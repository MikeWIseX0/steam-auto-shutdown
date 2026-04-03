package main

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/shirou/gopsutil/process"
)

type DiskManager struct {
	ctx               context.Context
	cacheMutex        sync.Mutex
	cachedProcesses   []*Process
	lastProcessesSync time.Time
}

type Process struct {
	Pid  int32
	Name string
}

func createDiskManager() *DiskManager {
	return &DiskManager{
		ctx: context.Background(),
	}
}

func (d *DiskManager) SetContext(ctx context.Context) {
	d.ctx = ctx
}

func (d *DiskManager) getProcessByPID(pid int32) (*process.Process, error) {
	p, err := process.NewProcess(pid)
	if err != nil {
		return nil, fmt.Errorf("No process found with PID: %d", pid)
	}

	return p, nil
}

func (d *DiskManager) GetDiskWriteSpeed(processPID int32) (float64, error) {
	// Mutex protection for PID-based lookup
	d.cacheMutex.Lock()
	p, err := d.getProcessByPID(processPID)
	d.cacheMutex.Unlock()

	if err != nil {
		return 0, err
	}

	initialIOCounters, err := p.IOCounters()
	if err != nil {
		return 0, err
	}

	startTime := time.Now()

	// Interruptible sleep: aborts instantly if the app closes
	select {
	case <-d.ctx.Done():
		return 0, d.ctx.Err()
	case <-time.After(SAMPLE_INTERVAL):
	}

	finalIOCounters, err := p.IOCounters()
	if err != nil {
		return 0, err
	}

	actualDuration := time.Since(startTime).Seconds()
	// Math safety floor to prevent infinite spikes on potential clock jitter
	if actualDuration < 0.1 {
		actualDuration = SAMPLE_INTERVAL.Seconds()
	}

	bytesWritten := uint64(0)
	if finalIOCounters.WriteBytes >= initialIOCounters.WriteBytes {
		bytesWritten = finalIOCounters.WriteBytes - initialIOCounters.WriteBytes
	}

	writeSpeed := float64(bytesWritten) / actualDuration

	return writeSpeed, nil
}

func (d *DiskManager) GetProcesses() ([]*Process, error) {
	d.cacheMutex.Lock()
	defer d.cacheMutex.Unlock()

	// High-Scale Optimization: Cache process list for 10 seconds to prevent
	// repetitive kernel-intensive process scanning.
	if time.Since(d.lastProcessesSync) < 10*time.Second && len(d.cachedProcesses) > 0 {
		return d.cachedProcesses, nil
	}

	processes, err := process.Processes()
	if err != nil {
		return nil, err
	}

	var processList []*Process = make([]*Process, 0, len(processes))
	for _, p := range processes {
		name, err := p.Name()
		if err != nil {
			continue
		}

		processList = append(processList, &Process{
			Pid:  p.Pid,
			Name: name,
		})
	}

	d.cachedProcesses = processList
	d.lastProcessesSync = time.Now()

	return processList, nil
}

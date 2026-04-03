package main

import (
	"context"
	"errors"
	"regexp"
	"sync"
	"time"

	"github.com/shirou/gopsutil/net"
)

var macRegex = regexp.MustCompile(`^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$`)

type NetworkManager struct {
	ctx              context.Context
	cacheMutex       sync.Mutex
	cachedInterfaces []net.InterfaceStat
	lastCacheUpdate  time.Time
}

type Interface struct {
	Index        int
	Name         string
	MTU          int
	HardwareAddr string
	Flags        []string
}

func createNetworkManager() *NetworkManager {
	return &NetworkManager{
		ctx: context.Background(),
	}
}

func (n *NetworkManager) SetContext(ctx context.Context) {
	n.ctx = ctx
}

func (n *NetworkManager) GetInterfaces() ([]net.InterfaceStat, error) {
	n.cacheMutex.Lock()
	defer n.cacheMutex.Unlock()

	// Cache for 5 seconds to reduce syscall overhead
	if time.Since(n.lastCacheUpdate) < 5*time.Second && len(n.cachedInterfaces) > 0 {
		return n.cachedInterfaces, nil
	}

	netInterfaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}

	n.cachedInterfaces = netInterfaces
	n.lastCacheUpdate = time.Now()

	return netInterfaces, nil
}

func (n *NetworkManager) GetInterfaceDownloadSpeed(mac string) (float64, error) {
	if !macRegex.MatchString(mac) {
		return 0, errors.New("Invalid MAC address format")
	}

	initialStat, err := n.GetIOStatByMac(mac)
	if err != nil {
		return 0, err
	}

	startTime := time.Now()
	initialBytesRecv := initialStat.BytesRecv

	// Interruptible sleep: aborts instantly if the app closes
	select {
	case <-n.ctx.Done():
		return 0, n.ctx.Err()
	case <-time.After(SAMPLE_INTERVAL):
	}

	finalStat, err := n.GetIOStatByMac(mac)
	if err != nil {
		return 0, err
	}

	actualEndTime := time.Now()
	elapsedSeconds := actualEndTime.Sub(startTime).Seconds()

	// Math safety floor to prevent infinite spikes on clock jitter
	if elapsedSeconds < 0.1 {
		elapsedSeconds = SAMPLE_INTERVAL.Seconds()
	}

	totalBytesRecv := uint64(0)
	if finalStat.BytesRecv >= initialBytesRecv {
		totalBytesRecv = finalStat.BytesRecv - initialBytesRecv
	}
	downloadSpeed := float64(totalBytesRecv) / elapsedSeconds

	return downloadSpeed, nil
}

func (n *NetworkManager) GetIOStatByMac(mac string) (net.IOCountersStat, error) {
	if !macRegex.MatchString(mac) {
		return net.IOCountersStat{}, errors.New("Invalid MAC address format")
	}

	iface, err := n.GetInterfaceByMac(mac)
	if err != nil {
		return net.IOCountersStat{}, err
	}

	interfaceName := iface.Name

	netInterface, err := net.IOCounters(true)
	if err != nil {
		return net.IOCountersStat{}, err
	}

	for _, v := range netInterface {
		if v.Name == interfaceName {
			return v, nil
		}
	}

	return net.IOCountersStat{}, errors.New("Interface not found")
}

func (n *NetworkManager) GetInterfaceByMac(mac string) (net.InterfaceStat, error) {
	// Refactored: Now uses the cached and mutex-protected GetInterfaces()
	netInterfaces, err := n.GetInterfaces()
	if err != nil {
		return net.InterfaceStat{}, err
	}

	for _, v := range netInterfaces {
		if v.HardwareAddr == mac {
			return v, nil
		}
	}

	return net.InterfaceStat{}, errors.New("No interface found with MAC: " + mac)
}

func (n *NetworkManager) AutoDetectInterface() (string, error) {
	interfaces, err := n.GetInterfaces()
	if err != nil {
		return "", err
	}

	activeInterfaces := make(map[string]bool)
	for _, v := range interfaces {
		isUp := false
		isRunning := false
		for _, flag := range v.Flags {
			if flag == "up" {
				isUp = true
			}
			if flag == "running" {
				isRunning = true
			}
		}
		if isUp && isRunning {
			activeInterfaces[v.Name] = true
		}
	}

	netInterface, err := net.IOCounters(true)
	if err != nil {
		return "", err
	}

	var highestInterfaceName string
	var highestReceived float64

	for _, v := range netInterface {
		// Only consider interfaces that are actually up and running
		if !activeInterfaces[v.Name] {
			continue
		}

		if float64(v.BytesRecv) > highestReceived {
			highestReceived = float64(v.BytesRecv)
			highestInterfaceName = v.Name
		}
	}

	if highestInterfaceName == "" {
		return "", errors.New("No active network interface found")
	}

	for _, v := range interfaces {
		if v.Name == highestInterfaceName {
			return v.HardwareAddr, nil
		}
	}

	return "", errors.New("Could not find MAC for interface: " + highestInterfaceName)
}

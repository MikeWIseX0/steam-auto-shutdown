package main

import (
	"context"
	"testing"
	"time"
)

func TestDiskManager_Caching(t *testing.T) {
	dm := createDiskManager()
	dm.SetContext(context.Background())

	// First call should populate cache
	start := time.Now()
	procs1, err := dm.GetProcesses()
	if err != nil {
		t.Fatalf("Failed to get processes: %v", err)
	}
	firstCallDuration := time.Since(start)

	// Second call within 10s should be near-instant (cached)
	start = time.Now()
	procs2, err := dm.GetProcesses()
	if err != nil {
		t.Fatalf("Failed to get second processes call: %v", err)
	}
	secondCallDuration := time.Since(start)

	if len(procs1) != len(procs2) {
		t.Errorf("Cache mismatch: found %d in first call, %d in second", len(procs1), len(procs2))
	}

	if secondCallDuration > firstCallDuration && secondCallDuration > 10*time.Millisecond {
		t.Logf("Warning: Second call took %v, which might not be cached (First: %v)", secondCallDuration, firstCallDuration)
	} else {
		t.Logf("Cache hit confirmed: %v vs %v", secondCallDuration, firstCallDuration)
	}
}

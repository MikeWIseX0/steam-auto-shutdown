package main

import (
	"testing"
)

func TestMacRegex(t *testing.T) {
	tests := []struct {
		mac    string
		expect bool
	}{
		{"00:11:22:33:44:55", true},
		{"AA:BB:CC:DD:EE:FF", true},
		{"00-11-22-33-44-55", true},
		{"invalid-mac", false},
		{"00:11:22:33:44", false},
		{"00:11:22:33:44:55:66", false},
		{"G0:11:22:33:44:55", false},
	}

	for _, tt := range tests {
		t.Run(tt.mac, func(t *testing.T) {
			if macRegex.MatchString(tt.mac) != tt.expect {
				t.Errorf("macRegex.MatchString(%s) = %v; want %v", tt.mac, !tt.expect, tt.expect)
			}
		})
	}
}

func TestNetworkManagerCreation(t *testing.T) {
	nm := createNetworkManager()
	if nm == nil {
		t.Fatal("Expected NetworkManager instance, got nil")
	}
	if nm.ctx == nil {
		t.Error("Expected context to be initialized")
	}
}

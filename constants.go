package main

import "time"

// SAMPLE_INTERVAL is the duration used to sample network and disk activity.
// Reduced to 1s from 2s to improve UI responsiveness.
const SAMPLE_INTERVAL = 1 * time.Second

// DEFAULT_AUTO_DETECT_PROCESS is the process name the frontend looks for by default.
const DEFAULT_AUTO_DETECT_PROCESS = "steam.exe"

// ACTION_TIMEOUT is the number of seconds Windows waits before executing a timed shutdown.
// Refactored from a constant to a variable to allow user customization via Bridge.
var ACTION_TIMEOUT = 10

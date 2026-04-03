package main

import (
	"context"
	"log"
	"net/url"
	"os/exec"
	"strconv"
	"syscall"
)

// App struct
type App struct {
	ctx            context.Context
	networkManager *NetworkManager
	diskManager    *DiskManager
}

// NewApp creates a new App application struct
func NewApp(nm *NetworkManager, dm *DiskManager) *App {
	return &App{
		networkManager: nm,
		diskManager:    dm,
	}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
	a.networkManager.SetContext(ctx)
	a.diskManager.SetContext(ctx)
}

// domReady is called after front-end resources have been loaded
func (a *App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Auto-Abort on Close: prevent scheduled shutdowns from finishing if the user closes the app
	a.CancelShutdown()
}

func (a *App) GetActionTimeout() int {
	return ACTION_TIMEOUT
}

func (a *App) SetActionTimeout(seconds int) {
	if seconds < 0 {
		log.Println("[SYS] Attempted to set negative timeout, ignoring.")
		return
	}
	ACTION_TIMEOUT = seconds
	log.Printf("[SYS] Action timeout updated to %d seconds", seconds)
}

func (a *App) ExecuteAction(actionName string) {
	var cmd *exec.Cmd
	timeoutStr := strconv.Itoa(ACTION_TIMEOUT)

	switch actionName {
	case "SHUTDOWN":
		cmd = exec.Command("shutdown", "/s", "/t", timeoutStr)
	case "RESTART":
		cmd = exec.Command("shutdown", "/r", "/t", timeoutStr)
	case "SLEEP":
		cmd = exec.Command("rundll32.exe", "powrprof.dll,SetSuspendState", "0")
	case "LOGOFF":
		cmd = exec.Command("shutdown", "/l")
	case "HIBERNATE":
		cmd = exec.Command("shutdown", "/h")
	default:
		log.Printf("[SYS] Unknown action requested: %s", actionName)
		return
	}

	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	err := cmd.Run()
	if err != nil {
		log.Printf("[SYS] Error executing %s command: %v", actionName, err)
	}
}

func (a *App) CancelShutdown() {
	// Guard: check context to prevent redundant execution during app closure
	select {
	case <-a.ctx.Done():
		return
	default:
	}

	cmd := exec.Command("shutdown", "/a")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	err := cmd.Run()
	if err != nil {
		log.Println("[SYS] Error executing cancel command:", err)
	}
}

func (a *App) OpenInBrowser(rawURL string) {
	// Security: Clamp URL length to prevent buffer/shell exploits
	if len(rawURL) > 2048 {
		log.Println("[SYS] URL is too long, ignoring.")
		return
	}

	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		log.Println("[SYS] Invalid URL:", err)
		return
	}

	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		log.Println("[SYS] URL scheme not allowed:", parsedURL.Scheme)
		return
	}

	// Guard: check context
	select {
	case <-a.ctx.Done():
		return
	default:
	}

	cmd := exec.Command("rundll32", "url.dll,FileProtocolHandler", parsedURL.String())
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	err = cmd.Run()
	if err != nil {
		log.Println("[SYS] Error executing open-browser command:", err)
	}
}

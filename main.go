// main is the official entryway to the Steam Auto Shutdown application.
// It initializes core managers and the Wails runtime with professional-grade defaults.
package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

var (
	width  = 800
	height = 560
)

func main() {
	// Create an instance of the app structure
	networkManager := createNetworkManager()
	diskManager := createDiskManager()
	app := NewApp(networkManager, diskManager)

	// Create application with options
	err := wails.Run(&options.App{
		Title:             "Steam Auto Shutdown",
		Width:             width,
		Height:            height,
		MinWidth:          width,
		MinHeight:         height,
		MaxWidth:          width,
		MaxHeight:         height,
		DisableResize:     true,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 20, G: 20, B: 20, A: 255},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Menu:             nil,
		Logger:           nil,
		LogLevel:         logger.INFO,
		OnStartup:        app.startup,
		OnDomReady:       app.domReady,
		OnBeforeClose:    app.beforeClose,
		OnShutdown:       app.shutdown,
		WindowStartState: options.Normal,
		Bind: []interface{}{
			app,
			networkManager,
			diskManager,
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			// DisableFramelessWindowDecorations: false,
			WebviewUserDataPath: "",
			ZoomFactor:          1.0,
		},
	})

	if err != nil {
		log.Fatal(err)
	}

}

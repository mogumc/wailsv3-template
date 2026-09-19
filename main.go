package main

import (
	"embed"
	"log"

	"wailsv3-template/global"
	"wailsv3-template/service"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed lang/*
var langFS embed.FS

//go:embed build/appicon.png
var appIcon []byte

func init() {
	// 注册类型化事件：绑定生成器会据此为前端生成强类型的事件 API
	application.RegisterEvent[string]("time")
	application.RegisterEvent[service.NotificationData]("notification")
	application.RegisterEvent[string]("shortcut")
}

func main() {
	global.LangFS = langFS
	global.Init()

	service.SetTrayIcon(appIcon)

	appName := global.GetProcessName()
	App := service.NewApp()

	app := application.New(application.Options{
		Name:        appName,
		Description: "Wails v3 template (React + MUI)",
		Services: []application.Service{
			application.NewService(App),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
	})

	// Frameless 窗口 + 自定义标题栏（前端 HeaderBar 用 --wails-draggable: drag 拖动）
	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            appName,
		Width:            1024,
		Height:           768,
		Frameless:        true,
		BackgroundColour: application.NewRGB(245, 247, 250),
		URL:              "/",
	})

	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}

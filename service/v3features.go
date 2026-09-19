package service

import (
	"wailsv3-template/global"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// 本文件集中演示 Wails v3 相比 v2 新增/重塑的能力：
//
//   - 多窗口（first-class）：app.Window.NewWithOptions 随时创建带独立生命周期的窗口
//   - 系统托盘：app.SystemTray.New + 原生菜单
//   - 剪贴板：app.Clipboard.SetText / Text
//   - 系统浏览器：app.Browser.OpenURL
//   - 全局快捷键：app.GlobalShortcut.Register / Unregister
//   - 类型化事件：application.RegisterEvent[T]（注册见 main.go，"shortcut" 事件在此 Emit）

var (
	tray            *application.SystemTray
	trayIcon        []byte
	activeShortcuts = map[string]bool{}
)

// SetTrayIcon 注入托盘图标（main.go 从 embed 的 build/appicon.png 读取后调用）
func SetTrayIcon(icon []byte) {
	trayIcon = icon
}

// OpenSubWindow 打开一个子窗口（v3 多窗口：每个窗口独立生命周期）
// Frameless 与主窗口一致；子窗口加载同一前端，HeaderBar 自带拖动区与窗口控制，
// 窗口操作走 Window.Current()（当前聚焦窗口），子窗口内点按钮控制的就是子窗口自己。
func (a *App) OpenSubWindow() bool {
	subWin := application.Get().Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            "子窗口 - Wails v3 多窗口",
		Width:            420,
		Height:           320,
		URL:              "/",
		Frameless:        true,
		BackgroundColour: application.NewRGB(245, 247, 250),
	})
	global.Log.Infof("子窗口已打开: id=%d", subWin.ID())
	return true
}

// CreateSystemTray 创建系统托盘（含原生菜单），重复调用不会重复创建
func (a *App) CreateSystemTray() bool {
	if tray != nil {
		return true
	}

	menu := application.NewMenu()
	menu.Add("显示主窗口").OnClick(func(*application.Context) {
		w := a.currentWindow()
		w.Show()
		w.Focus()
	})
	menu.Add("打开子窗口").OnClick(func(*application.Context) {
		a.OpenSubWindow()
	})
	menu.AddSeparator()
	menu.Add("退出应用").OnClick(func(*application.Context) {
		application.Get().Quit()
	})

	tray = application.Get().SystemTray.New()
	if len(trayIcon) > 0 {
		tray.SetIcon(trayIcon)
	}
	tray.SetTooltip("Wails v3 模板")
	tray.SetLabel("v3")
	tray.SetMenu(menu)

	global.Log.Info("系统托盘已创建")
	return true
}

// DestroySystemTray 销毁系统托盘
func (a *App) DestroySystemTray() bool {
	if tray == nil {
		return true
	}
	tray.Destroy()
	tray = nil
	global.Log.Info("系统托盘已销毁")
	return true
}

// ClipboardSetText 写入系统剪贴板
func (a *App) ClipboardSetText(text string) bool {
	return application.Get().Clipboard.SetText(text)
}

// ClipboardGetText 读取系统剪贴板
func (a *App) ClipboardGetText() string {
	text, ok := application.Get().Clipboard.Text()
	if !ok {
		return ""
	}
	return text
}

// OpenInBrowser 用系统默认浏览器打开 URL
func (a *App) OpenInBrowser(url string) bool {
	if url == "" {
		return false
	}
	if err := application.Get().Browser.OpenURL(url); err != nil {
		global.Log.Warnf("打开浏览器失败: %v", err)
		return false
	}
	return true
}

// RegisterGlobalShortcut 注册全局快捷键（如 "Ctrl+Alt+T"），
// 触发时通过类型化事件 "shortcut" 把快捷键字符串推给前端
func (a *App) RegisterGlobalShortcut(accelerator string) bool {
	if accelerator == "" {
		return false
	}
	err := application.Get().GlobalShortcut.Register(accelerator, func() {
		application.Get().Event.Emit("shortcut", accelerator)
	})
	if err != nil {
		global.Log.Warnf("注册全局快捷键失败 %s: %v", accelerator, err)
		return false
	}
	activeShortcuts[accelerator] = true
	global.Log.Infof("全局快捷键已注册: %s", accelerator)
	return true
}

// UnregisterGlobalShortcut 注销全局快捷键
func (a *App) UnregisterGlobalShortcut(accelerator string) bool {
	if err := application.Get().GlobalShortcut.Unregister(accelerator); err != nil {
		global.Log.Warnf("注销全局快捷键失败 %s: %v", accelerator, err)
		return false
	}
	delete(activeShortcuts, accelerator)
	return true
}

// GetActiveGlobalShortcuts 当前已注册的全局快捷键
func (a *App) GetActiveGlobalShortcuts() []string {
	keys := make([]string, 0, len(activeShortcuts))
	for k := range activeShortcuts {
		keys = append(keys, k)
	}
	return keys
}

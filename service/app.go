package service

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	goruntime "runtime"
	"sort"
	"strings"
	"time"

	"wailsv3-template/global"

	"github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v3/pkg/application"
)

// NotificationData 事件通知的数据结构
// 与 main.go 中 RegisterEvent[NotificationData]("notification") 配套，
// 前端会得到强类型的事件定义。
type NotificationData struct {
	Title   string `json:"title"`
	Message string `json:"message"`
}

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

// ServiceName v3 Service 可选接口：服务名，用于日志与生成绑定的命名
func (a *App) ServiceName() string {
	return "App"
}

// ServiceStartup v3 Service 可选接口：应用启动时调用，ctx 在应用生命周期内有效
func (a *App) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	a.ctx = ctx
	global.Log.Info("App 服务已启动")
	return nil
}

// ServiceShutdown v3 Service 可选接口：应用关闭时调用
func (a *App) ServiceShutdown() error {
	global.Log.Info("App 服务已关闭")
	return nil
}

func (a *App) Greet(name string) string {
	return greet(name)
}

func (a *App) Flashtime() {
	flashtime()
}

func (a *App) Gettestjson() string {
	return getJSONString()
}

func (a *App) GetLangTextMap() map[string]string {
	return global.GetLangTextMap()
}

func (a *App) GetLangPack() *global.LanguagePack {
	langPack, err := global.GetLangPack()
	if err != nil {
		global.Log.Warnf("获取语言包失败: %v", err)
		return nil
	}
	return langPack
}

func (a *App) GetALLLang() []global.LanguageInfo {
	return global.GetLangInfoList()
}

func (a *App) SetLanguage(langCode string) bool {
	global.GlobalConfig.Language = langCode
	global.ClearLangCache()
	global.UpdateCurrentLangPath()
	return true
}

func (a *App) GetCurrentLang() string {
	return global.GlobalConfig.Language
}

func (a *App) GetLogFiles() []string {
	logDir := global.GlobalConfig.LogDir
	entries, err := os.ReadDir(logDir)
	if err != nil {
		global.Log.Warnf("读取日志目录失败: %v", err)
		return []string{}
	}

	var logFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".log") {
			logFiles = append(logFiles, entry.Name())
		}
	}

	sort.Sort(sort.Reverse(sort.StringSlice(logFiles)))
	return logFiles
}

func (a *App) GetLogFileContent(filename string) string {
	// 安全检查：防止路径遍历
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		global.Log.Warnf("非法的日志文件名: %s", filename)
		return ""
	}

	logPath := filepath.Join(global.GlobalConfig.LogDir, filename)
	data, err := os.ReadFile(logPath)
	if err != nil {
		global.Log.Warnf("读取日志文件失败: %v", err)
		return ""
	}
	return string(data)
}

func (a *App) SetLogLevel(level string) bool {
	switch strings.ToLower(level) {
	case "debug":
		global.SetLogLevel(logrus.DebugLevel)
		global.Log.Debug("日志等级已切换为 Debug")
	case "info":
		global.SetLogLevel(logrus.InfoLevel)
		global.Log.Info("日志等级已切换为 Info")
	case "warn":
		global.SetLogLevel(logrus.WarnLevel)
		global.Log.Warn("日志等级已切换为 Warn")
	case "error":
		global.SetLogLevel(logrus.ErrorLevel)
		global.Log.Error("日志等级已切换为 Error")
	default:
		global.Log.Warnf("未知的日志等级: %s", level)
		return false
	}
	return true
}

func (a *App) GetLogLevel() string {
	if global.Log == nil {
		return "info"
	}
	return strings.ToUpper(global.Log.GetLevel().String())
}

// currentWindow 获取当前窗口
func (a *App) currentWindow() application.Window {
	return application.Get().Window.Current()
}

func (a *App) WindowMinimise() {
	a.currentWindow().Minimise()
}

func (a *App) WindowToggleMaximise() {
	a.currentWindow().ToggleMaximise()
}

func (a *App) WindowClose() {
	a.currentWindow().Close()
}

func (a *App) GetSystemInfo() SystemInfo {
	hostname, _ := os.Hostname()

	return SystemInfo{
		OS:          goruntime.GOOS,
		Arch:        goruntime.GOARCH,
		NumCPU:      goruntime.NumCPU(),
		Hostname:    hostname,
		GoVer:       goruntime.Version(),
		Time:        time.Now().Format(time.DateTime),
		ProcessName: global.GetProcessName(),
	}
}

func (a *App) GetProcessName() string {
	return global.GetProcessName()
}

func (a *App) OpenFileSelect() string {
	file, err := application.Get().Dialog.OpenFile().
		SetTitle("选择文件").
		AddFilter("所有文件", "*.*").
		AddFilter("文本文件", "*.txt").
		AddFilter("JSON 文件", "*.json").
		PromptForSingleSelection()
	if err != nil {
		global.Log.Debugf("打开文件对话框已取消或失败: %v", err)
		return ""
	}
	return file
}

func (a *App) OpenFolderSelect() string {
	folder, err := application.Get().Dialog.OpenFile().
		CanChooseDirectories(true).
		CanChooseFiles(false).
		SetTitle("选择目录").
		PromptForSingleSelection()
	if err != nil {
		global.Log.Debugf("打开目录对话框已取消或失败: %v", err)
		return ""
	}
	return folder
}

func (a *App) SaveFileSelect() string {
	file, err := application.Get().Dialog.SaveFile().
		SetMessage("保存文件").
		AddFilter("文本文件", "*.txt").
		AddFilter("JSON 文件", "*.json").
		PromptForSingleSelection()
	if err != nil {
		global.Log.Debugf("保存对话框已取消或失败: %v", err)
		return ""
	}
	return file
}

func (a *App) ReadFileContent(path string) string {
	if path == "" {
		return ""
	}
	data, err := os.ReadFile(path)
	if err != nil {
		global.Log.Warnf("读取文件失败: %v", err)
		return fmt.Sprintf("读取失败: %v", err)
	}
	return string(data)
}

func (a *App) WriteFileContent(path string, content string) bool {
	if path == "" {
		return false
	}
	err := os.WriteFile(path, []byte(content), 0644)
	if err != nil {
		global.Log.Warnf("写入文件失败: %v", err)
		return false
	}
	global.Log.Infof("文件写入成功: %s", path)
	return true
}

// Notify 向前端发送通知事件（演示 v3 类型化事件 + Event.Emit）
func (a *App) Notify(title string, message string) {
	application.Get().Event.Emit("notification", NotificationData{
		Title:   title,
		Message: message,
	})
}

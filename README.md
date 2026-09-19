# wailsv3-template

Wails **v3** (v3.0.0-beta.23) 桌面应用模板，用于新项目快速起步。由 [wails-template](https://github.com/wailsapp/wails-template)（Wails v2 + Vue + Element Plus）移植而来，**内置 v3 新特性演示页**。

## v3 新特性演示（模板自带）

运行 `wails3 dev` 后，「v3 特性」标签页可以直接体验（全部有源码实现，可复制到业务代码）：

| 特性 | 演示内容 | 核心 API |
| --- | --- | --- |
| **多窗口** | 一键打开独立子窗口 | `app.Window.NewWithOptions` |
| **系统托盘** | 托盘图标 + 原生菜单（显示窗口/开子窗/退出） | `app.SystemTray.New` + `NewMenu` + `MenuItem.OnClick` |
| **全局快捷键** | 注册系统级快捷键（应用不在前台也能触发），类型化事件回传 | `app.GlobalShortcut.Register` + `RegisterEvent[T]` |
| **类型化事件** | 事件在 main 中注册，前端获得强类型 API | `application.RegisterEvent[T]` + `app.Event.Emit` |
| **剪贴板** | 系统剪贴板读写，无需第三方库 | `app.Clipboard.SetText / Text` |
| **系统浏览器** | 调用默认浏览器打开链接 | `app.Browser.OpenURL` |
| **Service 模型** | 显式服务注册，绑定生成器静态分析出带注释的强类型 TS | `application.NewService` + `wails3 generate bindings` |

「概览」标签页展示模板基础能力（i18n / 日志 / 文件 / 对话框 / 窗口控制等）。

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 桌面框架 | Wails v3 (Go + WebView2) |
| 前端 | React 18 + TypeScript + Vite |
| UI 组件 | MUI (Material UI) |
| 国际化 | 自研 i18n（Go embed 语言包 + 文件系统语言包双加载） |
| 日志 | logrus（控制台带色 + 文件双写，自动清理旧日志） |

## 目录结构

```
wailsv3-template/
├── main.go              # 应用入口：application.New + Frameless 窗口 + 类型化事件注册
├── service/             # App 服务（v3 Service 模型，前端可调用的方法都在这）
│   ├── app.go           #   ServiceName/ServiceStartup/ServiceShutdown + 绑定方法
│   └── helpers.go       #   内部辅助（greet / flashtime / getJSONString / SystemInfo）
├── global/              # 全局单例：配置、语言、日志（与 Wails 无关，可直接复用）
├── api/                 # 供内部调用的 API 封装（语言、日志）
├── lang/                # 多语言包（embed 进二进制，也可放本地 lang/ 目录覆盖）
├── frontend/
│   ├── src/
│   │   ├── components/  # HeaderBar(标题栏) / LangSelector / DemoPage(功能演示)
│   │   ├── i18n.tsx     # I18nProvider + useI18n
│   │   └── toast.tsx    # 全局轻提示（ToastProvider + useToast）
│   └── bindings/        # wails3 generate bindings 的产物（已 gitignore）
├── build/               # v3 Taskfile 构建系统（各平台打包配置）
└── Taskfile.yml         # task 构建/打包/开发入口
```

## 快速开始

```bash
# 前置：安装 Go 1.25+、Node.js、wails3 CLI
go install github.com/wailsapp/wails/v3/cmd/wails3@latest

# 开发模式（自动生成 bindings + 启动 Vite）
wails3 dev

# 生产构建 / 打包（产物在 bin/）
wails3 build
wails3 package

# 手动重新生成前端绑定（通常不用，dev/build 会自动跑）
wails3 generate bindings
```

## 模板自带的基础功能演示（「概览 / 交互与事件 / 文件 / 日志」标签页）

- **前后端调用**：`App.Greet()` 绑定调用
- **事件系统**：Go `Event.Emit` 每秒推送时间；类型化事件 `RegisterEvent[T]`
- **i18n**：语言切换（embed + 本地语言包双加载，前端 `useI18n`）
- **日志**：等级动态调整 + 日志文件查看
- **文件**：原生打开/保存对话框、读写文件
- **窗口**：Frameless 自定义标题栏（`--wails-draggable` 拖动、双击最大化、窗口控制按钮）

## 从 v2 迁移的注意点

- 绑定模型变为 **Service**：实现 `ServiceName/ServiceStartup/ServiceShutdown`（可选），通过 `application.NewService(&App{})` 注册
- `wails/v2/pkg/runtime` 的功能分别归位：窗口操作在 `application.Get().Window`，对话框在 `application.Get().Dialog`，事件在 `application.Get().Event`
- 前端绑定路径：`frontend/bindings/<module>/<package>`，导入形如 `import { App } from "../bindings/wailsv3-template/service"`
- 构建系统由 `wails.json` 换成 **Taskfile**（`build/` 目录）

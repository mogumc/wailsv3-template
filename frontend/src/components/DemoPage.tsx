import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Events } from '@wailsio/runtime'
import { App } from '../../bindings/wailsv3-template/service'
import type { SystemInfo } from '../../bindings/wailsv3-template/service'
import { useI18n } from '../i18n'
import { useToast } from '../toast'
import LangSelector from './LangSelector'

/* ==================== 功能概览 ==================== */

const features = [
  { key: 'feature_services', desc: 'feature_services_desc', icon: '⚙️', color: '#6C5CE7' },
  { key: 'feature_multiwin', desc: 'feature_multiwin_desc', icon: '🗂️', color: '#00B894' },
  { key: 'feature_tray', desc: 'feature_tray_desc', icon: '🔔', color: '#0984E3' },
  { key: 'feature_shortcut', desc: 'feature_shortcut_desc', icon: '⌨️', color: '#D63031' },
  { key: 'feature_typed_events', desc: 'feature_typed_events_desc', icon: '🎯', color: '#E17055' },
  { key: 'feature_clipboard', desc: 'feature_clipboard_desc', icon: '📋', color: '#2D3436' },
  { key: 'feature_i18n', desc: 'feature_i18n_desc', icon: '🌐', color: '#409EFF' },
  { key: 'feature_backend', desc: 'feature_backend_desc', icon: '🔗', color: '#67C23A' },
  { key: 'feature_event', desc: 'feature_event_desc', icon: '📡', color: '#E6A23C' },
  { key: 'feature_window', desc: 'feature_window_desc', icon: '🪟', color: '#F56C6C' },
  { key: 'feature_logger', desc: 'feature_logger_desc', icon: '📝', color: '#909399' },
  { key: 'feature_json', desc: 'feature_json_desc', icon: '📦', color: '#9B59B6' },
  { key: 'feature_ui', desc: 'feature_ui_desc', icon: '🎨', color: '#1ABC9C' },
  { key: 'feature_embed', desc: 'feature_embed_desc', icon: '💾', color: '#3498DB' },
  { key: 'feature_dialog', desc: 'feature_dialog_desc', icon: '📂', color: '#E74C3C' },
  { key: 'feature_fileio', desc: 'feature_fileio_desc', icon: '✏️', color: '#F39C12' },
]

function FeatureOverviewCard() {
  const { t } = useI18n()
  return (
    <Card variant="outlined">
      <CardHeader title={<Typography sx={{ fontWeight: 700 }}>{t('feature_overview', '功能概览')}</Typography>} />
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('feature_overview_desc', '本模板集成了以下核心功能，可作为 Wails 项目的开发起点。')}
        </Typography>
        <Grid container spacing={1.5}>
          {features.map((feature) => (
            <Grid key={feature.key} size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%',
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                    backgroundColor: feature.color + '15',
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{t(feature.key, feature.key)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t(feature.desc, feature.desc)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

/* ==================== 前后端数据交互 (Greet) ==================== */

function GreetCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const doGreet = () => {
    if (!name.trim()) {
      toast(t('input_name', '输入名字'), 'warning')
      return
    }
    setLoading(true)
    App.Greet(name)
      .then((res) => {
        setResult(res)
        setLoading(false)
      })
      .catch((err) => {
        toast(String(err), 'error')
        setLoading(false)
      })
  }

  return (
    <DemoCard title={t('demo_data_interaction', '前后端数据交互')}>
      <SectionDesc>{t('demo_data_interaction_desc', '通过 Wails 绑定调用 Go 后端函数，获取返回值并展示。')}</SectionDesc>
      <Stack direction="row" spacing={1.5}>
        <TextField
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doGreet()}
          placeholder={t('greet_placeholder', '请输入你的名字')}
          sx={{ maxWidth: 300 }}
        />
        <Button variant="contained" onClick={doGreet} disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {t('send_greet', '发送问候')}
        </Button>
      </Stack>
      {result && (
        <Alert severity="success" sx={{ mt: 1.5 }}>
          {result}
        </Alert>
      )}
    </DemoCard>
  )
}

/* ==================== 事件系统（实时时间） ==================== */

let flashtimeStarted = false

function TimeCard() {
  const { t } = useI18n()
  const [systime, setSystime] = useState('Loading...')

  useEffect(() => {
    // goroutine 全局只启一次（React StrictMode 下 effect 会执行两次）
    if (!flashtimeStarted) {
      flashtimeStarted = true
      App.Flashtime()
    }
    const off = Events.On('time', (timeValue: any) => {
      setSystime(timeValue.data)
    })
    return () => off()
  }, [])

  return (
    <DemoCard title={`${t('feature_event', '事件系统')} - ${t('realtime_time', '实时时间')}`}>
      <SectionDesc>{t('demo_event_desc', 'Go 后端通过 Event.Emit 推送数据，前端通过 Events.On 监听接收。')}</SectionDesc>
      <Stack direction="row" spacing={2} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('time_label', '当前时间')}
        </Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 600, fontFamily: "'Courier New', monospace", color: '#1976d2' }}>
          {systime}
        </Typography>
      </Stack>
    </DemoCard>
  )
}

/* ==================== JSON 数据处理 ==================== */

interface JsonRow {
  name: string
  type: string
  size: string
  time: string
}

function convertBytes(byteSize: number): string {
  if (byteSize < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  let size = byteSize
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

function JsonCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [rows, setRows] = useState<JsonRow[] | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchJsonData = () => {
    setLoading(true)
    App.Gettestjson()
      .then((result) => {
        const parsed = JSON.parse(result)
        setRows(
          parsed.data.map((item: any) => ({
            name: item.name,
            type: item.isdir ? t('folder', '文件夹') : t('file', '文件'),
            size: item.isdir ? '---' : convertBytes(item.size),
            time: '---',
          })),
        )
        setLoading(false)
      })
      .catch((err) => {
        toast(String(err), 'error')
        setLoading(false)
      })
  }

  return (
    <DemoCard title={t('feature_json', 'JSON 数据处理')}>
      <SectionDesc>{t('demo_json_desc', '后端返回 JSON 字符串，前端解析后以表格形式展示。')}</SectionDesc>
      <Button variant="contained" onClick={fetchJsonData} disabled={loading} sx={{ mb: 1.5 }}>
        {t('fetch_data', '获取数据')}
      </Button>
      {rows ? (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('file_name', '文件名')}</TableCell>
                <TableCell>{t('file_type', '文件类型')}</TableCell>
                <TableCell>{t('file_size', '文件大小')}</TableCell>
                <TableCell>{t('create_time', '创建时间')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.size}</TableCell>
                  <TableCell>{row.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyText text={t('click_to_fetch', '点击按钮获取数据')} />
      )}
    </DemoCard>
  )
}

/* ==================== 语言切换 ==================== */

function LangCard() {
  const { t, changeLang } = useI18n()
  const { toast } = useToast()

  const handleLangChange = async (langCode: string) => {
    try {
      await changeLang(langCode)
      toast(t('lang_switched', '语言已切换'), 'success')
    } catch (err) {
      toast(String(err), 'error')
    }
  }

  return (
    <DemoCard title={t('demo_lang_switch', '语言切换 (i18n)')}>
      <SectionDesc>{t('demo_lang_switch_desc', '切换应用语言，支持嵌入语言包和本地语言文件。')}</SectionDesc>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {t('current_lang', '当前语言')}:
        </Typography>
        <LangSelector onChanged={handleLangChange} />
      </Stack>
    </DemoCard>
  )
}

/* ==================== 日志等级设置 ==================== */

const logLevelOptions = ['DEBUG', 'INFO', 'WARN', 'ERROR']

function LogLevelCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [level, setLevel] = useState('INFO')

  useEffect(() => {
    App.GetLogLevel()
      .then((lv) => setLevel(lv || 'INFO'))
      .catch((e) => console.error('获取日志等级失败:', e))
  }, [])

  const handleLogLevelChange = async (lv: string) => {
    try {
      const ok = await App.SetLogLevel(lv)
      if (ok) {
        setLevel(lv)
        toast(t('log_level_changed', '日志等级已切换为') + ' ' + lv, 'success')
      }
    } catch (err) {
      toast(String(err), 'error')
    }
  }

  return (
    <DemoCard title={t('demo_log_level', '日志等级设置')}>
      <SectionDesc>{t('demo_log_level_desc', '动态调整日志输出等级。')}</SectionDesc>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {t('log_level', '日志等级')}:
        </Typography>
        <TextField
          select
          size="small"
          value={level}
          onChange={(e) => handleLogLevelChange(e.target.value)}
          sx={{ width: 200 }}
        >
          {logLevelOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </DemoCard>
  )
}

/* ==================== 日志文件查看 ==================== */

function LogViewerCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [logFiles, setLogFiles] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const viewerRef = useRef<HTMLDivElement | null>(null)

  const loadLogFiles = () => {
    App.GetLogFiles()
      .then((files) => setLogFiles(files || []))
      .catch((err) => console.error('获取日志列表失败:', err))
  }

  useEffect(() => {
    loadLogFiles()
  }, [])

  const handleLogFileChange = async (filename: string) => {
    if (!filename) {
      setContent('')
      return
    }
    setLoading(true)
    setSelected(filename)
    try {
      const data = await App.GetLogFileContent(filename)
      setContent(data)
      // 等内容渲染完再滚动到底部
      requestAnimationFrame(() => {
        viewerRef.current?.scrollTo({ top: viewerRef.current.scrollHeight })
      })
    } catch (err) {
      toast(String(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DemoCard title={t('demo_log_viewer', '日志文件查看')}>
      <SectionDesc>{t('demo_log_viewer_desc', '获取日志文件列表并查看内容，展示前后端数据交互的实际应用。')}</SectionDesc>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField
          select
          size="small"
          value={selected}
          onChange={(e) => handleLogFileChange(e.target.value)}
          placeholder={t('select_log_file', '选择日志文件')}
          disabled={loading}
          sx={{ width: 300 }}
        >
          {logFiles.map((file) => (
            <MenuItem key={file} value={file}>
              {file}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={loadLogFiles}>
          {t('refresh', '刷新')}
        </Button>
      </Stack>
      {content ? (
        <Box
          ref={viewerRef}
          sx={{
            maxHeight: 400,
            overflow: 'auto',
            bgcolor: '#1e1e1e',
            border: '1px solid #333',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography
            component="pre"
            sx={{
              m: 0,
              fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
              fontSize: 12,
              lineHeight: 1.6,
              color: '#d4d4d4',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {content}
          </Typography>
        </Box>
      ) : (
        <EmptyText text={t('select_log_to_view', '选择一个日志文件查看内容')} />
      )}
    </DemoCard>
  )
}

/* ==================== 系统信息 ==================== */

function SystemInfoCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchSystemInfo = () => {
    setLoading(true)
    App.GetSystemInfo()
      .then(setInfo)
      .catch((err) => toast(String(err), 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSystemInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DemoCard title={t('demo_system_info', '系统信息')}>
      <SectionDesc>{t('demo_system_info_desc', '获取当前操作系统、架构、CPU 核心数等系统信息。')}</SectionDesc>
      <Button variant="contained" onClick={fetchSystemInfo} disabled={loading} sx={{ mb: 1.5 }}>
        {t('fetch_data', '获取数据')}
      </Button>
      {info ? (
        <Grid container sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          {[
            { label: t('os', '操作系统'), value: info.os },
            { label: t('arch', '架构'), value: info.arch },
            { label: t('cpu_count', 'CPU 核心数'), value: String(info.num_cpu) },
            { label: t('hostname', '主机名'), value: info.hostname },
            { label: t('go_version', 'Go 版本'), value: info.go_ver },
            { label: t('time_label', '当前时间'), value: info.time },
            { label: t('process_name', '进程名'), value: info.process_name },
          ].map((item, idx) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
              <Stack
                direction="row"
                sx={{
                  p: 1.25,
                  borderBottom: idx < 6 ? '1px solid' : 'none',
                  borderRight: { xs: 'none', sm: idx % 2 === 0 ? '1px solid' : 'none' },
                  borderColor: 'divider',
                  minHeight: 40,
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ width: 120, flexShrink: 0 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2">{item.value}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyText text={t('click_to_fetch', '点击按钮获取数据')} />
      )}
    </DemoCard>
  )
}

/* ==================== 文件对话框 ==================== */

function FileDialogCard() {
  const { t } = useI18n()
  const [path, setPath] = useState('')

  const handlers = {
    openFile: () => App.OpenFileSelect().then((p) => p && setPath(p)),
    openFolder: () => App.OpenFolderSelect().then((p) => p && setPath(p)),
    saveFile: () => App.SaveFileSelect().then((p) => p && setPath(p)),
  }

  return (
    <DemoCard title={t('demo_file_dialog', '文件对话框')}>
      <SectionDesc>{t('demo_file_dialog_desc', '调用系统原生文件对话框，支持打开文件、选择目录和保存文件。')}</SectionDesc>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <Button variant="contained" onClick={handlers.openFile}>
          {t('open_file', '打开文件')}
        </Button>
        <Button variant="contained" color="success" onClick={handlers.openFolder}>
          {t('open_folder', '选择目录')}
        </Button>
        <Button variant="contained" color="warning" onClick={handlers.saveFile}>
          {t('save_file', '保存文件')}
        </Button>
      </Stack>
      {path ? (
        <Alert severity="info" icon={false}>
          {t('selected_path', '已选择路径')}: {path}
        </Alert>
      ) : (
        <EmptyText text={t('click_to_fetch', '点击按钮获取数据')} />
      )}
    </DemoCard>
  )
}

/* ==================== 文件读写 ==================== */

function FileReadWriteCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [filePath, setFilePath] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReadFile = async () => {
    if (!filePath.trim()) {
      toast(t('file_path_empty', '请输入文件路径'), 'warning')
      return
    }
    setLoading(true)
    try {
      const content = await App.ReadFileContent(filePath)
      setFileContent(content)
      toast(t('file_read_success', '文件读取成功'), 'success')
    } catch (err) {
      toast(String(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleWriteFile = async () => {
    if (!filePath.trim()) {
      toast(t('file_path_empty', '请输入文件路径'), 'warning')
      return
    }
    setLoading(true)
    try {
      const ok = await App.WriteFileContent(filePath, fileContent)
      if (ok) {
        toast(t('file_write_success', '文件写入成功'), 'success')
      } else {
        toast(t('file_write_failed', '文件写入失败'), 'error')
      }
    } catch (err) {
      toast(String(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DemoCard title={t('demo_file_read_write', '文件读写')}>
      <SectionDesc>{t('demo_file_read_write_desc', '读取和写入本地文件，展示文件系统交互能力。')}</SectionDesc>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder={t('file_path', '文件路径')}
          sx={{ maxWidth: 400 }}
        />
        <Button variant="contained" onClick={handleReadFile} disabled={loading}>
          {t('read_file', '读取文件')}
        </Button>
        <Button variant="contained" color="success" onClick={handleWriteFile} disabled={loading}>
          {t('write_file', '写入文件')}
        </Button>
      </Stack>
      <TextField
        fullWidth
        multiline
        rows={6}
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        placeholder={t('file_content', '文件内容')}
      />
    </DemoCard>
  )
}

/* ==================== 事件通知 ==================== */

interface NotifyLogItem {
  time: string
  title: string
  message: string
}

function NotifyCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [log, setLog] = useState<NotifyLogItem[]>([])

  useEffect(() => {
    const off = Events.On('notification', (event: any) => {
      const data = event.data
      setLog((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          title: data?.title ?? '',
          message: data?.message ?? '',
        },
        ...prev,
      ])
      toast(`${t('notification_received', '收到通知')}: ${data?.title ?? ''}`, 'info')
    })
    return () => off()
  }, [t, toast])

  const handleSendNotify = () => {
    if (!title.trim()) {
      toast(t('notify_title', '通知标题'), 'warning')
      return
    }
    App.Notify(title, message)
  }

  return (
    <DemoCard title={t('demo_notification', '事件通知')}>
      <SectionDesc>{t('demo_notification_desc', '后端通过 Event.Emit 向前端发送自定义通知事件（类型化事件）。')}</SectionDesc>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField size="small" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('notify_title', '通知标题')} sx={{ maxWidth: 200 }} />
        <TextField size="small" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('notify_message', '通知内容')} sx={{ maxWidth: 300 }} />
        <Button variant="contained" onClick={handleSendNotify}>
          {t('send_notify', '发送通知')}
        </Button>
      </Stack>
      {log.length ? (
        <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5, maxHeight: 200, overflowY: 'auto' }}>
          {log.map((item, idx) => (
            <Stack key={idx} direction="row" spacing={1} sx={{ py: 0.75, fontSize: 13, borderBottom: idx < log.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Typography component="span" sx={{ fontSize: 12, color: 'text.secondary', fontFamily: "'Courier New', monospace" }}>
                [{item.time}]
              </Typography>
              <Chip label={item.title} size="small" sx={{ height: 20, fontSize: 12 }} />
              {item.message && (
                <Typography component="span" variant="body2" color="text.secondary">
                  {item.message}
                </Typography>
              )}
            </Stack>
          ))}
        </Box>
      ) : (
        <EmptyText text={t('click_to_fetch', '点击按钮获取数据')} />
      )}
    </DemoCard>
  )
}

/* ==================== v3 特性：多窗口 ==================== */

function MultiWindowCard() {
  const { t } = useI18n()
  const { toast } = useToast()

  const openSubWindow = async () => {
    const ok = await App.OpenSubWindow()
    if (ok) toast(t('sub_window_opened', '子窗口已打开'), 'success')
  }

  return (
    <DemoCard title={t('v3_multi_window', '多窗口 (v3 新增)')}>
      <SectionDesc>{t('v3_multi_window_desc', 'v3 原生支持多窗口：每个窗口拥有独立生命周期，可随时通过 app.Window.NewWithOptions 创建。')}</SectionDesc>
      <Button variant="contained" onClick={openSubWindow}>
        {t('open_sub_window', '打开子窗口')}
      </Button>
    </DemoCard>
  )
}

/* ==================== v3 特性：系统托盘 ==================== */

function SystemTrayCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [created, setCreated] = useState(false)

  return (
    <DemoCard title={t('v3_system_tray', '系统托盘 (v3 新增)')}>
      <SectionDesc>{t('v3_system_tray_desc', 'v3 内置系统托盘支持：托盘图标 + 原生菜单（右键本托盘可见：显示主窗口 / 打开子窗口 / 退出应用）。')}</SectionDesc>
      <Stack direction="row" spacing={1.5}>
        {!created ? (
          <Button
            variant="contained"
            onClick={async () => {
              const ok = await App.CreateSystemTray()
              if (ok) {
                setCreated(true)
                toast(t('tray_created', '托盘已创建'), 'success')
              }
            }}
          >
            {t('create_tray', '创建托盘')}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            onClick={async () => {
              await App.DestroySystemTray()
              setCreated(false)
              toast(t('tray_destroyed', '托盘已销毁'), 'info')
            }}
          >
            {t('destroy_tray', '销毁托盘')}
          </Button>
        )}
      </Stack>
    </DemoCard>
  )
}

/* ==================== v3 特性：剪贴板 ==================== */

function ClipboardCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [text, setText] = useState('')

  return (
    <DemoCard title={t('v3_clipboard', '系统剪贴板 (v3 新增)')}>
      <SectionDesc>{t('v3_clipboard_desc', 'v3 直接提供剪贴板 API：app.Clipboard.SetText / Text，无需第三方库。')}</SectionDesc>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField size="small" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('clipboard_text', '剪贴板内容')} sx={{ maxWidth: 400 }} />
        <Button
          variant="contained"
          onClick={async () => {
            const ok = await App.ClipboardSetText(text)
            toast(ok ? t('clipboard_written', '已写入剪贴板') : t('clipboard_failed', '写入失败'), ok ? 'success' : 'error')
          }}
        >
          {t('write_clipboard', '写入')}
        </Button>
        <Button
          variant="outlined"
          onClick={async () => {
            const content = await App.ClipboardGetText()
            setText(content)
            toast(t('clipboard_read', '已读取剪贴板'), 'info')
          }}
        >
          {t('read_clipboard', '读取')}
        </Button>
      </Stack>
    </DemoCard>
  )
}

/* ==================== v3 特性：系统浏览器 ==================== */

function BrowserCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [url, setUrl] = useState('https://v3.wails.io')

  return (
    <DemoCard title={t('v3_browser', '系统浏览器 (v3 新增)')}>
      <SectionDesc>{t('v3_browser_desc', 'app.Browser.OpenURL 直接调用系统默认浏览器打开链接。')}</SectionDesc>
      <Stack direction="row" spacing={1.5}>
        <TextField size="small" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." sx={{ maxWidth: 400 }} />
        <Button
          variant="contained"
          onClick={async () => {
            const ok = await App.OpenInBrowser(url)
            if (!ok) toast(t('browser_failed', '打开浏览器失败'), 'error')
          }}
        >
          {t('open_in_browser', '打开浏览器')}
        </Button>
      </Stack>
    </DemoCard>
  )
}

/* ==================== v3 特性：全局快捷键 ==================== */

function GlobalShortcutCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [accelerator, setAccelerator] = useState('Ctrl+Alt+G')
  const [active, setActive] = useState<string[]>([])
  const [hits, setHits] = useState<Record<string, number>>({})

  useEffect(() => {
    App.GetActiveGlobalShortcuts()
      .then((keys) => setActive(keys || []))
      .catch(() => setActive([]))
    // 全局快捷键触发时后端会 Emit 类型化事件 "shortcut"
    const off = Events.On('shortcut', (event: any) => {
      const key = event.data as string
      setHits((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
    })
    return () => off()
  }, [])

  const refreshActive = () => {
    App.GetActiveGlobalShortcuts().then((keys) => setActive(keys || []))
  }

  return (
    <DemoCard title={t('v3_global_shortcut', '全局快捷键 (v3 新增)')}>
      <SectionDesc>{t('v3_global_shortcut_desc', 'app.GlobalShortcut.Register 注册系统级快捷键（应用不在前台也能触发），通过类型化事件推送到前端。试试注册后切到别的窗口按 Ctrl+Alt+G。')}</SectionDesc>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField size="small" value={accelerator} onChange={(e) => setAccelerator(e.target.value)} placeholder="Ctrl+Alt+G" sx={{ width: 220 }} />
        <Button
          variant="contained"
          onClick={async () => {
            const ok = await App.RegisterGlobalShortcut(accelerator)
            if (ok) {
              refreshActive()
              toast(t('shortcut_registered', '快捷键已注册') + ': ' + accelerator, 'success')
            } else {
              toast(t('shortcut_failed', '注册失败（格式或占用）'), 'error')
            }
          }}
        >
          {t('register_shortcut', '注册')}
        </Button>
        <Button
          variant="outlined"
          onClick={async () => {
            const ok = await App.UnregisterGlobalShortcut(accelerator)
            if (ok) refreshActive()
          }}
        >
          {t('unregister_shortcut', '注销')}
        </Button>
      </Stack>
      {active.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {active.map((key) => (
            <Chip key={key} label={`${key} × ${hits[key] || 0}`} color="primary" variant="outlined" size="small" />
          ))}
        </Stack>
      ) : (
        <EmptyText text={t('no_shortcuts', '暂无已注册的全局快捷键')} />
      )}
    </DemoCard>
  )
}

/* ==================== 通用小组件 ==================== */

function DemoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined">
      <CardHeader
        title={<Typography sx={{ fontSize: 16, fontWeight: 600 }}>{title}</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function SectionDesc({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
      {children}
    </Typography>
  )
}

function EmptyText({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 3 }}>
      {text}
    </Typography>
  )
}

/* ==================== 导出：按标签页分组 ==================== */

export interface DemoTab {
  label: string
  content: React.ReactNode
}

export function useDemoTabs(): DemoTab[] {
  const { t } = useI18n()
  return [
    {
      label: t('tab_v3_features', 'v3 特性'),
      content: (
        <>
          <MultiWindowCard />
          <SystemTrayCard />
          <GlobalShortcutCard />
          <ClipboardCard />
          <BrowserCard />
        </>
      ),
    },
    {
      label: t('tab_overview', '概览'),
      content: (
        <>
          <FeatureOverviewCard />
          <SystemInfoCard />
          <LangCard />
        </>
      ),
    },
    {
      label: t('tab_interaction', '交互与事件'),
      content: (
        <>
          <GreetCard />
          <TimeCard />
          <JsonCard />
          <NotifyCard />
        </>
      ),
    },
    {
      label: t('tab_files', '文件'),
      content: (
        <>
          <FileDialogCard />
          <FileReadWriteCard />
        </>
      ),
    },
    {
      label: t('tab_logs', '日志'),
      content: (
        <>
          <LogLevelCard />
          <LogViewerCard />
        </>
      ),
    },
  ]
}

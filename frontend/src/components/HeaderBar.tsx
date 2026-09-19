import { useEffect, useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { Close, Minimize, CropSquare } from '@mui/icons-material'
import { App } from '../../bindings/wailsv3-template/service'
import { useI18n } from '../i18n'
import LangSelector from './LangSelector'

export default function HeaderBar() {
  const { t } = useI18n()
  const [appName, setAppName] = useState('')

  useEffect(() => {
    App.GetProcessName()
      .then(setAppName)
      .catch(() => setAppName(t('app_name', 'wailsv3-template')))
  }, [t])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        pl: 1.5,
        pr: 0.5,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        userSelect: 'none',
        /* Frameless 窗口拖动区域 */
        '--wails-draggable': 'drag',
      }}
      onDoubleClick={() => App.WindowToggleMaximise()}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
        {appName}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, '--wails-draggable': 'no-drag' }}>
        <LangSelector />
        <IconButton size="small" onClick={() => App.WindowMinimise()} aria-label="minimise">
          <Minimize sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton size="small" onClick={() => App.WindowToggleMaximise()} aria-label="maximise">
          <CropSquare sx={{ fontSize: 15 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => App.WindowClose()}
          aria-label="close"
          sx={{ '&:hover': { bgcolor: 'error.main', color: '#fff' } }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  )
}

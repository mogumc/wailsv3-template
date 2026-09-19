import { useState } from 'react'
import { Box, Stack, Tab, Tabs } from '@mui/material'
import HeaderBar from './components/HeaderBar'
import { useDemoTabs } from './components/DemoPage'

function App() {
  const tabs = useDemoTabs()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', bgcolor: '#f5f7fa' }}>
      <HeaderBar />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', pl: 1 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ minHeight: 40 }}>
          {tabs.map((tab) => (
            <Tab key={tab.label} label={tab.label} sx={{ minHeight: 40, fontSize: 14 }} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={2}>{tabs[activeTab]?.content}</Stack>
      </Box>
    </Box>
  )
}

export default App

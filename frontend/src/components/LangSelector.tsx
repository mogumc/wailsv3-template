import { MenuItem, Select } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useI18n } from '../i18n'

interface LangSelectorProps {
  /** 语言切换成功后的回调（可选） */
  onChanged?: (langCode: string) => void
}

export default function LangSelector({ onChanged }: LangSelectorProps) {
  const { langList, currentLang, changeLang } = useI18n()

  const handleChange = (event: SelectChangeEvent) => {
    const langCode = event.target.value
    changeLang(langCode)
      .then(() => onChanged?.(langCode))
      .catch((error) => console.error('设置语言失败:', error))
  }

  return (
    <Select
      size="small"
      value={currentLang}
      onChange={handleChange}
      variant="standard"
      disableUnderline
      sx={{ fontSize: 13, minWidth: 96, mr: 1 }}
    >
      {langList.map((lang) => (
        <MenuItem key={lang.language_code} value={lang.language_code} sx={{ fontSize: 13 }}>
          {lang.language_name}
        </MenuItem>
      ))}
    </Select>
  )
}

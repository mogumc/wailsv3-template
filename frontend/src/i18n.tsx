import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { App } from '../bindings/wailsv3-template/service'
import type { LanguageInfo } from '../bindings/wailsv3-template/global'

interface I18nContextValue {
  /** 翻译：textMap[key] || fallback || key */
  t: (key: string, fallback?: string) => string
  textMap: Record<string, string>
  langList: LanguageInfo[]
  currentLang: string
  changeLang: (langCode: string) => Promise<void>
  reload: () => Promise<void>
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [textMap, setTextMap] = useState<Record<string, string>>({})
  const [langList, setLangList] = useState<LanguageInfo[]>([])
  const [currentLang, setCurrentLang] = useState('')
  const loadedRef = useRef(false)

  const reload = useCallback(async () => {
    try {
      const map = await App.GetLangTextMap()
      setTextMap((map ?? {}) as Record<string, string>)
    } catch (error) {
      console.error('加载语言包失败:', error)
      setTextMap({})
    }
  }, [])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    reload()
    App.GetALLLang()
      .then((list) => setLangList(list || []))
      .catch((error) => console.error('获取语言列表失败:', error))
    App.GetCurrentLang()
      .then((lang) => setCurrentLang(lang || 'zh-CN'))
      .catch(() => setCurrentLang('zh-CN'))
  }, [reload])

  const t = useCallback(
    (key: string, fallback?: string) => textMap[key] || fallback || key,
    [textMap],
  )

  const changeLang = useCallback(
    async (langCode: string) => {
      await App.SetLanguage(langCode)
      setCurrentLang(langCode)
      await reload()
    },
    [reload],
  )

  return (
    <I18nContext.Provider value={{ t, textMap, langList, currentLang, changeLang, reload }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n 必须在 I18nProvider 内使用')
  return ctx
}

package api

import (
	"wailsv3-template/global"
)

func GetLang() (*global.LanguagePack, error) {
	return global.GetLangPack()
}

func GetALLLang() []global.LanguageInfo {
	return global.GetLangInfoList()
}
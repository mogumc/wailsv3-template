package service

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// flashtime 每秒向前端推送一次当前时间（事件名已在 main.go 中注册）
func flashtime() {
	go func() {
		for {
			now := time.Now().Format(time.DateTime)
			application.Get().Event.Emit("time", now)
			time.Sleep(time.Second)
		}
	}()
}

func getJSONString() string {
	datas := map[string]interface{}{
		"code":    200,
		"message": "ok",
		"data": []map[string]interface{}{
			{
				"id":    1,
				"name":  "apps",
				"isdir": true,
				"size":  0,
			},
			{
				"id":    2,
				"name":  "docs",
				"isdir": true,
				"size":  0,
			},
			{
				"id":    3,
				"name":  "readme.txt",
				"isdir": false,
				"size":  2048,
			},
		},
	}

	jsonBytes, err := json.Marshal(datas)
	if err != nil {
		return "{}"
	}

	return string(jsonBytes)
}

type SystemInfo struct {
	OS          string `json:"os"`
	Arch        string `json:"arch"`
	NumCPU      int    `json:"num_cpu"`
	Hostname    string `json:"hostname"`
	GoVer       string `json:"go_ver"`
	Time        string `json:"time"`
	ProcessName string `json:"process_name"`
}

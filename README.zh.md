# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

这是一个使用浏览器麦克风输入，将语音实时转写并翻译成其他语言的 Web 应用。

## 主要功能

- 使用浏览器麦克风输入
- 实时语音转写
- 翻译转写文本
- 切换源语言和目标语言
- 开始、停止、提交和清空会话

## 使用方法

在屏幕底部的控制面板中选择源语言和目标语言。

点击 `Start` 请求麦克风权限并开始转写。识别到语音后，主面板会显示转写和翻译结果。

点击 `Stop` 停止麦克风输入和 Realtime 连接。

点击 `Commit` 提交当前音频缓冲区，并完成当前转写内容以进行翻译。会话期间，音频缓冲区也会每15秒自动提交一次。

点击 `Clear` 清空显示的历史记录。

## 需要准备

- Node.js
- OpenAI API key

## 设置

创建 `.env.local`，并设置 OpenAI API key。

```bash
OPENAI_API_KEY=your_api_key
```

安装依赖。

```bash
npm install
```

启动开发服务器。

```bash
npm run dev
```

在浏览器中打开以下地址。

```txt
http://localhost:3000
```

## 注意事项

- 需要在浏览器中允许麦克风权限。
- 使用 OpenAI API 可能会产生费用。

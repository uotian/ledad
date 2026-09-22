# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![ledad 实时语音转写和翻译演示](docs/assets/ledad-demo.gif)

使用示例数据的操作演示。

这是一个使用浏览器麦克风输入，将语音实时转写并翻译成其他语言的 Web 应用。

## 工作原理

浏览器通过 WebRTC 将麦克风音频传输至 OpenAI Realtime API，以生成低延迟的初步转写。同时，浏览器会将同一段音频按60秒录制，并发送至 `gpt-transcribe` 生成更准确的最终转写。已完成的初步内容会在同一时间线上替换为最终版本，最新的未完成部分则继续显示为初步内容。OpenAI API 密钥仅在服务器端处理。

使用技术：Next.js 16、React 19、TypeScript，以及 OpenAI Realtime API 和 Responses API。

## 主要功能

- 使用浏览器麦克风输入
- 低延迟初步转写和每60秒生成的最终转写
- 翻译初步和最终转写文本
- 切换源语言和目标语言
- 开始、停止、提交和清空会话

## 使用方法

点击屏幕右上角的齿轮图标（`Settings`），调整以下设置后点击 `Save`。设置保存在当前浏览器中。

- `Source language`／`Translation language`：可选择英语（`en`）、日语（`ja`）、中文（`zh`）或法语（`fr`）。默认为英语→日语。底部控制面板会显示所选的翻译方向。
- `Text size`：S／M／L（默认为 M）。
- `Prompt`：输入话题或录音背景，为转写提供上下文。
- `Keywords`：输入专有名词、专业术语或缩写，每行一个，作为拼写提示。

会话不是 idle 状态时打开设置，会先确认是否停止会话。保存后，文字大小立即生效；其他设置在下次会话开始时生效。

点击 `Stop` 停止麦克风输入和 Realtime 连接。

点击 `Commit` 提交当前音频缓冲区，并完成当前转写内容以进行翻译。会话期间，音频缓冲区也会每15秒自动提交一次。

点击主面板右下角的橡皮擦图标（`Clear`）清空显示的历史记录。此操作不会停止会话。

## 需要准备

- Node.js
- OpenAI API key

## 支持的浏览器

请使用最新版稳定版 Chrome、Edge、Firefox 或 Safari（包括 iOS Safari）。不支持 Internet Explorer 和过旧的浏览器。

麦克风输入还需要安全上下文（HTTPS 或 `localhost`）以及浏览器的麦克风权限。

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
- 会话会在 30 分钟后自动停止。如需继续，请再次点击 `Start`。
- 使用 OpenAI API 可能会产生费用。

[更新日志](CHANGELOG.md)

# 已发布后的更新方法

这个项目发布到 Wallpaper Engine 创意工坊后，仍然可以继续更新。

## 当前推荐发布入口
- `index_audio_publish.html`

## 当前主要文件
- `index_audio_publish.html`：发布入口
- `script-audio-edge.js`：音频响应粒子与时间逻辑
- `style.css`：布局与视觉样式
- `background_1664x936.jpg`：当前发布预览/主舞台背景
- `project.json`：Wallpaper Engine 项目配置

## 以后更新流程
1. 修改项目文件
2. 在 Wallpaper Engine 编辑器里重新打开这个项目
3. 确认入口仍然是 `index_audio_publish.html`
4. 预览确认没问题后，选择更新已发布的创意工坊作品
5. 填写本次更新说明

## 建议
- 尽量继续使用英文文件名作为发布入口，避免更新时出现路径或编码问题
- 如果只是实验效果，可以继续放在 `index.html` 或其他测试文件中
- 确认稳定后，再同步到 `index_audio_publish.html`

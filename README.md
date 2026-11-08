# Paseo Smart Title

一键根据当前会话上下文生成更贴切的 Paseo 会话标题。

## 使用

- 点击会话输入框上方的“智能标题”按钮；或
- 打开 Command Center，运行“智能更新会话标题”。

插件读取最近 80 条 timeline 项目中的用户和助手文本，总上下文最多 24,000 个字符。它使用当前会话的 provider/model 启动一个后台、自动归档的临时会话生成标题；该临时会话不会出现在普通工作区列表中。生成完成后，插件通过 `paseo agent update` 保存标题。

## 开发

```bash
npm install
npm run typecheck
paseo plugin reload paseo-smart-title
```

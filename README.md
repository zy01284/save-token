# save-token

粘贴你的 prompt，压掉多余的 token。变量、代码、否定词不会被动。

## 在线使用

https://save-token-xxx.vercel.app

## 它做什么

- 删除客套话（"你好""请帮我""非常感谢"）
- 合并冗余表达（"非常非常重要" → "非常重要"）
- 保护变量占位符（`{{name}}`、`${result}`）
- 保护代码块、行内代码、URL
- 保护否定词（"不要""必须""never"）

## 它不做什么

- 不做语义重写（那是下一版）
- 不上传你的 prompt 到任何服务器（纯前端运行）

## 本地运行

```bash
python -m http.server 8000
# 打开 http://localhost:8000

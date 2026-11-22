# Avatar 像 riben.life 店員一樣對話，懂所有 blog 內容，模型可在 sysAdmin 設定

Status: Proposed 2026-11-22 · Accepted 2026-11-22 (owner)
Author: Mingster

## Problem

mingster.com 是我個人的網站，拿來玩和練習概念。首頁是一個 Blender 做的 avatar，接到 AI 代理。只有付費用戶和我能跟它對話。

現在的 avatar 只是一般閒聊夥伴。它不知道 `web/blogData` 裡我寫過的東西，問它 blog 的內容答不出來。模型寫死在程式裡（Gemini），要換模型得改程式再部署。

riben.life 的 AI 店員已經有一套我滿意的對話設計，也能在 sysAdmin 設定模型。mingster.com 應該用同一套。

## Proposed outcome

* 跟 avatar 對話的方式和 riben.life 的店員一樣。
* avatar 能回答 `web/blogData` 裡的所有內容。
* 我能在 sysAdmin 頁面設定 avatar 用哪個模型，不用改程式。
* 可選的模型供應商只有 Claude、Gemini、Grok。不用 Codex 或 OpenAI。
* 預設模型：Gemini Flash（我的選擇，2026-11-22）。
* 只有付費用戶和我能對話，這點不變。

## Affected users and systems

* 付費用戶與我：首頁 avatar 對話。
* 我（平台管理者）：新的 sysAdmin 模型設定頁。
* 系統：`/api/chat`、avatar 元件、`web/blogData`、平台設定。

## Constraints

* 照 riben.life 的設計，不另外發明一套。
* 語音、表情、動作要繼續運作。
* 不碰任何資料庫，schema 變更由我同意後才推。
* 正式機的金鑰只有我能加。

## Open questions

* blog 之後會一直變多，全部放進對話時是否還夠快、夠便宜。
* 「和店員一樣」裡，哪些店員才有的功能（購物車、工單、LINE、點數計費）不適用於這裡。

## Related chores (not part of this intent, filed as issues)

* 所有套件更新到最新。
* 確認 repo 裡完全沒有 Codex 或 OpenAI。
* 刪除 `vercel.json` 和過時程式碼，包含從 riben.life 搬來、從沒用過的 Store、訂單等 model。

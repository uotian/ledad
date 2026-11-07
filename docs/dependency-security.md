# 依存関係のセキュリティ

確認日：2026-11-07。Gemini SDK 3への移行後に残っていた依存監査の指摘を確認し、Next.js 16・React 19・Vitest 4・shadcn 4を維持して更新した。アプリの処理、Geminiのモデル・APIバージョン、既存データと認証情報は変更しない。

## 監査結果

| 対象 | 更新前 | 更新後 |
| --- | --- | --- |
| 全依存 | 35件：Critical 2、High 13、Moderate 19、Low 1 | Low 3件のみ |
| 本番依存（`npm audit --omit=dev`） | 14件：Critical 2、High 7、Moderate 5 | 0件 |

更新後のLow 3件は `deepmerge` の同じ問題が、依存元の `@shadcn/registry` と `shadcn` にも計上されたもの。新たに3種類の問題が発生したという意味ではない。以下の回避策を入れても、修正版が未公開のため監査表示は残る。

## 更新方針

| 対象 | 更新・対応 |
| --- | --- |
| Next.js・eslint-config-next | 16.2.11 → 16.4.5。Criticalを含む修正を取り込む。 |
| sharp | 0.35.3へのoverrideを外し、Next.jsが要求する0.35.5を使用。 |
| shadcn | 4.15.0 → 4.23.0。MCP依存の更新により、脆弱な `proxy-addr`・旧MCP SDK・Express/Hono関連の依存経路がなくなった。 |
| Vitest・coverage-v8 | 4.1.10 → 4.1.12。Viteもロックファイルで8.3.6に更新。 |
| minimatch | 脆弱な7〜10系に限定して11.0.5へoverride。旧APIを使う3系の呼び出し元には適用しない。 |
| その他の間接依存 | `npm audit fix` で宣言済みの範囲内を更新。zod、undici、js-yaml、brace-expansionなどの指摘を解消。 |

`npm audit fix --force` は使用していない。監査が提示するshadcn 1系などへの変更は採用せず、Base UI構成を維持する。minimatchのoverrideは、呼び出し元が修正版を要求するようになった時点で削除を検討する。型チェック・lintとshadcnの変更プレビューで呼び出し元との互換性を確認した。

## deepmergeの回避策

`deepmerge` 4.3.1には、特定の入力で返り値のオブジェクトのプロトタイプを書き換えられる問題があり、確認時点で修正版はない。アプリ内でJavaScriptとして使用している箇所はなく、shadcnの開発用CLIの依存に残る。`src/app/globals.css` はshadcnのCSSだけを参照する。

上流で示されているNode.jsの `--disable-proto=throw` を、`package.json` のshadcnコマンドに適用する。コンポーネントの確認や追加は、リポジトリのルートで以下のコマンドを使う。

```bash
npm run shadcn -- info
npm run shadcn -- add button --dry-run
# 内容を確認してから追加する場合
npm run shadcn -- add button
```

この設定は上記コマンドのNodeプロセスに限る。`npx shadcn`、`npm exec -- shadcn`、CLIの直接起動には適用されない。本プロジェクトではNext.jsのビルド等がこのオプションで失敗したため、全コマンド共通の `.npmrc` には設定しない。修正版の公開後はshadcnの依存を更新し、この一時的な起動オプションと専用テストを取り除く。

`tests/dependencies/security.test.ts` は通常のマージを確認する。加えて実際の `npm run shadcn` の子プロセスに検証用コードを読み込ませ、nullプロトタイプの対象、null／undefinedの値、対象側の `__proto__` キーを含む入力が `ERR_PROTO_ACCESS` で拒否されることを確認する。回避策のない直接起動を安全とみなすテストではない。

## 検証

- `npm run typecheck`、`npm run lint`：成功。
- Node.js 22.16.0で `npm test`：33ファイル・263テスト成功。Gemini SDKの実クライアントを使った送信先・設定のテストを含む。
- 同Node.jsで `npm run build`：Next.js 16.4.5の本番ビルド成功。
- `npm run shadcn -- info` と `npm run shadcn -- add button --dry-run`：成功。コンポーネントの変更は適用していない。
- `npm ls`、`npm ci --dry-run --ignore-scripts --no-audit --no-fund`：依存関係とロックファイルの整合を確認。
- `npm audit --omit=dev`：0件。`npm audit`：上記Low 3件のため終了コード1。監査対象からの除外はしていない。

実API、実マイク、ブラウザ画面、リモートCIは今回未確認。実際の機器での音声品質・遅延や外部APIの可用性は、この検証では保証しない。

## 参照資料

- [Next.js 16.4.5リリース](https://github.com/vercel/next.js/releases/tag/v16.4.5)
- [Next.jsのCritical修正とsharp要件](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw)
- [proxy-addrのCriticalアドバイザリ](https://github.com/jshttp/proxy-addr/security/advisories/GHSA-jqcg-44mw-7w3h)
- [minimatchの修正範囲](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249)
- [deepmergeのアドバイザリ](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)／[上流の報告と回避策](https://github.com/TehShrike/deepmerge/issues/273)
- [Node.jsの `--disable-proto`](https://nodejs.org/api/cli.html#--disable-protomode)

# Node.js インストールマニュアル (macOS)

このマニュアルでは、macOSにNode.jsをインストールする手順を説明します。推奨される方法は、Node Version Manager (nvm)を使用することです。

## 前提条件

- macOS (Apple Silicon Mac または Intel Mac)
- 管理者権限（パスワード入力が必要）

## インストール手順

### 1. Homebrewのインストール

まず、パッケージマネージャーのHomebrewをインストールします。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

インストール中にパスワードの入力が求められます。

### 2. HomebrewをPATHに追加

インストール完了後、HomebrewをPATHに追加します。

```bash
# .zprofileにHomebrewのパスを追加
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile

# 現在のセッションでHomebrewを有効化
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 3. nvmのインストール

Node Version Manager (nvm)をインストールします。

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### 4. nvmの設定

nvmを.zshrcファイルに追加して、新しいターミナルセッションでも使用できるようにします。

```bash
# nvmの環境変数を追加
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc

# nvmスクリプトを読み込む設定を追加
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc

# nvmの補完機能を追加
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc
```

### 5. 現在のセッションでnvmを有効化

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### 6. Node.jsのインストール

最新のLTS版のNode.jsをインストールします。

```bash
nvm install --lts
```

### 7. インストール確認

Node.jsとnpmが正常にインストールされたか確認します。

```bash
node --version
npm --version
nvm --version
```

## インストール結果

正常にインストールされると、以下のようなバージョンが表示されます：

- Node.js: v22.16.0 (LTS版)
- npm: v10.9.2
- nvm: v0.39.0

## nvmの基本的な使用方法

### 新しいNode.jsバージョンのインストール

```bash
nvm install 18      # Node.js 18.xをインストール
nvm install 20      # Node.js 20.xをインストール
nvm install --lts   # 最新のLTS版をインストール
```

### Node.jsバージョンの切り替え

```bash
nvm use 18          # Node.js 18.xに切り替え
nvm use 20          # Node.js 20.xに切り替え
nvm use --lts       # 最新のLTS版に切り替え
nvm use default     # デフォルトバージョンに切り替え
```

### インストール済みバージョンの確認

```bash
nvm list            # インストール済みバージョンを表示
nvm list installed  # インストール済みバージョンのみ表示
```

### デフォルトバージョンの設定

```bash
nvm alias default 18    # Node.js 18.xをデフォルトに設定
nvm alias default lts   # 最新のLTS版をデフォルトに設定
```

## トラブルシューティング

### 新しいターミナルでnvmが認識されない場合

ターミナルを再起動するか、以下のコマンドを実行してください：

```bash
source ~/.zshrc
```

### Homebrewが認識されない場合

以下のコマンドを実行してください：

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 権限エラーが発生した場合

sudoを使用して管理者権限で実行してください：

```bash
sudo /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 次のステップ

Node.jsのインストールが完了したら、以下のような開発環境の構築を検討してください：

1. **プロジェクトの初期化**
   ```bash
   mkdir my-project
   cd my-project
   npm init -y
   ```

2. **よく使用されるパッケージのインストール**
   ```bash
   npm install express    # Webフレームワーク
   npm install nodemon    # 開発用サーバー
   ```

3. **TypeScriptの設定**
   ```bash
   npm install -D typescript @types/node
   npx tsc --init
   ```

## 参考リンク

- [Node.js公式サイト](https://nodejs.org/)
- [nvm GitHub](https://github.com/nvm-sh/nvm)
- [Homebrew公式サイト](https://brew.sh/)
- [npm公式サイト](https://www.npmjs.com/) 
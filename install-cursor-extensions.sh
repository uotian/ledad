#!/bin/bash

echo "Installing Cursor extensions for Next.js development..."

# 必須セット（CursorのAI機能を最大限活用）
echo "Installing essential extensions..."
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode

# 開発効率向上セット
echo "Installing productivity extensions..."
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension christian-kohler.path-intellisense
code --install-extension wix.vscode-import-cost

# UI/UX向上セット
echo "Installing UI/UX extensions..."
code --install-extension vscode-icons-team.vscode-icons
code --install-extension CoenraadS.bracket-pair-colorizer-2
code --install-extension usernamehw.errorlens

echo "All extensions installed successfully!"
echo ""
echo "Installed extensions:"
echo "✅ Tailwind CSS IntelliSense"
echo "✅ ESLint"
echo "✅ Prettier - Code formatter"
echo "✅ ES7+ React/Redux/React-Native snippets"
echo "✅ Path Intellisense"
echo "✅ Import Cost"
echo "✅ VSCode Icons"
echo "✅ Bracket Pair Colorizer 2"
echo "✅ Error Lens"
echo ""
echo "Next steps:"
echo "1. Restart Cursor to ensure all extensions are loaded"
echo "2. Check that all extensions are working properly"
echo "3. Configure project-specific settings if needed"

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// 色定義の型
interface ColorDefinition {
  name: string;
  variable: string;
  category: string;
}

// 色定義の配列
const colorDefinitions: ColorDefinition[] = [
  // 基本色
  { name: "Background", variable: "background", category: "基本色" },
  { name: "Foreground", variable: "foreground", category: "基本色" },

  // カード・ポップオーバー
  { name: "Card", variable: "card", category: "カード・ポップオーバー" },
  { name: "Card Foreground", variable: "card-foreground", category: "カード・ポップオーバー" },
  { name: "Popover", variable: "popover", category: "カード・ポップオーバー" },
  { name: "Popover Foreground", variable: "popover-foreground", category: "カード・ポップオーバー" },

  // プライマリ・セカンダリ
  { name: "Primary", variable: "primary", category: "プライマリ・セカンダリ" },
  { name: "Primary Foreground", variable: "primary-foreground", category: "プライマリ・セカンダリ" },
  { name: "Secondary", variable: "secondary", category: "プライマリ・セカンダリ" },
  { name: "Secondary Foreground", variable: "secondary-foreground", category: "プライマリ・セカンダリ" },

  // ミュート・アクセント
  { name: "Muted", variable: "muted", category: "ミュート・アクセント" },
  { name: "Muted Foreground", variable: "muted-foreground", category: "ミュート・アクセント" },
  { name: "Accent", variable: "accent", category: "ミュート・アクセント" },
  { name: "Accent Foreground", variable: "accent-foreground", category: "ミュート・アクセント" },

  // システム色
  { name: "Destructive", variable: "destructive", category: "システム色" },
  { name: "Border", variable: "border", category: "システム色" },
  { name: "Input", variable: "input", category: "システム色" },
  { name: "Ring", variable: "ring", category: "システム色" },

  // チャート色
  { name: "Chart 1", variable: "chart-1", category: "チャート色" },
  { name: "Chart 2", variable: "chart-2", category: "チャート色" },
  { name: "Chart 3", variable: "chart-3", category: "チャート色" },
  { name: "Chart 4", variable: "chart-4", category: "チャート色" },
  { name: "Chart 5", variable: "chart-5", category: "チャート色" },

  // サイドバー
  { name: "Sidebar", variable: "sidebar", category: "サイドバー" },
  { name: "Sidebar Foreground", variable: "sidebar-foreground", category: "サイドバー" },
  { name: "Sidebar Primary", variable: "sidebar-primary", category: "サイドバー" },
  { name: "Sidebar Primary Foreground", variable: "sidebar-primary-foreground", category: "サイドバー" },
  { name: "Sidebar Accent", variable: "sidebar-accent", category: "サイドバー" },
  { name: "Sidebar Accent Foreground", variable: "sidebar-accent-foreground", category: "サイドバー" },
  { name: "Sidebar Border", variable: "sidebar-border", category: "サイドバー" },
  { name: "Sidebar Ring", variable: "sidebar-ring", category: "サイドバー" },
];

// カテゴリごとに色をグループ化
const groupedColors = colorDefinitions.reduce((acc, color) => {
  if (!acc[color.category]) {
    acc[color.category] = [];
  }
  acc[color.category].push(color);
  return acc;
}, {} as Record<string, ColorDefinition[]>);

// 色ボックスコンポーネント
function ColorBox({ color }: { color: ColorDefinition }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className="w-20 h-20 rounded-lg border-2 border-border shadow-md flex items-center justify-center text-center p-1 transition-all duration-200 hover:scale-105 relative overflow-hidden"
        style={{
          backgroundColor: `var(--${color.variable})`,
        }}
      >
        {/* 背景色が薄い場合のオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{color.name}</p>
        <p className="text-[10px] text-muted-foreground">--{color.variable}</p>
      </div>
    </div>
  );
}

interface ColorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ColorsDialog({ open, onOpenChange }: ColorsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto" style={{ maxWidth: "85vw", width: "85vw" }}>
        <DialogHeader>
          <DialogTitle>ledad カラーパレット</DialogTitle>
          <DialogDescription>
            プロジェクトで使用されているすべての色定義を視覚的に確認できます。 ライトモードとダークモードで色が自動的に切り替わります。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* カテゴリごとの色表示 */}
          {Object.entries(groupedColors).map(([category, colors]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold text-foreground mb-6 border-b border-border pb-3">{category}</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-6">
                {colors.map((color) => (
                  <ColorBox key={color.variable} color={color} />
                ))}
              </div>
            </div>
          ))}

          {/* 情報セクション */}
          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-4">色の使用方法</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">Tailwind CSS クラス</h5>
                <code className="text-sm bg-background p-3 rounded block">bg-primary text-primary-foreground</code>
              </div>
              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">CSS 変数</h5>
                <code className="text-sm bg-background p-3 rounded block">background-color: var(--primary);</code>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

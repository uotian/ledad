"use client";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  {
    name: "Card Foreground",
    variable: "card-foreground",
    category: "カード・ポップオーバー",
  },
  { name: "Popover", variable: "popover", category: "カード・ポップオーバー" },
  {
    name: "Popover Foreground",
    variable: "popover-foreground",
    category: "カード・ポップオーバー",
  },

  // プライマリ・セカンダリ
  { name: "Primary", variable: "primary", category: "プライマリ・セカンダリ" },
  {
    name: "Primary Foreground",
    variable: "primary-foreground",
    category: "プライマリ・セカンダリ",
  },
  {
    name: "Secondary",
    variable: "secondary",
    category: "プライマリ・セカンダリ",
  },
  {
    name: "Secondary Foreground",
    variable: "secondary-foreground",
    category: "プライマリ・セカンダリ",
  },

  // ミュート・アクセント
  { name: "Muted", variable: "muted", category: "ミュート・アクセント" },
  {
    name: "Muted Foreground",
    variable: "muted-foreground",
    category: "ミュート・アクセント",
  },
  { name: "Accent", variable: "accent", category: "ミュート・アクセント" },
  {
    name: "Accent Foreground",
    variable: "accent-foreground",
    category: "ミュート・アクセント",
  },

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
  {
    name: "Sidebar Foreground",
    variable: "sidebar-foreground",
    category: "サイドバー",
  },
  {
    name: "Sidebar Primary",
    variable: "sidebar-primary",
    category: "サイドバー",
  },
  {
    name: "Sidebar Primary Foreground",
    variable: "sidebar-primary-foreground",
    category: "サイドバー",
  },
  {
    name: "Sidebar Accent",
    variable: "sidebar-accent",
    category: "サイドバー",
  },
  {
    name: "Sidebar Accent Foreground",
    variable: "sidebar-accent-foreground",
    category: "サイドバー",
  },
  {
    name: "Sidebar Border",
    variable: "sidebar-border",
    category: "サイドバー",
  },
  { name: "Sidebar Ring", variable: "sidebar-ring", category: "サイドバー" },
];

// カテゴリごとに色をグループ化
const groupedColors = colorDefinitions.reduce(
  (acc, color) => {
    if (!acc[color.category]) {
      acc[color.category] = [];
    }
    acc[color.category].push(color);
    return acc;
  },
  {} as Record<string, ColorDefinition[]>
);

// 色ボックスコンポーネント（ライトモードとダークモードを横に並べる）
function ColorBox({ color }: { color: ColorDefinition }) {
  // ライトモードとダークモードの色を固定で定義
  const lightModeColors: Record<string, string> = {
    background: "oklch(80% 0.04 90)",
    foreground: "oklch(35% 0.02 90)",
    card: "oklch(75% 0.04 90)",
    "card-foreground": "oklch(10% 0.02 90)",
    popover: "oklch(10% 0.035 90)",
    "popover-foreground": "oklch(90% 0.02 90)",
    primary: "oklch(60% 0.13 50)",
    "primary-foreground": "oklch(95% 0.01 50)",
    secondary: "oklch(50% 0.08 240)",
    "secondary-foreground": "oklch(95% 0.01 240)",
    muted: "oklch(70% 0.03 90)",
    "muted-foreground": "oklch(50% 0.015 90)",
    accent: "oklch(68% 0.12 50)",
    "accent-foreground": "oklch(95% 0.01 50)",
    destructive: "oklch(65% 0.25 25)",
    border: "oklch(70% 0.02 90)",
    input: "oklch(70% 0.02 90)",
    ring: "oklch(65% 0.01 90)",
    "chart-1": "oklch(65% 0.15 50)",
    "chart-2": "oklch(60% 0.12 240)",
    "chart-3": "oklch(55% 0.1 90)",
    "chart-4": "oklch(70% 0.18 50)",
    "chart-5": "oklch(65% 0.15 240)",
    sidebar: "oklch(20% 0.025 87.362)",
    "sidebar-foreground": "oklch(85% 0.02 87.362)",
    "sidebar-primary": "oklch(65% 0.15 50)",
    "sidebar-primary-foreground": "oklch(95% 0.01 50)",
    "sidebar-accent": "oklch(75% 0.03 240)",
    "sidebar-accent-foreground": "oklch(95% 0.01 240)",
    "sidebar-border": "oklch(70% 0.02 90)",
    "sidebar-ring": "oklch(65% 0.15 50)",
  };

  const darkModeColors: Record<string, string> = {
    background: "oklch(15% 0.02 87.362)",
    foreground: "oklch(85% 0.02 87.362)",
    card: "oklch(20% 0.025 87.362)",
    "card-foreground": "oklch(85% 0.02 87.362)",
    popover: "oklch(18% 0.02 87.362)",
    "popover-foreground": "oklch(85% 0.02 87.362)",
    primary: "oklch(70% 0.15 87.362)",
    "primary-foreground": "oklch(15% 0.02 87.362)",
    secondary: "oklch(50% 0.08 240)",
    "secondary-foreground": "oklch(95% 0.01 240)",
    muted: "oklch(22% 0.02 87.362)",
    "muted-foreground": "oklch(65% 0.015 87.362)",
    accent: "oklch(25% 0.05 87.362)",
    "accent-foreground": "oklch(85% 0.02 87.362)",
    destructive: "oklch(70% 0.25 25)",
    border: "oklch(25% 0.02 87.362)",
    input: "oklch(25% 0.02 87.362)",
    ring: "oklch(70% 0.15 87.362)",
    "chart-1": "oklch(70% 0.15 87.362)",
    "chart-2": "oklch(65% 0.12 120)",
    "chart-3": "oklch(60% 0.1 180)",
    "chart-4": "oklch(75% 0.18 60)",
    "chart-5": "oklch(70% 0.15 300)",
    sidebar: "oklch(20% 0.025 87.362)",
    "sidebar-foreground": "oklch(85% 0.02 87.362)",
    "sidebar-primary": "oklch(70% 0.15 87.362)",
    "sidebar-primary-foreground": "oklch(15% 0.02 87.362)",
    "sidebar-accent": "oklch(25% 0.03 87.362)",
    "sidebar-accent-foreground": "oklch(85% 0.02 87.362)",
    "sidebar-border": "oklch(25% 0.02 87.362)",
    "sidebar-ring": "oklch(70% 0.15 87.362)",
  };

  const lightColor = lightModeColors[color.variable] || "#000000";
  const darkColor = darkModeColors[color.variable] || "#ffffff";

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex space-x-2">
        {/* ライトモード */}
        <div className="flex flex-col items-center">
          <div
            className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-md flex items-center justify-center text-center p-1 transition-all duration-200 hover:scale-105 relative overflow-hidden"
            style={{
              backgroundColor: lightColor,
            }}
          >
            {/* 背景色が薄い場合のオーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          </div>
          <p className="text-[10px] text-gray-600 mt-1">Light</p>
        </div>

        {/* ダークモード */}
        <div className="flex flex-col items-center">
          <div
            className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-md flex items-center justify-center text-center p-1 transition-all duration-200 hover:scale-105 relative overflow-hidden bg-gray-900"
            style={{
              backgroundColor: darkColor,
            }}
          >
            {/* 背景色が薄い場合のオーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          </div>
          <p className="text-[10px] text-gray-600 mt-1">Dark</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-gray-800">{color.name}</p>
        <p className="text-[10px] text-gray-500">--{color.variable}</p>
      </div>
    </div>
  );
}

interface ColorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ColorsDialog({
  open,
  onOpenChange,
}: ColorsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[80vh] overflow-y-auto bg-white"
        style={{ maxWidth: "90vw", width: "90vw" }}
      >
        <DialogHeader>
          <DialogTitle className="text-gray-800">
            ledad カラーパレット
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            プロジェクトで使用されているすべての色定義を視覚的に確認できます。
            ライトモードとダークモードの色が横に並んで表示されます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* カテゴリごとの色表示 */}
          {Object.entries(groupedColors).map(([category, colors]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-300 pb-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
                {colors.map((color) => (
                  <ColorBox key={color.variable} color={color} />
                ))}
              </div>
            </div>
          ))}

          {/* 情報セクション */}
          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-4">色の使用方法</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-800 mb-2">
                  Tailwind CSS クラス
                </h5>
                <code className="text-sm bg-white p-3 rounded block border border-gray-300">
                  bg-primary text-primary-foreground
                </code>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-800 mb-2">
                  CSS 変数
                </h5>
                <code className="text-sm bg-white p-3 rounded block border border-gray-300">
                  background-color: var(--primary);
                </code>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

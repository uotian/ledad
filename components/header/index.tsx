import packageJson from "@/package.json";

export function Header() {
  return (
    <header className="flex items-baseline gap-2 px-1">
      <h1 className="text-sm font-semibold tracking-wide text-foreground">{packageJson.displayName}</h1>
      <span className="text-xs font-medium text-muted-foreground">v{packageJson.version}</span>
    </header>
  );
}

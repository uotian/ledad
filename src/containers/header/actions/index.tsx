import Setting from "./setting";
import ThemeToggle from "./theme-toggle";

export default function Actions() {
  return (
    <div className="flex items-center gap-8">
      <Setting />
      <ThemeToggle />
    </div>
  );
}

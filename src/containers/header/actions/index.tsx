import ThemeToggle from "./theme-toggle";
import Trash from "./trash";
import Setting from "./setting";

export default function Actions() {
  return (
    <div className="flex items-center gap-6">
      <Trash />
      <Setting />
      <ThemeToggle />
    </div>
  );
}

import Setting from "./setting";
import ThemeToggle from "./theme-toggle";
import Trash from "./trash";

export default function Actions() {
  return (
    <div className="flex items-center gap-8">
      <Trash />
      <Setting />
      <ThemeToggle />
    </div>
  );
}

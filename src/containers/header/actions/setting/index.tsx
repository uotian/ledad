import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import DialogContent from "./content";

export default function Component() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button aria-label="設定を開く" type="button" title="設定">
          <Settings className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent />
    </Dialog>
  );
}

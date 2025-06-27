import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import DialogContent from "./content";
import ButtonSquare from "@/components/myui/button-square";

export default function Component() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ButtonSquare size="sm" aria-label="設定を開く" type="button" title="設定">
          <Settings className="w-5 h-5" strokeWidth={1.5} />
        </ButtonSquare>
      </DialogTrigger>
      <DialogContent />
    </Dialog>
  );
}

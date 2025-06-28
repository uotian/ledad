import MicInput from "./mic-input";
import TextInput from "./text-input";
import { getLang1, getLang2 } from "@/lib/storage";

export default function Footer() {
  const lang1 = getLang1();
  const lang2 = getLang2();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background/75 to-transparent">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-8 xl:gap-16">
          <MicInput langFrom={lang1} langTo={lang2} user={1} />
          <TextInput />
          <MicInput langFrom={lang2} langTo={lang1} user={2} />
        </div>
      </div>
    </footer>
  );
}

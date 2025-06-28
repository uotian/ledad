import MicInput from "./mic-input";
import TextInput from "./text-input";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background/75 to-transparent">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-8 xl:gap-16">
          <MicInput />
          <TextInput />
        </div>
      </div>
    </footer>
  );
}

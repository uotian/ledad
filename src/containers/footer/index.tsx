import { Skeleton } from "@/components/ui/skeleton";
import Input from "./input";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-8">
          <div>
            <Skeleton className="h-16 w-16 rounded-full bg-red-900" />
          </div>
          <Input />
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import MicInput from "./mic-input";
import TextInput from "./text-input";
import { getLangA, getLangB, getMainUser } from "@/lib/storage";

export default function Footer() {
  const [mainUser, setMainUser] = useState<string | null>(null);
  const [langA, setLangA] = useState<string | null>(null);
  const [langB, setLangB] = useState<string | null>(null);

  useEffect(() => {
    setMainUser(getMainUser());
    setLangA(getLangA());
    setLangB(getLangB());
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t">
      <div className="container mx-auto p-4">
        {langA && langB && (
          <div className="flex items-center">
            <MicInput langFrom={langA} langTo={langB} user="A" />
            {mainUser === "A" ? <div className="w-4 md:w-8 h-1/2 border-foreground/60 border-b"></div> : <div className="w-4 md:w-8" />}
            {mainUser === "A" && <TextInput langFrom={langA} langTo={langB} user="A" />}
            {mainUser === "B" && <TextInput langFrom={langB} langTo={langA} user="B" />}
            {mainUser === "B" ? <div className="w-4 md:w-8 h-1/2 border-foreground/60 border-b"></div> : <div className="w-4 md:w-8" />}
            <MicInput langFrom={langB} langTo={langA} user="B" />
          </div>
        )}
      </div>
    </footer>
  );
}

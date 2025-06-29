"use client";

import { getMainUser } from "@/lib/storage";

interface MicTextLinkProps {
  user: string;
}

export default function MicTextLink({ user }: MicTextLinkProps) {
  const mainUser = getMainUser();

  return <>{mainUser === user ? <div className="w-4 md:w-8 h-1/2 border-foreground/60 border-b"></div> : <div className="w-4 md:w-8" />}</>;
}

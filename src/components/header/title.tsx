import { Outfit } from "next/font/google";
import packageJson from "../../../package.json";

const logoFont = Outfit({
  subsets: ["latin"],
  weight: "600",
});

export function Title() {
  return (
    <>
      <h1 className={`${logoFont.className} text-sm tracking-wide text-foreground`}>
        <span className="sr-only">ledad</span>
        <span aria-hidden="true" className="whitespace-nowrap">
          l
          <span className="mr-[0.06em] inline-block -scale-x-100">e</span>
          d
          <span className="mr-[0.04em] inline-block -scale-x-100">a</span>
          d
        </span>
      </h1>
      <span className="text-xs font-medium text-muted-foreground">v{packageJson.version}</span>
    </>
  );
}

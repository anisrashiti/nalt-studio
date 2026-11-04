import Image from "next/image";

const RATIO = 246 / 190;

type LogoSymbolProps = {
  /** Height in px. The rules set a 16px minimum; the nav pill's 7.7px is the design's one exception. */
  height?: number;
  className?: string;
};

export function LogoSymbol({ height = 16, className }: LogoSymbolProps) {
  return (
    <Image
      src="/brand/logo-symbol.svg"
      alt=""
      width={height * RATIO}
      height={height}
      className={className}
    />
  );
}

import Image from "next/image";

const RATIO = 988 / 194.5;
const MIN_HEIGHT = 12;

type WordmarkProps = {
  /** Height in px. The logo rules set a 12px minimum. */
  height?: number;
  theme?: "dark" | "light";
  className?: string;
};

export function Wordmark({ height = 14, theme = "dark", className }: WordmarkProps) {
  const h = Math.max(height, MIN_HEIGHT);

  return (
    <Image
      src={`/brand/logo-wordmark-${theme}.svg`}
      alt="NALT"
      width={h * RATIO}
      height={h}
      className={className}
      loading="eager"
    />
  );
}

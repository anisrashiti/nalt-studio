import type { ReactNode } from "react";

type SplitGridProps = {
  className?: string;
  children: ReactNode;
};

/** The layout shared by Services, Contact and the footer. From 1280px the table starts at x=559; below that it stacks. */
export function SplitGrid({ className = "", children }: SplitGridProps) {
  return (
    <div className={`grid gap-y-10 pr-inset pl-gutter xl:grid-cols-[531px_minmax(0,1fr)] xl:gap-y-0 ${className}`}>
      {children}
    </div>
  );
}

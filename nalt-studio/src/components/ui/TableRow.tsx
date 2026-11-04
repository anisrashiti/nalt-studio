import type { ReactNode } from "react";

type TableRowProps = {
  label: string;
  line: ReactNode;
  detail: ReactNode;
  /** Makes the whole row a link: the label turns orange and an arrow appears on hover. */
  href?: string;
};

const ROW =
  "relative grid gap-y-2 border-t border-rule pt-[19px] pb-8 md:grid-cols-[233px_minmax(0,420px)] md:gap-y-0 md:pb-[54px]";

export function TableRow({ label, line, detail, href }: TableRowProps) {
  // On a phone the label sits above the text as a small mono label, like the signal rules table.
  const cells = (
    <>
      <p className="transition-colors group-hover:text-signal group-focus-visible:text-signal max-md:type-label max-md:text-stone">
        {label}
      </p>
      <div>
        <p>{line}</p>
        <p className="mt-0.5 text-stone">{detail}</p>
      </div>
    </>
  );

  if (!href) {
    return <div className={ROW}>{cells}</div>;
  }

  return (
    <a href={href} className={`group ${ROW}`}>
      {cells}
      <span
        aria-hidden
        className="absolute top-[18px] right-3 text-signal opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        →
      </span>
    </a>
  );
}

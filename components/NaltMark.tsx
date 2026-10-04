import { NALT_A_PATH, NALT_A_VIEWBOX } from "@/lib/brand/naltGeometry";

export function NaltMark({ outline = false }: { outline?: boolean }) {
  return (
    <svg className="nalt-mark" viewBox={NALT_A_VIEWBOX} aria-hidden="true" focusable="false">
      {!outline && <path className="mark-fill" d={NALT_A_PATH} />}
      <path className="mark-outline" d={NALT_A_PATH} strokeLinejoin="miter" />
    </svg>
  );
}

import type { MediaKind } from "@/content/site";

type MediaCaptionProps = {
  kind: MediaKind;
  label: string;
  description?: string;
};

export function MediaCaption({ kind, label, description }: MediaCaptionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-label whitespace-pre">{`[ ${kind} ]  ${label}`}</p>
      {description && <p className="max-w-[440px] text-stone">{description}</p>}
    </div>
  );
}

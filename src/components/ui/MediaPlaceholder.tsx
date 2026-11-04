import Image from "next/image";
import type { ReactNode } from "react";
import type { MediaKind } from "@/content/site";
import { MediaCaption } from "./MediaCaption";
import { MediaVideo } from "./MediaVideo";

type MediaPlaceholderProps = {
  kind: MediaKind;
  label: string;
  description?: string;
  /** Size and ratio classes, such as an aspect ratio. */
  className?: string;
  /** Real media. Set this and the placeholder label goes away. */
  src?: string;
  alt?: string;
  children?: ReactNode;
};

export function MediaPlaceholder({
  kind,
  label,
  description,
  className = "",
  src,
  alt = "",
  children,
}: MediaPlaceholderProps) {
  return (
    <div className={`relative overflow-clip rounded-card bg-graphite ${className}`}>
      {src && kind === "image" && <Image src={src} alt={alt} fill className="object-cover" />}
      {src && kind === "video" && <MediaVideo src={src} />}
      {!src && (
        <div className="absolute inset-x-5 top-5">
          <MediaCaption kind={kind} label={label} description={description} />
        </div>
      )}
      {children}
    </div>
  );
}

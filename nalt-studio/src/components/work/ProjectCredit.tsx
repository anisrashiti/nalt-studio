type ProjectCreditProps = {
  tagline: string;
  meta: string;
};

export function ProjectCredit({ tagline, meta }: ProjectCreditProps) {
  return (
    <div className="flex items-start gap-4">
      <div aria-hidden className="size-10 shrink-0 rounded-logo bg-rule" />
      <div className="pt-0.5">
        <p>{tagline}</p>
        <p className="type-label mt-1 text-stone">{meta}</p>
      </div>
    </div>
  );
}

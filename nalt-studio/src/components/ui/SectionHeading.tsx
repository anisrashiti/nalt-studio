type SectionHeadingProps = {
  title: string;
  subtitle: string;
};

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-title md:whitespace-nowrap">
      <h2>{title}</h2>
      <p className="text-stone">{subtitle}</p>
    </div>
  );
}

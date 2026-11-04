type TagProps = {
  children: string;
};

export function Tag({ children }: TagProps) {
  return (
    <span className="type-label inline-block h-[26px] min-w-[62px] rounded-tag bg-rule px-2 pt-[7px]">
      {children}
    </span>
  );
}

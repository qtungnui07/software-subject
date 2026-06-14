type Props = {
  children: React.ReactNode;
};

export const StickyWrapper = ({ children }: Props) => {
  return (
    <aside className="hidden w-[400px] shrink-0 2xl:w-[425px] xl:block">
      <div className="sticky top-8 flex flex-col gap-y-4">{children}</div>
    </aside>
  );
};

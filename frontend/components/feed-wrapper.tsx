type Props = {
  children: React.ReactNode;
};

export const FeedWrapper = ({ children }: Props) => {
  return <div className="min-w-0 flex-1 pb-10">{children}</div>;
};

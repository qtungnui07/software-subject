import Link from "next/link";

type LearnTransitionLinkProps = {
  className: string;
};

export const LearnTransitionLink = ({ className }: LearnTransitionLinkProps) => {
  return (
    <Link
      id="header-learn-link"
      href="/learn"
      className={className}
    >
      Vào học
    </Link>
  );
};

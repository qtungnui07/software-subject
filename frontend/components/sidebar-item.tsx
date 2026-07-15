"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { LoaderCircle, LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc?: string;
  icon?: LucideIcon;
  href: string;
};

const NavigationStatus = () => {
  const { pending } = useLinkStatus();

  return (
    <span className="ml-auto flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
      <LoaderCircle
        className={`size-4 transition-opacity ${pending ? "animate-spin opacity-100" : "opacity-0"}`}
      />
    </span>
  );
};

export const SidebarItem = ({ label, iconSrc, icon: Icon, href }: Props) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Button
      variant={active ? "sidebar-outline" : "sidebar"}
      className="h-[58px] justify-start rounded-[18px] px-4 text-[15px]"
      asChild
    >
      <Link
        href={href}
        prefetch
        aria-current={active ? "page" : undefined}
      >
        {Icon ? (
          <Icon className="mr-4 size-8 shrink-0" strokeWidth={2.5} />
        ) : iconSrc ? (
          <Image
            src={iconSrc}
            alt=""
            className="mr-4 size-8 object-contain"
            height={32}
            width={32}
          />
        ) : null}
        <span className="truncate">{label.toUpperCase()}</span>
        <NavigationStatus />
      </Link>
    </Button>
  );
};

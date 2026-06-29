"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc?: string;
  icon?: LucideIcon;
  href: string;
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
      <Link href={href} aria-current={active ? "page" : undefined}>
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
      </Link>
    </Button>
  );
};


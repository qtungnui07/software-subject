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
  showNotificationDot?: boolean;
  notificationLabel?: string;
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

export const SidebarItem = ({
  label,
  iconSrc,
  icon: Icon,
  href,
  showNotificationDot = false,
  notificationLabel = "Co thong bao moi",
}: Props) => {
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
        <span className="relative mr-4 flex size-8 shrink-0 items-center justify-center">
          {Icon ? (
            <Icon className="size-8" strokeWidth={2.5} />
          ) : iconSrc ? (
            <Image
              src={iconSrc}
              alt=""
              className="size-8 object-contain"
              height={32}
              width={32}
            />
          ) : null}
          {showNotificationDot ? (
            <span
              className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-white bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.18)] dark:border-[#131f24]"
              aria-hidden="true"
            />
          ) : null}
        </span>
        <span className="truncate">{label.toUpperCase()}</span>
        {showNotificationDot ? (
          <span className="sr-only">{notificationLabel}</span>
        ) : null}
        <NavigationStatus />
      </Link>
    </Button>
  );
};

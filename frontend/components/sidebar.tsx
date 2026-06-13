import Image from "next/image";
import Link from "next/link";

import { SidebarItem } from "./sidebar-item";

import { cn } from "@/lib/utils";

type Props = {
    className?: string;
};

export const Sidebar = ({className}: Props) => {
    return (
        <div className={cn("flex h-full w-full lg:w-[304px] lg:fixed left-0 top-0 px-5 border-r-2 flex-col bg-white",
            className, 
        )}>
            <Link href="/learn">
                <div className="pt-8 pl-3 pb-8 flex items-center gap-x-4">
                    <Image src="/logo.svg" height={56} width={56} alt="Logo"/>
                    <h1 className="text-[32px] font-extrabold text-[#1486CC] tracking-wide">
                        Robogo
                    </h1>
                </div>
            </Link>  
            <div className="flex flex-col gap-y-2 flex-1">
                <SidebarItem 
                    label="Learn" 
                    href="/learn"
                    iconSrc="/learn.svg"
                />
                <SidebarItem 
                    label="Leaderboard"
                    href="/leaderboard"
                    iconSrc="/leaderboard.svg"
                />
                <SidebarItem 
                    label="Quests" 
                    href="/quests"
                    iconSrc="/quests.svg"
                />
                <SidebarItem 
                    label="Shop" 
                    href="/shop"
                    iconSrc="/shop.svg"
                />
            </div>  
        </div>
    );
};
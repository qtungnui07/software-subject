import { Menu } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";


export const MobileSidebar = () => {
    return (
        <Sheet>
            <SheetTrigger>
                <Menu className="text-white"/>
            </SheetTrigger>
            <SheetContent className="w-[304px] max-w-[85vw] p-0 z-[100]" side="left">
                <Sidebar/>
            </SheetContent>
        </Sheet>
    )
}
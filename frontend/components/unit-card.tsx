import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Props = {
    title: string;
    description: string;
    iconSrc: string;
    progress: number;
    active: boolean;
};

export const UnitCard = ({ title, description, iconSrc, progress, active }: Props) => {
    const actionLabel = progress === 100 ? "Ôn tập" : progress > 0 ? "Tiếp tục" : "Bắt đầu";

    return (
        <div className={`w-full border-2 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-x-6 gap-y-4 transition-colors shadow-sm ${active ? "border-[#1486CC]/30 bg-[#1486CC]/5" : "border-neutral-200 hover:bg-slate-50"}`}>
            <div className="flex-shrink-0 bg-white p-3 rounded-xl border-2 shadow-sm">
                <Image src={iconSrc} alt={title} width={64} height={64} className="drop-shadow-sm" />
            </div>
            <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <h3 className="text-xl font-bold text-neutral-700">{title}</h3>
                <p className="text-neutral-500 text-sm">{description}</p>
                <div className="w-full flex items-center gap-x-3 pt-2">
                    <Progress value={progress} className="h-3 flex-1 bg-neutral-200" />
                    <span className="text-sm font-bold text-neutral-400 w-10 text-right">{progress}%</span>
                </div>
            </div>
            <div className="w-full sm:w-auto pt-2 sm:pt-0 flex-shrink-0">
                <Button 
                    variant={active ? "primary" : "secondary"} 
                    className="w-full sm:w-[150px]"
                >
                    {actionLabel}
                </Button>
            </div>
        </div>
    );
};

import { UnitCard } from "./unit-card";

type Unit = {
    id: number;
    title: string;
    description: string;
    iconSrc: string;
    progress: number;
    active: boolean;
};

type Props = {
    units: Unit[];
};

export const UnitList = ({ units }: Props) => {
    return (
        <div className="flex flex-col gap-y-6 pb-10">
            {units.map((unit) => (
                <UnitCard 
                    key={unit.id}
                    title={unit.title}
                    description={unit.description}
                    iconSrc={unit.iconSrc}
                    progress={unit.progress}
                    active={unit.active}
                />
            ))}
        </div>
    );
};

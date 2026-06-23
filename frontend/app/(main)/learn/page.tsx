import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StreakCard } from "@/components/streak/streak-card";
import { UnitList } from "@/components/unit-list";

import { Header } from "./header";
import { getUserProgress } from "@/db/queries";
import { userProgress } from '../../../db/schema';

const mockUnits = [
    {
        id: 1,
        title: "Unit 1: The Basics",
        description: "Learn the fundamentals of the language and start forming simple sentences.",
        iconSrc: "/learn.svg",
        progress: 100,
        active: false
    },
    {
        id: 2,
        title: "Unit 2: Greetings & Introductions",
        description: "Master saying hello, introducing yourself, and basic conversational phrases.",
        iconSrc: "/learn.svg",
        progress: 50,
        active: true
    },
    {
        id: 3,
        title: "Unit 3: Food & Drinks",
        description: "Learn vocabulary for ordering food and discussing meals.",
        iconSrc: "/learn.svg",
        progress: 0,
        active: false
    }
];

const LearnPage = async () => {
    const userProgressData = getUserProgress()

    const [
        userProgress
    ] = await Promise.all([
        userProgressData
    ]);

    // Tạm thời comment logic redirect để bạn có thể xem UI trang Learn
    // if (!userProgress || !userProgress.activeCourse) {
    //     redirect("/courses");
    // }

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                 activeCourse={{ title: "Spanish", imageSrc: "/es.svg"}}
                 hearts={5}
                 points={100}
                />
                <StreakCard />
            </StickyWrapper>
            <FeedWrapper>
                <Header title="Spanish"/>
                <div className="mt-8">
                    <UnitList units={mockUnits} />
                </div>
            </FeedWrapper>
        </div>
    );
};

export default LearnPage;
export const dynamic = "force-dynamic";

import { getUserProgress } from "@/db/queries";
import { getContentCourses } from "@/services/content-service";

import { List } from "./list";

const CoursesPage = async () => {
    const [
        courses,
        userProgress,
    ] = await Promise.all([
        getContentCourses(),
        getUserProgress(),
    ]);

    const courseRows = courses.map((course) => ({
        id: course.databaseId,
        title: course.title,
        imageSrc: course.imageSrc,
    }));

    return (
        <div className="h-full max-w-228 px-3 mx-auto">
            <h1 className="text-2xl font-bold text-neutral-700">
                
            </h1>
            <List courses={courseRows}
            activeCourseId={userProgress?.activeCourseId}
            />
        </div>
    );
};

export default CoursesPage;

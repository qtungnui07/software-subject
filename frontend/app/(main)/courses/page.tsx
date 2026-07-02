export const dynamic = "force-dynamic";

import { getCourses, getUserProgress } from "@/db/queries";

import { List } from "./list";

const CoursesPage = async () => {
    const [
        courses,
        userProgress,
    ] = await Promise.all([
        getCourses(),
        getUserProgress(),
    ]);

    // CHỈNH SỬA TẠI ĐÂY: Đổi thành false nếu muốn mở lại các khóa học khác (Tiếng Nhật, Tiếng Pháp, v.v.)
    const showOnlyEnglish = true; 

    const filteredCourses = showOnlyEnglish
        ? courses.filter(course => course.title === "Tiếng Anh")
        : courses;

    return (
        <div className="h-full max-w-228 px-3 mx-auto">
            <h1 className="text-2xl font-bold text-neutral-700">
                
            </h1>
            <List courses={filteredCourses} 
            activeCourseId={userProgress?.activeCourseId}
            />
        </div>
    );
};

export default CoursesPage;

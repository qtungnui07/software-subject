import {
  createMultipleChoiceExercise,
} from "@/data/exercises/english/exercise-builders";
import type { Exercise } from "@/types/exercise";

const lessonId = "lesson-1";

export const sectionOneLessonOneExercises: Exercise[] = [
  createMultipleChoiceExercise({
    id: "lesson-1-exercise-1",
    lessonId,
    skill: "vocabulary",
    difficulty: 1,
    instruction: "Chọn đáp án đúng",
    prompt: "Trong tiếng Anh, từ \"Hello\" có nghĩa là gì?",
    explanation: "“Hello” là lời chào thông dụng trong tiếng Anh.",
    options: ["Tạm biệt", "Xin chào", "Cảm ơn", "Xin lỗi"],
    correctIndex: 1,
  }),
  createMultipleChoiceExercise({
    id: "lesson-1-exercise-2",
    lessonId,
    skill: "conversation",
    difficulty: 1,
    instruction: "Chọn bản dịch đúng",
    prompt: "Dịch câu sau sang tiếng Anh: \"Chào buổi sáng\"",
    explanation: "“Good morning” được dùng để chào vào buổi sáng.",
    options: ["Good morning", "Good evening", "Good night", "Goodbye"],
    correctIndex: 0,
  }),
  createMultipleChoiceExercise({
    id: "lesson-1-exercise-3",
    lessonId,
    skill: "grammar",
    difficulty: 1,
    instruction: "Hoàn thành câu",
    prompt: "Điền vào chỗ trống: \"Nice to ______ you.\"",
    explanation: "Cụm đúng là “Nice to meet you.”",
    options: ["see", "meet", "hear", "speak"],
    correctIndex: 1,
  }),
  createMultipleChoiceExercise({
    id: "lesson-1-exercise-4",
    lessonId,
    skill: "vocabulary",
    difficulty: 1,
    instruction: "Chọn nghĩa đúng",
    prompt: "Cụm từ \"Thank you\" trong tiếng Việt nghĩa là gì?",
    explanation: "“Thank you” dùng để bày tỏ lời cảm ơn.",
    options: ["Không có gì", "Cảm ơn", "Tạm biệt", "Xin lỗi"],
    correctIndex: 1,
  }),
  createMultipleChoiceExercise({
    id: "lesson-1-exercise-5",
    lessonId,
    skill: "conversation",
    difficulty: 1,
    instruction: "Chọn bản dịch đúng",
    prompt: "Dịch câu sau sang tiếng Anh: \"Tạm biệt, hẹn gặp lại!\"",
    explanation: "“Goodbye, see you again!” là lời tạm biệt và hẹn gặp lại.",
    options: ["Goodbye, see you again!", "Hello, nice to meet you!", "Thank you, goodbye!", "Good night, see you!"],
    correctIndex: 0,
  }),
];

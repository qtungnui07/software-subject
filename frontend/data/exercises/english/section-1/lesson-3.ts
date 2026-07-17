import {
  createArrangeDialogueExercise,
  createArrangeWordsExercise,
  createDialogueChoiceExercise,
  createFillBlankExercise,
  createListeningChoiceExercise,
  createMatchPairsExercise,
  createMultipleChoiceExercise,
  createShortWritingExercise,
} from "@/data/exercises/english/exercise-builders";
import type {
  Exercise,
  ListeningExerciseContext,
  ReadingExerciseContext,
} from "@/types/exercise";

const lessonId = "lesson-3";
const contentVersion = 2;

const greenCupMenuContext = {
  id: "lesson-3-green-cup-menu",
  kind: "reading",
  title: "Green Cup Café menu",
  text: `GREEN CUP CAFÉ\n\nDrinks: coffee £2.50, tea £2.00, orange juice £2.80, and water £1.50.\n\nFood: cheese sandwich £4.50, chicken sandwich £5.00, chocolate cake £3.00, and fruit salad £3.50.\n\nPlease order at the counter. The café accepts cash and cards. Emma wants a hot drink and something sweet after school, while Daniel only has four pounds to spend today.`,
} satisfies ReadingExerciseContext;

const emmaOrderText =
  "Server: Hi. Welcome to Green Cup Café. What would you like today? Emma: Can I have a chicken sandwich and an orange juice, please? Server: Of course. Would you like tea or cake too? Emma: No, thank you. That’s all. How much is it? Server: It’s seven pounds eighty. Emma: Great. I will pay by card. Here you are. Server: Thank you. Your order will be ready soon.";

const emmaOrderContext = {
  id: "lesson-3-emma-order",
  kind: "listening",
  title: "Emma orders at the café",
  spokenText: emmaOrderText,
  silentAlternative:
    "Emma orders a chicken sandwich and orange juice. The server says the total is seven pounds eighty.",
  transcriptAfterSubmit: emmaOrderText,
} satisfies ListeningExerciseContext;

export const sectionOneLessonThreeExercises: Exercise[] = [
  createDialogueChoiceExercise({
    id: "lesson-3-exercise-1",
    lessonId,
    contentVersion,
    skill: "conversation",
    difficulty: 1,
    instruction: "Chọn câu gọi món lịch sự",
    prompt: "Bạn đang gọi món tại Green Cup Café.",
    explanation:
      "“I’d like...” là cách lịch sự và tự nhiên để gọi một món ăn.",
    hint: "Chọn câu có cấu trúc “I’d like + món ăn + please”.",
    speaker: "Server",
    dialogue: "Hello. What would you like?",
    options: [
      "I’d like a cheese sandwich, please.",
      "I am a cheese sandwich.",
      "The sandwich likes me.",
      "It is next to the bank.",
    ],
    correctIndex: 0,
  }),
  createMatchPairsExercise({
    id: "lesson-3-exercise-2",
    lessonId,
    contentVersion,
    skill: "vocabulary",
    difficulty: 1,
    instruction: "Nối món với giá",
    prompt: "Dựa vào bảng giá mẫu của quán cà phê.",
    explanation: "Mỗi món có một mức giá riêng bằng bảng Anh.",
    hint: "Chú ý ký hiệu £ và phần thập phân của từng giá.",
    pairs: [
      ["Coffee", "£2.50"],
      ["Tea", "£2.00"],
      ["Cheese sandwich", "£4.50"],
      ["Chocolate cake", "£3.00"],
    ],
    shuffledRightOrder: [2, 0, 3, 1],
  }),
  createArrangeWordsExercise({
    id: "lesson-3-exercise-3",
    lessonId,
    contentVersion,
    skill: "grammar",
    difficulty: 1,
    instruction: "Sắp xếp câu gọi món",
    prompt: "Tạo một yêu cầu lịch sự với nhân viên.",
    explanation: "Câu đúng là “Can I have a coffee, please?”.",
    hint: "Bắt đầu bằng “Can I”, sau đó là động từ “have”.",
    wordsInCorrectOrder: ["Can", "I", "have", "a", "coffee,", "please?"],
    shuffledOrder: [3, 0, 4, 2, 5, 1],
  }),
  createMultipleChoiceExercise({
    id: "lesson-3-exercise-4",
    lessonId,
    contentVersion,
    context: greenCupMenuContext,
    skill: "reading",
    difficulty: 2,
    instruction: "Đọc menu và tính tổng tiền",
    prompt: "Emma orders tea and chocolate cake. How much is her order?",
    explanation: "Tea costs £2.00 and cake costs £3.00, so the total is £5.00.",
    hint: "Tìm giá của hai món rồi cộng hai số đơn giản.",
    options: ["£5.00", "£4.50", "£5.50", "£6.00"],
    correctIndex: 0,
  }),
  createFillBlankExercise({
    id: "lesson-3-exercise-5",
    lessonId,
    contentVersion,
    context: greenCupMenuContext,
    skill: "reading",
    difficulty: 2,
    instruction: "Đọc menu và điền món phù hợp",
    prompt: "Daniel has £4.00. Complete the sentence with one drink he can buy with water.",
    explanation: "Tea costs £2.00 and water costs £1.50, so the total is £3.50.",
    hint: "Món cần điền là một đồ uống nóng có giá không quá £2.50.",
    sentenceBefore: "Daniel can buy",
    sentenceAfter: "and water for no more than £4.00.",
    acceptedAnswers: ["tea"],
  }),
  createMultipleChoiceExercise({
    id: "lesson-3-exercise-6",
    lessonId,
    contentVersion,
    context: greenCupMenuContext,
    skill: "reading",
    difficulty: 2,
    instruction: "Chọn đơn hàng phù hợp với yêu cầu",
    prompt: "Emma wants a hot drink and something sweet. What can she order?",
    explanation: "Tea is a hot drink and chocolate cake is something sweet.",
    hint: "Chọn một đồ uống nóng và một món tráng miệng ngọt.",
    options: [
      "Tea and chocolate cake",
      "Water and cheese sandwich",
      "Orange juice and chicken sandwich",
      "Coffee and cheese sandwich",
    ],
    correctIndex: 0,
  }),
  createListeningChoiceExercise({
    id: "lesson-3-exercise-7",
    lessonId,
    contentVersion,
    context: emmaOrderContext,
    skill: "listening",
    difficulty: 2,
    instruction: "Nghe hội thoại gọi món",
    prompt: "What drink does Emma order?",
    explanation: "Emma orders an orange juice with her sandwich.",
    hint: "Nghe phần Emma nói ngay sau tên món sandwich.",
    options: ["Orange juice", "Tea", "Coffee", "Water"],
    correctIndex: 0,
  }),
  createArrangeDialogueExercise({
    id: "lesson-3-exercise-8",
    lessonId,
    contentVersion,
    skill: "conversation",
    difficulty: 2,
    instruction: "Sắp xếp hội thoại gọi món",
    prompt: "Chọn bốn lượt nói phù hợp và đặt theo thứ tự tự nhiên.",
    explanation:
      "Nhân viên hỏi món trước, khách gọi món, nhân viên hỏi thêm và khách kết thúc đơn.",
    hint: "Câu về thư viện không thuộc cuộc hội thoại tại quán cà phê.",
    linesInCorrectOrder: [
      { speaker: "Server", text: "What would you like?" },
      { speaker: "Customer", text: "I’d like a coffee, please." },
      { speaker: "Server", text: "Anything else?" },
      { speaker: "Customer", text: "No, that’s all. Thank you." },
    ],
    distractorLines: [
      { speaker: "Customer", text: "The library is behind the café." },
    ],
    shuffledOrder: [3, 0, 4, 2, 1],
  }),
  createShortWritingExercise({
    id: "lesson-3-exercise-9",
    lessonId,
    contentVersion,
    skill: "conversation",
    difficulty: 2,
    instruction: "Viết một đơn gọi món ngắn",
    prompt: "Write a short café order.",
    topic:
      "Gọi ít nhất một món ăn và một đồ uống, sau đó kết thúc lời gọi món lịch sự.",
    explanation:
      "Một đơn gọi món A1+ nên dùng câu yêu cầu lịch sự, tên món rõ ràng và lời cảm ơn.",
    hint: "Bạn có thể bắt đầu bằng “I’d like...” hoặc “Can I have...”.",
    minWords: 18,
    maxWords: 30,
    suggestedWords: [
      "I'd like",
      "Can I have",
      "please",
      "anything else",
      "thank you",
    ],
    minimumSuggestedWordMatches: 3,
    minimumSentences: 2,
    sampleAnswer:
      "I’d like a chicken sandwich, please. Can I have some water too? That’s all for my friend and me, thank you.",
  }),
];

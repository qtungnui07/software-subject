import {
  createArrangeDialogueExercise,
  createFillBlankExercise,
  createListeningChoiceExercise,
  createMatchPairsExercise,
  createMultipleChoiceExercise,
  createSentenceRewriteExercise,
  createShortWritingExercise,
} from "@/data/exercises/english/exercise-builders";
import type {
  Exercise,
  ListeningExerciseContext,
  ReadingExerciseContext,
  ScenarioExerciseContext,
} from "@/types/exercise";

const lessonId = "lesson-6";
const contentVersion = 2;

const missionContext = {
  id: "lesson-6-weekend-mission",
  kind: "scenario",
  title: "Weekend mission",
  description:
    "Emma is free after 2:00 p.m. Daniel must be home before 7:00 p.m. The library closes at 5:00 p.m. The café is open until 8:00 p.m. The group has £15 in total.",
} satisfies ScenarioExerciseContext;

const emmaMessageContext = {
  id: "lesson-6-emma-message",
  kind: "reading",
  title: "Emma’s plan",
  text: `Hi! I checked the plan for Saturday. The library closes at five, so we should meet outside it at half past two. I need to borrow an English book before we go to the café. Daniel can stay until half past six because he must be home before seven. At the Green Cup Café, I’m going to order tea and a cheese sandwich. Daniel wants coffee, and Minh wants water with chocolate cake. Please remember that we only have fifteen pounds for all three of us. The café is next to the supermarket, opposite the small park.`,
} satisfies ReadingExerciseContext;

const danielDirectionsText =
  "Daniel: Hi, Emma. I’m near the station, but I can’t find the library. Emma: Start at the station and go straight along Green Street. Walk past the bank, then turn right at the supermarket. Continue for about one minute. The library is on your left, next to the café. Daniel: Is it far from the station? Emma: No. It takes about five minutes. I’m waiting outside the library, and Minh is already here with the book list. Daniel: Great. I’ll follow those directions and be there soon.";

const danielDirectionsContext = {
  id: "lesson-6-daniel-directions",
  kind: "listening",
  title: "Daniel is lost",
  spokenText: danielDirectionsText,
  silentAlternative:
    "From the station, Daniel should go straight, walk past the bank and turn right at the supermarket to reach the library.",
  transcriptAfterSubmit: danielDirectionsText,
} satisfies ListeningExerciseContext;

export const sectionOneLessonSixExercises: Exercise[] = [
  createMultipleChoiceExercise({
    id: "lesson-6-exercise-1",
    lessonId,
    contentVersion,
    context: missionContext,
    skill: "reading",
    difficulty: 2,
    instruction: "Đọc yêu cầu nhiệm vụ",
    prompt: "Which plan is possible for the whole group?",
    explanation:
      "Meeting at the library at 2:30 leaves enough time before it closes and before Daniel must go home.",
    hint: "Kiểm tra giờ Emma rảnh, giờ library đóng và giờ Daniel phải về.",
    options: [
      "Meet at the library at 2:30, then go to the café",
      "Meet at the library at 5:30, then study there",
      "Meet at the café at 7:30, then visit the library",
      "Meet at the station at 1:00 before Emma is free",
    ],
    correctIndex: 0,
  }),
  createMatchPairsExercise({
    id: "lesson-6-exercise-2",
    lessonId,
    contentVersion,
    skill: "vocabulary",
    difficulty: 2,
    instruction: "Nối yêu cầu với địa điểm",
    prompt: "Chọn nơi phù hợp cho từng phần của nhiệm vụ.",
    explanation: "Các địa điểm ôn lại kiến thức từ những lesson trước.",
    hint: "Nghĩ về nơi mượn sách, mua đồ uống, đi tàu và mua thức ăn.",
    pairs: [
      ["Borrow a book", "Library"],
      ["Buy a drink", "Café"],
      ["Catch a train", "Station"],
      ["Buy food", "Supermarket"],
    ],
    shuffledRightOrder: [1, 3, 0, 2],
  }),
  createArrangeDialogueExercise({
    id: "lesson-6-exercise-3",
    lessonId,
    contentVersion,
    skill: "conversation",
    difficulty: 2,
    instruction: "Sắp xếp lịch trình nhiệm vụ",
    prompt: "Chọn năm bước đúng và đặt theo thứ tự từ lúc gặp đến lúc rời đi.",
    explanation:
      "Nhiệm vụ bắt đầu ở library, tiếp tục tại café và kết thúc trước 6:30.",
    hint: "Chuyến tàu đến thành phố khác không thuộc kế hoạch.",
    linesInCorrectOrder: [
      { speaker: "Step 1", text: "Meet outside the library at 2:30." },
      { speaker: "Step 2", text: "Borrow the English study book." },
      { speaker: "Step 3", text: "Walk to the Green Cup Café." },
      { speaker: "Step 4", text: "Order drinks and a snack." },
      { speaker: "Step 5", text: "Leave before 6:30." },
    ],
    distractorLines: [
      { speaker: "Extra", text: "Take a train to another city." },
    ],
    shuffledOrder: [3, 0, 5, 2, 4, 1],
  }),
  createMultipleChoiceExercise({
    id: "lesson-6-exercise-4",
    lessonId,
    contentVersion,
    context: emmaMessageContext,
    skill: "reading",
    difficulty: 2,
    instruction: "Đọc tin nhắn của Emma",
    prompt: "Why should the group meet at 2:30?",
    explanation:
      "They need enough time to borrow a book before the library closes at five.",
    hint: "Tìm giờ library đóng và việc Emma cần làm trước khi đến café.",
    options: [
      "They need time to visit the library before it closes",
      "The café closes at three",
      "Daniel must catch a train at three",
      "Emma has music class at four",
    ],
    correctIndex: 0,
  }),
  createMultipleChoiceExercise({
    id: "lesson-6-exercise-5",
    lessonId,
    contentVersion,
    context: emmaMessageContext,
    skill: "reading",
    difficulty: 2,
    instruction: "Kiểm tra ngân sách",
    prompt:
      "Emma orders tea and a cheese sandwich, Daniel orders coffee, and Minh orders water with chocolate cake. Does £15 cover the order?",
    explanation:
      "£6.50 + £2.50 + £4.50 = £13.50, so the group has £1.50 left.",
    hint: "Dùng đúng giá từ Green Cup Café và cộng ba phần đơn hàng.",
    options: [
      "Yes. They have £1.50 left",
      "Yes. They have £3.50 left",
      "No. They need £1.50 more",
      "No. The total is £16.50",
    ],
    correctIndex: 0,
  }),
  createFillBlankExercise({
    id: "lesson-6-exercise-6",
    lessonId,
    contentVersion,
    context: emmaMessageContext,
    skill: "vocabulary",
    difficulty: 2,
    instruction: "Điền từ chỉ số tiền còn lại",
    prompt: "Hoàn thành câu về ngân sách sau khi trả £13.50.",
    explanation: "“Left” mô tả số tiền còn lại sau khi chi tiêu.",
    hint: "Từ này có nghĩa là “còn lại”.",
    sentenceBefore: "The group has £1.50",
    sentenceAfter: ".",
    acceptedAnswers: ["left"],
  }),
  createListeningChoiceExercise({
    id: "lesson-6-exercise-7",
    lessonId,
    contentVersion,
    context: danielDirectionsContext,
    skill: "listening",
    difficulty: 2,
    instruction: "Nghe chỉ đường cho Daniel",
    prompt: "What should Daniel do after he walks past the bank?",
    explanation: "Emma tells him to turn right at the supermarket.",
    hint: "Nghe bước xuất hiện ngay sau “walk past the bank”.",
    options: [
      "Turn right at the supermarket",
      "Turn left at the station",
      "Go into the park",
      "Wait outside the bank",
    ],
    correctIndex: 0,
  }),
  createSentenceRewriteExercise({
    id: "lesson-6-exercise-8",
    lessonId,
    contentVersion,
    skill: "grammar",
    difficulty: 2,
    instruction: "Sửa tin nhắn kế hoạch",
    prompt: "Rewrite the message correctly. Use “are”.",
    explanation:
      "Present Continuous can describe a fixed arrangement: “We are meeting...”.",
    hint: "Thêm động từ “are” sau chủ ngữ “We”.",
    sourceSentence: "We meeting outside the library at half past two.",
    requiredWords: ["are"],
    acceptedAnswers: [
      "We are meeting outside the library at half past two.",
      "We are meeting outside the library at 2:30.",
      "We are meeting outside the library at two thirty.",
    ],
  }),
  createShortWritingExercise({
    id: "lesson-6-exercise-9",
    lessonId,
    contentVersion,
    skill: "conversation",
    difficulty: 2,
    instruction: "Gửi kế hoạch cuối cùng",
    prompt: "Write the final weekend plan for Emma and Daniel.",
    topic:
      "Bám theo nhiệm vụ: nêu giờ và điểm gặp, hoạt động ở library, hoạt động sau đó tại café và thời gian rời đi.",
    explanation:
      "Kế hoạch hoàn chỉnh cần giữ đúng các chi tiết chính nhưng có thể dùng nhiều cách diễn đạt tương đương.",
    hint: "Dùng các từ nối “First” và “After that” để giữ đúng thứ tự.",
    minWords: 40,
    maxWords: 60,
    suggestedWords: [
      "we are meeting",
      "first",
      "after that",
      "we are going to",
      "we need to leave",
    ],
    minimumSuggestedWordMatches: 3,
    minimumSentences: 4,
    requiredPhraseOrder: ["first", "after that", "leave"],
    requiredContentGroups: [
      {
        id: "meeting-time",
        label: "Có thời gian gặp lúc 2:30",
        phrases: ["half past two", "2:30", "two thirty"],
      },
      {
        id: "meeting-place",
        label: "Có điểm gặp bên ngoài library",
        phrases: [
          "outside the library",
          "meet at the library",
          "meeting at the library",
        ],
      },
      {
        id: "first-activity",
        label: "Có hoạt động mượn sách đầu tiên",
        phrases: [
          "borrow an english book",
          "borrow the english book",
          "borrow a book",
        ],
      },
      {
        id: "next-activity",
        label: "Có hoạt động tiếp theo tại café",
        phrases: [
          "go to the green cup café",
          "go to the green cup cafe",
          "going to the green cup café",
          "going to the green cup cafe",
          "go to the café",
          "go to the cafe",
          "going to the café",
          "going to the cafe",
          "visit the café",
          "visit the cafe",
        ],
      },
      {
        id: "leave-time",
        label: "Có thời gian rời đi trước 6:30",
        phrases: [
          "leave before half past six",
          "leave before 6:30",
          "leave by 6:30",
          "leave before six thirty",
        ],
      },
    ],
    sampleAnswer:
      "We are meeting outside the library on Saturday at half past two. First, Emma is going to borrow an English book. After that, we are going to the Green Cup Café. We need to leave before half past six so Daniel can be home on time.",
  }),
];

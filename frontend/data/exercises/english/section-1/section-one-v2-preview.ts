import {
  createArrangeDialogueExercise,
  createMatchPairsExercise,
  createSentenceRewriteExercise,
  createShortWritingExercise,
} from "@/data/exercises/english/exercise-builders";
import type { Exercise, ExerciseContext } from "@/types/exercise";

const meetingScenario: ExerciseContext = {
  id: "section-one-v2-preview-scenario",
  kind: "scenario",
  title: "Gặp các bạn mới trong lớp",
  description:
    "Ba học sinh đang giới thiệu sở thích của mình. Hãy nối mỗi người với hoạt động phù hợp.",
};

const directionsReading: ExerciseContext = {
  id: "section-one-v2-preview-reading",
  kind: "reading",
  title: "Finding the library",
  text:
    "Mia is new in town. She asks a local person how to get to the library. The library is opposite the bank, next to a small café.",
};

const weatherListening: ExerciseContext = {
  id: "section-one-v2-preview-listening",
  kind: "listening",
  title: "A change of plan",
  spokenText:
    "It is raining this afternoon, so we are staying home and watching a film together.",
  silentAlternative:
    "The weather changes the group's plan for the afternoon.",
  transcriptAfterSubmit:
    "It is raining this afternoon, so we are staying home and watching a film together.",
};

const invitationReading: ExerciseContext = {
  id: "section-one-v2-preview-writing-context",
  kind: "reading",
  title: "A short invitation",
  text:
    "Your friend Anna is free on Saturday afternoon. Write a short message and invite her to meet you at a café.",
};

export const sectionOneV2PreviewExercises: Exercise[] = [
  createMatchPairsExercise({
    id: "section-one-v2-preview-match",
    lessonId: "section-one-v2-preview",
    skill: "reading",
    difficulty: 1,
    instruction: "Nối mỗi người với sở thích phù hợp.",
    prompt: "Ai thích hoạt động nào?",
    explanation: "Mỗi người chỉ có một sở thích phù hợp.",
    context: meetingScenario,
    contentVersion: 2,
    pairs: [
      ["Anna", "Plays tennis"],
      ["Ben", "Studies English"],
      ["Lucy", "Works at a café"],
    ],
    shuffledRightOrder: [2, 0, 1],
  }),
  createArrangeDialogueExercise({
    id: "section-one-v2-preview-dialogue",
    lessonId: "section-one-v2-preview",
    skill: "conversation",
    difficulty: 1,
    instruction: "Sắp xếp cuộc hội thoại theo thứ tự tự nhiên.",
    prompt: "Mia hỏi đường đến thư viện.",
    explanation: "Bắt đầu bằng lời hỏi đường và kết thúc bằng lời cảm ơn.",
    context: directionsReading,
    contentVersion: 2,
    linesInCorrectOrder: [
      { speaker: "Mia", text: "Excuse me, where is the library?" },
      { speaker: "Guide", text: "Go straight and turn left at the bank." },
      { speaker: "Mia", text: "Is it next to the café?" },
      { speaker: "Guide", text: "Yes, it is. You can't miss it." },
      { speaker: "Mia", text: "Thank you very much." },
    ],
    distractorLines: [
      { speaker: "Guide", text: "I usually drink tea in the morning." },
    ],
    shuffledOrder: [3, 5, 0, 4, 1, 2],
  }),
  createSentenceRewriteExercise({
    id: "section-one-v2-preview-rewrite",
    lessonId: "section-one-v2-preview",
    skill: "grammar",
    difficulty: 2,
    instruction: "Viết lại câu và sử dụng từ được yêu cầu.",
    prompt: "Nối hai ý bằng “because”.",
    explanation: "Dùng because để đưa ra nguyên nhân.",
    context: weatherListening,
    contentVersion: 2,
    sourceSentence: "It is raining. We are staying home.",
    requiredWords: ["because"],
    acceptedAnswers: [
      "We are staying home because it is raining.",
      "Because it is raining, we are staying home.",
    ],
  }),
  createShortWritingExercise({
    id: "section-one-v2-preview-writing",
    lessonId: "section-one-v2-preview",
    skill: "conversation",
    difficulty: 2,
    instruction: "Viết một lời mời ngắn bằng tiếng Anh.",
    prompt: "Mời Anna đi uống cà phê.",
    explanation: "Nêu rõ ngày, thời gian và địa điểm gặp nhau.",
    context: invitationReading,
    contentVersion: 2,
    topic: "Invite Anna to meet you at a café on Saturday afternoon.",
    minWords: 20,
    maxWords: 30,
    suggestedWords: ["Saturday", "free", "meet", "café", "afternoon"],
    minimumSuggestedWordMatches: 3,
    minimumSentences: 2,
    sampleAnswer:
      "Hi Anna! Are you free on Saturday afternoon? We can meet at the café near school at three o'clock after lunch.",
  }),
];

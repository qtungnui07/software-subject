import type { LessonDetailContent } from "@/types/lesson-detail";

const details: LessonDetailContent[] = [
  {
    nodeId: "lesson-1",
    overview:
      "Bắt đầu với những từ tiếng Anh ngắn, quen thuộc và cách dùng chúng trong phản xạ giao tiếp đầu tiên.",
    objectives: [
      "Nhận biết và ghi nhớ các từ tiếng Anh cơ bản đầu tiên.",
      "Chọn từ phù hợp trong câu và hội thoại cực ngắn.",
      "Làm quen với nhịp nghe và phát âm của từ mới.",
    ],
    focusSkills: ["vocabulary", "conversation", "grammar"],
    estimatedMinutes: 7,
  },
  {
    nodeId: "lesson-2",
    overview:
      "Luyện cách chào hỏi, tạm biệt và mở đầu một cuộc trò chuyện ngắn trong các tình huống thông dụng.",
    objectives: [
      "Sử dụng lời chào phù hợp với thời điểm và ngữ cảnh.",
      "Phản hồi tự nhiên khi người khác chào hỏi.",
      "Phân biệt cách chào thân mật và cách chào lịch sự.",
    ],
    focusSkills: ["conversation", "grammar", "listening"],
    estimatedMinutes: 7,
  },
  {
    nodeId: "lesson-3",
    overview:
      "Thực hành giới thiệu tên, tuổi, quê quán và hỏi lại thông tin cơ bản của người đối diện.",
    objectives: [
      "Giới thiệu bản thân bằng các câu ngắn, rõ ràng.",
      "Hỏi tên, tuổi và nơi ở bằng cấu trúc phù hợp.",
      "Hiểu thông tin cá nhân trong hội thoại ngắn.",
    ],
    focusSkills: ["grammar", "vocabulary", "conversation", "listening"],
    estimatedMinutes: 7,
  },
  {
    nodeId: "lesson-4",
    overview:
      "Củng cố cách hỏi và trả lời tên, tuổi để duy trì một cuộc trò chuyện làm quen tự nhiên hơn.",
    objectives: [
      "Đặt câu hỏi về tên và tuổi đúng cấu trúc.",
      "Trả lời ngắn gọn nhưng đầy đủ thông tin.",
      "Nghe và nhận biết thông tin chính trong đoạn hội thoại.",
    ],
    focusSkills: ["conversation", "grammar", "listening"],
    estimatedMinutes: 7,
  },
  {
    nodeId: "lesson-5",
    overview:
      "Tăng phản xạ nghe với các câu ngắn và lựa chọn thông tin chính xác trong thời gian giới hạn.",
    objectives: [
      "Nhận biết từ khóa quan trọng khi nghe.",
      "Phân biệt các từ và cấu trúc dễ nhầm lẫn.",
      "Phản hồi nhanh với hội thoại cơ bản.",
    ],
    focusSkills: ["listening", "vocabulary", "conversation"],
    estimatedMinutes: 7,
  },
  {
    nodeId: "lesson-6",
    overview:
      "Ôn lại toàn bộ từ vựng, cấu trúc và phản xạ giao tiếp của chương trước khi làm checkpoint.",
    objectives: [
      "Hệ thống hóa kiến thức của sáu bài học nền tảng.",
      "Nhận ra những nội dung cần ôn thêm trước checkpoint.",
      "Vận dụng từ vựng và mẫu câu trong nhiều dạng bài.",
    ],
    focusSkills: ["vocabulary", "grammar", "conversation", "listening"],
    estimatedMinutes: 7,
  },
  {
    nodeId: "chapter-1-test",
    overview:
      "Đánh giá khả năng sử dụng từ vựng và mẫu câu giao tiếp nền tảng của Chương 1.",
    objectives: [
      "Kiểm tra khả năng ghi nhớ từ vựng cốt lõi.",
      "Áp dụng mẫu câu chào hỏi và giới thiệu bản thân.",
      "Đạt tối thiểu 70% để hoàn thành Phần 1.",
    ],
    focusSkills: ["vocabulary", "grammar", "conversation", "listening", "reading"],
    estimatedMinutes: 12,
    checkpointUnlocks: "Phần 2: Trung cấp",
  },
  {
    nodeId: "en-s2-c1-lesson-1",
    overview:
      "Kể lại những hoạt động đã xảy ra bằng thì quá khứ đơn và các mốc thời gian quen thuộc.",
    objectives: [
      "Chọn đúng dạng quá khứ của động từ thông dụng.",
      "Sắp xếp một câu kể chuyện theo trình tự tự nhiên.",
      "Hỏi và trả lời về hoạt động đã diễn ra.",
    ],
    focusSkills: ["grammar", "conversation", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s2-c1-lesson-2",
    overview:
      "Hỏi đường, hiểu chỉ dẫn và mô tả vị trí bằng từ vựng giao thông, địa điểm và phương hướng.",
    objectives: [
      "Hỏi đường bằng mẫu câu lịch sự.",
      "Hiểu các chỉ dẫn rẽ trái, rẽ phải và đi thẳng.",
      "Mô tả vị trí của một địa điểm trên đường đi.",
    ],
    focusSkills: ["vocabulary", "grammar", "conversation", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s2-c1-lesson-3",
    overview:
      "Thực hành gọi món, hỏi giá và đưa ra yêu cầu lịch sự trong nhà hàng hoặc cửa hàng.",
    objectives: [
      "Gọi món và hỏi thông tin về món ăn.",
      "Hỏi giá và số lượng khi mua sắm.",
      "Dùng cấu trúc lịch sự khi đưa ra yêu cầu.",
    ],
    focusSkills: ["conversation", "grammar", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s2-c1-lesson-4",
    overview:
      "Nói về dự định, kế hoạch và dự đoán tương lai bằng will và be going to.",
    objectives: [
      "Phân biệt dự định và dự đoán trong tương lai.",
      "Sử dụng will và be going to đúng ngữ cảnh.",
      "Hỏi và trả lời về kế hoạch sắp tới.",
    ],
    focusSkills: ["grammar", "conversation", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s2-c1-lesson-5",
    overview:
      "Xử lý các tình huống thường ngày bằng so sánh, modal verbs và lời đề nghị giúp đỡ.",
    objectives: [
      "So sánh lựa chọn trong tình huống thực tế.",
      "Dùng modal verbs để đề nghị, xin phép và khuyên nhủ.",
      "Phản hồi lịch sự khi cần giúp đỡ.",
    ],
    focusSkills: ["grammar", "conversation", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s2-c1-checkpoint",
    overview:
      "Tổng hợp khả năng kể chuyện, hỏi đường, mua sắm và trình bày kế hoạch trong các tình huống trung cấp.",
    objectives: [
      "Vận dụng quá khứ đơn và cấu trúc tương lai.",
      "Xử lý hội thoại dịch vụ và chỉ đường.",
      "Đạt tối thiểu 70% để mở Phần 3.",
    ],
    focusSkills: ["grammar", "vocabulary", "conversation", "listening", "reading"],
    estimatedMinutes: 12,
    checkpointUnlocks: "Phần 3: Nâng cao",
  },
  {
    nodeId: "en-s3-c1-lesson-1",
    overview:
      "Trình bày quan điểm cá nhân rõ ràng và bổ sung lý do để người nghe hiểu lập trường của bạn.",
    objectives: [
      "Mở đầu một ý kiến bằng cấu trúc phù hợp.",
      "Giải thích lý do và đưa ra ví dụ hỗ trợ.",
      "Nghe và xác định quan điểm chính của người nói.",
    ],
    focusSkills: ["vocabulary", "grammar", "conversation", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s3-c1-lesson-2",
    overview:
      "Đồng ý hoặc phản đối một ý kiến bằng ngôn ngữ lịch sự, có lý do và không làm gián đoạn cuộc trao đổi.",
    objectives: [
      "Sử dụng cách đồng ý và phản đối lịch sự.",
      "Nêu phản biện kèm lý do rõ ràng.",
      "Duy trì mạch hội thoại khi có quan điểm khác nhau.",
    ],
    focusSkills: ["conversation", "grammar", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s3-c1-lesson-3",
    overview:
      "Thảo luận về công nghệ, mạng xã hội, lợi ích, rủi ro và quyền riêng tư trong đời sống số.",
    objectives: [
      "Mô tả lợi ích và tác động của công nghệ.",
      "Nêu rủi ro liên quan đến mạng xã hội và quyền riêng tư.",
      "Đưa ra lời khuyên sử dụng công nghệ có trách nhiệm.",
    ],
    focusSkills: ["grammar", "conversation", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s3-c1-lesson-4",
    overview:
      "Thảo luận vấn đề giáo dục và môi trường, đồng thời đề xuất giải pháp bằng cấu trúc nâng cao.",
    objectives: [
      "Mô tả một vấn đề xã hội hoặc môi trường.",
      "Sử dụng mệnh đề quan hệ để bổ sung thông tin.",
      "Đề xuất giải pháp và giải thích tác động mong đợi.",
    ],
    focusSkills: ["grammar", "reading", "conversation", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s3-c1-lesson-5",
    overview:
      "Xây dựng lập luận có mở đầu, dẫn chứng và kết luận bằng từ nối cùng reported speech.",
    objectives: [
      "Sắp xếp luận điểm theo trình tự logic.",
      "Tường thuật lại ý kiến của người khác.",
      "Kết luận một cuộc thảo luận bằng thông điệp rõ ràng.",
    ],
    focusSkills: ["grammar", "reading", "conversation", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "en-s3-c1-checkpoint",
    overview:
      "Đánh giá khả năng nêu quan điểm, phản biện và kết luận trong những chủ đề giao tiếp nâng cao.",
    objectives: [
      "Hiểu và phân tích quan điểm trong đoạn đọc hoặc nghe.",
      "Chọn cách phản biện phù hợp và có lập luận.",
      "Đạt tối thiểu 70% để hoàn thành Phần 3.",
    ],
    focusSkills: ["conversation", "grammar", "listening", "reading"],
    estimatedMinutes: 12,
    checkpointUnlocks: "Hoàn thành lộ trình tiếng Anh hiện tại",
  },
];

export const englishLessonDetailCatalog: Record<string, LessonDetailContent> =
  Object.fromEntries(details.map((detail) => [detail.nodeId, detail]));

export const getEnglishLessonDetail = (nodeId: string) =>
  englishLessonDetailCatalog[nodeId] ?? null;

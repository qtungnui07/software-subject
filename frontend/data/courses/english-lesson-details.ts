import type { LessonDetailContent } from "@/types/lesson-detail";

const details: LessonDetailContent[] = [
  {
    nodeId: "lesson-1",
    overview:
      "Gặp Emma và Daniel trong ngày đầu đến lớp, sau đó luyện chào hỏi, đọc hồ sơ, nghe giới thiệu và tự viết vài câu về bản thân.",
    objectives: [
      "Chào hỏi và giới thiệu tên, quê quán hoặc nơi ở.",
      "Hiểu thông tin cơ bản trong hồ sơ và đoạn giới thiệu ngắn.",
      "Viết lời giới thiệu bản thân từ 15 đến 25 từ.",
    ],
    focusSkills: ["conversation", "grammar", "reading", "listening"],
    estimatedMinutes: 7,
  },
  {
    nodeId: "lesson-2",
    overview:
      "Theo dõi lịch sinh hoạt của Emma và Daniel để luyện giờ giấc, hiện tại đơn và cách mô tả một ngày thường.",
    objectives: [
      "Nói giờ và sắp xếp các hoạt động trong ngày.",
      "Dùng hiện tại đơn với I và ngôi thứ ba số ít.",
      "Viết ba câu ngắn về lịch sinh hoạt cá nhân.",
    ],
    focusSkills: ["vocabulary", "grammar", "reading", "listening"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "lesson-3",
    overview:
      "Cùng Emma đến Green Cup Café để đọc menu, tính một đơn hàng nhỏ, nghe hội thoại và tự gọi món lịch sự.",
    objectives: [
      "Đọc menu và hiểu giá tiền bằng bảng Anh.",
      "Gọi món bằng Can I have và I’d like.",
      "Viết một đơn gọi món ngắn có lời cảm ơn.",
    ],
    focusSkills: ["vocabulary", "grammar", "reading", "listening", "conversation"],
    estimatedMinutes: 8,
  },
  {
    nodeId: "lesson-4",
    overview:
      "Giúp Daniel đi từ ga đến thư viện bằng cách đọc vị trí, nghe chỉ dẫn và viết các bước theo đúng thứ tự.",
    objectives: [
      "Hỏi vị trí và đường đi bằng mẫu câu lịch sự.",
      "Hiểu giới từ vị trí cùng các chỉ dẫn rẽ và đi thẳng.",
      "Viết ít nhất ba bước chỉ đường theo đúng tuyến.",
    ],
    focusSkills: ["vocabulary", "grammar", "reading", "listening", "conversation"],
    estimatedMinutes: 9,
  },
  {
    nodeId: "lesson-5",
    overview:
      "Kết hợp lịch của Emma, Daniel và Minh để chọn một thời gian phù hợp, nghe kế hoạch thay đổi và viết lời mời cuối tuần.",
    objectives: [
      "Mời, đồng ý hoặc từ chối một kế hoạch một cách lịch sự.",
      "Kết hợp lịch của nhiều người với giờ của một hoạt động.",
      "Viết lời mời có hoạt động, ngày, giờ và địa điểm gặp.",
    ],
    focusSkills: ["grammar", "reading", "listening", "conversation"],
    estimatedMinutes: 9,
  },
  {
    nodeId: "lesson-6",
    overview:
      "Hoàn thành một nhiệm vụ cuối tuần bằng cách kết hợp thời gian, thư viện, quán cà phê, ngân sách và chỉ đường từ các lesson trước.",
    objectives: [
      "Chọn kế hoạch thỏa mãn nhiều điều kiện về thời gian và địa điểm.",
      "Kiểm tra đơn hàng trong ngân sách và hiểu chỉ đường quen thuộc.",
      "Viết kế hoạch cuối cùng theo đúng thứ tự hoạt động.",
    ],
    focusSkills: ["vocabulary", "grammar", "reading", "listening", "conversation"],
    estimatedMinutes: 10,
  },
  {
    nodeId: "chapter-1-test",
    overview:
      "Hoàn thành 12 hoạt động A2 về giới thiệu, thói quen, gọi món, chỉ đường, kế hoạch và nhiệm vụ cuối tuần. Checkpoint chỉ chấm sau khi nộp toàn bài.",
    objectives: [
      "Kết hợp Reading, Listening, giao tiếp và Writing trong các tình huống thực tế.",
      "Xem điểm theo kỹ năng và tối đa ba lesson được đề xuất để ôn lại.",
      "Đạt chính xác từ 70% để mở Section 2; làm lại chỉ giữ điểm cao nhất.",
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

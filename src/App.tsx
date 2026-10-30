import { useMemo, useState } from "react"
import RescueGame from "./RescueGame"

type CardKind = "academic" | "professional" | "application"

type GameCard = {
  id: number
  kind: CardKind
  topic: string
  question: string
  choices?: string[]
  answer?: string
  explanation: string
  takeaway: string
  rubric?: string[]
}

const kinds: Record<CardKind, { label: string; short: string; letter: string }> =
  {
    academic: {
      label: "المعرفة الأكاديمية",
      short: "المعرفة",
      letter: "م",
    },
    professional: {
      label: "المهارات المهنية",
      short: "المهارات",
      letter: "هـ",
    },
    application: {
      label: "التطبيق العملي",
      short: "التطبيق",
      letter: "ت",
    },
  }

const cards: GameCard[] = [
  {
    id: 1,
    kind: "academic",
    topic: "التفكير النقدي",
    question: "ما الخطوة الأولى عند تقييم معلومة جديدة؟",
    choices: ["قبولها لأنها شائعة", "التحقق من مصدرها وأدلتها", "رفضها فورًا"],
    answer: "ب — التحقق من مصدرها وأدلتها.",
    explanation: "التفكير النقدي يبدأ بفحص المصدر والدليل قبل تكوين الرأي.",
    takeaway: "اسأل عن الدليل قبل أن تبني قرارك.",
  },
  {
    id: 2,
    kind: "academic",
    topic: "حل المشكلات",
    question: "أي صياغة تساعد أكثر على حل مشكلة؟",
    choices: [
      "المشكلة مستحيلة",
      "من المسؤول عنها؟",
      "ما السبب وما الخيارات المتاحة؟",
    ],
    answer: "ج — ما السبب وما الخيارات المتاحة؟",
    explanation:
      "تعريف السبب والخيارات يحول المشكلة من شكوى إلى مهمة قابلة للحل.",
    takeaway: "عرّف المشكلة بدقة قبل البحث عن الحل.",
  },
  {
    id: 3,
    kind: "academic",
    topic: "التواصل الفعّال",
    question: "متى تكون الرسالة أكثر وضوحًا؟",
    choices: [
      "عندما تحدد الهدف والمطلوب",
      "عندما تكون طويلة جدًا",
      "عندما تستخدم كلمات معقدة",
    ],
    answer: "أ — عندما تحدد الهدف والمطلوب.",
    explanation: "وضوح الهدف والطلب يقلل سوء الفهم ويسهّل الاستجابة.",
    takeaway: "تواصل بوضوح: هدف، سياق، ثم طلب محدد.",
  },
  {
    id: 4,
    kind: "academic",
    topic: "الاستماع الفعّال",
    question: "أي سلوك يدل على الاستماع الفعّال؟",
    choices: [
      "تجهيز الرد أثناء حديث الآخر",
      "المقاطعة للتوضيح",
      "إعادة صياغة ما فهمته",
    ],
    answer: "ج — إعادة صياغة ما فهمته.",
    explanation: "إعادة الصياغة تؤكد الفهم وتمنح المتحدث فرصة للتصحيح.",
    takeaway: "افهم أولًا، ثم أجب.",
  },
  {
    id: 5,
    kind: "academic",
    topic: "إدارة الوقت",
    question: "لديك مهام كثيرة ووقت محدود؛ ما التصرف الأفضل؟",
    choices: [
      "البدء بالأسهل دائمًا",
      "ترتيبها حسب الأهمية والموعد",
      "تنفيذها عشوائيًا",
    ],
    answer: "ب — ترتيبها حسب الأهمية والموعد.",
    explanation:
      "تحديد الأولويات يوجّه الجهد نحو ما يحقق أكبر أثر في الوقت المتاح.",
    takeaway: "الأولوية قرار، وليست قائمة طويلة.",
  },
  {
    id: 6,
    kind: "academic",
    topic: "تحديد الأهداف",
    question: "أي هدف أكثر قابلية للتنفيذ؟",
    choices: ["سأصبح أفضل", "سأقرأ أكثر", "سألخص فصلين قبل الخميس"],
    answer: "ج — سألخص فصلين قبل الخميس.",
    explanation: "الهدف الجيد محدد وقابل للقياس ومرتبط بوقت.",
    takeaway: "حوّل النية إلى خطوة وموعد.",
  },
  {
    id: 7,
    kind: "academic",
    topic: "العمل الجماعي",
    question: "ما الذي يرفع فاعلية الفريق؟",
    choices: [
      "وضوح الأدوار والهدف",
      "عمل الجميع بالطريقة نفسها",
      "تجنب مشاركة التقدم",
    ],
    answer: "أ — وضوح الأدوار والهدف.",
    explanation: "الأدوار الواضحة تقلل التداخل وتربط جهود الأعضاء بهدف مشترك.",
    takeaway: "الفريق القوي يعرف: من يفعل ماذا ولماذا.",
  },
  {
    id: 8,
    kind: "academic",
    topic: "اتخاذ القرار",
    question: "عند المقارنة بين خيارين، ما الأساس الأفضل؟",
    choices: [
      "الخيار الأكثر شيوعًا",
      "معايير مرتبطة بالهدف",
      "الانطباع الأول فقط",
    ],
    answer: "ب — معايير مرتبطة بالهدف.",
    explanation: "المعايير الواضحة تجعل القرار منطقيًا ويمكن تفسيره.",
    takeaway: "حدّد معيارك قبل أن تختار.",
  },
  {
    id: 9,
    kind: "academic",
    topic: "التعلم المستمر",
    question: "ما المؤشر الأقوى على التعلم المستمر؟",
    choices: [
      "الاكتفاء بما تعرفه",
      "انتظار التدريب الإلزامي",
      "طلب المعرفة وتجربة ما تعلمته",
    ],
    answer: "ج — طلب المعرفة وتجربة ما تعلمته.",
    explanation: "يكتمل التعلم بالممارسة والتأمل، لا بجمع المعلومات فقط.",
    takeaway: "تعلّم، جرّب، راجع، ثم حسّن.",
  },
  {
    id: 10,
    kind: "academic",
    topic: "تقبّل الملاحظات",
    question: "كيف تستفيد من ملاحظة عامة مثل «طوّر عرضك»؟",
    choices: ["تطلب مثالًا ومعيارًا واضحًا", "تتجاهلها", "تدافع عن نفسك فورًا"],
    answer: "أ — تطلب مثالًا ومعيارًا واضحًا.",
    explanation: "السؤال عن مثال يحوّل الملاحظة العامة إلى سلوك يمكن تحسينه.",
    takeaway: "الملاحظة الجيدة بداية حوار، لا حكم نهائي.",
  },
  {
    id: 11,
    kind: "academic",
    topic: "المرونة والتكيف",
    question: "ماذا تعني المرونة في العمل أو الدراسة؟",
    choices: [
      "تغيير الهدف كل يوم",
      "تعديل الأسلوب عند تغير الظروف",
      "الموافقة على كل شيء",
    ],
    answer: "ب — تعديل الأسلوب عند تغير الظروف.",
    explanation: "المرونة تحافظ على الهدف مع تكييف الخطة والوسائل.",
    takeaway: "تمسّك بالهدف، وكن مرنًا في الطريق.",
  },
  {
    id: 12,
    kind: "academic",
    topic: "الأخلاقيات المهنية",
    question: "وجدت خطأً في عملك قد لا يلاحظه أحد. ماذا تفعل؟",
    choices: ["تخفيه", "تنتظر أن يكتشفه غيرك", "تبلّغ عنه وتشارك في تصحيحه"],
    answer: "ج — تبلّغ عنه وتشارك في تصحيحه.",
    explanation: "النزاهة تعني تحمل مسؤولية الخطأ وحماية جودة العمل والثقة.",
    takeaway: "المهنية تظهر عندما لا يراقبك أحد.",
  },
  {
    id: 13,
    kind: "professional",
    topic: "التواصل الفعّال",
    question: "طلب منك زميل مهمة غير واضحة وموعدها قريب. كيف تتصرف؟",
    rubric: ["توضيح المطلوب", "تأكيد الموعد", "تلخيص الاتفاق"],
    explanation:
      "الإجابة القوية تطرح أسئلة محددة، ثم تؤكد النتيجة والموعد كتابةً.",
    takeaway: "الوضوح المبكر يوفر وقت التصحيح لاحقًا.",
  },
  {
    id: 14,
    kind: "professional",
    topic: "الاستماع الفعّال",
    question: "يقاطع أحد أعضاء الفريق الآخرين باستمرار. كيف تدير النقاش؟",
    rubric: ["احترام الجميع", "تنظيم الأدوار", "تلخيص الآراء"],
    explanation: "يمكن وضع دور للكلام، ثم تلخيص النقاط والتأكد من سماع كل عضو.",
    takeaway: "الاستماع يفتح مساحة للمشاركة، لا للصمت فقط.",
  },
  {
    id: 15,
    kind: "professional",
    topic: "إدارة الوقت",
    question: "تزامن تسليم مشروعين مهمين في اليوم نفسه. ما خطتك؟",
    rubric: ["ترتيب الأولويات", "تقسيم المهام", "التواصل المبكر"],
    explanation:
      "الخطة المنطقية تقدّر الجهد، تقسّم العمل، وتبلغ المعنيين مبكرًا عند وجود خطر.",
    takeaway: "لا تنتظر ضغط الموعد كي تعلن عن التعثر.",
  },
  {
    id: 16,
    kind: "professional",
    topic: "العمل الجماعي",
    question: "تأخر عضو في تسليم جزئه، وتأثر عمل الفريق. ماذا تفعل؟",
    rubric: ["فهم السبب", "حل عملي", "متابعة واضحة"],
    explanation:
      "ابدأ بفهم السبب دون اتهام، واتفقوا على دعم أو توزيع جديد وموعد متابعة.",
    takeaway: "عالج التعثر مع الشخص، لا ضد الشخص.",
  },
  {
    id: 17,
    kind: "professional",
    topic: "حل الخلافات",
    question: "اختلف عضوان حول أفضل طريقة لإنجاز المهمة. كيف تساعدهما؟",
    rubric: ["هدف مشترك", "أدلة ومعايير", "قرار متفق عليه"],
    explanation:
      "أعد النقاش إلى الهدف، وقارن البدائل بمعايير واضحة بدل تحويله إلى خلاف شخصي.",
    takeaway: "اجعل الفكرة موضع النقاش، لا صاحبها.",
  },
  {
    id: 18,
    kind: "professional",
    topic: "تحمل المسؤولية",
    question: "اكتشفت أنك لن تنهي مهمتك في الوقت المتفق عليه. ماذا تقول؟",
    rubric: ["إبلاغ مبكر", "تحمل المسؤولية", "خطة بديلة"],
    explanation:
      "اذكر الواقع بوضوح دون أعذار، وقدّم موعدًا واقعيًا أو بديلًا يقلل الأثر.",
    takeaway: "تحمل المسؤولية يجمع الصراحة مع الحل.",
  },
  {
    id: 19,
    kind: "professional",
    topic: "القيادة والمبادرة",
    question: "لاحظت مهمة مهمة لم تُسند إلى أحد. كيف تبادر؟",
    rubric: ["تأكيد الحاجة", "اقتراح واضح", "تنسيق دون تجاوز"],
    explanation:
      "اسأل عن الحاجة، واقترح تولي المهمة أو تنظيمها مع إطلاع المسؤول والفريق.",
    takeaway: "المبادرة مسؤولية واعية، وليست عملاً منفردًا.",
  },
  {
    id: 20,
    kind: "professional",
    topic: "تقبّل الملاحظات",
    question: "تلقيت ملاحظة قاسية أمام الفريق. كيف تستجيب بمهنية؟",
    rubric: ["ضبط الانفعال", "طلب توضيح", "فصل الأسلوب عن الفائدة"],
    explanation:
      "اشكر على الملاحظة، اطلب مناقشة التفاصيل بهدوء، واستخلص ما يفيد تطوير العمل.",
    takeaway: "اختر استجابتك حتى عندما لا تختار أسلوب الآخرين.",
  },
  {
    id: 21,
    kind: "professional",
    topic: "المرونة والتكيف",
    question: "تغيّرت متطلبات المشروع بعد بدء التنفيذ. ماذا تفعل؟",
    rubric: ["تحديد الأثر", "تحديث الخطة", "إبلاغ الفريق"],
    explanation:
      "قيّم أثر التغيير على الوقت والموارد، ثم حدّث الأولويات والاتفاقات.",
    takeaway: "التكيف الجيد يبدأ بفهم أثر التغيير.",
  },
  {
    id: 22,
    kind: "professional",
    topic: "اتخاذ القرار",
    question: "الفريق متردد بين حل سريع وآخر أدق لكنه أبطأ. كيف يقرر؟",
    rubric: ["تحديد الحاجة", "موازنة المخاطر", "توثيق القرار"],
    explanation:
      "قارنوا أثر السرعة والدقة وفق الهدف والمخاطر والموعد، ثم وثّقوا الاختيار.",
    takeaway: "لا يوجد خيار مثالي؛ يوجد خيار أنسب للسياق.",
  },
  {
    id: 23,
    kind: "professional",
    topic: "التعلم المستمر",
    question: "طُلبت منك مهمة جديدة لا تتقنها بعد. كيف تبدأ؟",
    rubric: ["تحديد فجوة المعرفة", "مصدر موثوق", "تجربة وطلب دعم"],
    explanation:
      "حدّد ما تحتاجه تحديدًا، تعلّم من مصدر موثوق، وطبّق على نطاق صغير.",
    takeaway: "عدم المعرفة نقطة بداية، لا سبب للتوقف.",
  },
  {
    id: 24,
    kind: "professional",
    topic: "الأخلاقيات المهنية",
    question:
      "طلب منك صديق مشاركة ملف داخلي ليس من حقه الاطلاع عليه. ما موقفك؟",
    rubric: ["حفظ السرية", "رفض واضح", "اقتراح قناة نظامية"],
    explanation:
      "ارفض المشاركة بلطف، واشرح حدود الصلاحية، ووجّهه إلى القناة المعتمدة.",
    takeaway: "الثقة المهنية تُبنى بحماية المعلومات.",
  },
  {
    id: 25,
    kind: "application",
    topic: "تحويل المعرفة إلى تطبيق",
    question: "تعلمت مبدأ «تقسيم المشكلة». طبّقه على مشروع متعثر.",
    rubric: ["تحديد المشكلة", "تقسيمها لأجزاء", "ترتيب خطوة أولى"],
    explanation:
      "مثال جيد: تحديد سبب التعثر، فصل المهام والموارد والمواعيد، ثم بدء الجزء الأكثر أثرًا.",
    takeaway: "المفهوم يصبح مهارة عندما تستخدمه.",
  },
  {
    id: 26,
    kind: "application",
    topic: "التفكير النقدي",
    question: "وصلتك معلومة مؤثرة من حساب مجهول. كيف تتحقق منها قبل مشاركتها؟",
    rubric: ["فحص المصدر", "مقارنة مصادر", "تمييز الرأي عن الحقيقة"],
    explanation:
      "ابحث عن المصدر الأصلي، وقارن أكثر من مرجع موثوق، وافحص تاريخ وسياق المعلومة.",
    takeaway: "المشاركة قرار؛ والتحقق جزء من المسؤولية.",
  },
  {
    id: 27,
    kind: "application",
    topic: "التواصل والعمل الجماعي",
    question: "حوّل اجتماعًا مشتتًا إلى خطة عمل واضحة في ثلاث خطوات.",
    rubric: ["تحديد الهدف", "توزيع المهام", "مواعيد ومتابعة"],
    explanation:
      "لخّص الهدف والقرارات، حدّد المسؤول عن كل مهمة، واتفق على موعد التسليم والمتابعة.",
    takeaway: "الاجتماع الناجح ينتهي بمسؤول وموعد.",
  },
  {
    id: 28,
    kind: "application",
    topic: "إدارة الوقت",
    question: "لديك ساعتان وثلاث مهام متفاوتة الأهمية. اشرح كيف ستوزع وقتك.",
    rubric: ["أولوية واضحة", "تقدير واقعي", "هامش للطوارئ"],
    explanation:
      "ابدأ بالأهم والأقرب موعدًا، خصص وقتًا محددًا لكل مهمة، واترك هامشًا قصيرًا للمراجعة.",
    takeaway: "إدارة الوقت هي إدارة الاختيارات.",
  },
  {
    id: 29,
    kind: "application",
    topic: "تقبّل الملاحظات",
    question: "حوّل ملاحظة «فكرتك غير واضحة» إلى خطة تحسين عملية.",
    rubric: ["سؤال توضيحي", "تعديل محدد", "اختبار التحسين"],
    explanation:
      "اطلب تحديد الجزء غير الواضح، أعد تنظيم الفكرة، ثم اعرض النسخة الجديدة على شخص آخر.",
    takeaway: "حوّل كل ملاحظة إلى فعل قابل للمراجعة.",
  },
  {
    id: 30,
    kind: "application",
    topic: "القيادة وتحمل المسؤولية",
    question: "فريقك أخفق في نتيجة مهمة. كيف تقود مراجعة تساعده على التحسن؟",
    rubric: ["حقائق دون لوم", "دروس مستفادة", "إجراء ومالك وموعد"],
    explanation:
      "راجعوا ما حدث بموضوعية، حدّدوا سببًا قابلًا للعلاج، واتفقوا على تحسين مسؤول عنه شخص وموعد.",
    takeaway: "القيادة تحوّل الإخفاق إلى تعلم.",
  },
]

function Icon({
  name,
  size = "md",
}: {
  name: string
  size?: "sm" | "md" | "lg"
}) {
  const path =
    name === "spark"
      ? "M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
      : name === "clock"
        ? "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2"
        : name === "users"
          ? "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m0-7.26a4 4 0 0 1 0 7.75"
          : name === "print"
            ? "M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-12-4h12v7H6v-7Z"
            : name === "arrow"
              ? "m9 18 6-6-6-6"
              : "M9 18h6m-5 3h4m3-9a5 5 0 1 0-10 0c0 2 1 3 2 4h6c1-1 2-2 2-4Z"

  return (
    <svg
      className={`icon icon-${size}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <img src="/nexus-logo.png" alt="شعار NEXUS" />
      {!compact && (
        <div>
          <strong>Skill Challenge</strong>
          <span>Academic or Professional?</span>
        </div>
      )}
    </div>
  )
}

function CardFace({
  card,
  back = false,
  compact = false,
}: {
  card: GameCard
  back?: boolean
  compact?: boolean
}) {
  const meta = kinds[card.kind]
  return (
    <article
      className={`game-card ${card.kind} ${back ? "card-back" : "card-front"} ${
        compact ? "compact-card" : ""
      }`}
      dir="rtl"
    >
      <div className="card-topline">
        <span className="kind-pill">
          <b>{meta.letter}</b>
          {meta.label}
        </span>
        <span className="card-number">{String(card.id).padStart(2, "0")}</span>
      </div>

      <div className="card-brandline">
        <span>SKILL CHALLENGE</span>
        <i />
      </div>

      {!back ? (
        <div className="card-content">
          <div className="topic-icon">
            <Icon
              name={
                card.topic.includes("وقت")
                  ? "clock"
                  : card.topic.includes("جماعي") || card.topic.includes("تواصل")
                    ? "users"
                    : card.kind === "application"
                      ? "spark"
                      : "bulb"
              }
              size="lg"
            />
          </div>
          <span className="topic">{card.topic}</span>
          <p className="question">{card.question}</p>
          {card.choices && (
            <ol className="choices">
              {card.choices.map((choice, index) => (
                <li key={choice}>
                  <span>{"أبج"[index]}</span>
                  {choice}
                </li>
              ))}
            </ol>
          )}
          {!card.choices && (
            <div className="open-hint">
              <Icon name="clock" size="sm" />
              لديك 30–60 ثانية لبناء إجابتك
            </div>
          )}
        </div>
      ) : (
        <div className="card-content answer-content">
          <span className="answer-label">
            {card.answer ? "الإجابة" : "معايير التقييم"}
          </span>
          {card.answer ? (
            <p className="answer">{card.answer}</p>
          ) : (
            <ul className="rubric">
              {card.rubric?.map((item) => (
                <li key={item}>
                  <i />
                  {item}
                </li>
              ))}
            </ul>
          )}
          <p className="explanation">{card.explanation}</p>
          <div className="takeaway">
            <Icon name="spark" size="sm" />
            <span>{card.takeaway}</span>
          </div>
        </div>
      )}

      <div className="card-footer">
        <span>اعرفها</span>
        <i />
        <span>طبّقها</span>
        <i />
        <span>أتقنها</span>
      </div>
    </article>
  )
}

function PrintSheets({
  list,
  back = false,
}: {
  list: GameCard[]
  back?: boolean
}) {
  const pages = Array.from({ length: Math.ceil(list.length / 9) }, (_, index) =>
    list.slice(index * 9, index * 9 + 9),
  )
  return (
    <>
      {pages.map((page, pageIndex) => (
        <section className="print-page" key={`${back}-${pageIndex}`}>
          <div className="print-label">
            {back ? "صفحات الإجابات" : "صفحات الأسئلة"} · صفحة {pageIndex + 1}
          </div>
          <div className="print-grid">
            {page.map((card) => (
              <CardFace key={card.id} card={card} back={back} compact />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function LegacyApp() {
  const [filter, setFilter] = useState<"all" | CardKind>("all")
  const [selectedId, setSelectedId] = useState(1)
  const [flipped, setFlipped] = useState(false)

  const visibleCards = useMemo(
    () =>
      filter === "all" ? cards : cards.filter((card) => card.kind === filter),
    [filter],
  )
  const selected =
    visibleCards.find((card) => card.id === selectedId) ?? visibleCards[0]
  const selectedIndex = visibleCards.findIndex(
    (card) => card.id === selected.id,
  )

  const chooseCard = (card: GameCard) => {
    setSelectedId(card.id)
    setFlipped(false)
    document
      .querySelector(".challenge-stage")
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const move = (direction: number) => {
    const next =
      (selectedIndex + direction + visibleCards.length) % visibleCards.length
    setSelectedId(visibleCards[next].id)
    setFlipped(false)
  }

  const selectFilter = (next: "all" | CardKind) => {
    setFilter(next)
    const first = next === "all" ? cards[0] : cards.find((c) => c.kind === next)
    if (first) setSelectedId(first.id)
    setFlipped(false)
  }

  const randomCard = () => {
    const options = visibleCards.filter((card) => card.id !== selected.id)
    const pick = options[Math.floor(Math.random() * options.length)] ?? selected
    setSelectedId(pick.id)
    setFlipped(false)
  }

  return (
    <main>
      <section className="hero">
        <nav className="nav-shell">
          <Brand />
          <button className="print-button" onClick={() => window.print()}>
            <Icon name="print" size="sm" />
            طباعة المجموعة
          </button>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="event-kicker">
              <span />
              Beyond the Classroom
              <i>من قاعة المحاضرات إلى سوق العمل</i>
            </div>
            <h1>
              هل هي معرفة
              <br />
              <em>أم مهارة؟</em>
            </h1>
            <p>
              تحدٍ تفاعلي يختبر قدرتك على تحويل ما تعرفه إلى ما تستطيع فعله في
              الدراسة والعمل والحياة.
            </p>
            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() =>
                  document
                    .querySelector(".challenge-stage")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                ابدأ التحدي
                <Icon name="arrow" size="sm" />
              </button>
              <div className="time-note">
                <Icon name="clock" />
                <span>
                  <b>60 ثانية</b>
                  لكل بطاقة
                </span>
              </div>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="floating-card card-a">
              <span>01</span>
              <Icon name="bulb" size="lg" />
              <b>فكّر</b>
            </div>
            <div className="floating-card card-b">
              <span>13</span>
              <Icon name="users" size="lg" />
              <b>تواصل</b>
            </div>
            <div className="floating-card card-c">
              <span>25</span>
              <Icon name="spark" size="lg" />
              <b>طبّق</b>
            </div>
            <div className="art-center">
              <Brand compact />
            </div>
          </div>
        </div>

        <div className="stats-strip">
          <div>
            <strong>30</strong>
            <span>بطاقة تحدٍ</span>
          </div>
          <div>
            <strong>3</strong>
            <span>مسارات للمهارة</span>
          </div>
          <div>
            <strong>16</strong>
            <span>موضوعًا عمليًا</span>
          </div>
          <div className="slogan">
            <span>اعرفها</span>
            <i />
            <span>طبّقها</span>
            <i />
            <span>أتقنها</span>
          </div>
        </div>
      </section>

      <section className="how-to section-shell">
        <div className="section-heading">
          <span>طريقة اللعب</span>
          <h2>دقيقة واحدة تكشف مهارتك</h2>
          <p>اختر، فكّر، ثم اربط المعرفة بالموقف العملي.</p>
        </div>
        <div className="steps">
          {[
            ["01", "اختر بطاقة", "اسحب بطاقة عشوائية من أحد المسارات."],
            ["02", "اقرأ وفكّر", "لديك من 30 إلى 60 ثانية للإجابة."],
            ["03", "ناقش الحل", "شارك منطقك واستمع إلى توضيح الميسّر."],
            ["04", "اكسب النقطة", "إجابة صحيحة أو حل منطقي يحقق المعايير."],
          ].map(([number, title, body]) => (
            <div className="step" key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="challenge-section">
        <div className="section-shell">
          <div className="section-heading light">
            <span>جرّب الآن</span>
            <h2>اختر مسارك وابدأ التحدي</h2>
            <p>اضغط على البطاقة بعد الإجابة لكشف التفسير.</p>
          </div>

          <div
            className="filter-tabs"
            role="tablist"
            aria-label="أنواع البطاقات"
          >
            {[
              ["all", "جميع البطاقات", "30"],
              ["academic", "المعرفة الأكاديمية", "12"],
              ["professional", "المهارات المهنية", "12"],
              ["application", "التطبيق العملي", "6"],
            ].map(([value, label, count]) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                onClick={() => selectFilter(value as "all" | CardKind)}
                role="tab"
                aria-selected={filter === value}
              >
                {label}
                <span>{count}</span>
              </button>
            ))}
          </div>

          <div className="challenge-stage">
            <button
              className="round-arrow"
              onClick={() => move(-1)}
              aria-label="البطاقة السابقة"
            >
              <Icon name="arrow" />
            </button>

            <button
              className={`flip-shell ${flipped ? "is-flipped" : ""}`}
              onClick={() => setFlipped(!flipped)}
              aria-label={flipped ? "عرض السؤال" : "عرض الإجابة"}
            >
              <div className="flip-inner">
                <div className="flip-side">
                  <CardFace card={selected} />
                </div>
                <div className="flip-side flip-back">
                  <CardFace card={selected} back />
                </div>
              </div>
            </button>

            <button
              className="round-arrow reverse"
              onClick={() => move(1)}
              aria-label="البطاقة التالية"
            >
              <Icon name="arrow" />
            </button>
          </div>

          <div className="stage-controls">
            <button className="random-button" onClick={randomCard}>
              <Icon name="spark" size="sm" />
              بطاقة عشوائية
            </button>
            <span>
              {selectedIndex + 1} من {visibleCards.length}
            </span>
          </div>
        </div>
      </section>

      <section className="collection section-shell">
        <div className="section-heading row-heading">
          <div>
            <span>المجموعة الكاملة</span>
            <h2>30 بطاقة، مهارات تصنع الفارق</h2>
          </div>
          <button className="outline-button" onClick={() => window.print()}>
            <Icon name="print" size="sm" />
            نسخة جاهزة للطباعة
          </button>
        </div>

        <div className="legend">
          {(Object.keys(kinds) as CardKind[]).map((kind) => (
            <span className={`legend-${kind}`} key={kind}>
              <i />
              {kinds[kind].label}
            </span>
          ))}
        </div>

        <div className="card-grid">
          {cards.map((card) => (
            <button
              className={`mini-card ${card.kind}`}
              key={card.id}
              onClick={() => chooseCard(card)}
            >
              <div>
                <span>{String(card.id).padStart(2, "0")}</span>
                <b>{kinds[card.kind].short}</b>
              </div>
              <p>{card.question}</p>
              <small>{card.topic}</small>
              <i>عرض البطاقة ←</i>
            </button>
          ))}
        </div>
      </section>

      <footer>
        <Brand />
        <p>
          لأن المعرفة تبدأ في القاعة، لكن قيمتها الحقيقية تظهر عندما نطبّقها.
        </p>
        <div>
          <span>اعرفها</span>
          <i />
          <span>طبّقها</span>
          <i />
          <span>أتقنها</span>
        </div>
      </footer>

      <div className="print-only">
        <PrintSheets list={cards} />
        <PrintSheets list={cards} back />
      </div>
    </main>
  )
}

export default function App() {
  return <RescueGame cards={cards} kinds={kinds} />
}

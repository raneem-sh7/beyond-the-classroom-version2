import { useEffect, useMemo, useRef, useState } from "react"

import "./rescue.css"

type CardKind = "academic" | "professional" | "application"

type EducationalCard = {
  id: number

  kind: CardKind

  topic: string

  question: string

  choices?: string[]

  answer?: string

  explanation: string

  takeaway: string
}

type KindInfo = {
  label: string
  short: string
  letter: string
}

type Stage = "welcome" | "playing" | "feedback" | "results" | "between" | "cards"

type Task = {
  id: string

  title: string

  duration: number

  importance: string

  consequence: string

  skill: "programming" | "testing" | "design"
}

type Member = {
  id: string
  name: string
  specialty: string
  capacity: number
}

type RoundResult = {
  name: string

  scores: number[]

  explanations: string[]

  remaining: number
}

const RULES = {
  activeSeconds: 180,

  priorityBudget: 90,

  surpriseBudget: 80,

  feedbackSeconds: 6,

  scoring: {
    maxPerChallenge: 25,

    priority: {
      bug: 7,

      feature: 7,

      testing: 5,

      withinBudget: 4,

      sequence: 2,

      earlierEssentials: 1,

      overBudgetPenaltyPerTen: 2,

      maxOverBudgetPenalty: 8,
    },

    communication: {
      clarify: 8,
      deadline: 8,
      help: 9,
      blame: -8,
      threat: -10,
      vague: -5,
    },

    delegation: {
      matching: 10,

      feasible: 8,

      balanced: 5,

      partialBalance: 3,

      assigned: 2,

      balanceTolerance: 25,
    },

    adaptability: {
      bug: 7,

      feature: 7,

      testing: 5,

      withinBudget: 4,

      postponeDecor: 2,

      overBudgetPenaltyPerTen: 2,

      maxOverBudgetPenalty: 10,
    },
  },
}

const tasks: Task[] = [
  {
    id: "bug",

    title: "إصلاح خلل يمنع تشغيل المشروع",

    duration: 25,

    importance: "أساسي",

    consequence: "بدونه لن يعمل المشروع أمام لجنة التقييم.",

    skill: "programming",
  },

  {
    id: "feature",

    title: "إكمال ميزة أساسية ناقصة",

    duration: 35,

    importance: "أساسي",

    consequence: "الميزة هي جوهر المشروع ومتطلبات التسليم.",

    skill: "programming",
  },

  {
    id: "testing",

    title: "اختبار الوظائف الأساسية",

    duration: 20,

    importance: "مهم",

    consequence: "الاختبار يكشف الأعطال قبل العرض.",

    skill: "testing",
  },

  {
    id: "presentation",

    title: "تحضير العرض التقديمي",

    duration: 25,

    importance: "مهم",

    consequence: "عرض واضح يساعد الفريق على شرح قيمة عمله.",

    skill: "design",
  },

  {
    id: "decor",

    title: "تحسين الألوان والتفاصيل الشكلية",

    duration: 15,

    importance: "تحسيني",

    consequence: "لمسات جميلة، لكنها لا تعوّض نقص الوظائف.",

    skill: "design",
  },
]

const members: Member[] = [
  { id: "programmer", name: "ليان", specialty: "البرمجة", capacity: 60 },

  { id: "designer", name: "عمر", specialty: "التصميم والعرض", capacity: 45 },

  { id: "tester", name: "نور", specialty: "الاختبار والتنظيم", capacity: 50 },
]

const messages = [
  {
    id: "clarify",
    label: "المطلوب هو إصلاح الخلل وإرسال نسخة تعمل.",
    points: RULES.scoring.communication.clarify,
  },

  {
    id: "deadline",
    label: "هل تستطيع إنهاءه قبل الساعة ٦؟ أخبرني إن احتجت وقتًا.",
    points: RULES.scoring.communication.deadline,
  },

  {
    id: "help",
    label: "ما العائق الذي تواجهه؟ يمكنني مساعدتك أو تقسيم المهمة.",
    points: RULES.scoring.communication.help,
  },

  {
    id: "blame",
    label: "أنت دائمًا سبب تأخير الفريق.",
    points: RULES.scoring.communication.blame,
  },

  {
    id: "threat",
    label: "إذا لم تنهِها الآن سأستبعدك من الفريق.",
    points: RULES.scoring.communication.threat,
  },

  {
    id: "vague",
    label: "خلصه بسرعة.",
    points: RULES.scoring.communication.vague,
  },
]

const skillNames = ["إدارة الوقت", "التواصل", "العمل الجماعي", "المرونة"]

const challengeNames = [
  "ترتيب الأولويات",
  "إصلاح التواصل",
  "توزيع المهام",
  "مفاجأة الموعد",
]

function timeText(seconds: number) {
  return `${Math.floor(seconds / 60)

    .toString()

    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
}

function priorityScore(order: string[]) {
  let score =
    (order.includes("bug") ? RULES.scoring.priority.bug : 0) +
    (order.includes("feature") ? RULES.scoring.priority.feature : 0) +
    (order.includes("testing") ? RULES.scoring.priority.testing : 0)

  const total = order.reduce(
    (sum, id) => sum + (tasks.find((task) => task.id === id)?.duration ?? 0),

    0,
  )

  if (order.length > 0) {
    score +=
      total <= RULES.priorityBudget
        ? RULES.scoring.priority.withinBudget
        : -Math.min(
            RULES.scoring.priority.maxOverBudgetPenalty,

            Math.ceil((total - RULES.priorityBudget) / 10) *
              RULES.scoring.priority.overBudgetPenaltyPerTen,
          )
  }

  const positions = Object.fromEntries(order.map((id, index) => [id, index]))

  if (
    positions.bug !== undefined &&
    positions.feature !== undefined &&
    positions.testing !== undefined &&
    positions.bug < positions.feature &&
    positions.feature < positions.testing
  )
    score += RULES.scoring.priority.sequence
  else if (
    positions.bug !== undefined &&
    positions.testing !== undefined &&
    positions.bug < positions.testing
  ) {
    score += RULES.scoring.priority.earlierEssentials
  }

  return Math.max(0, Math.min(RULES.scoring.maxPerChallenge, score))
}

function delegationScore(assignments: Record<string, string>) {
  let matched = 0

  for (const [taskId, memberId] of Object.entries(assignments)) {
    const task = tasks.find((item) => item.id === taskId)

    const member = members.find((item) => item.id === memberId)

    if (
      task &&
      member &&
      ((task.skill === "programming" && member.id === "programmer") ||
        (task.skill === "design" && member.id === "designer") ||
        (task.skill === "testing" && member.id === "tester"))
    )
      matched += 1
  }

  const loads = members.map((member) =>
    Object.entries(assignments)

      .filter(([, memberId]) => memberId === member.id)

      .reduce(
        (sum, [taskId]) =>
          sum + (tasks.find((task) => task.id === taskId)?.duration ?? 0),

        0,
      ),
  )

  const feasible = loads.filter(
    (load, index) => load > 0 && load <= members[index].capacity,
  ).length

  const nonzero = loads.filter((load) => load > 0)

  const balanced =
    nonzero.length >= 2 &&
    Math.max(...nonzero) - Math.min(...nonzero) <=
      RULES.scoring.delegation.balanceTolerance

  const assigned = Object.keys(assignments).length

  return Math.min(
    RULES.scoring.maxPerChallenge,

    Math.round((matched / tasks.length) * RULES.scoring.delegation.matching) +
      Math.round(
        (feasible / members.length) * RULES.scoring.delegation.feasible,
      ) +
      (balanced
        ? RULES.scoring.delegation.balanced
        : assigned >= 3
          ? RULES.scoring.delegation.partialBalance
          : 0) +
      Math.round((assigned / tasks.length) * RULES.scoring.delegation.assigned),
  )
}

function surpriseScore(kept: string[]) {
  const total = kept.reduce(
    (sum, id) => sum + (tasks.find((task) => task.id === id)?.duration ?? 0),

    0,
  )

  let score =
    (kept.includes("bug") ? RULES.scoring.adaptability.bug : 0) +
    (kept.includes("feature") ? RULES.scoring.adaptability.feature : 0) +
    (kept.includes("testing") ? RULES.scoring.adaptability.testing : 0) +
    (kept.length === 0
      ? 0
      : total <= RULES.surpriseBudget
        ? RULES.scoring.adaptability.withinBudget
        : -Math.min(
            RULES.scoring.adaptability.maxOverBudgetPenalty,

            Math.ceil((total - RULES.surpriseBudget) / 10) *
              RULES.scoring.adaptability.overBudgetPenaltyPerTen,
          ))

  if (kept.length > 0 && !kept.includes("decor")) {
    score += RULES.scoring.adaptability.postponeDecor
  }

  return Math.max(0, Math.min(RULES.scoring.maxPerChallenge, score))
}

function Brand() {
  return (
    <div className="rescue-brand">
      <img src="/nexus-logo.png" alt="شعار NEXUS" />
      <span>BEYOND THE CLASSROOM</span>
    </div>
  )
}

export default function RescueGame({
  cards,

  kinds,
}: {
  cards: EducationalCard[]

  kinds: Record<CardKind, KindInfo>
}) {
  const [screen, setScreen] = useState<Stage>("welcome")

  const [mode, setMode] = useState<"solo" | "teams">("solo")

  const [teamNames, setTeamNames] = useState(["الفريق الأول", "الفريق الثاني"])

  const [teamIndex, setTeamIndex] = useState(0)

  const [timeLeft, setTimeLeft] = useState(RULES.activeSeconds)

  const [challenge, setChallenge] = useState(0)

  const [scores, setScores] = useState<number[]>([])

  const [explanations, setExplanations] = useState<string[]>([])

  const [quality, setQuality] = useState(50)

  const [collaboration, setCollaboration] = useState(50)

  const [feedback, setFeedback] = useState("")

  const [taskOrder, setTaskOrder] = useState<string[]>([])

  const [messageSelection, setMessageSelection] = useState<string[]>([])

  const [assignments, setAssignments] = useState<Record<string, string>>({})

  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const [keptTasks, setKeptTasks] = useState(["bug", "feature", "testing"])

  const [rounds, setRounds] = useState<RoundResult[]>([])

  const [muted, setMuted] = useState(true)

  const [filter, setFilter] = useState<"all" | CardKind>("all")

  const ended = useRef(false)

  const currentName = mode === "teams" ? teamNames[teamIndex] : "جولة فردية"

  const totalScore = scores.reduce((sum, score) => sum + score, 0)

  const plannedTime = taskOrder.reduce(
    (sum, id) => sum + (tasks.find((task) => task.id === id)?.duration ?? 0),

    0,
  )

  const preview = messageSelection

    .map((id) => messages.find((message) => message.id === id)?.label)

    .filter(Boolean)

    .join(" ")

  const visibleCards = useMemo(
    () =>
      filter === "all" ? cards : cards.filter((card) => card.kind === filter),

    [cards, filter],
  )

  const playSound = (success: boolean) => {
    if (muted || !window.AudioContext) return

    const context = new window.AudioContext()

    const oscillator = context.createOscillator()

    const gain = context.createGain()

    oscillator.frequency.value = success ? 660 : 220

    gain.gain.setValueAtTime(0.06, context.currentTime)

    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18)

    oscillator.connect(gain)

    gain.connect(context.destination)

    oscillator.start()

    oscillator.stop(context.currentTime + 0.18)

    oscillator.onended = () => void context.close()
  }

  const resetRound = (nextTeamIndex = 0) => {
    ended.current = false

    setTeamIndex(nextTeamIndex)

    setTimeLeft(RULES.activeSeconds)

    setChallenge(0)

    setScores([])

    setExplanations([])

    setQuality(50)

    setCollaboration(50)

    setTaskOrder([])

    setMessageSelection([])

    setAssignments({})

    setSelectedTask(null)

    setKeptTasks(["bug", "feature", "testing"])

    setFeedback("")
  }

  const startRound = (nextTeamIndex = teamIndex) => {
    resetRound(nextTeamIndex)

    setScreen("playing")
  }

  const buildResult = (
    nextScores: number[],

    nextExplanations: string[],

    remaining = timeLeft,
  ): RoundResult => ({
    name: currentName,

    scores: nextScores,

    explanations: nextExplanations,

    remaining,
  })

  const finishRound = (
    nextScores = scores,

    nextExplanations = explanations,

    remaining = timeLeft,
  ) => {
    const result = buildResult(nextScores, nextExplanations, remaining)

    if (mode === "teams" && teamIndex === 0) {
      setRounds([result])

      setTeamIndex(1)

      setScreen("between")
    } else if (mode === "teams") {
      setRounds((previous) => [...previous.slice(0, 1), result])

      setScreen("results")
    } else {
      setRounds([result])

      setScreen("results")
    }
  }

  useEffect(() => {
    if (screen !== "playing") return

    if (timeLeft <= 0) {
      if (ended.current) return

      ended.current = true

      const missing = 4 - scores.length

      const nextScores = [...scores, ...Array(missing).fill(0)]

      const nextExplanations = [
        ...explanations,

        ...Array(missing).fill(
          "غير مكتمل: انتهى الوقت قبل تأكيد هذا التحدي؛ لم تُحتسب له نقاط.",
        ),
      ]

      setScores(nextScores)

      setExplanations(nextExplanations)

      finishRound(nextScores, nextExplanations, 0)

      return
    }

    const timer = window.setTimeout(
      () => setTimeLeft((value) => value - 1),
      1000,
    )

    return () => window.clearTimeout(timer)
  }, [screen, timeLeft])

  useEffect(() => {
    if (screen !== "feedback") return

    const timer = window.setTimeout(() => {
      if (challenge >= 3) finishRound()
      else {
        setChallenge((value) => value + 1)

        setScreen("playing")
      }
    }, RULES.feedbackSeconds * 1000)

    return () => window.clearTimeout(timer)
  }, [screen, challenge])

  const submitChallenge = (
    score: number,

    explanation: string,

    qualityChange: number,

    collaborationChange: number,
  ) => {
    if (screen !== "playing" || scores.length !== challenge) return

    const nextScores = [...scores, score]

    const nextExplanations = [...explanations, explanation]

    setScores(nextScores)

    setExplanations(nextExplanations)

    setQuality((value) => Math.max(0, Math.min(100, value + qualityChange)))

    setCollaboration((value) =>
      Math.max(0, Math.min(100, value + collaborationChange)),
    )

    setFeedback(`${score}/25 نقطة — ${explanation}`)

    playSound(score >= 15)

    setScreen("feedback")
  }

  const confirmPriority = () => {
    const score = priorityScore(taskOrder)

    const essentials =
      taskOrder.includes("bug") && taskOrder.includes("feature")

    setKeptTasks(taskOrder)

    submitChallenge(
      score,

      `اخترت ${taskOrder.length} مهام بوقت ${plannedTime} دقيقة. ${
        essentials
          ? "حافظت على أساس المشروع."
          : "أهملت عملًا أساسيًا يحتاجه المشروع."
      }`,

      (taskOrder.includes("bug") ? 8 : -8) +
        (taskOrder.includes("feature") ? 8 : -8) +
        (taskOrder.includes("testing") ? 5 : -3),

      taskOrder.includes("presentation") ? 2 : 0,
    )
  }

  const confirmCommunication = () => {
    const points = messageSelection.reduce(
      (sum, id) =>
        sum + (messages.find((message) => message.id === id)?.points ?? 0),

      0,
    )

    const positives = messageSelection.filter((id) =>
      ["clarify", "deadline", "help"].includes(id),
    ).length

    const reply =
      positives === 3
        ? "تمام، صار المطلوب أوضح. سأبدأ الآن، وأخبرك إذا واجهت عائقًا."
        : "ما زلت غير متأكد من الخطوة التالية. هل يمكننا الاتفاق على المطلوب؟"

    const score = Math.max(
      0,

      Math.min(RULES.scoring.maxPerChallenge, points),
    )

    submitChallenge(
      score,

      `ردّ زميلك: «${reply}» ${
        positives === 3
          ? "وضوحك ودعمك سهّلا التعاون."
          : "التوجيه غير الواضح أو اللوم زاد التوتر."
      }`,

      positives === 3 ? 5 : -8,

      Math.round((score - 12) * 0.6),
    )
  }

  const confirmDelegation = () => {
    const score = delegationScore(assignments)

    const assigned = Object.keys(assignments).length

    const overloaded = members.some(
      (member) =>
        Object.entries(assignments)

          .filter(([, memberId]) => memberId === member.id)

          .reduce(
            (sum, [taskId]) =>
              sum + (tasks.find((task) => task.id === taskId)?.duration ?? 0),

            0,
          ) > member.capacity,
    )

    submitChallenge(
      score,

      `${assigned} مهام وُزّعت. ${
        overloaded
          ? "هناك عضو تجاوز وقته المتاح، ما يهدد موعد التسليم."
          : "راعيْت الوقت المتاح للأعضاء."
      }`,

      assigned >= 3 && !overloaded ? 7 : -4,

      assigned >= 3 && !overloaded ? 10 : -5,
    )
  }

  const confirmSurprise = () => {
    const score = surpriseScore(keptTasks)

    const duration = keptTasks.reduce(
      (sum, id) => sum + (tasks.find((task) => task.id === id)?.duration ?? 0),

      0,
    )

    const coreSaved = keptTasks.includes("bug") && keptTasks.includes("feature")

    submitChallenge(
      score,

      `أبقيت ${keptTasks.length} مهام بوقت ${duration} دقيقة من ${RULES.surpriseBudget}. ${
        coreSaved
          ? "حافظت على أساس المشروع وأجلت التحسينات."
          : "تأثر جوهر المشروع بقرار التأجيل."
      }`,

      coreSaved && keptTasks.includes("testing") ? 10 : -12,

      coreSaved ? 5 : -8,
    )
  }

  const compare = () => {
    if (rounds.length !== 2) return null

    const [first, second] = rounds

    const firstScore = first.scores.reduce((sum, value) => sum + value, 0)

    const secondScore = second.scores.reduce((sum, value) => sum + value, 0)

    const winner =
      firstScore === secondScore
        ? first.remaining === second.remaining
          ? "تعادل"
          : first.remaining > second.remaining
            ? first.name
            : second.name
        : firstScore > secondScore
          ? first.name
          : second.name

    return { first, second, firstScore, secondScore, winner }
  }

  const moveTask = (id: string, direction: number) => {
    const index = taskOrder.indexOf(id)

    const target = index + direction

    if (index < 0 || target < 0 || target >= taskOrder.length) return

    const next = [...taskOrder]
    ;[next[index], next[target]] = [next[target], next[index]]

    setTaskOrder(next)
  }

  const toggleMessage = (id: string) => {
    setMessageSelection((selection) => {
      if (selection.includes(id)) return selection.filter((item) => item !== id)

      return selection.length < 3 ? [...selection, id] : selection
    })
  }

  const assignTask = (taskId: string, memberId: string) => {
    setAssignments((current) => ({ ...current, [taskId]: memberId }))

    setSelectedTask(null)
  }

  const startCompetition = () => {
    setMode("teams")

    setRounds([])

    resetRound(0)

    setScreen("playing")
  }

  const openCards = () => {
    setScreen("cards")

    window.setTimeout(
      () =>
        document
          .getElementById("skills")
          ?.scrollIntoView({ behavior: "smooth" }),

      0,
    )
  }

  const showResults = () => {
    const result = rounds[0]

    if (mode === "teams") {
      const comparison = compare()

      if (!comparison) return null

      const teamCard = (round: RoundResult) => (
        <article className="comparison-card" key={round.name}>
          <span>{round.name}</span>
          <strong>
            {round.scores.reduce((sum, value) => sum + value, 0)}
            <small>/100</small>
          </strong>
          {round.scores.map((value, index) => (
            <div className="comparison-skill" key={skillNames[index]}>
              <span>{skillNames[index]}</span>
              <b>{value}/25</b>
              <i>
                <em style={{ width: `${value * 4}%` }} />
              </i>
            </div>
          ))}
          <small>الوقت المتبقي: {timeText(round.remaining)}</small>
        </article>
      )

      return (
        <section className="result-panel">
          <div className="result-emoji">🏆</div>
          <span className="eyebrow">نهاية المنافسة المحلية</span>
          <h1>
            {comparison.winner === "تعادل"
              ? "تعادل رائع!"
              : `الفائز: ${comparison.winner}`}
          </h1>
          <p>
            منافسة محلية على الجهاز نفسه · أعلى نتيجة تفوز، والوقت المتبقي يحسم
            التعادل.
          </p>
          <div className="team-comparison">
            {teamCard(comparison.first)}
            {teamCard(comparison.second)}
          </div>
          <div className="result-actions">
            <button className="game-primary" onClick={startCompetition}>
              منافسة جديدة
            </button>
            <button className="game-secondary" onClick={openCards}>
              استكشف المهارات
            </button>
          </div>
        </section>
      )
    }

    if (!result) return null

    const score = result.scores.reduce((sum, value) => sum + value, 0)

    const outcome =
      score >= 75
        ? "تم إنقاذ المشروع"
        : score >= 45
          ? "تم التسليم مع تحديات"
          : "المشروع يحتاج خطة إنقاذ جديدة"

    const strongestScore = Math.max(...result.scores)

    const strongest = result.scores.indexOf(strongestScore)

    const practice = result.scores.indexOf(Math.min(...result.scores))

    return (
      <section className="result-panel">
        <div className="result-emoji">
          {score >= 75 ? "🎉" : score >= 45 ? "🛠️" : "🧭"}
        </div>
        <span className="eyebrow">ملخص الجولة · {result.name}</span>
        <h1>{outcome}</h1>
        <p className="result-total">
          {score}
          <small> / 100</small>
        </p>
        <div className="skill-breakdown">
          {skillNames.map((name, index) => (
            <article key={name}>
              <span>{name}</span>
              <b>{result.scores[index]}/25</b>
              <i>
                <em style={{ width: `${result.scores[index] * 4}%` }} />
              </i>
              <small>{result.explanations[index]}</small>
            </article>
          ))}
        </div>
        <div className="result-insight">
          <p>
            <b>أقوى مهارة:</b>{" "}
            {strongestScore > 0
              ? `${skillNames[strongest]} — أظهرت أفضل قراراتك هنا.`
              : "لم تُحدّد هذه الجولة مهارة متميزة؛ أكمل التحديات لتظهر نقاط القوة."}
          </p>
          <p>
            <b>مهارة للتدريب:</b> {skillNames[practice]} — جرّب تقسيم القرار إلى
            خطوات واضحة قبل التنفيذ.
          </p>
        </div>
        <p className="result-disclaimer">
          هذه النتيجة تصف قراراتك في هذه الجولة، وليست تقييمًا شاملًا لقدراتك.
        </p>
        <div className="result-actions">
          <button className="game-primary" onClick={() => startRound(0)}>
            جرّب من جديد
          </button>
          <button className="game-secondary" onClick={() => startRound(0)}>
            اللاعب التالي
          </button>
          <button className="game-secondary" onClick={openCards}>
            استكشف المهارات
          </button>
        </div>
      </section>
    )
  }

  const challengeContent = () => {
    if (challenge === 0) {
      const priorityDisplayTasks = [...tasks].sort((first, second) => {
        const firstOrder = taskOrder.indexOf(first.id)

        const secondOrder = taskOrder.indexOf(second.id)

        if (firstOrder < 0 && secondOrder < 0) {
          return tasks.indexOf(first) - tasks.indexOf(second)
        }

        if (firstOrder < 0) return 1

        if (secondOrder < 0) return -1

        return firstOrder - secondOrder
      })

      return (
        <div className="challenge-body">
          <div className="challenge-intro">
            <span className="skill-tag">المهارة: إدارة الوقت</span>
            <p>
              اختر المهام المناسبة ورتّب تنفيذها. اسحب لإعادة الترتيب أو استخدم
              أزرار التحريك.
            </p>
            <div className="budget-banner">
              ميزانية العمل <b>{RULES.priorityBudget} دقيقة</b> · إجمالي خطتك{" "}
              <b>{plannedTime} دقيقة</b>
            </div>
          </div>
          <div className="task-choice-list">
            {priorityDisplayTasks.map((task) => {
              const selected = taskOrder.includes(task.id)

              const order = taskOrder.indexOf(task.id)

              return (
                <article
                  className={`rescue-task ${selected ? "task-selected" : ""}`}
                  key={task.id}
                  draggable={selected}
                  onDragStart={() => setDraggedTask(task.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()

                    if (!draggedTask || draggedTask === task.id) return

                    setTaskOrder((previous) => {
                      const next = previous.filter((id) => id !== draggedTask)

                      const position = next.indexOf(task.id)

                      next.splice(
                        position < 0 ? next.length : position,
                        0,
                        draggedTask,
                      )

                      return next
                    })

                    setDraggedTask(null)
                  }}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        setTaskOrder((previous) =>
                          selected
                            ? previous.filter((id) => id !== task.id)
                            : [...previous, task.id],
                        )
                      }
                    />
                    <span className="task-order">
                      {selected ? order + 1 : "＋"}
                    </span>
                    <span className="task-copy">
                      <b>{task.title}</b>
                      <small>{task.consequence}</small>
                    </span>
                  </label>
                  <span
                    className={`importance ${
                      task.importance === "أساسي" ? "essential" : ""
                    }`}
                  >
                    {task.importance}
                  </span>
                  <span className="task-duration">{task.duration} د</span>
                  {selected && (
                    <span className="move-controls">
                      <button
                        type="button"
                        onClick={() => moveTask(task.id, -1)}
                        aria-label="تحريك المهمة للأعلى"
                        disabled={order === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTask(task.id, 1)}
                        aria-label="تحريك المهمة للأسفل"
                        disabled={order === taskOrder.length - 1}
                      >
                        ↓
                      </button>
                    </span>
                  )}
                </article>
              )
            })}
          </div>
          <button className="game-primary" onClick={confirmPriority}>
            تأكيد خطة العمل
          </button>
        </div>
      )
    }

    if (challenge === 1) {
      const positiveCount = messageSelection.filter((id) =>
        ["clarify", "deadline", "help"].includes(id),
      ).length

      return (
        <div className="challenge-body">
          <div className="challenge-intro">
            <span className="skill-tag">المهارة: تواصل واضح وبنّاء</span>
            <p>زميلك أرسل في المحادثة:</p>
          </div>
          <div className="chat-bubble">
            «مش فاهم شو المطلوب مني، والتسليم قرب!»
          </div>
          <div className="message-options">
            {messages.map((message) => (
              <button
                className={
                  messageSelection.includes(message.id)
                    ? "message-option chosen"
                    : "message-option"
                }
                key={message.id}
                onClick={() => toggleMessage(message.id)}
                aria-pressed={messageSelection.includes(message.id)}
              >
                <span>{messageSelection.indexOf(message.id) + 1 || "＋"}</span>
                {message.label}
              </button>
            ))}
          </div>
          <div className="message-preview">
            <b>معاينة الرد · {messageSelection.length}/3</b>
            <p>{preview || "اختر حتى ثلاثة أجزاء لبناء ردك..."}</p>
          </div>
          <p className="fiction-note">
            محادثة خيالية داخل اللعبة فقط؛ لن تُرسل أي رسائل حقيقية.
          </p>
          <button
            className="game-primary"
            onClick={confirmCommunication}
            disabled={messageSelection.length !== 3}
          >
            إرسال الرد الافتراضي
          </button>
          <span className="sr-only" aria-live="polite">
            {positiveCount} عناصر بنّاءة في الرد
          </span>
        </div>
      )
    }

    if (challenge === 2) {
      return (
        <div className="challenge-body">
          <div className="challenge-intro">
            <span className="skill-tag">المهارة: العمل الجماعي</span>
            <p>
              اختر مهمة ثم عضوًا، أو اسحب المهمة إلى بطاقة العضو. يمكن تغيير
              الإسناد قبل التأكيد.
            </p>
          </div>
          <div className="delegation-layout">
            <div className="delegation-tasks">
              <h3>المهام · اضغط لاختيارها</h3>
              {tasks.map((task) => {
                const person = members.find(
                  (member) => member.id === assignments[task.id],
                )

                return (
                  <button
                    className={`delegation-task ${
                      selectedTask === task.id ? "selected" : ""
                    } ${person ? "assigned" : ""}`}
                    key={task.id}
                    onClick={() => setSelectedTask(task.id)}
                    aria-pressed={selectedTask === task.id}
                    draggable
                    onDragStart={() => setDraggedTask(task.id)}
                  >
                    <b>{task.title}</b>
                    <span>{task.duration} دقيقة</span>
                    <small>
                      {person ? `مسندة إلى ${person.name}` : "غير مسندة"}
                    </small>
                  </button>
                )
              })}
            </div>
            <div className="teammate-list">
              <h3>أعضاء الفريق · اضغط للإسناد</h3>
              {members.map((member) => {
                const workload = Object.entries(assignments)

                  .filter(([, memberId]) => memberId === member.id)

                  .reduce(
                    (sum, [taskId]) =>
                      sum +
                      (tasks.find((task) => task.id === taskId)?.duration ?? 0),
                    0,
                  )

                const overloaded = workload > member.capacity

                return (
                  <button
                    className={`teammate-card ${
                      selectedTask ? "can-assign" : ""
                    } ${overloaded ? "overloaded" : ""}`}
                    key={member.id}
                    onClick={() =>
                      selectedTask && assignTask(selectedTask, member.id)
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()

                      if (draggedTask) assignTask(draggedTask, member.id)

                      setDraggedTask(null)
                    }}
                    aria-label={`إسناد المهمة إلى ${member.name}`}
                  >
                    <span className="member-avatar">
                      {member.name.slice(0, 1)}
                    </span>
                    <b>{member.name}</b>
                    <small>{member.specialty}</small>
                    <span className="workload-label">
                      الحمل {workload}/{member.capacity} دقيقة
                    </span>
                    <span className="workload-track">
                      <i
                        style={{
                          width: `${Math.min(100, (workload / member.capacity) * 100)}%`,
                        }}
                      />
                    </span>
                    {overloaded && (
                      <strong className="overload-warning">
                        تجاوز الوقت المتاح
                      </strong>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <button className="game-primary" onClick={confirmDelegation}>
            تأكيد توزيع المهام
          </button>
        </div>
      )
    }

    const currentTime = keptTasks.reduce(
      (sum, id) => sum + (tasks.find((task) => task.id === id)?.duration ?? 0),

      0,
    )

    return (
      <div className="challenge-body">
        <div className="surprise-banner">
          <span>حدث مفاجئ</span>
          <b>موعد التسليم تقدّم، والوقت المتاح صار أقل!</b>
        </div>
        <div className="challenge-intro">
          <span className="skill-tag">المهارة: المرونة واتخاذ القرار</span>
          <p>
            أبقِ ما يحمي جوهر المشروع ضمن الوقت الجديد، وأجّل ما يمكن تحسينه
            لاحقًا.
          </p>
        </div>
        <div className="current-plan">
          <b>الخطة الحالية بعد التحدي الأول</b>
          <span>
            {taskOrder.length
              ? taskOrder
                  .map(
                    (id, index) =>
                      `${index + 1}. ${tasks.find((task) => task.id === id)?.title}`,
                  )
                  .join(" · ")
              : "لم تُحدد مهام بعد؛ ابنِ خطة جديدة للأعمال المتبقية."}
          </span>
        </div>
        <div className="budget-banner">
          الوقت بعد التغيير <b>{RULES.surpriseBudget} دقيقة</b> · وقت المهام
          المختارة <b>{currentTime} دقيقة</b>
        </div>
        <div className="task-choice-list">
          {tasks.map((task) => (
            <label
              className={`rescue-task surprise-task ${
                keptTasks.includes(task.id) ? "task-selected" : ""
              }`}
              key={task.id}
            >
              <input
                type="checkbox"
                checked={keptTasks.includes(task.id)}
                onChange={() =>
                  setKeptTasks((previous) =>
                    previous.includes(task.id)
                      ? previous.filter((id) => id !== task.id)
                      : [...previous, task.id],
                  )
                }
              />
              <span className="task-copy">
                <b>{task.title}</b>
                <small>{task.consequence}</small>
              </span>
              <span className="task-duration">{task.duration} د</span>
              <span className="keep-status">
                {keptTasks.includes(task.id) ? "إبقاء" : "تأجيل"}
              </span>
            </label>
          ))}
        </div>
        <button className="game-primary" onClick={confirmSurprise}>
          اعتماد خطة الإنقاذ
        </button>
      </div>
    )
  }

  return (
    <main className="rescue-app" dir="rtl">
      <header className="rescue-header">
        <Brand />
        <div className="header-controls">
          <button
            className="icon-control"
            onClick={() => setMuted((value) => !value)}
            aria-label={muted ? "تشغيل الأصوات" : "كتم الأصوات"}
          >
            {muted ? "🔇" : "🔊"}{" "}
            <span>{muted ? "الصوت مكتوم" : "الصوت يعمل"}</span>
          </button>
          <button
            className="icon-control"
            onClick={() =>
              document.fullscreenElement
                ? void document.exitFullscreen()
                : void document.documentElement.requestFullscreen?.()
            }
            aria-label="تبديل ملء الشاشة"
          >
            ⛶ <span>ملء الشاشة</span>
          </button>
        </div>
      </header>

      {screen === "welcome" && (
        <section className="welcome-panel">
          <div className="welcome-copy">
            <span className="eyebrow">مهمة NEXUS · تحدٍ تفاعلي</span>
            <h1>
              أنقذ <em>المشروع!</em>
            </h1>
            <p className="story">
              باقي يوم على تسليم المشروع! أحد أعضاء الفريق تأخر، العرض فيه
              أخطاء، والمتطلبات تغيّرت. هل تستطيع إنقاذ المشروع؟
            </p>
            <p>
              أربع قرارات واقعية تكشف أثر إدارة الوقت والتواصل والعمل الجماعي
              والمرونة.
            </p>
            {mode === "solo" && (
              <button className="game-primary" onClick={() => startRound(0)}>
                ابدأ المهمة <span>←</span>
              </button>
            )}
            <span className="duration-chip">⏱ ٣ دقائق من اللعب النشط</span>
            <button className="game-secondary welcome-explore" onClick={openCards}>
              استكشف المهارات
            </button>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="art-ring" />
            <div className="project-icon">🚀</div>
            <span className="orbit-chip chip-one">✓ خطة</span>
            <span className="orbit-chip chip-two">✦ فريق</span>
            <span className="orbit-chip chip-three">⏱ وقت</span>
          </div>
          <div className="mode-picker">
            <button
              className={mode === "solo" ? "mode-card active" : "mode-card"}
              onClick={() => setMode("solo")}
            >
              <b>جولة فردية سريعة</b>
              <span>بلا تسجيل أو معلومات شخصية · ابدأ فورًا</span>
            </button>
            <button
              className={mode === "teams" ? "mode-card active" : "mode-card"}
              onClick={() => setMode("teams")}
            >
              <b>منافسة بين فريقين</b>
              <span>على الجهاز نفسه · اسم فريق قصير فقط</span>
            </button>
          </div>
          {mode === "teams" && (
            <div className="team-name-fields">
              {teamNames.map((name, index) => (
                <label key={index}>
                  اسم الفريق {index + 1}
                  <input
                    maxLength={18}
                    value={name}
                    onChange={(event) =>
                      setTeamNames((previous) =>
                        previous.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                    placeholder={`الفريق ${index + 1}`}
                  />
                </label>
              ))}
              <button
                className="game-primary"
                disabled={teamNames.some((name) => !name.trim())}
                onClick={startCompetition}
              >
                ابدأ المنافسة
              </button>
              <small>
                منافسة محلية على الجهاز نفسه؛ لا تُحفظ بيانات الفرق أو تُرسل.
              </small>
            </div>
          )}
          <div className="how-to-play">
            <b>كيف تلعب؟</b>
            <span>رتّب المهام</span>
            <i>←</i>
            <span>تواصل بوضوح</span>
            <i>←</i>
            <span>وزّع الأدوار</span>
            <i>←</i>
            <span>تكيّف مع المفاجأة</span>
          </div>
        </section>
      )}

      {(screen === "playing" || screen === "feedback") && (
        <section className="game-shell">
          <div className="hud-top">
            <div>
              <span className="eyebrow">{currentName}</span>
              <h1>
                {screen === "feedback"
                  ? "نتيجة القرار"
                  : challengeNames[challenge]}
              </h1>
            </div>
            <div className={`timer-card ${timeLeft <= 30 ? "urgent" : ""}`}>
              <span>الوقت المتبقي</span>
              <b>⏱ {timeText(timeLeft)}</b>
            </div>
          </div>
          <div className="hud-meters">
            <div className="meter-card">
              <span>
                جودة المشروع <b>◇</b>
              </span>
              <strong>{quality}/100</strong>
              <i>
                <em style={{ width: `${quality}%` }} />
              </i>
            </div>
            <div className="meter-card">
              <span>
                تعاون الفريق <b>♧</b>
              </span>
              <strong>{collaboration}/100</strong>
              <i>
                <em style={{ width: `${collaboration}%` }} />
              </i>
            </div>
            <div className="meter-card score-card">
              <span>
                النقاط الحالية <b>★</b>
              </span>
              <strong>
                {totalScore}
                <small>/100</small>
              </strong>
            </div>
          </div>
          <div
            className="challenge-track"
            aria-label={`التحدي ${challenge + 1} من 4`}
          >
            {challengeNames.map((name, index) => (
              <div
                className={`track-step ${
                  index === challenge ? "current" : ""
                } ${scores[index] !== undefined ? "complete" : ""}`}
                key={name}
              >
                <span>{scores[index] !== undefined ? "✓" : index + 1}</span>
                <small>{name}</small>
              </div>
            ))}
          </div>
          {screen === "playing" ? (
            <article className="challenge-card">
              <div className="challenge-card-head">
                <span>التحدي {challenge + 1} من 4</span>
                <span>حتى 25 نقطة</span>
              </div>
              {challengeContent()}
            </article>
          ) : (
            <article className="feedback-card" role="status">
              <span className="feedback-icon">
                {scores[challenge] >= 15 ? "✓" : "!"}
              </span>
              <span className="eyebrow">
                أثر قرارك · {scores[challenge]}/25
              </span>
              <h2>{feedback}</h2>
              <p>
                جودة المشروع {quality}/100 · تعاون الفريق {collaboration}/100
              </p>
              <p className="criteria-note">
                يُحتسب التقييم وفق جودة الاختيار والوضوح والوقت والملاءمة، دون
                نقاط عشوائية.
              </p>
              <button
                className="game-primary"
                onClick={() => {
                  if (challenge >= 3) finishRound()
                  else {
                    setChallenge((value) => value + 1)

                    setScreen("playing")
                  }
                }}
              >
                متابعة المهمة
              </button>
            </article>
          )}
          <div className="feedback-strip">
            <b>آخر أثر:</b>{" "}
            {screen === "feedback"
              ? feedback
              : "قراراتك ستغيّر جودة المشروع وتعاون الفريق."}
          </div>
        </section>
      )}

      {screen === "between" && (
        <section className="between-panel">
          <span className="eyebrow">انتهى دور الفريق الأول</span>
          <h1>حان دور الفريق الثاني</h1>
          <p>
            أخفينا نتائج الفريق الأول وتفسيراته. لكل فريق سيناريو مماثل ووقت
            وقواعد تسجيل متطابقة.
          </p>
          <strong>{teamNames[1]}</strong>
          <button className="game-primary" onClick={() => startRound(1)}>
            ابدأ دور الفريق الثاني
          </button>
        </section>
      )}

      {screen === "results" && showResults()}

      {screen === "cards" && (
        <section className="skills-explorer" id="skills">
          <span className="eyebrow">مكتبة المهارات · 30 بطاقة</span>
          <h1>استكشف المهارات</h1>
          <p>بطاقات Beyond the Classroom التعليمية متاحة للتصفح بعد المهمة.</p>
          <div className="skill-filters">
            {([
              ["all", "كل البطاقات"],
              ["academic", "المعرفة الأكاديمية"],
              ["professional", "المهارات المهنية"],
              ["application", "التطبيق العملي"],
            ] as const).map(([value, label]) => (
              <button
                className={filter === value ? "selected" : ""}
                key={value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="educational-cards">
            {visibleCards.map((card) => (
              <article className={`edu-card ${card.kind}`} key={card.id}>
                <span>
                  {String(card.id).padStart(2, "0")} · {kinds[card.kind].label}
                </span>
                <h2>{card.topic}</h2>
                <p>{card.question}</p>
                {card.choices && (
                  <ul>
                    {card.choices.map((choice) => (
                      <li key={choice}>{choice}</li>
                    ))}
                  </ul>
                )}
                <div>
                  <b>الفكرة:</b> {card.explanation}
                </div>
                <small>{card.takeaway}</small>
                {card.answer && (
                  <details>
                    <summary>إجابة مقترحة</summary>
                    <p>{card.answer}</p>
                  </details>
                )}
              </article>
            ))}
          </div>
          <button
            className="game-secondary"
            onClick={() => setScreen("welcome")}
          >
            العودة إلى الرئيسية
          </button>
        </section>
      )}
      <footer className="rescue-footer">
        <Brand />
        <span>اعرفها · طبّقها · أتقنها</span>
      </footer>
    </main>
  )
}

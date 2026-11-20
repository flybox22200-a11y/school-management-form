/**
 * Single source of truth for the questionnaire.
 *
 * The public form, the review screen, server-side validation, the admin detail
 * view and the CSV export are all driven by this file. Question ids (q1…q38)
 * are stable identifiers stored in the database — do not renumber them.
 */

export const SCHEMA_VERSION = 1;

export type Special = "dont_know" | "declined";

export const SPECIAL_LABELS: Record<Special, string> = {
  dont_know: "Maloom nahi (Don't know)",
  declined: "Declined",
};

export type Option = { value: string; label: string };

export type SubField = {
  key: string;
  label: string;
  input: "text" | "longtext" | "number";
  placeholder?: string;
};

type Base = {
  id: string;
  number: number;
  prompt: string;
  help?: string;
  /** Bullet hints shown under the prompt (e.g. what a good answer explains). */
  hints?: string[];
  required?: boolean;
  /** Which "can't answer" choices are offered. Defaults to both. */
  specials?: Special[];
  /** Always-visible optional explanation field. */
  explain?: { label: string };
  /** Explanation field shown only when the chosen value matches. */
  explainWhen?: { value: string; label: string };
};

export type SingleQuestion = Base & {
  type: "single";
  options: Option[];
  /** Render as a dropdown instead of radio buttons. */
  dropdown?: boolean;
};

export type MultiQuestion = Base & { type: "multi"; options: Option[] };

export type TextQuestion = Base & {
  type: "text" | "longtext";
  placeholder?: string;
};

export type NumberQuestion = Base & { type: "number"; unit?: string };

export type RepeaterQuestion = Base & {
  type: "repeater";
  fields: SubField[];
  addLabel: string;
  /** Offer to pre-fill rows from the selections of another multi question. */
  seedFrom?: string;
};

export type FieldsQuestion = Base & { type: "fields"; fields: SubField[] };

export type Question =
  | SingleQuestion
  | MultiQuestion
  | TextQuestion
  | NumberQuestion
  | RepeaterQuestion
  | FieldsQuestion;

export type Section = {
  id: string;
  code?: string;
  title: string;
  purpose?: string;
  note?: string;
  questions: Question[];
};

/** "Other" option value — selecting it reveals a free-text field. */
export const OTHER = "other";

const opt = (label: string, value?: string): Option => ({
  label,
  value:
    value ??
    label
      .toLowerCase()
      .replace(/[–—]/g, "-")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, ""),
});

const other = opt("Other", OTHER);

const FREQUENCY_SHORT = [
  opt("Daily"),
  opt("Weekly"),
  opt("Monthly"),
  opt("Occasionally"),
  opt("Rarely"),
];

export const CAMPUS_OPTIONS: Option[] = [
  opt("Ring Road Campus", "ring_road"),
  opt("Kabootar Chowk Preschool", "kabootar_chowk"),
  opt("Both campuses", "both"),
];

export const SECTIONS: Section[] = [
  {
    id: "basic",
    title: "Basic Organization Information",
    purpose: "A little context about you and the campus you are describing.",
    questions: [
      {
        id: "q1",
        number: 1,
        type: "single",
        prompt: "Which campus are you answering questions about?",
        required: true,
        specials: [],
        options: CAMPUS_OPTIONS,
      },
      {
        id: "q2",
        number: 2,
        type: "single",
        prompt: "What is your current role?",
        required: true,
        specials: ["declined"],
        options: [
          opt("Principal"),
          opt("Vice Principal"),
          opt("Academic Coordinator"),
          opt("Teacher"),
          opt("Administrative Staff"),
          other,
        ],
      },
      {
        id: "q3",
        number: 3,
        type: "single",
        prompt: "How involved are you in the management of this campus?",
        required: true,
        specials: [],
        options: [
          opt("Directly involved in management", "direct"),
          opt("Somewhat involved", "somewhat"),
          opt("Mostly involved in teaching or daily operations", "operations"),
          opt("Not directly involved in management", "not_involved"),
        ],
      },
      {
        id: "q4",
        number: 4,
        type: "single",
        prompt: "Approximately how many employees work at this campus?",
        dropdown: true,
        options: [
          opt("1–10", "1-10"),
          opt("11–20", "11-20"),
          opt("21–30", "21-30"),
          opt("31–40", "31-40"),
          opt("41–50", "41-50"),
          opt("More than 50", "50+"),
        ],
      },
      {
        id: "q5",
        number: 5,
        type: "single",
        prompt: "How familiar are you with the overall management structure?",
        options: [
          opt("Very familiar", "very"),
          opt("Somewhat familiar", "somewhat"),
          opt("Slightly familiar", "slightly"),
          opt("Not familiar", "not"),
        ],
      },
    ],
  },
  {
    id: "f1",
    code: "F1",
    title: "Division of Work",
    purpose: "How work is divided among departments or groups.",
    questions: [
      {
        id: "q6",
        number: 6,
        type: "multi",
        prompt: "What departments or main working groups exist at this campus?",
        help: "Select all that apply.",
        options: [
          opt("Administration"),
          opt("Teaching Staff"),
          opt("Academic Coordination"),
          opt("Accounts and Fee Management", "accounts"),
          opt("Admissions"),
          opt("Examination and Assessment", "examination"),
          opt("Support Staff"),
          opt("Security"),
          other,
        ],
      },
      {
        id: "q7",
        number: 7,
        type: "repeater",
        prompt: "Approximately how many employees work in each department?",
        help: "Add one row per department. Approximate numbers are fine.",
        addLabel: "Add department",
        seedFrom: "q6",
        fields: [
          { key: "department", label: "Department name", input: "text" },
          { key: "count", label: "Approx. employees", input: "number" },
        ],
      },
      {
        id: "q8",
        number: 8,
        type: "repeater",
        prompt: "Who is responsible for managing each department or group?",
        help: "Give the person's role or title, not their name.",
        addLabel: "Add department",
        seedFrom: "q6",
        fields: [
          { key: "department", label: "Department", input: "text" },
          {
            key: "role",
            label: "Responsible person's role",
            input: "text",
            placeholder: "e.g. Vice Principal",
          },
        ],
      },
      {
        id: "q9",
        number: 9,
        type: "single",
        prompt: "Does each department have a separate supervisor or manager?",
        options: [opt("Yes"), opt("No"), opt("Some departments do", "some")],
        explain: { label: "Additional explanation (optional)" },
      },
    ],
  },
  {
    id: "f2",
    code: "F2",
    title: "Span of Control",
    purpose:
      "How many employees report directly to managers at different levels.",
    note: "Count only direct reporting relationships — people who report straight to that manager — not everyone working under them indirectly.",
    questions: [
      {
        id: "q10",
        number: 10,
        type: "number",
        prompt:
          "Approximately how many employees report directly to the campus principal or head?",
        unit: "employees",
      },
      {
        id: "q11",
        number: 11,
        type: "number",
        prompt:
          "Approximately how many employees report directly to the academic coordinator or teacher supervisor?",
        unit: "employees",
      },
      {
        id: "q12",
        number: 12,
        type: "single",
        prompt:
          "How many management levels exist between ordinary employees and the person responsible for the campus?",
        options: [
          opt("One level", "1"),
          opt("Two levels", "2"),
          opt("Three levels", "3"),
          opt("More than three levels", "4+"),
        ],
        explain: { label: "Additional explanation (optional)" },
      },
    ],
  },
  {
    id: "f3",
    code: "F3",
    title: "Decision-Making",
    purpose:
      "Which decisions can be made independently and which require approval.",
    questions: [
      {
        id: "q13",
        number: 13,
        type: "longtext",
        prompt:
          "Give one example of a decision that a campus manager or department head can make without asking higher management for approval.",
        placeholder: "Describe a real example…",
      },
      {
        id: "q14",
        number: 14,
        type: "longtext",
        prompt:
          "Give one example of a decision that requires approval from higher management.",
        placeholder: "Describe a real example…",
      },
      {
        id: "q15",
        number: 15,
        type: "fields",
        prompt: "Who usually makes the final decision regarding the following?",
        help: "Enter the responsible person's role for each item. Leave blank if unsure.",
        fields: [
          { key: "hiring", label: "Hiring new employees", input: "text" },
          { key: "salary", label: "Salary changes", input: "text" },
          { key: "expenses", label: "Major expenses", input: "text" },
          { key: "academic", label: "Important academic decisions", input: "text" },
        ],
      },
    ],
  },
  {
    id: "f4",
    code: "F4",
    title: "Performance Measurement",
    purpose:
      "How the organization measures employee and organizational performance.",
    questions: [
      {
        id: "q16",
        number: 16,
        type: "multi",
        prompt:
          "What things does the school regularly monitor to evaluate performance?",
        help: "Select all that apply.",
        options: [
          opt("Student attendance"),
          opt("Teacher attendance"),
          opt("Fee collection"),
          opt("New admissions"),
          opt("Examination results"),
          opt("Teacher performance"),
          opt("Parent complaints"),
          opt("Student academic progress"),
          other,
        ],
      },
      {
        id: "q17",
        number: 17,
        type: "single",
        prompt: "How frequently are these performance indicators reviewed?",
        options: [
          opt("Daily"),
          opt("Weekly"),
          opt("Monthly"),
          opt("Every term", "term"),
          opt("Annually"),
          opt("Only when a problem occurs", "on_problem"),
          other,
        ],
      },
      {
        id: "q18",
        number: 18,
        type: "longtext",
        prompt:
          "Who checks performance, and what happens when performance is unsatisfactory?",
        hints: [
          "Who monitors performance?",
          "What happens when a problem is identified?",
          "Is feedback provided?",
          "Are corrective actions taken?",
        ],
      },
    ],
  },
  {
    id: "f5",
    code: "F5",
    title: "Recruitment",
    purpose: "The actual recruitment process used by the organization.",
    questions: [
      {
        id: "q19",
        number: 19,
        type: "longtext",
        prompt:
          "Think about the most recent employee hired at this campus. Describe the recruitment process in the order it happened.",
        help: "Please describe what actually happened, not the ideal or official process.",
        placeholder: "First… then… finally…",
      },
      {
        id: "q20",
        number: 20,
        type: "single",
        prompt: "How was the candidate initially found?",
        options: [
          opt("Online job advertisement", "online_ad"),
          opt("Personal reference"),
          opt("Existing employee recommendation", "employee_referral"),
          opt("Walk-in applicant", "walk_in"),
          opt("Direct contact"),
          other,
        ],
      },
      {
        id: "q21",
        number: 21,
        type: "multi",
        prompt:
          "Which of the following steps were involved in the recruitment process?",
        help: "Select all that apply.",
        options: [
          opt("CV screening"),
          opt("Initial interview"),
          opt("Teaching demonstration"),
          opt("Subject knowledge test"),
          opt("Reference checking"),
          opt("Final interview"),
          opt("Management approval"),
          other,
        ],
      },
      {
        id: "q22",
        number: 22,
        type: "longtext",
        prompt: "Who made the final hiring decision?",
        help: "A role or title is enough, e.g. “Principal after approval from the regional office”.",
      },
    ],
  },
  {
    id: "f6",
    code: "F6",
    title: "Employee Management",
    purpose:
      "How the organization manages, evaluates, motivates and retains employees.",
    questions: [
      {
        id: "q23",
        number: 23,
        type: "multi",
        prompt: "How does the school evaluate employee performance?",
        help: "Select all that apply.",
        options: [
          opt("Classroom observation"),
          opt("Student examination results", "exam_results"),
          opt("Employee attendance"),
          opt("Parent feedback"),
          opt("Principal evaluation"),
          opt("Academic coordinator evaluation", "coordinator_evaluation"),
          opt("Formal performance reviews"),
          other,
        ],
      },
      {
        id: "q24",
        number: 24,
        type: "longtext",
        prompt:
          "What specific practices does the school use to motivate employees, retain good employees, improve performance, or manage employee pay?",
        help: "Actual examples are most useful (e.g. “annual increment linked to observation scores”).",
      },
    ],
  },
  {
    id: "partD",
    code: "Part D",
    title: "Identifying an Organizational Problem",
    purpose:
      "One real operational problem and its possible causes. Factual examples are more useful than general opinions.",
    questions: [
      {
        id: "q25",
        number: 25,
        type: "longtext",
        prompt:
          "What is one significant operational or management problem that currently affects this campus?",
      },
      {
        id: "q26",
        number: 26,
        type: "single",
        prompt: "Which category best describes this problem?",
        dropdown: true,
        options: [
          opt("Communication"),
          opt("Staff management"),
          opt("Workload distribution"),
          opt("Decision-making", "decision_making"),
          opt("Recruitment"),
          opt("Employee performance"),
          opt("Student management"),
          opt("Parent communication"),
          opt("Financial or resource limitations", "financial"),
          other,
        ],
      },
      {
        id: "q27",
        number: 27,
        type: "fields",
        prompt:
          "Can you describe a recent incident in which this problem affected the school's operations?",
        fields: [
          { key: "what", label: "What happened?", input: "longtext" },
          { key: "affected", label: "Who or what was affected?", input: "longtext" },
          { key: "result", label: "What was the result?", input: "longtext" },
        ],
      },
      {
        id: "q28",
        number: 28,
        type: "single",
        prompt: "How frequently does this problem occur?",
        options: FREQUENCY_SHORT,
      },
      {
        id: "q29",
        number: 29,
        type: "fields",
        prompt: "What do you believe is the main reason behind this problem?",
        fields: [
          { key: "main", label: "Main cause", input: "longtext" },
          {
            key: "alternative",
            label: "Another possible explanation (if any)",
            input: "longtext",
          },
        ],
      },
    ],
  },
  {
    id: "partE",
    code: "Part E",
    title: "Recommendations",
    purpose: "Information that can help develop a practical recommendation.",
    questions: [
      {
        id: "q30",
        number: 30,
        type: "single",
        prompt: "Has the school previously tried to solve this problem?",
        options: [opt("Yes"), opt("No")],
        explainWhen: {
          value: "yes",
          label: "What was attempted, and what happened?",
        },
      },
      {
        id: "q31",
        number: 31,
        type: "longtext",
        prompt:
          "What change or improvement do you think would help solve this problem?",
      },
      {
        id: "q32",
        number: 32,
        type: "multi",
        prompt: "What resources would be required to implement this improvement?",
        help: "Select all that apply.",
        options: [
          opt("Money"),
          opt("Additional employees"),
          opt("Staff training"),
          opt("Software or technology", "technology"),
          opt("Management time"),
          opt("Better communication"),
          other,
        ],
      },
      {
        id: "q33",
        number: 33,
        type: "longtext",
        prompt:
          "What difficulties or disadvantages might arise from implementing this change?",
      },
      {
        id: "q34",
        number: 34,
        type: "longtext",
        prompt:
          "How could the school measure whether the proposed improvement is successful?",
        help: "Measurable indicators are best, e.g. “parent complaints fall from ~10 to under 4 per month”.",
      },
    ],
  },
  {
    id: "partF",
    code: "Part F",
    title: "Additional Findings",
    questions: [
      {
        id: "q35",
        number: 35,
        type: "longtext",
        prompt:
          "Is there any information about the school's management that is difficult to find or is not formally recorded?",
      },
      {
        id: "q36",
        number: 36,
        type: "longtext",
        prompt:
          "Is there any management practice at this school that surprised you because it works differently from what you would normally expect?",
      },
    ],
  },
  {
    id: "additional",
    title: "Additional Information",
    questions: [
      {
        id: "q37",
        number: 37,
        type: "longtext",
        prompt:
          "Is there anything else about the management or daily operations of this campus that you think is important?",
      },
      {
        id: "q38",
        number: 38,
        type: "single",
        prompt:
          "Would you be willing to answer a short follow-up question if clarification is needed?",
        specials: [],
        options: [opt("Yes"), opt("No")],
        explainWhen: {
          value: "yes",
          label:
            "How may we contact you? (optional — phone or email; only the researcher will see this)",
        },
      },
    ],
  },
];

export const QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions);

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export function specialsFor(q: Question): Special[] {
  return q.specials ?? ["dont_know", "declined"];
}

// ---------------------------------------------------------------------------
// Answer model
// ---------------------------------------------------------------------------

export type RepeaterRow = Record<string, string>;

export type Answer = {
  special?: Special;
  /**
   * single → string, multi → string[], text/longtext → string,
   * number → string (kept as typed; validated as a non-negative integer),
   * repeater → RepeaterRow[], fields → Record<string,string>
   */
  value?: string | string[] | RepeaterRow[] | Record<string, string>;
  /** Free text for the "Other" option. */
  other?: string;
  /** Optional / conditional explanation. */
  explain?: string;
};

export type Answers = Record<string, Answer>;

export function isAnswered(q: Question, a: Answer | undefined): boolean {
  if (!a) return false;
  if (a.special) return true;
  const v = a.value;
  switch (q.type) {
    case "single":
    case "text":
    case "longtext":
    case "number":
      return typeof v === "string" && v.trim() !== "";
    case "multi":
      return Array.isArray(v) && v.length > 0;
    case "repeater":
      return (
        Array.isArray(v) &&
        (v as RepeaterRow[]).some((r) => Object.values(r).some((x) => x?.trim()))
      );
    case "fields":
      return (
        !!v &&
        typeof v === "object" &&
        Object.values(v as Record<string, string>).some((x) => x?.trim())
      );
  }
}

/** Human-readable label for an option value. */
export function optionLabel(q: Question, value: string): string {
  if (q.type !== "single" && q.type !== "multi") return value;
  return q.options.find((o) => o.value === value)?.label ?? value;
}

/** Flatten an answer into a single human-readable string (review + CSV). */
export function formatAnswer(q: Question, a: Answer | undefined): string {
  if (!a) return "";
  if (a.special) return SPECIAL_LABELS[a.special];
  const parts: string[] = [];
  const v = a.value;
  switch (q.type) {
    case "single":
      if (typeof v === "string" && v) {
        parts.push(
          v === OTHER && a.other ? `Other: ${a.other}` : optionLabel(q, v),
        );
      }
      break;
    case "multi":
      if (Array.isArray(v)) {
        parts.push(
          (v as string[])
            .map((x) => (x === OTHER && a.other ? `Other: ${a.other}` : optionLabel(q, x)))
            .join("; "),
        );
      }
      break;
    case "text":
    case "longtext":
      if (typeof v === "string") parts.push(v.trim());
      break;
    case "number":
      if (typeof v === "string" && v) parts.push(q.unit ? `${v} ${q.unit}` : v);
      break;
    case "repeater":
      if (Array.isArray(v)) {
        parts.push(
          (v as RepeaterRow[])
            .filter((r) => Object.values(r).some((x) => x?.trim()))
            .map((r) => q.fields.map((f) => r[f.key]?.trim() || "—").join(": "))
            .join("; "),
        );
      }
      break;
    case "fields":
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const rec = v as Record<string, string>;
        parts.push(
          q.fields
            .filter((f) => rec[f.key]?.trim())
            .map((f) => `${f.label} ${rec[f.key].trim()}`)
            .join(" | "),
        );
      }
      break;
  }
  if (a.explain?.trim()) parts.push(`(${a.explain.trim()})`);
  return parts.filter(Boolean).join(" ");
}

export function campusLabel(value: string): string {
  return CAMPUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "follow_up", label: "Needs follow-up" },
  { value: "excluded", label: "Excluded" },
] as const;

export type SubmissionStatus = (typeof STATUS_OPTIONS)[number]["value"];

/**
 * Single source of truth for the questionnaire.
 *
 * The public form, the review screen, server-side validation, the admin detail
 * view and the CSV export are all driven by this file. Question ids (q1…q38)
 * and option values are stable identifiers stored in the database — do not
 * renumber or rename them. Labels (shown to people) are in Roman Urdu and can
 * be edited freely.
 */

export const SCHEMA_VERSION = 1;

export type Special = "dont_know" | "declined";

export const SPECIAL_LABELS: Record<Special, string> = {
  dont_know: "Maloom nahi",
  declined: "Jawab dene se inkaar",
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
export const OTHER_LABEL = "Deegar";

/** Option with an explicit, stable database value. */
const opt = (label: string, value: string): Option => ({ label, value });

const other = opt(OTHER_LABEL, OTHER);
const YES = opt("Haan", "yes");
const NO = opt("Nahi", "no");
const OPTIONAL_EXPLAIN = { label: "Mazeed wazahat (ikhtiyari)" };

export const CAMPUS_OPTIONS: Option[] = [
  opt("Ring Road Campus", "ring_road"),
  opt("Kabootar Chowk Preschool", "kabootar_chowk"),
  opt("Dono campus", "both"),
];

export const SECTIONS: Section[] = [
  {
    id: "basic",
    title: "Idare ki Bunyadi Maloomat",
    purpose: "Aap ke baare mein aur us campus ke baare mein thori si maloomat jis ka aap zikr kar rahe hain.",
    questions: [
      {
        id: "q1",
        number: 1,
        type: "single",
        prompt: "Aap kis campus ke baare mein jawab de rahe hain?",
        required: true,
        specials: [],
        options: CAMPUS_OPTIONS,
      },
      {
        id: "q2",
        number: 2,
        type: "single",
        prompt: "Aap ka maujooda ohda (role) kya hai?",
        required: true,
        specials: ["declined"],
        options: [
          opt("Principal", "principal"),
          opt("Vice Principal", "vice_principal"),
          opt("Academic Coordinator", "academic_coordinator"),
          opt("Teacher (Ustad / Ustani)", "teacher"),
          opt("Administrative Staff (Daftari amla)", "administrative_staff"),
          other,
        ],
      },
      {
        id: "q3",
        number: 3,
        type: "single",
        prompt: "Aap is campus ki management mein kis had tak shamil hain?",
        required: true,
        specials: [],
        options: [
          opt("Management mein seedha shamil hoon", "direct"),
          opt("Kuch had tak shamil hoon", "somewhat"),
          opt("Zyada tar parhane ya rozmarra ke kaam mein shamil hoon", "operations"),
          opt("Management mein seedha shamil nahi hoon", "not_involved"),
        ],
      },
      {
        id: "q4",
        number: 4,
        type: "single",
        prompt: "Is campus mein taqreeban kitne mulazimeen kaam karte hain?",
        dropdown: true,
        options: [
          opt("1–10", "1-10"),
          opt("11–20", "11-20"),
          opt("21–30", "21-30"),
          opt("31–40", "31-40"),
          opt("41–50", "41-50"),
          opt("50 se zyada", "50+"),
        ],
      },
      {
        id: "q5",
        number: 5,
        type: "single",
        prompt: "Aap management ke majmooi dhaanche (structure) se kitna waqif hain?",
        options: [
          opt("Bohat achi tarah waqif hoon", "very"),
          opt("Kuch had tak waqif hoon", "somewhat"),
          opt("Thora sa waqif hoon", "slightly"),
          opt("Waqif nahi hoon", "not"),
        ],
      },
    ],
  },
  {
    id: "f1",
    code: "F1",
    title: "Kaam ki Taqseem",
    purpose: "Kaam mukhtalif shobon (departments) ya groups mein kaise taqseem kiya jata hai.",
    questions: [
      {
        id: "q6",
        number: 6,
        type: "multi",
        prompt: "Is campus mein kaun kaun se shobe (departments) ya kaam karne wale bare groups maujood hain?",
        help: "Jitne bhi lagu hon, sab muntakhib karein.",
        options: [
          opt("Administration (Intezamia)", "administration"),
          opt("Teaching Staff (Tadreesi amla)", "teaching_staff"),
          opt("Academic Coordination", "academic_coordination"),
          opt("Accounts aur Fee ka intezam", "accounts"),
          opt("Admissions (Dakhlay)", "admissions"),
          opt("Imtihanaat aur Assessment", "examination"),
          opt("Support Staff (Maawin amla)", "support_staff"),
          opt("Security (Hifazat)", "security"),
          other,
        ],
      },
      {
        id: "q7",
        number: 7,
        type: "repeater",
        prompt: "Har shobe mein taqreeban kitne mulazimeen kaam karte hain?",
        help: "Har shobe ke liye ek line add karein. Andaazan tadaad kaafi hai.",
        addLabel: "Shoba add karein",
        seedFrom: "q6",
        fields: [
          { key: "department", label: "Shobe ka naam", input: "text" },
          { key: "count", label: "Andaazan mulazimeen", input: "number" },
        ],
      },
      {
        id: "q8",
        number: 8,
        type: "repeater",
        prompt: "Har shobe ya group ka intezam kis ke zimme hai?",
        help: "Shakhs ka naam nahi, sirf un ka ohda likhein.",
        addLabel: "Shoba add karein",
        seedFrom: "q6",
        fields: [
          { key: "department", label: "Shoba", input: "text" },
          {
            key: "role",
            label: "Zimmedar shakhs ka ohda",
            input: "text",
            placeholder: "maslan Vice Principal",
          },
        ],
      },
      {
        id: "q9",
        number: 9,
        type: "single",
        prompt: "Kya har shobe ka alag supervisor ya manager hai?",
        options: [YES, NO, opt("Kuch shobon ka hai", "some")],
        explain: OPTIONAL_EXPLAIN,
      },
    ],
  },
  {
    id: "f2",
    code: "F2",
    title: "Nigrani ka Daira (Span of Control)",
    purpose: "Mukhtalif darjon ke managers ko kitne mulazimeen seedha report karte hain.",
    note: "Sirf seedhi reporting ginein — yani woh log jo seedha usi manager ko report karte hain — un ke neeche kaam karne wale tamam logon ko nahi.",
    questions: [
      {
        id: "q10",
        number: 10,
        type: "number",
        prompt: "Campus ke principal ya head ko taqreeban kitne mulazimeen seedha report karte hain?",
        unit: "mulazimeen",
      },
      {
        id: "q11",
        number: 11,
        type: "number",
        prompt:
          "Academic coordinator ya teacher supervisor ko taqreeban kitne mulazimeen seedha report karte hain?",
        unit: "mulazimeen",
      },
      {
        id: "q12",
        number: 12,
        type: "single",
        prompt:
          "Aam mulazimeen aur campus ke zimmedar shakhs ke darmiyan management ke kitne darje (levels) hain?",
        options: [
          opt("Ek darja", "1"),
          opt("Do darje", "2"),
          opt("Teen darje", "3"),
          opt("Teen se zyada darje", "4+"),
        ],
        explain: OPTIONAL_EXPLAIN,
      },
    ],
  },
  {
    id: "f3",
    code: "F3",
    title: "Faisla Sazi",
    purpose: "Kaun se faisle khud kiye ja sakte hain aur kin ke liye manzoori leni parti hai.",
    questions: [
      {
        id: "q13",
        number: 13,
        type: "longtext",
        prompt:
          "Kisi aise faisle ki ek misaal dein jo campus manager ya shobe ka sarbarah upar wali management se poochay baghair kar sakta hai.",
        placeholder: "Koi haqeeqi misaal likhein…",
      },
      {
        id: "q14",
        number: 14,
        type: "longtext",
        prompt: "Kisi aise faisle ki ek misaal dein jis ke liye upar wali management ki manzoori zaroori hoti hai.",
        placeholder: "Koi haqeeqi misaal likhein…",
      },
      {
        id: "q15",
        number: 15,
        type: "fields",
        prompt: "Neeche diye gaye maamlaat mein aam tor par aakhri faisla kaun karta hai?",
        help: "Har maamle ke liye zimmedar shakhs ka ohda likhein. Agar yaqeen na ho to khali chhor dein.",
        fields: [
          { key: "hiring", label: "Naye mulazimeen ki bharti", input: "text" },
          { key: "salary", label: "Tankhwah mein tabdeeli", input: "text" },
          { key: "expenses", label: "Bare akhrajaat", input: "text" },
          { key: "academic", label: "Ahem taleemi (academic) faisle", input: "text" },
        ],
      },
    ],
  },
  {
    id: "f4",
    code: "F4",
    title: "Karkardagi ki Jaanch",
    purpose: "Idara mulazimeen aur apni majmooi karkardagi ko kaise jaanchta hai.",
    questions: [
      {
        id: "q16",
        number: 16,
        type: "multi",
        prompt: "School karkardagi jaanchne ke liye baqaidagi se kin cheezon ki nigrani karta hai?",
        help: "Jitne bhi lagu hon, sab muntakhib karein.",
        options: [
          opt("Talaba ki haazri", "student_attendance"),
          opt("Asatiza ki haazri", "teacher_attendance"),
          opt("Fee ki wasooli", "fee_collection"),
          opt("Naye dakhlay", "new_admissions"),
          opt("Imtihani nataij", "examination_results"),
          opt("Asatiza ki karkardagi", "teacher_performance"),
          opt("Walidain ki shikayaat", "parent_complaints"),
          opt("Talaba ki taleemi taraqqi", "student_academic_progress"),
          other,
        ],
      },
      {
        id: "q17",
        number: 17,
        type: "single",
        prompt: "In karkardagi ke ishariyon (indicators) ka jaiza kitni baar liya jata hai?",
        options: [
          opt("Rozana", "daily"),
          opt("Haftawar", "weekly"),
          opt("Mahana", "monthly"),
          opt("Har term mein", "term"),
          opt("Saalana", "annually"),
          opt("Sirf jab koi masla ho", "on_problem"),
          other,
        ],
      },
      {
        id: "q18",
        number: 18,
        type: "longtext",
        prompt: "Karkardagi kaun check karta hai, aur jab karkardagi tasalli bakhsh na ho to kya hota hai?",
        hints: [
          "Karkardagi ki nigrani kaun karta hai?",
          "Masla saamne aane par kya hota hai?",
          "Kya feedback di jati hai?",
          "Kya islahi iqdamaat kiye jate hain?",
        ],
      },
    ],
  },
  {
    id: "f5",
    code: "F5",
    title: "Bharti (Recruitment)",
    purpose: "Idare mein bharti ka asal tareeqa-e-kaar.",
    questions: [
      {
        id: "q19",
        number: 19,
        type: "longtext",
        prompt:
          "Is campus mein sab se haal hi mein bharti hone wale mulazim ke baare mein sochein. Bharti ka amal usi tarteeb se bayan karein jis mein woh hua.",
        help: "Barah-e-meharbani woh batayein jo asal mein hua, na ke mithali ya sarkari tareeqa.",
        placeholder: "Pehle… phir… aakhir mein…",
      },
      {
        id: "q20",
        number: 20,
        type: "single",
        prompt: "Umeedwar shuru mein kaise mila?",
        options: [
          opt("Online naukri ka ishtehar", "online_ad"),
          opt("Zaati hawala (reference)", "personal_reference"),
          opt("Maujooda mulazim ki sifarish", "employee_referral"),
          opt("Khud aa kar darkhwast di (walk-in)", "walk_in"),
          opt("Seedha raabta", "direct_contact"),
          other,
        ],
      },
      {
        id: "q21",
        number: 21,
        type: "multi",
        prompt: "Bharti ke amal mein in mein se kaun se marahil shamil the?",
        help: "Jitne bhi lagu hon, sab muntakhib karein.",
        options: [
          opt("CV ki jaanch", "cv_screening"),
          opt("Ibtidai interview", "initial_interview"),
          opt("Teaching demonstration (parha kar dikhana)", "teaching_demonstration"),
          opt("Mazmoon ki maloomat ka test", "subject_knowledge_test"),
          opt("References ki tasdeeq", "reference_checking"),
          opt("Aakhri interview", "final_interview"),
          opt("Management ki manzoori", "management_approval"),
          other,
        ],
      },
      {
        id: "q22",
        number: 22,
        type: "longtext",
        prompt: "Bharti ka aakhri faisla kis ne kiya?",
        help: "Ohda batana kaafi hai, maslan “Regional office ki manzoori ke baad Principal”.",
      },
    ],
  },
  {
    id: "f6",
    code: "F6",
    title: "Mulazimeen ka Intezam",
    purpose:
      "Idara mulazimeen ka intezam, un ki karkardagi ka jaiza, hosla afzai aur unhein barqarar kaise rakhta hai.",
    questions: [
      {
        id: "q23",
        number: 23,
        type: "multi",
        prompt: "School mulazimeen ki karkardagi ka jaiza kaise leta hai?",
        help: "Jitne bhi lagu hon, sab muntakhib karein.",
        options: [
          opt("Classroom ka mushahida (observation)", "classroom_observation"),
          opt("Talaba ke imtihani nataij", "exam_results"),
          opt("Mulazimeen ki haazri", "employee_attendance"),
          opt("Walidain ki raaye", "parent_feedback"),
          opt("Principal ka jaiza", "principal_evaluation"),
          opt("Academic coordinator ka jaiza", "coordinator_evaluation"),
          opt("Baqaida performance reviews", "formal_performance_reviews"),
          other,
        ],
      },
      {
        id: "q24",
        number: 24,
        type: "longtext",
        prompt:
          "School mulazimeen ki hosla afzai, ache mulazimeen ko barqarar rakhne, karkardagi behtar banane ya tankhwah ke intezam ke liye kaun se khaas tareeqay istemal karta hai?",
        help: "Haqeeqi misaalein sab se zyada mufeed hain (maslan “observation scores se munsalik saalana increment”).",
      },
    ],
  },
  {
    id: "partD",
    code: "Part D",
    title: "Idare ke Masle ki Nishandahi",
    purpose:
      "Ek haqeeqi amli masla aur us ki mumkina wujoohat. Aam raaye ke bajaye haqeeqi misaalein zyada mufeed hain.",
    questions: [
      {
        id: "q25",
        number: 25,
        type: "longtext",
        prompt: "Koi ek ahem amli ya intezami masla kya hai jo is waqt is campus ko mutasir kar raha hai?",
      },
      {
        id: "q26",
        number: 26,
        type: "single",
        prompt: "Kaun si category is masle ko sab se behtar bayan karti hai?",
        dropdown: true,
        options: [
          opt("Raabta (Communication)", "communication"),
          opt("Staff ka intezam", "staff_management"),
          opt("Kaam ki taqseem (Workload)", "workload_distribution"),
          opt("Faisla sazi", "decision_making"),
          opt("Bharti", "recruitment"),
          opt("Mulazimeen ki karkardagi", "employee_performance"),
          opt("Talaba ka intezam", "student_management"),
          opt("Walidain se raabta", "parent_communication"),
          opt("Maali ya wasail ki kami", "financial"),
          other,
        ],
      },
      {
        id: "q27",
        number: 27,
        type: "fields",
        prompt: "Kya aap haal hi ka koi waqia bayan kar sakte hain jis mein is masle ne school ke kaam ko mutasir kiya?",
        fields: [
          { key: "what", label: "Kya hua?", input: "longtext" },
          { key: "affected", label: "Kaun ya kya mutasir hua?", input: "longtext" },
          { key: "result", label: "Nateeja kya nikla?", input: "longtext" },
        ],
      },
      {
        id: "q28",
        number: 28,
        type: "single",
        prompt: "Yeh masla kitni baar paish aata hai?",
        options: [
          opt("Rozana", "daily"),
          opt("Haftawar", "weekly"),
          opt("Mahana", "monthly"),
          opt("Kabhi kabhar", "occasionally"),
          opt("Shaz-o-naadir", "rarely"),
        ],
      },
      {
        id: "q29",
        number: 29,
        type: "fields",
        prompt: "Aap ke khayal mein is masle ki asal wajah kya hai?",
        fields: [
          { key: "main", label: "Asal wajah", input: "longtext" },
          { key: "alternative", label: "Koi aur mumkina wajah (agar ho)", input: "longtext" },
        ],
      },
    ],
  },
  {
    id: "partE",
    code: "Part E",
    title: "Tajaweez",
    purpose: "Aisi maloomat jo ek qabil-e-amal tajweez tayyar karne mein madad de.",
    questions: [
      {
        id: "q30",
        number: 30,
        type: "single",
        prompt: "Kya school ne pehle is masle ko hal karne ki koshish ki hai?",
        options: [YES, NO],
        explainWhen: {
          value: "yes",
          label: "Kya koshish ki gayi, aur us ka kya nateeja nikla?",
        },
      },
      {
        id: "q31",
        number: 31,
        type: "longtext",
        prompt: "Aap ke khayal mein kaun si tabdeeli ya behtari is masle ko hal karne mein madad degi?",
      },
      {
        id: "q32",
        number: 32,
        type: "multi",
        prompt: "Is behtari par amal ke liye kin wasail ki zaroorat hogi?",
        help: "Jitne bhi lagu hon, sab muntakhib karein.",
        options: [
          opt("Paisa", "money"),
          opt("Izafi mulazimeen", "additional_employees"),
          opt("Staff ki training", "staff_training"),
          opt("Software ya technology", "technology"),
          opt("Management ka waqt", "management_time"),
          opt("Behtar raabta", "better_communication"),
          other,
        ],
      },
      {
        id: "q33",
        number: 33,
        type: "longtext",
        prompt: "Is tabdeeli par amal karne se kya mushkilat ya nuqsanaat paida ho sakte hain?",
      },
      {
        id: "q34",
        number: 34,
        type: "longtext",
        prompt: "School kaise maloom kar sakta hai ke tajweez kardah behtari kamyab rahi?",
        help: "Napne ke qabil isharay sab se behtar hain, maslan “walidain ki mahana shikayaat 10 se kam ho kar 4 se neeche aa jayein”.",
      },
    ],
  },
  {
    id: "partF",
    code: "Part F",
    title: "Izafi Mushahidaat",
    questions: [
      {
        id: "q35",
        number: 35,
        type: "longtext",
        prompt:
          "Kya school ki management ke baare mein koi aisi maloomat hai jo dhoondna mushkil ho ya baqaida record na ki jati ho?",
      },
      {
        id: "q36",
        number: 36,
        type: "longtext",
        prompt:
          "Kya is school mein management ka koi aisa tareeqa hai jis ne aap ko hairan kiya, kyunke woh aap ki tawaqqo se mukhtalif tareeqay se kaam karta hai?",
      },
    ],
  },
  {
    id: "additional",
    title: "Izafi Maloomat",
    questions: [
      {
        id: "q37",
        number: 37,
        type: "longtext",
        prompt:
          "Kya is campus ki management ya rozmarra ke kaam ke baare mein koi aur baat hai jo aap ke khayal mein ahem hai?",
      },
      {
        id: "q38",
        number: 38,
        type: "single",
        prompt: "Agar wazahat ki zaroorat ho to kya aap ek mukhtasar follow-up sawal ka jawab dene ke liye tayyar honge?",
        specials: [],
        options: [YES, NO],
        explainWhen: {
          value: "yes",
          label: "Hum aap se kaise raabta kar sakte hain? (ikhtiyari — phone ya email; yeh sirf researcher dekhega)",
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

const otherText = (a: Answer) => `${OTHER_LABEL}: ${a.other ?? ""}`;

/** Flatten an answer into a single human-readable string (review + CSV). */
export function formatAnswer(q: Question, a: Answer | undefined): string {
  if (!a) return "";
  if (a.special) return SPECIAL_LABELS[a.special];
  const parts: string[] = [];
  const v = a.value;
  switch (q.type) {
    case "single":
      if (typeof v === "string" && v) {
        parts.push(v === OTHER && a.other ? otherText(a) : optionLabel(q, v));
      }
      break;
    case "multi":
      if (Array.isArray(v)) {
        parts.push(
          (v as string[])
            .map((x) => (x === OTHER && a.other ? otherText(a) : optionLabel(q, x)))
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

export const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export function D(a) { return new Date(a[0], a[1] - 1, a[2]); }

export const REVIEW = { t: "مراجعة الكتاب", per: "1–2" };

export function U(unit, ut, n, lt) { return { unit: unit, ut: ut, n: n, lt: lt, per: "1–4" }; }

export function P(per, ch) { return { per: per, ch: ch }; }

export const RV = "مراجعة الفهم";

export const PLAN = [
  { id: "t1-16", term: 1, wk: 16, d: [2026, 12, 26], book: REVIEW, plat: P("3–6", [[9, "العامل المنطقي"], [10, "العملية التكرارية"], [11, RV], [12, "الدالة (1)"]]) },
  { id: "t1-17", term: 1, wk: 17, d: [2027, 1, 2], book: REVIEW, plat: P("3–6", [[13, "الدالة (2)"], [14, RV], [15, "المصفوفة (1)"], [16, "المصفوفة (2)"]]),
    notes: [{ k: "hol", t: "6 و7 و8 يناير: لا تعقد امتحانات (أعياد الإخوة المسيحيين)" }, { k: "hol", t: "عيد الميلاد المجيد يوم الخميس 7 يناير" }] },
  { id: "t1-18", term: 1, wk: 18, d: [2027, 1, 9], blank: true },

  { id: "t2-1", term: 2, wk: 1, d: [2027, 2, 6], weekly: true, book: U(5, "جمع البيانات وتنقيتها", "1-5", "طرق جمع البيانات"), plat: P("5–6", [[17, RV], [18, "bool"]]),
    notes: [{ k: "info", t: "بداية الفصل الدراسي الثاني" }] },
  { id: "t2-2", term: 2, wk: 2, d: [2027, 2, 13], weekly: true, book: U(5, "جمع البيانات وتنقيتها", "2-5", "تنقية البيانات وتحويلها"), plat: P("5–6", [[19, "الدوال (3)"], [20, RV]]) },
  { id: "t2-3", term: 2, wk: 3, d: [2027, 2, 20], weekly: true, book: U(5, "جمع البيانات وتنقيتها", "3-5", "البيانات المفتوحة وواجهات برمجة التطبيقات"), plat: P("5–6", [[21, RV], [22, RV], [23, "جملة for والمصفوفة"]]) },
  { id: "t2-4", term: 2, wk: 4, d: [2027, 2, 27], weekly: true, book: U(6, "التحليل والتواصل", "1-6", "الاستدلال الإحصائي"), plat: P("5–6", [[24, RV], [25, RV], [26, "Switch statement (1)"]]) },
  { id: "t2-5", term: 2, wk: 5, d: [2027, 3, 6], weekly: true, book: U(6, "التحليل والتواصل", "2-6", "استخدام تحليل الانحدار وتقييمه"), plat: P("5–6", [[27, "Switch statement (2)"], [28, "Switch statement (3)"]]),
    notes: [{ k: "hol", t: "عيد الفطر المبارك بدءًا من 9/3/2027" }] },
  { id: "t2-6", term: 2, wk: 6, d: [2027, 3, 13], weekly: true, book: U(6, "التحليل والتواصل", "3-6", "تمثيل البيانات المرئي والتواصل"), plat: P("5–6", [[29, "While loop (1)"], [30, "While loop (2)"]]),
    notes: [{ k: "exam", t: "الاختبار الشهري الأول من 14 إلى 18 مارس" }] },
  { id: "t2-7", term: 2, wk: 7, d: [2027, 3, 20], weekly: true, book: U(7, "التعلم الآلي والذكاء الاصطناعي", "1-7", "أساسيات التعلم الآلي"), plat: P("5–6", [[31, "While loop (3)"], [32, "While loop (4)"]]) },
  { id: "t2-8", term: 2, wk: 8, d: [2027, 3, 27], weekly: true, book: U(7, "التعلم الآلي والذكاء الاصطناعي", "1-7", "تابع أساسيات التعلم الآلي"), plat: P("5–6", [[33, "While loop (5)"], [34, "While loop (6)"]]),
    notes: [{ k: "meet", t: "اللقاء التشاوري الأول لأولياء الأمور يوم 1 أبريل" }] },
  { id: "t2-9", term: 2, wk: 9, d: [2027, 4, 3], weekly: true, book: U(7, "التعلم الآلي والذكاء الاصطناعي", "2-7", "الشبكات العصبية والتعلم العميق"), plat: P("5–6", [[35, "Array operations (add, remove, access) (1)"], [36, "Array operations (add, remove, access) (2)"]]) },
  { id: "t2-10", term: 2, missing: true, d: [2027, 4, 10], label: "الأسابيع 10 إلى 12 (10 و17 و24 أبريل)" },
  { id: "t2-13", term: 2, wk: 13, d: [2027, 5, 1], book: REVIEW, plat: P("3–6", [[43, "Loop control (break / continue) (1)"], [44, "Loop control (break / continue) (2)"], [45, "Loop control (break / continue) (3)"]]),
    notes: [{ k: "hol", t: "عيد العمال 1 مايو، وشم النسيم الاثنين 3 مايو" }] },
  { id: "t2-14", term: 2, wk: 14, d: [2027, 5, 8], book: REVIEW, plat: P("3–6", [[46, "Review"], [47, "Review"]]),
    notes: [{ k: "meet", t: "اللقاء التشاوري الثاني لأولياء الأمور يوم 9 مايو" }] },
  { id: "t2-15", term: 2, wk: 15, d: [2027, 5, 15], book: REVIEW, plat: { per: "3–6", text: "مراجعة المنصة" } },
  { id: "t2-16", term: 2, wk: 16, d: [2027, 5, 22], blank: true }
];

export const KEYDATES = [
  { d: [2027, 1, 6], e: [2027, 1, 8], t: "لا تعقد امتحانات (أعياد الإخوة المسيحيين)", k: "hol" },
  { d: [2027, 2, 6], t: "بداية الفصل الدراسي الثاني", k: "info" },
  { d: [2027, 3, 9], t: "عيد الفطر المبارك", k: "hol" },
  { d: [2027, 3, 14], e: [2027, 3, 18], t: "الاختبار الشهري الأول", k: "exam" },
  { d: [2027, 4, 1], t: "اللقاء التشاوري الأول لأولياء الأمور", k: "meet" },
  { d: [2027, 5, 1], t: "عيد العمال", k: "hol" },
  { d: [2027, 5, 3], t: "شم النسيم", k: "hol" },
  { d: [2027, 5, 9], t: "اللقاء التشاوري الثاني لأولياء الأمور", k: "meet" }
];

export function fmt(a) { return a[2] + " " + AR_MONTHS[a[1] - 1]; }

export function bookHtml(b) {
  if (b.unit) {
    return (
      <>
        <p className="u">الوحدة {b.unit} · {b.ut}</p>
        <p>الدرس <bdi dir="ltr">{b.n}</bdi> · {b.lt}</p>
      </>
    );
  }
  return <p>{b.t}</p>;
}

export function platHtml(p) {
  if (p.text) return <p>{p.text}</p>;
  return (
    <ul className="chs">
      {p.ch.map((c, i) => (
        <li key={i}><b>فصل {c[0]}</b><bdi>{c[1]}</bdi></li>
      ))}
    </ul>
  );
}

export function weekTitle(w) {
  return w.term === 1 ? "الأسبوع " + w.wk + " من الفصل الأول" : "الأسبوع " + w.wk + " من الفصل الثاني";
}

export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function countdown(days) {
  if (days === 0) return "اليوم";
  if (days === 1) return "غدًا";
  if (days === 2) return "بعد يومين";
  if (days > 0) return "بعد " + days + " يوم";
  return "انتهى";
}

export function planFocus() {
  const now = new Date();
  const weeks = PLAN.filter(function(w) { return !w.missing; });
  let next = null, cur = null;
  weeks.forEach(function(w) {
    const s = D(w.d);
    const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
    if (now >= s && now < e) cur = w;
    else if (s > now && !next) next = w;
  });
  return { cur: cur, next: next, last: weeks[weeks.length - 1], now: now };
}
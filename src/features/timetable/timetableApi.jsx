export const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export const PERIODS = [
  { n: 1, t: "8:00 – 8:50", r: [480, 530] },
  { n: 2, t: "8:50 – 9:40", r: [530, 580] },
  { n: 3, t: "9:40 – 10:30", r: [580, 630] },
  { n: 4, t: "10:30 – 11:20", r: [630, 680] },
  { brk: true, t: "11:20 – 11:40" },
  { n: 5, t: "11:40 – 12:30", r: [700, 750] },
  { n: 6, t: "12:30 – 1:20", r: [750, 800] }
];

export const TYPES = {
  prog: { cls: "t-prog", label: "برمجة" },
  str: { cls: "t-str", label: "تشعيب" },
  fin: { cls: "t-fin", label: "ثقافة مالية" }
};

export const GRADE_NAMES = { 4: "الرابع", 5: "الخامس", 6: "السادس", 7: "السابع", 8: "الثامن", 9: "التاسع" };

export const STAGES = {
  pri: { label: "ابتدائي", grades: [4, 5, 6] },
  prep: { label: "إعدادي", grades: [7, 8, 9] }
};

export function ict(s, c, k) {
  const g = parseInt(c, 10);
  return { t: "ict", s: s, c: c, k: k, g: g, st: g <= 6 ? "pri" : "prep" };
}

export const PROG = { t: "prog", s: "برمجة", c: "10/A", g: 10 };
export const STR = { t: "str", s: "تشعيب", c: "11/A + 11/B", g: 11, plan: true };

export function fin(c) {
  return { t: "fin", s: "ثقافة مالية", c: c, g: 11 };
}

// DATA[day][period number]
export const DATA = [
  { 1: fin("11/B"), 3: PROG, 4: STR },
  { 1: fin("11/A"), 3: ict("حاسب آلي", "5/A", "عربي"), 5: STR, 6: ict("حاسب آلي", "9/A", "عربي") },
  { 1: ict("ICT", "9/B", "Languages"), 3: STR, 4: ict("ICT", "6/B") },
  { 1: STR, 2: ict("حاسب آلي", "6/A", "عربي"), 3: ict("حاسب آلي", "7/A", "عربي"), 4: ict("حاسب آلي", "5/B", "عربي"), 5: ict("ICT", "5/C", "Languages") },
  { 1: ict("حاسب آلي", "8/A", "عربي"), 2: STR, 3: PROG }
];

export function colorClass(it) {
  if (it.t === "ict") {
    return it.st === "pri" ? "t-pri" : "t-prep";
  }
  return TYPES[it.t].cls;
}

export function body(it) {
  return (
    <>
      <span className="s">{it.s}</span>
      <span className="c">{it.c}</span>
      {it.k && <span className="k">{it.k}</span>}
    </>
  );
}

export function planAttrs(it) {
  if (!it.plan) return {};
  return {
    'data-plan': '1',
    role: 'button',
    tabIndex: 0,
    title: 'افتح خطة التشعيب'
  };
}

export function getDates() {
  const now0 = new Date();
  return DAYS.map((_, i) => {
    return new Date(now0.getFullYear(), now0.getMonth(), now0.getDate() - now0.getDay() + i).getDate();
  });
}
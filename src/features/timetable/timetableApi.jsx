export const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export const PERIODS = [
  { n: 1, t: "8:00 – 8:50", r: [480, 530] },
  { n: 2, t: "8:50 – 9:40", r: [530, 580] },
  { n: 3, t: "9:40 – 10:30", r: [580, 630] },
  { n: 4, t: "10:30 – 11:20", r: [630, 680] },
  { brk: true, t: "11:20 – 11:40" },
  { n: 5, t: "11:40 – 12:30", r: [700, 750] }
];

export const TYPES = {
  prog: { cls: "t-prog", label: "برمجة" },
  str: { cls: "t-str", label: "تشعيب" },
  fin: { cls: "t-fin", label: "ثقافة مالية" }
};

export const GRADE_NAMES = { 10: "1 ثانوي", 11: "2 ثانوي" };

export const STAGES = {
  sec: { label: "ثانوي", grades: [10, 11] }
};

export const PROG = { t: "prog", s: "برمجة", c: "10/A", g: 10, st: "sec" };
export const STR = { t: "str", s: "تشعيب", c: "11/A + 11/B", g: 11, st: "sec" };

export function fin(c) {
  return { t: "fin", s: "ثقافة مالية", c: c, g: 11, st: "sec" };
}

// DATA[day][period number]
export const DATA = [
  { 1: STR, 3: PROG, 4: fin("11/B") },
  { 4: fin("11/A"), 5: STR },
  { 3: STR },
  { 1: STR },
  { 2: STR, 3: PROG }
];

export function colorClass(it) {
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



export function getDates() {
  const now0 = new Date();
  return DAYS.map((_, i) => {
    return new Date(now0.getFullYear(), now0.getMonth(), now0.getDate() - now0.getDay() + i).getDate();
  });
}

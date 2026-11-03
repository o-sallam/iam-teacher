export const STORAGE_KEY = 'iam-teacher:teaching-progress:v1'

export const SECOND_YEAR = 'programming-secondary-2'
export const FIRST_YEAR = 'programming-secondary-1'

export const CHAPTERS = {
  1: 'تكنولوجيا المعلومات والمجتمع',
  2: 'الأمن السيبراني',
  3: 'تطبيقات الويب',
  4: 'تصميم الويب والوسائط',
}

export const SECOND_YEAR_LESSONS = [
  ['1-1', 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', 4],
  ['1-2', 'كيف يعمل الذكاء الاصطناعي', 12],
  ['1-3', 'الذكاء الاصطناعي في الحياة اليومية والصناعة', 18],
  ['1-4', 'القضايا الأخلاقية للذكاء الاصطناعي', 24],
  ['2-1', 'تقنيات التشفير والمصادقة', 31],
  ['2-2', 'تصميم أمن الشبكات', 38],
  ['2-3', 'الاستجابة للحوادث وإدارة المخاطر', 44],
  ['3-1', 'البنية العامة لتطبيقات الويب', 50],
  ['3-2', 'طرق الاتصال في تطبيقات الويب', 56],
  ['3-3', 'أساسيات تكنولوجيا الواجهة الأمامية', 62],
  ['4-1', 'أنواع الوسائط وخصائصها', 68],
  ['4-2', 'تصميم المعلومات وتجربة المستخدم للمواقع', 74],
  ['4-3', 'أساليب تقييم المواقع الإلكترونية', 81],
  ['4-4', 'عملية التحسين التكراري للمواقع', 87],
].map(([id, title, page]) => ({ id, title, page, chapter: CHAPTERS[id[0]] }))

export function createDefaultProgress() {
  return {
    version: 1,
    courses: {
      [SECOND_YEAR]: {
        title: 'برمجة · الثاني الثانوي (تشعيب)',
        lessons: SECOND_YEAR_LESSONS,
        nextIndex: 8,
        pdf: 'Programming-ArtificialIntelligence-Ar-EB-part1.pdf',
        // Verified against the supplied PDF: printed page 56 is PDF page 57.
        pageOffset: 1,
        sessions: {},
      },
      [FIRST_YEAR]: {
        title: 'برمجة · الأول الثانوي',
        lessons: [],
        nextIndex: 0,
        pdf: '',
        pageOffset: 0,
        sessions: {},
      },
    },
  }
}

export function courseForItem(item) {
  if (item.t === 'str' && item.g === 11) return SECOND_YEAR
  if (item.t === 'prog' && item.g === 10) return FIRST_YEAR
  return null
}

export function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getWeekStart(now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  date.setDate(date.getDate() - date.getDay())
  return date
}

export function sessionForItem(item, now = new Date()) {
  const date = getWeekStart(now)
  date.setDate(date.getDate() + item.day)
  const dateKey = localDateKey(date)
  return { ...item, courseId: courseForItem(item), date: dateKey, key: `${dateKey}:${item.period}` }
}

// A week's unrecorded sessions are proposals. Only the first pending lesson can
// be completed; uncompleted lessons carry forward when the week changes.
export function planWeek(items, courses, now = new Date()) {
  const pendingCounts = {}
  return [...items].sort((a, b) => a.day - b.day || a.period - b.period).map(item => {
    const session = sessionForItem(item, now)
    const course = courses[session.courseId]
    if (!course) return { ...session, status: 'untracked' }
    const record = course.sessions[session.key]
    if (record) return { ...session, status: record.status === 'deferred' ? 'deferred' : 'completed', lesson: record.lesson, record }
    if (!course.lessons.length) return { ...session, status: 'setup' }
    const ordinal = pendingCounts[session.courseId] || 0
    pendingCounts[session.courseId] = ordinal + 1
    const lessonIndex = course.nextIndex + ordinal
    const lesson = course.lessons[lessonIndex]
    return { ...session, lesson, lessonIndex, ordinal, status: lesson ? 'planned' : 'finished' }
  })
}

export function completeSession(progress, key, items, now = new Date()) {
  const session = planWeek(items, progress.courses, now).find(item => item.key === key)
  if (!session || session.status !== 'planned' || session.ordinal !== 0) return progress
  const course = progress.courses[session.courseId]
  return {
    ...progress,
    courses: {
      ...progress.courses,
      [session.courseId]: {
        ...course,
        nextIndex: course.nextIndex + 1,
        sessions: {
          ...course.sessions,
          [key]: { lesson: session.lesson, completedAt: now.toISOString(), date: session.date, period: session.period },
        },
      },
    },
  }
}

// A session may finish before its lesson does. Carry that same lesson forward
// without advancing progress or allowing the next lesson to be completed early.
export function deferSession(progress, key, items, now = new Date()) {
  const session = planWeek(items, progress.courses, now).find(item => item.key === key)
  if (!session || session.status !== 'planned' || session.ordinal !== 0) return progress
  const course = progress.courses[session.courseId]
  return {
    ...progress,
    courses: { ...progress.courses, [session.courseId]: {
      ...course,
      sessions: { ...course.sessions, [key]: {
        status: 'deferred', lesson: session.lesson, completedAt: now.toISOString(), date: session.date, period: session.period,
      } },
    } },
  }
}

export function canUndo(course, key) {
  const records = Object.entries(course.sessions)
  const last = records[records.length - 1]
  return !!last && last[0] === key && (last[1].status === 'deferred' || course.lessons[course.nextIndex - 1]?.id === last[1].lesson.id)
}

export function undoSession(progress, courseId, key) {
  const course = progress.courses[courseId]
  if (!canUndo(course, key)) return progress
  const sessions = { ...course.sessions }
  delete sessions[key]
  return { ...progress, courses: { ...progress.courses, [courseId]: { ...course, nextIndex: course.nextIndex - (course.sessions[key].status === 'deferred' ? 0 : 1), sessions } } }
}

export function updateCurrentLesson(progress, courseId, nextIndex) {
  const course = progress.courses[courseId]
  if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex > course.lessons.length || nextIndex === course.nextIndex) return progress
  // Explicit progress correction starts a fresh session log for this course.
  return { ...progress, courses: { ...progress.courses, [courseId]: { ...course, nextIndex, sessions: {} } } }
}

export function pdfHref(course, lesson) {
  if (!course.pdf) return null
  const base = `${import.meta.env.BASE_URL}${course.pdf.replace(/^\/+/, '')}`
  return lesson?.page ? `${base}#page=${Math.max(1, lesson.page + course.pageOffset)}` : base
}

export function parseLessons(text) {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map((line, i) => {
    const parts = line.split('|').map(part => part.trim())
    const page = parts[1] ? Number(parts[1]) : null
    if (!parts[0] || parts.length > 2 || (page !== null && (!Number.isInteger(page) || page < 1))) {
      throw new Error(`راجع عنوان الدرس ورقم الصفحة في السطر ${i + 1}.`)
    }
    return { id: `first-${i + 1}`, title: parts[0], page }
  })
}

function validCourse(course) {
  return course && Array.isArray(course.lessons) && course.lessons.every(lesson =>
    lesson && typeof lesson.id === 'string' && typeof lesson.title === 'string' &&
    (lesson.page == null || (Number.isInteger(lesson.page) && lesson.page > 0))) &&
    Number.isInteger(course.nextIndex) && course.nextIndex >= 0 && course.nextIndex <= course.lessons.length &&
    typeof course.pdf === 'string' && isPublicPdf(course.pdf) && Number.isInteger(course.pageOffset) &&
    course.sessions && typeof course.sessions === 'object' && !Array.isArray(course.sessions) &&
    Object.values(course.sessions).every(record => record && typeof record.lesson?.id === 'string' &&
      typeof record.lesson?.title === 'string' && typeof record.completedAt === 'string' &&
      (record.lesson.page == null || (Number.isInteger(record.lesson.page) && record.lesson.page > 0)))
}

export function isPublicPdf(path) {
  return path === '' || (/^[^:#?\\]+\.pdf$/i.test(path) && !path.includes('..') && !path.startsWith('//'))
}

export function readProgress(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return { progress: createDefaultProgress(), error: '' }
    const saved = JSON.parse(raw)
    if (saved.version !== 1 || !validCourse(saved.courses?.[FIRST_YEAR]) || !validCourse(saved.courses?.[SECOND_YEAR])) {
      throw new Error('Invalid teaching progress')
    }
    // Keep the supplied curriculum authoritative across application updates.
    saved.courses[SECOND_YEAR].lessons = SECOND_YEAR_LESSONS
    if (saved.courses[SECOND_YEAR].nextIndex > SECOND_YEAR_LESSONS.length) throw new Error('Invalid lesson index')
    return { progress: saved, error: '' }
  } catch {
    return { progress: createDefaultProgress(), error: 'تعذر قراءة التقدم المحفوظ. تُعرض نقطة البداية؛ لن تُستبدل البيانات القديمة حتى تحفظ تغييرًا.' }
  }
}

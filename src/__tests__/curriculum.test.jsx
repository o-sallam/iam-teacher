import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from '../App.jsx'
import { DATA } from '../features/timetable/timetableApi.jsx'
import {
  FIRST_YEAR, SECOND_YEAR, SECOND_YEAR_LESSONS, STORAGE_KEY, canUndo,
  completeSession, createDefaultProgress, deferSession, isPublicPdf, parseLessons,
  pdfHref, planWeek, readProgress, undoSession, updateCurrentLesson,
} from '../features/curriculum/curriculum.js'

const sunday = new Date(2026, 10, 1, 8, 10)
const items = DATA.flatMap((day, dayIndex) => Object.entries(day).map(([period, item]) => ({
  ...item, day: dayIndex, period: Number(period),
})))
const secondYearPlan = progress => planWeek(items, progress.courses, sunday).filter(item => item.courseId === SECOND_YEAR)

describe('curriculum sequence and session records', () => {
  it('starts at 3-2, with the preceding eight lessons completed', () => {
    const progress = createDefaultProgress()
    expect(progress.courses[SECOND_YEAR].nextIndex).toBe(8)
    expect(SECOND_YEAR_LESSONS).toHaveLength(14)
    expect(secondYearPlan(progress).map(session => session.lesson.id)).toEqual(['3-2', '3-3', '4-1', '4-2', '4-3'])
  })

  it('plans chronologically regardless of item order and separates courses', () => {
    const progress = createDefaultProgress()
    const plan = planWeek([...items].reverse(), progress.courses, sunday)
    expect(plan.filter(item => item.courseId === SECOND_YEAR).map(item => item.lesson.id)).toEqual(['3-2', '3-3', '4-1', '4-2', '4-3'])
    expect(plan.filter(item => item.courseId === FIRST_YEAR).every(item => item.status === 'setup')).toBe(true)
    expect(plan.filter(item => item.t === 'fin').every(item => item.status === 'untracked')).toBe(true)
  })

  it('prevents skipping lessons and completing a session twice', () => {
    const original = createDefaultProgress()
    const [first, second] = secondYearPlan(original)
    expect(completeSession(original, second.key, items, sunday)).toBe(original)
    const progress = completeSession(original, first.key, items, sunday)
    expect(progress.courses[SECOND_YEAR].nextIndex).toBe(9)
    expect(secondYearPlan(progress)[0].status).toBe('completed')
    expect(secondYearPlan(progress)[0].lesson.id).toBe('3-2')
    expect(secondYearPlan(progress)[1].lesson.id).toBe('3-3')
    expect(completeSession(progress, first.key, items, sunday)).toBe(progress)
    expect(progress.courses[FIRST_YEAR]).toBe(original.courses[FIRST_YEAR])
  })

  it('carries an unfinished lesson into the next session without marking it complete', () => {
    const original = createDefaultProgress()
    const [first, second] = secondYearPlan(original)
    expect(deferSession(original, second.key, items, sunday)).toBe(original)
    const deferred = deferSession(original, first.key, items, sunday)
    expect(deferred.courses[SECOND_YEAR].nextIndex).toBe(8)
    expect(secondYearPlan(deferred)[0].status).toBe('deferred')
    expect(secondYearPlan(deferred)[1].lesson.id).toBe('3-2')
    expect(secondYearPlan(deferred)[2].lesson.id).toBe('3-3')
    const completed = completeSession(deferred, second.key, items, sunday)
    expect(completed.courses[SECOND_YEAR].nextIndex).toBe(9)
    expect(secondYearPlan(completed)[2].lesson.id).toBe('3-3')
  })

  it('only undoes the latest record and handles continuation without changing progress', () => {
    const original = createDefaultProgress()
    const [first, second] = secondYearPlan(original)
    const deferred = deferSession(original, first.key, items, sunday)
    expect(undoSession(deferred, SECOND_YEAR, first.key)).toEqual(original)
    const completed = completeSession(deferred, second.key, items, sunday)
    expect(canUndo(completed.courses[SECOND_YEAR], first.key)).toBe(false)
    expect(undoSession(completed, SECOND_YEAR, first.key)).toBe(completed)
    expect(undoSession(completed, SECOND_YEAR, second.key)).toEqual(deferred)
  })

  it('carries actual progress into the next week with distinct dated session keys', () => {
    const original = createDefaultProgress()
    const first = secondYearPlan(original)[0]
    const progress = completeSession(original, first.key, items, sunday)
    const followingSunday = new Date(2026, 10, 8, 8, 10)
    const nextWeek = planWeek(items, progress.courses, followingSunday).filter(item => item.courseId === SECOND_YEAR)
    expect(nextWeek[0].key).toBe('2026-11-08:1')
    expect(nextWeek[0].lesson.id).toBe('3-3')
    expect(nextWeek[0].status).toBe('planned')
    expect(progress.courses[SECOND_YEAR].sessions[first.key].lesson.id).toBe('3-2')
    expect(planWeek(items, original.courses, followingSunday)[0].lesson.id).toBe('3-2')
  })

  it('handles the end of the curriculum without an out-of-range lesson', () => {
    let progress = updateCurrentLesson(createDefaultProgress(), SECOND_YEAR, 13)
    const first = secondYearPlan(progress)[0]
    expect(first.lesson.id).toBe('4-4')
    expect(secondYearPlan(progress)[1].status).toBe('finished')
    progress = completeSession(progress, first.key, items, sunday)
    expect(progress.courses[SECOND_YEAR].nextIndex).toBe(14)
    expect(secondYearPlan(progress)[1].lesson).toBeUndefined()
    expect(completeSession(progress, secondYearPlan(progress)[1].key, items, sunday)).toBe(progress)
  })

  it('supports explicit progress correction with validated bounds', () => {
    const original = createDefaultProgress()
    for (const invalid of [-1, 15, 1.5, NaN]) expect(updateCurrentLesson(original, SECOND_YEAR, invalid)).toBe(original)
    const completed = completeSession(original, secondYearPlan(original)[0].key, items, sunday)
    const corrected = updateCurrentLesson(completed, SECOND_YEAR, 8)
    expect(corrected.courses[SECOND_YEAR].sessions).toEqual({})
    expect(secondYearPlan(corrected)[0].lesson.id).toBe('3-2')
    expect(corrected.courses[FIRST_YEAR]).toBe(original.courses[FIRST_YEAR])
  })

  it('uses the verified PDF offset including the final lesson on printed page 87', () => {
    const course = createDefaultProgress().courses[SECOND_YEAR]
    expect(pdfHref(course, SECOND_YEAR_LESSONS[8])).toBe('/Programming-ArtificialIntelligence-Ar-EB-part1.pdf#page=57')
    expect(pdfHref(course, SECOND_YEAR_LESSONS[13])).toContain('#page=88')
    expect(pdfHref(course)).toBe('/Programming-ArtificialIntelligence-Ar-EB-part1.pdf')
    expect(pdfHref({ pdf: '' })).toBeNull()
  })

  it('validates first-year lessons and local PDF paths', () => {
    expect(parseLessons('أول درس | 4\n\nثاني درس')).toEqual([
      { id: 'first-1', title: 'أول درس', page: 4 },
      { id: 'first-2', title: 'ثاني درس', page: null },
    ])
    for (const text of ['درس | 0', 'درس | 1.5', 'درس | صفحة', '| 4', 'درس | 4 | 5']) expect(() => parseLessons(text)).toThrow()
    for (const path of ['https://example.com/book.pdf', '../book.pdf', '//example.com/book.pdf', 'book.pdf#page=2']) expect(isPublicPdf(path)).toBe(false)
    expect(isPublicPdf('books/first-year.pdf')).toBe(true)
  })

  it('restores recorded progress and safely handles malformed storage', () => {
    const progress = completeSession(createDefaultProgress(), '2026-11-01:1', items, sunday)
    expect(readProgress({ getItem: () => JSON.stringify(progress) })).toEqual({ progress, error: '' })
    for (const value of ['{broken', '{}', JSON.stringify({ ...progress, version: 99 })]) {
      const result = readProgress({ getItem: () => value })
      expect(result.progress).toEqual(createDefaultProgress())
      expect(result.error).not.toBe('')
    }
    expect(readProgress({ getItem() { throw new Error('Unavailable') } }).error).not.toBe('')
  })
})

describe('teaching progress in the timetable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(sunday)
    // Vitest 1 on newer Node releases can inherit Node's unavailable Storage.
    const entries = new Map()
    vi.stubGlobal('localStorage', {
      getItem: key => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, String(value)),
      clear: () => entries.clear(),
    })
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
  function openSession(container, day = 0, period = 1, mobile = false) {
    const selector = mobile ? `li.row[data-day="${day}"][data-p="${period}"] button` : `td.lesson[data-day="${day}"][data-p="${period}"] button`
    fireEvent.click(container.querySelector(selector))
    return screen.getByRole('dialog')
  }

  it('opens the current lesson, its PDF page, and an inline preview', () => {
    const { container } = render(<App />)
    const dialog = openSession(container)
    expect(within(dialog).getByRole('heading', { level: 3 }).textContent).toContain('طرق الاتصال في تطبيقات الويب')
    expect(within(dialog).getByRole('link', { name: /فتح PDF/ }).getAttribute('href')).toContain('#page=57')
    fireEvent.click(within(dialog).getByRole('button', { name: 'عرض الكتاب هنا' }))
    expect(within(dialog).getByTitle(/معاينة المنهج/).getAttribute('src')).toContain('#page=57')
  })

  it('persists completion across reloads and updates later sessions', () => {
    const view = render(<App />)
    let dialog = openSession(view.container)
    fireEvent.click(within(dialog).getByRole('button', { name: 'تم تدريس الدرس' }))
    expect(within(dialog).getByText('✓ تم التدريس')).toBeTruthy()
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).courses[SECOND_YEAR].nextIndex).toBe(9)
    view.unmount()
    const reloaded = render(<App />)
    dialog = openSession(reloaded.container, 1, 5)
    expect(within(dialog).getByRole('heading', { level: 3 }).textContent).toContain('أساسيات تكنولوجيا الواجهة الأمامية')
    expect(within(dialog).getByRole('button', { name: 'تم تدريس الدرس' }).disabled).toBe(false)
  })

  it('prevents completing a later lesson early and carries unfinished lessons forward', () => {
    const { container } = render(<App />)
    let dialog = openSession(container, 1, 5)
    expect(within(dialog).getByRole('button', { name: 'تم تدريس الدرس' }).disabled).toBe(true)
    fireEvent.click(within(dialog).getByRole('button', { name: 'إغلاق' }))
    dialog = openSession(container)
    fireEvent.click(within(dialog).getByRole('button', { name: 'متابعة الدرس في الحصة التالية' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'إغلاق' }))
    dialog = openSession(container, 1, 5)
    expect(within(dialog).getByRole('heading', { level: 3 }).textContent).toContain('طرق الاتصال في تطبيقات الويب')
    expect(within(dialog).getByRole('button', { name: 'تم تدريس الدرس' }).disabled).toBe(false)
  })

  it('opens mobile sessions with keyboard-accessible buttons and supports undo', () => {
    const { container } = render(<App />)
    const dialog = openSession(container, 0, 1, true)
    fireEvent.click(within(dialog).getByRole('button', { name: 'تم تدريس الدرس' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'التراجع عن تسجيل الإنجاز' }))
    expect(within(dialog).getByRole('button', { name: 'تم تدريس الدرس' }).disabled).toBe(false)
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).courses[SECOND_YEAR].nextIndex).toBe(8)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it('configures first-year progress once and schedules it independently', () => {
    const { container } = render(<App />)
    let dialog = openSession(container, 0, 3)
    fireEvent.click(within(dialog).getByRole('button', { name: 'إعداد المنهج والتقدم' }))
    dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText('دروس المنهج، درس في كل سطر'), { target: { value: 'درس أول | 4\nدرس ثان | 12\nدرس ثالث | 20' } })
    fireEvent.change(within(dialog).getByLabelText('الدرس الحالي'), { target: { value: '1' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'حفظ المنهج والتقدم' }))
    dialog = openSession(container, 0, 3)
    expect(within(dialog).getByRole('heading', { level: 3 }).textContent).toBe('درس ثان')
    fireEvent.click(within(dialog).getByRole('button', { name: 'تم تدريس الدرس' }))
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    expect(saved.courses[FIRST_YEAR].nextIndex).toBe(2)
    expect(saved.courses[SECOND_YEAR].nextIndex).toBe(8)
    fireEvent.click(within(dialog).getByRole('button', { name: 'إغلاق' }))
    dialog = openSession(container, 4, 3)
    expect(within(dialog).getByRole('heading', { level: 3 }).textContent).toBe('درس ثالث')
  })

  it('shows storage failures inside the open dialog and allows retry', () => {
    const { container } = render(<App />)
    const dialog = openSession(container)
    vi.spyOn(window.localStorage, 'setItem').mockImplementationOnce(() => { throw new Error('Full') })
    fireEvent.click(within(dialog).getByRole('button', { name: 'تم تدريس الدرس' }))
    expect(within(dialog).getByRole('alert').textContent).toContain('تعذر حفظ التقدم')
    fireEvent.click(within(dialog).getByRole('button', { name: 'إعادة حفظ التقدم' }))
    expect(within(dialog).queryByRole('alert')).toBeNull()
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).courses[SECOND_YEAR].nextIndex).toBe(9)
  })

  it('refreshes dates and carries progress forward when a tab stays open into the next week', async () => {
    const { container } = render(<App />)
    vi.setSystemTime(new Date(2026, 10, 8, 8, 10))
    await act(async () => { vi.advanceTimersByTime(60000) })
    const dialog = openSession(container)
    expect(within(dialog).getByText('2026-11-08')).toBeTruthy()
    expect(within(dialog).getByRole('heading', { level: 3 }).textContent).toContain('طرق الاتصال في تطبيقات الويب')
  })
})

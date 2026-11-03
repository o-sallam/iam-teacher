import React, { useState } from 'react'
import Modal from '../../components/Modal.jsx'
import { FIRST_YEAR, isPublicPdf, parseLessons, updateCurrentLesson } from './curriculum.js'
import { CurriculumList, PdfAccess } from './CurriculumDetails.jsx'
import StorageNotice from './StorageNotice.jsx'

function FirstYearSetup({ course, onSave }) {
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [pdf, setPdf] = useState('')
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState('')
  let lessons = []
  try { lessons = parseLessons(text) } catch { /* Show validation on save. */ }
  const submit = event => {
    event.preventDefault()
    try {
      const parsed = parseLessons(text)
      if (!parsed.length) throw new Error('أضف درسًا واحدًا على الأقل.')
      if (!isPublicPdf(pdf.trim())) throw new Error('أدخل اسم ملف PDF داخل public، مثل First-Year.pdf.')
      if (!Number.isInteger(Number(offset))) throw new Error('فرق الصفحات يجب أن يكون عددًا صحيحًا.')
      if (parsed.some(lesson => lesson.page && lesson.page + Number(offset) < 1)) throw new Error('فرق الصفحات يجعل إحدى صفحات PDF أقل من 1.')
      onSave({ ...course, lessons: parsed, nextIndex: Math.min(currentIndex, parsed.length), pdf: pdf.trim().replace(/^\/+/, ''), pageOffset: Number(offset), sessions: {} })
    } catch (err) { setError(err.message) }
  }
  return (
    <form className="course-form" onSubmit={submit}>
      <p>أدخل الدروس بالترتيب وحدد الدرس الذي ستدرّسه الآن. ستُحسب الدروس السابقة مكتملة.</p>
      <label htmlFor="first-year-lessons">دروس المنهج، درس في كل سطر</label>
      <textarea id="first-year-lessons" rows={7} value={text} onChange={event => { setText(event.target.value); setCurrentIndex(0) }} placeholder={'عنوان الدرس الأول | 4\nعنوان الدرس الثاني | 12'} aria-describedby="lesson-format" required />
      <small id="lesson-format">رقم الصفحة اختياري؛ أضفه بعد علامة |. أدخل عناوين المنهج الفعلية.</small>
      <label htmlFor="first-year-current">الدرس الحالي</label>
      <select id="first-year-current" value={currentIndex} onChange={event => setCurrentIndex(Number(event.target.value))}>
        {lessons.length ? lessons.map((lesson, i) => <option key={lesson.id} value={i}>{i + 1}. {lesson.title}</option>) : <option value={0}>أضف الدروس أولًا</option>}
        {!!lessons.length && <option value={lessons.length}>اكتمل المنهج</option>}
      </select>
      <label htmlFor="first-year-pdf">اسم ملف PDF داخل public (اختياري)</label>
      <input id="first-year-pdf" dir="ltr" value={pdf} onChange={event => setPdf(event.target.value)} placeholder="First-Year.pdf" />
      <label htmlFor="first-year-offset">فرق صفحة PDF عن رقم الصفحة المطبوع</label>
      <input id="first-year-offset" type="number" value={offset} onChange={event => setOffset(event.target.value)} />
      <small>مثال: إذا كانت ص 4 المطبوعة هي الصفحة 5 في PDF، أدخل 1.</small>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="action-button" type="submit">حفظ المنهج والتقدم</button>
    </form>
  )
}

export default function CourseManager({ courseId, course, update, onClose, storageError, onRetrySave }) {
  const [currentIndex, setCurrentIndex] = useState(course.nextIndex)
  const [saved, setSaved] = useState(false)
  const changeProgress = event => {
    event.preventDefault()
    update(progress => updateCurrentLesson(progress, courseId, currentIndex))
    setSaved(true)
  }
  return (
    <Modal title={course.title} onClose={onClose}>
      <StorageNotice error={storageError} onRetry={onRetrySave} />
      {!course.lessons.length && courseId === FIRST_YEAR ? <FirstYearSetup course={course} onSave={configured => {
        update(progress => ({ ...progress, courses: { ...progress.courses, [courseId]: configured } }))
        onClose()
      }} /> : <>
        <p className="dialog-description">{courseId === FIRST_YEAR ? 'تقدم مستقل عن الثاني الثانوي.' : 'الترم الأول · الفصول 1 إلى 4 · تقدم مشترك لحصص 11/A و11/B.'}</p>
        <PdfAccess course={course} />
        <CurriculumList course={course} />
        <form className="course-form" onSubmit={changeProgress}>
          <label htmlFor="current-lesson-select">تعديل موضع التقدم</label>
          <select id="current-lesson-select" value={currentIndex} onChange={event => { setCurrentIndex(Number(event.target.value)); setSaved(false) }}>
            {course.lessons.map((lesson, i) => <option key={lesson.id} value={i}>{!lesson.id.startsWith('first-') ? `${lesson.id} · ` : ''}{lesson.title}</option>)}
            <option value={course.lessons.length}>اكتمل المنهج</option>
          </select>
          <p className="plan-note">اختر الدرس الذي ستدرّسه الآن؛ تُحسب كل الدروس السابقة مكتملة. حفظ موضع جديد يمسح سجل حصص هذا المنهج ويعيد توزيع الدروس. استخدم «تم تدريس الدرس» داخل الحصة للتقدم المعتاد.</p>
          <button className="action-button secondary-action" type="submit" disabled={currentIndex === course.nextIndex}>حفظ موضع التقدم</button>
          {saved && <p role="status">تم تحديث التقدم وإعادة توزيع الدروس.</p>}
        </form>
      </>}
    </Modal>
  )
}

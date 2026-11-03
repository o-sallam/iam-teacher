import React from 'react'
import Modal from '../../components/Modal.jsx'
import { DAYS, PERIODS } from '../timetable/timetableApi.jsx'
import { canUndo } from './curriculum.js'
import { CurriculumList, PdfAccess } from './CurriculumDetails.jsx'
import StorageNotice from './StorageNotice.jsx'

export default function SessionDetails({ session, course, onClose, onComplete, onDefer, onUndo, onManage, storageError, onRetrySave }) {
  const period = PERIODS.find(item => item.n === session.period)
  const lesson = session.lesson
  return (
    <Modal title={course.title} onClose={onClose}>
      <StorageNotice error={storageError} onRetry={onRetrySave} />
      <p className="session-date">{DAYS[session.day]} · <bdi>{session.date}</bdi> · الحصة {session.period} · <bdi>{period?.t}</bdi> · <bdi>{session.c}</bdi></p>
      {session.status === 'setup' ? <div className="session-lesson">
        <h3>أضف منهج الأول الثانوي</h3>
        <p>أضف ترتيب الدروس وحدد الدرس الحالي ليُختار درس كل حصة تلقائيًا.</p>
        <button className="action-button" type="button" onClick={onManage}>إعداد المنهج والتقدم</button>
      </div> : <>
        <div className={`session-lesson ${session.status === 'completed' ? 'completed-lesson' : ''}`} aria-live="polite">
          <span className="session-status">{session.status === 'completed' ? '✓ تم التدريس' : session.status === 'deferred' ? 'متابعة بالحصة التالية' : session.status === 'finished' ? 'نهاية المنهج' : session.ordinal === 0 ? 'الدرس التالي للتدريس' : 'درس مقترح لهذه الحصة'}</span>
          {lesson ? <>
            {lesson.chapter && <p className="chapter-title">{lesson.chapter}</p>}
            <h3>{!lesson.id.startsWith('first-') && <bdi className="lesson-code">{lesson.id} </bdi>}{lesson.title}</h3>
            {lesson.page && <p>صفحة {lesson.page} في الكتاب</p>}
          </> : <>
            <h3>{course.nextIndex === course.lessons.length ? 'اكتمل المنهج' : 'حصة للمراجعة بعد إتمام المنهج'}</h3>
            <p>لا توجد دروس إضافية في التسلسل الحالي.</p>
          </>}
        </div>
        <PdfAccess key={lesson?.id || 'book'} course={course} lesson={lesson} preview />
        {session.status === 'planned' && <div className="completion-actions">
          {session.ordinal > 0 && <p className="plan-note">أكمل الدرس الحالي «{course.lessons[course.nextIndex]?.title}» في الحصة السابقة أولًا. يتحدث التوزيع تلقائيًا بعد تسجيل الإنجاز.</p>}
          <button type="button" className="action-button" disabled={session.ordinal !== 0} onClick={onComplete}>تم تدريس الدرس</button>
          <button type="button" className="text-action" disabled={session.ordinal !== 0} onClick={onDefer}>متابعة الدرس في الحصة التالية</button>
          <small>سجّل الإنجاز بعد الانتهاء. إذا احتاج الدرس وقتًا إضافيًا أو لم تُعقد الحصة، اختر المتابعة ليبقى نفس الدرس في الحصة التالية.</small>
        </div>}
        {session.status === 'completed' && <div className="completion-actions">
          <p role="status">تم حفظ إنجاز هذه الحصة. الدرس التالي: {course.lessons[course.nextIndex]?.title || 'اكتمل المنهج'}.</p>
          {canUndo(course, session.key) && <button className="text-action" type="button" onClick={onUndo}>التراجع عن تسجيل الإنجاز</button>}
        </div>}
        {session.status === 'deferred' && <div className="completion-actions">
          <p role="status">لم يُسجّل هذا الدرس مكتملًا. سيستمر في الحصة التالية حسب ترتيب المنهج.</p>
          {canUndo(course, session.key) && <button className="text-action" type="button" onClick={onUndo}>التراجع عن المتابعة</button>}
        </div>}
        <CurriculumList course={course} />
        <button type="button" className="text-action" onClick={onManage}>تعديل موضع التقدم</button>
      </>}
    </Modal>
  )
}

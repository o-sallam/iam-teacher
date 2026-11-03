import React from 'react'
import { FIRST_YEAR, SECOND_YEAR } from './curriculum.js'

export default function TeachingProgressPanel({ courses, onManage }) {
  return (
    <section className="teaching-progress" aria-label="تقدم التدريس">
      <div className="progress-heading">
        <h2>خطة التدريس</h2>
        <span>افتح الحصة لعرض الدرس وتسجيل إنجازه</span>
      </div>
      <div className="course-progress-grid">
        {[SECOND_YEAR, FIRST_YEAR].map(id => {
          const course = courses[id]
          const lesson = course.lessons[course.nextIndex]
          return (
            <article key={id} className={`course-progress ${id === SECOND_YEAR ? 't-str' : 't-prog'}`}>
              <h3>{course.title}</h3>
              {course.lessons.length ? <>
                <p className="progress-caption">{lesson ? 'الدرس الحالي' : 'اكتمل المنهج'}</p>
                <p className="current-lesson">{lesson ? <><bdi className="lesson-code">{lesson.id.startsWith('first-') ? course.nextIndex + 1 : lesson.id}</bdi> {lesson.title}</> : 'جميع الدروس مكتملة ✓'}</p>
                <div className="progress-meter">
                  <progress aria-label={`الدروس المكتملة: ${course.title}`} max={course.lessons.length} value={course.nextIndex} />
                  <span>{course.nextIndex} / {course.lessons.length} مكتمل</span>
                </div>
              </> : <p className="setup-caption">أضف ترتيب الدروس وحدد الدرس الحالي مرة واحدة لتوزيع الحصص تلقائيًا.</p>}
              <button type="button" className="text-action" onClick={() => onManage(id)}>
                {course.lessons.length ? 'المنهج والتقدم' : 'إعداد منهج الأول الثانوي'} <span aria-hidden="true">←</span>
              </button>
            </article>
          )
        })}
      </div>
      <p className="plan-note">الدروس موزعة بترتيب المنهج. في كل حصة سجّل الإنجاز أو اختر متابعة نفس الدرس في الحصة التالية. ينتقل أي درس غير مكتمل إلى الأسبوع الجديد.</p>
      <p className="local-save-note">يُحفظ التقدم في هذا المتصفح على هذا الجهاز.</p>
    </section>
  )
}

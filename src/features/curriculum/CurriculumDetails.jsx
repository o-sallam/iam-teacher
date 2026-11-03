import React, { useState } from 'react'
import { pdfHref } from './curriculum.js'

export function PdfAccess({ course, lesson, preview = false }) {
  const [showPreview, setShowPreview] = useState(false)
  const href = pdfHref(course, lesson)
  if (!href) return null
  return (
    <div className="pdf-access">
      <div className="dialog-actions">
        <a className="action-button secondary-action" href={href} target="_blank" rel="noopener noreferrer">
          {lesson?.page ? `فتح PDF · ص ${lesson.page}` : 'فتح كتاب المنهج PDF'} <span aria-hidden="true">↗</span>
        </a>
        {preview && <button type="button" className="text-action" aria-expanded={showPreview} onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'إخفاء المعاينة' : 'عرض الكتاب هنا'}</button>}
      </div>
      {showPreview && <>
        <iframe className="pdf-preview" title={`معاينة المنهج: ${lesson?.title || course.title}`} src={href} />
        <p className="plan-note">إذا لم تظهر المعاينة في متصفحك، استخدم رابط فتح PDF.</p>
      </>}
    </div>
  )
}

export function CurriculumList({ course }) {
  return (
    <details className="curriculum-details">
      <summary>تسلسل المنهج · {course.lessons.length} درسًا</summary>
      <ol className="curriculum-list">
        {course.lessons.map((lesson, index) => {
          const href = pdfHref(course, lesson)
          return (
            <li key={lesson.id} className={index < course.nextIndex ? 'is-complete' : index === course.nextIndex ? 'is-current' : ''} aria-current={index === course.nextIndex ? 'step' : undefined}>
              <span className="curriculum-marker" aria-hidden="true">{index < course.nextIndex ? '✓' : index + 1}</span>
              <div>
                {lesson.chapter && (index === 0 || lesson.chapter !== course.lessons[index - 1].chapter) && <small className="chapter-title">{lesson.chapter}</small>}
                <span>{!lesson.id.startsWith('first-') && <bdi className="lesson-code">{lesson.id} </bdi>}{lesson.title}</span>
                <small>{index < course.nextIndex ? 'مكتمل' : index === course.nextIndex ? 'الدرس الحالي' : 'قادم'}</small>
              </div>
              {href && <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`فتح ${lesson.title} في PDF`}>{lesson.page ? `ص ${lesson.page}` : 'PDF'}</a>}
            </li>
          )
        })}
      </ol>
    </details>
  )
}

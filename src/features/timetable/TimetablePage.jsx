import React, { useState, useEffect } from 'react'
import { useTimetable } from './useTimetable.js'
import TimetableGrid from './TimetableGrid.jsx'
import Button from '../../components/Button.jsx'
import { TYPES, GRADE_NAMES, STAGES } from './timetableApi.jsx'
import { useTeachingProgress } from '../curriculum/useTeachingProgress.js'
import { completeSession, deferSession, planWeek, undoSession } from '../curriculum/curriculum.js'
import TeachingProgressPanel from '../curriculum/TeachingProgressPanel.jsx'
import SessionDetails from '../curriculum/SessionDetails.jsx'
import CourseManager from '../curriculum/CourseManager.jsx'
import StorageNotice from '../curriculum/StorageNotice.jsx'

function TimetablePage({ onSubtitleChange }) {
  const { filter, setFilter, matches, chipCounts, today, currentPeriod, items, now } = useTimetable()
  const { progress, update, storageError, retrySave } = useTeachingProgress()
  const [selectedKey, setSelectedKey] = useState(null)
  const [managingCourse, setManagingCourse] = useState(null)
  // Always plan from the entire timetable, including classes hidden by a filter.
  const sessions = planWeek(items, progress.courses, now)
  const selectedSession = sessions.find(session => session.key === selectedKey)
  const manageCourse = courseId => {
    setSelectedKey(null)
    setManagingCourse(courseId)
  }
  const [subtitle, setSubtitle] = useState('')
  const [empty, setEmpty] = useState(null)
  const [dimmedItems, setDimmedItems] = useState(new Set())
  
  // Set subtitle
  useEffect(() => {
    try {
      const now0 = new Date()
      const month = now0.toLocaleDateString('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' }) + ' · '
      const sub = month + items.length + ' حصة في الأسبوع'
      setSubtitle(sub)
      if (onSubtitleChange) onSubtitleChange(sub)
    } catch (e) {
      const sub = items.length + ' حصة في الأسبوع'
      setSubtitle(sub)
      if (onSubtitleChange) onSubtitleChange(sub)
    }
  }, [items, onSubtitleChange])
  
  // Apply filter and check for empty state
  useEffect(() => {
    const hits = items.filter(it => matches(it)).length
    let emptyMsg = null
    
    if (filter.k !== 'all' && hits === 0) {
      let what = ''
      if (filter.k === 'grade') what = 'للصف ' + GRADE_NAMES[filter.v]
      else if (filter.k === 'stage') what = 'للمرحلة ' + STAGES[filter.v].label
      emptyMsg = (
        <>
          <span>لا توجد حصص {what} في جدولك الحالي.</span>
          <Button className="link-btn" id="showAll" onClick={() => setFilter({ k: 'all', v: null })}>عرض الكل</Button>
        </>
      )
    }
    
    setEmpty(emptyMsg)
    
    // Update dimmed items
    const newDimmed = new Set()
    items.forEach((it, idx) => {
      if (!matches(it)) {
        newDimmed.add(`${it.day}-${it.period}`)
      }
    })
    setDimmedItems(newDimmed)
  }, [filter, items, matches])
  
  const handleChipClick = (kind, v) => {
    if (kind === 'all' || (filter.k === kind && filter.v === v)) {
      setFilter({ k: 'all', v: null })
    } else {
      setFilter({ k: kind, v })
    }
  }
  
  const getChipPressed = (kind, v) => {
    if (kind === 'all') return filter.k === 'all'
    return filter.k === kind && String(filter.v) === String(v)
  }
  
  let chipIndex = 0
  const getDelay = () => {
    const d = (0.12 + chipIndex++ * 0.04).toFixed(2) + 's'
    return { '--d': d }
  }
  
  // Calculate total per grade for stages
  const stageCounts = {}
  Object.keys(STAGES).forEach(sk => {
    const st = STAGES[sk]
    let sum = 0
    st.grades.forEach(g => {
      sum += chipCounts[g] || 0
    })
    stageCounts[sk] = sum
  })
  
  return (
    <>
      <TeachingProgressPanel courses={progress.courses} onManage={manageCourse} />
      {!selectedSession && !managingCourse && <StorageNotice error={storageError} onRetry={retrySave} />}
      <div className="filters" id="filters" aria-label="تصفية الجدول">
        <div className="frow">
          <span className="flabel">الصف</span>
          <Button 
            className="chip" 
            data-k="all" 
            data-v="" 
            style={getDelay()}
            aria-pressed={getChipPressed('all', null)}
            onClick={() => handleChipClick('all', null)}
          >
            <span className="dot"></span>الكل
          </Button>
          
          {Object.keys(STAGES).map(sk => (
            <div className="fgrp" key={sk}>
              <Button 
                className={`chip t-${sk} stage-chip`} 
                data-k="stage" 
                data-v={sk}
                style={getDelay()}
                aria-pressed={getChipPressed('stage', sk)}
                onClick={() => handleChipClick('stage', sk)}
              >
                <span className="dot"></span>{STAGES[sk].label}<span className="n">{stageCounts[sk]}</span>
              </Button>
              {STAGES[sk].grades.map(g => (
                <Button 
                  key={g}
                  className={`chip t-${sk}`} 
                  data-k="grade" 
                  data-v={g}
                  style={getDelay()}
                  aria-pressed={getChipPressed('grade', g)}
                  onClick={() => handleChipClick('grade', g)}
                >
                  <span className="dot"></span>{GRADE_NAMES[g]}<span className="n">{chipCounts[g]}</span>
                </Button>
              ))}
            </div>
          ))}
        </div>
        
        <div className="frow">
          <span className="flabel">المادة</span>
          <div className="fgrp">
            {Object.keys(TYPES).map(key => (
              <Button 
                key={key}
                className={`chip ${TYPES[key].cls}`} 
                data-k="type" 
                data-v={key}
                style={getDelay()}
                aria-pressed={getChipPressed('type', key)}
                onClick={() => handleChipClick('type', key)}
              >
                <span className="dot"></span>{TYPES[key].label}<span className="n">{chipCounts[key]}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {empty && (
        <div className="empty" id="empty" role="status">
          {empty}
        </div>
      )}
      
      <TimetableGrid 
        items={sessions}
        dimmedItems={dimmedItems} 
        today={today} 
        currentPeriod={currentPeriod}
        onOpenSession={session => setSelectedKey(session.key)}
      />
      {selectedSession && progress.courses[selectedSession.courseId] && <SessionDetails
        key={selectedSession.key}
        session={selectedSession}
        course={progress.courses[selectedSession.courseId]}
        onClose={() => setSelectedKey(null)}
        onComplete={() => update(current => completeSession(current, selectedSession.key, items, new Date()))}
        onDefer={() => update(current => deferSession(current, selectedSession.key, items, new Date()))}
        onUndo={() => update(current => undoSession(current, selectedSession.courseId, selectedSession.key))}
        onManage={() => manageCourse(selectedSession.courseId)}
        storageError={storageError}
        onRetrySave={retrySave}
      />}
      {managingCourse && <CourseManager
        key={managingCourse}
        courseId={managingCourse}
        course={progress.courses[managingCourse]}
        update={update}
        onClose={() => setManagingCourse(null)}
        storageError={storageError}
        onRetrySave={retrySave}
      />}
    </>
  )
}

export default TimetablePage

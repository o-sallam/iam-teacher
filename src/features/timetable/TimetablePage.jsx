import React, { useState, useEffect } from 'react'
import { useTimetable } from './useTimetable.js'
import TimetableGrid from './TimetableGrid.jsx'
import Button from '../../components/Button.jsx'
import { DAYS, PERIODS, TYPES, GRADE_NAMES, STAGES, getDates } from './timetableApi.jsx'

function TimetablePage({ onOpenPlan, onSubtitleChange }) {
  const { filter, setFilter, matches, chipCounts, today, currentPeriod, weekDates, items } = useTimetable()
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
        items={items} 
        dimmedItems={dimmedItems} 
        today={today} 
        currentPeriod={currentPeriod}
        onOpenPlan={onOpenPlan}
      />
    </>
  )
}

export default TimetablePage
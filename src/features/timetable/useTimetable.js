import { useState, useEffect, useCallback } from 'react'
import { DATA, PERIODS, GRADE_NAMES, STAGES } from './timetableApi.jsx'

// Count items per grade and type
function countItems(items) {
  const gc = Object.fromEntries(Object.keys(GRADE_NAMES).map(g => [g, 0]));
  const tc = { prog: 0, str: 0, fin: 0 };
  
  items.forEach(it => {
    gc[it.g] = (gc[it.g] || 0) + 1;
    tc[it.t] = (tc[it.t] || 0) + 1;
  });
  
  return { gc, tc };
}

export function useTimetable() {
  const [filter, setFilter] = useState({ k: 'all', v: null })
  const [items, setItems] = useState([])
  const [today, setToday] = useState(null)
  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [weekDates, setWeekDates] = useState([])
  
  // Initialize items from DATA
  useEffect(() => {
    const allItems = []
    DATA.forEach((dayData, dayIndex) => {
      Object.keys(dayData).forEach(periodNum => {
        allItems.push({ ...dayData[periodNum], day: dayIndex, period: parseInt(periodNum, 10) })
      })
    })
    setItems(allItems)
    
    // Get week dates
    const now0 = new Date()
    const dates = []
    for (let i = 0; i < 5; i++) {
      dates.push(new Date(now0.getFullYear(), now0.getMonth(), now0.getDate() - now0.getDay() + i).getDate())
    }
    setWeekDates(dates)
  }, [])
  
  // Update today/current period every 60 seconds
  useEffect(() => {
    const updateNow = () => {
      const d = new Date()
      const day = d.getDay()
      const m = d.getHours() * 60 + d.getMinutes()
      
      setToday(day <= 4 ? day : null)
      
      let period = null
      PERIODS.forEach(p => {
        if (!p.brk && p.r && m >= p.r[0] && m < p.r[1]) {
          period = p.n
        }
      })
      setCurrentPeriod(period)
    }
    
    updateNow()
    const interval = setInterval(updateNow, 60000)
    return () => clearInterval(interval)
  }, [])
  
  const matches = useCallback((it) => {
    if (filter.k === 'all') return true
    if (filter.k === 'grade') return it.g === filter.v
    if (filter.k === 'stage') return it.st === filter.v
    return it.t === filter.v
  }, [filter])
  
  const counts = countItems(items)
  
  const chipCounts = {
    ...counts.gc,
    ...Object.fromEntries(Object.entries(STAGES).map(([key, stage]) => [
      key, stage.grades.reduce((sum, grade) => sum + (counts.gc[grade] || 0), 0)
    ])),
    prog: counts.tc.prog || 0,
    str: counts.tc.str || 0,
    fin: counts.tc.fin || 0
  }
  
  return {
    filter,
    setFilter,
    matches,
    chipCounts,
    today,
    currentPeriod,
    weekDates,
    items
  }
}
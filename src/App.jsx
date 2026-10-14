import React, { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar.jsx'
import TimetablePage from './features/timetable/TimetablePage.jsx'
import PlanPage from './features/timetable/PlanPage.jsx'
import { DAYS } from './features/timetable/timetableApi.jsx'

function App() {
  const [view, setView] = useState('tt')
  const [subtitle, setSubtitle] = useState('')
  const [todayDisabled, setTodayDisabled] = useState(false)
  
  useEffect(() => {
    if (window.location.hash === '#plan') {
      setView('plan')
    }
  }, [])
  
  // Check if today is a weekday (0-4 = Sun-Thu)
  useEffect(() => {
    const day = new Date().getDay()
    setTodayDisabled(day > 4)
  }, [])
  
  const handleTabClick = (tab) => {
    if (tab === 'tt') {
      setView('tt')
    } else {
      setView('plan')
    }
  }
  
  const openPlan = (scroll = true) => {
    setView('plan')
    if (!scroll) return
    
    setTimeout(() => {
      const current = document.querySelector('.wk.cur')
      const next = document.querySelector('.wk.next')
      const el = current || next || document.querySelector('.wk:last-child')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 60)
  }
  
  const handleTodayClick = () => {
    const day = new Date().getDay()
    if (day > 4) return
    
    const card = document.querySelector(`.day-card[data-day='${day}']`)
    if (card && card.offsetParent !== null) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    
    // Bump animation
    const ddElements = document.querySelectorAll(`.day-card[data-day='${day}'] .dd`)
    ddElements.forEach(el => {
      el.classList.remove('bump')
      void el.offsetWidth
      el.classList.add('bump')
    })
  }
  
  return (
    <main className="page" id="page">
      <Navbar 
        subtitle={subtitle} 
        disabled={todayDisabled} 
        onClick={handleTodayClick}
      />
      
      <nav className="tabs" role="tablist" aria-label="العرض">
        <button 
          className="tab" 
          role="tab" 
          id="tab-tt" 
          aria-selected={view === 'tt'} 
          aria-controls="view-tt" 
          type="button"
          onClick={() => handleTabClick('tt')}
        >
          الجدول الأسبوعي
        </button>
        <button 
          className="tab" 
          role="tab" 
          id="tab-plan" 
          aria-selected={view === 'plan'} 
          aria-controls="view-plan" 
          type="button"
          onClick={() => openPlan(false)}
        >
          خطة تانية ثانوي
        </button>
      </nav>

      <section className="view" id="view-tt" role="tabpanel" aria-labelledby="tab-tt" hidden={view !== 'tt'}>
        <TimetablePage onOpenPlan={openPlan} onSubtitleChange={setSubtitle} />
      </section>

      <section className="view" id="view-plan" role="tabpanel" aria-labelledby="tab-plan" hidden={view !== 'plan'}>
        <PlanPage />
      </section>
    </main>
  )
}

export default App
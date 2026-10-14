import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import TimetablePage from './features/timetable/TimetablePage.jsx'

function App() {
  const [subtitle, setSubtitle] = useState('')
  const [todayDisabled, setTodayDisabled] = useState(false)
  
  // Check if today is a weekday (0-4 = Sun-Thu)
  useEffect(() => {
    const day = new Date().getDay()
    setTodayDisabled(day > 4)
  }, [])
  
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
      
      <section className="view" id="view-timetable">
        <TimetablePage onSubtitleChange={setSubtitle} />
      </section>
    </main>
  )
}

export default App
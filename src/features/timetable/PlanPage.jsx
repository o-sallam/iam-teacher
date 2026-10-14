import React, { useState, useEffect } from 'react'
import { PLAN, KEYDATES, AR_MONTHS, D, fmt, bookHtml, platHtml, weekTitle, startOfDay, countdown, planFocus } from './planData.jsx'

function PlanPage() {
  const [curWeek, setCurWeek] = useState(null)
  const [nextWeek, setNextWeek] = useState(null)
  const [keydateCountdowns, setKeydateCountdowns] = useState({})
  
  // Refresh plan state every 60 seconds
  useEffect(() => {
    const refreshPlan = () => {
      const f = planFocus()
      const today = startOfDay(f.now)
      
      setCurWeek(f.cur)
      setNextWeek(f.next)
      
      // Update keydate countdowns
      const newCountdowns = {}
      KEYDATES.forEach((x, j) => {
        const s = D(x.d)
        const e = x.e ? D(x.e) : s
        const days = Math.round((s - today) / 864e5)
        newCountdowns[j] = (today >= s && today <= e) ? "جارٍ الآن" : countdown(days)
      })
      setKeydateCountdowns(newCountdowns)
    }
    
    refreshPlan()
    const interval = setInterval(refreshPlan, 60000)
    return () => clearInterval(interval)
  }, [])
  
  // Generate key dates
  const renderKeyDates = () => {
    return KEYDATES.map((x, j) => {
      const day = x.e ? x.d[2] + "–" + x.e[2] : x.d[2]
      const delay = (j * 0.04).toFixed(2) + 's'
      return (
        <div key={j} className={`kd k-${x.k}`} style={{ '--d': delay }}>
          <div className="dt">
            <b>{day}</b>
            <span>{AR_MONTHS[x.d[1] - 1]}</span>
          </div>
          <div className="tx">
            <b>{x.t}</b>
            <span data-kd={j}>{keydateCountdowns[j] || ''}</span>
          </div>
        </div>
      )
    })
  }
  
  // Generate weeks
  const renderWeeks = () => {
    const elements = []
    let lastTerm = 0
    let lastMon = ""
    let i = 0
    
    PLAN.forEach((w) => {
      const delay = Math.min(i++ * 0.04, 0.5).toFixed(2) + 's'
      
      // Term header
      if (w.term !== lastTerm) {
        elements.push(
          <h3 key={`term-${w.term}`} className="termh">
            {w.term === 1 ? "نهاية الفصل الأول" : "الفصل الدراسي الثاني 2026/2027"}
          </h3>
        )
        lastTerm = w.term
        lastMon = ""
      }
      
      // Month header
      const mk = w.d[0] + "-" + w.d[1]
      if (mk !== lastMon) {
        elements.push(
          <div key={`mon-${mk}`} className="mon">
            {AR_MONTHS[w.d[1] - 1] + " " + w.d[0]}
          </div>
        )
        lastMon = mk
      }
      
      // Missing weeks
      if (w.missing) {
        elements.push(
          <article key={w.id} className="wk missing" id={`wk-${w.id}`} style={{ '--d': delay }}>
            <p className="mute">{w.label}: الصفحة 4 من الخطة غير مرفقة. أرسلها لتظهر هنا.</p>
          </article>
        )
        return
      }
      
      // Week header
      const head = (
        <header className="wk-h">
          <span className="wk-n">{w.wk}</span>
          <div>
            <span className="wk-l">{w.term === 1 ? "الفصل الأول" : "الفصل الثاني"}</span>
            <span className="wk-d" style={{ display: 'block' }}>{fmt(w.d)}</span>
          </div>
          <span className="wk-tag"></span>
        </header>
      )
      
      // Blank week
      if (w.blank) {
        elements.push(
          <article key={w.id} className="wk blank" id={`wk-${w.id}`} data-id={w.id} style={{ '--d': delay }}>
            {head}
            <p className="mute">لا يوجد محتوى في هذا الأسبوع.</p>
          </article>
        )
        return
      }
      
      // Notes
      const notes = (w.weekly ? "<span class='nt'>أداءات وتقييمات أسبوعية</span>" : "") +
        (w.notes || []).map(n => `<span class='nt k-${n.k}'>${n.t}</span>`).join("")
      
      // Determine week classes
      let weekClasses = 'wk'
      if (curWeek === w) weekClasses += ' cur'
      else if (!curWeek && nextWeek === w) weekClasses += ' next'
      else {
        // Check if past
        const s = D(w.d)
        const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7)
        const now = new Date()
        if (e <= now) weekClasses += ' past'
      }
      
      elements.push(
        <article 
          key={w.id} 
          className={weekClasses} 
          id={`wk-${w.id}`} 
          data-id={w.id}
          style={{ '--d': delay }}
        >
          {head}
          <div className="blk bk">
            <div className="bl2">
              <span className="lab">الكتاب</span>
              <span className="per">ح {w.book.per}</span>
            </div>
            {bookHtml(w.book)}
          </div>
          <div className="blk pf">
            <div className="bl2">
              <span className="lab">المنصة</span>
              <span className="per">ح {w.plat.per}</span>
            </div>
            {platHtml(w.plat)}
          </div>
          {notes && <div className="wk-notes" dangerouslySetInnerHTML={{ __html: notes }}></div>}
        </article>
      )
    })
    
    return elements
  }
  
  return (
    <>
      <div className="phead">
        <h2>خطة البرمجة والذكاء الاصطناعي</h2>
        <p>الصف الثاني البكالوريا والمنصة اليابانية، العام الدراسي 2026/2027</p>
      </div>
      <h3 className="sec">المواعيد المهمة</h3>
      <div className="kds" id="kds">
        {renderKeyDates()}
      </div>
      <h3 className="sec">الأسابيع</h3>
      <div className="tl" id="tl">
        {renderWeeks()}
      </div>
      <p className="src">المصدر: توزيع محتوى المادة، صفحات الفصل الثاني 1 و2 و3 و5 وصفحة 6 من نهاية الفصل الأول. الصفحة 4 (الأسابيع 10 إلى 12) غير مرفقة.</p>
    </>
  )
}

export default PlanPage
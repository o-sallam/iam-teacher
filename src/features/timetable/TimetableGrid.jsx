import React from 'react'
import { DAYS, PERIODS, colorClass, body, planAttrs, getDates } from './timetableApi.jsx'

function TimetableGrid({ items, dimmedItems, today, currentPeriod, onOpenPlan }) {
  const dates = getDates()
  
  // Handle plan click
  const handleKeyDown = (e, item) => {
    if ((e.key === 'Enter' || e.key === ' ') && item.plan) {
      e.preventDefault()
      onOpenPlan(true)
    }
  }
  
  // Build table
  const renderTable = () => {
    const colCounts = {}
    let col = 0
    
    return (
      <div className="board" dir="ltr">
        <table id="tt">
          <caption style={{ position: 'absolute', left: '-9999px' }}>الجدول الأسبوعي للمعلم عمر</caption>
          <thead>
            <tr>
              <th className="day"></th>
              {PERIODS.map((p, i) => {
                if (p.brk) {
                  col++
                  return (
                    <th key={i} className="brk">
                      <span className="bl">استراحة</span>
                      <span className="tm">{p.t}</span>
                    </th>
                  )
                }
                col++
                return (
                  <th key={i}>
                    <span className="pn">{p.n}</span>
                    <span className="tm">{p.t}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((d, i) => (
              <tr key={i}>
                <th className={`day ${today === i ? 'today' : ''}`} scope="row" data-day={i}>
                  <span className="dn">{d}</span>
                  <span className="dd">{dates[i]}</span>
                </th>
                {(() => {
                  let colNum = 0
                  return PERIODS.map((p, pIdx) => {
                    colNum++
                    if (p.brk) {
                      if (i === 0) {
                        return <td key={pIdx} className="brk" rowSpan={5}></td>
                      }
                      return null
                    }
                    
                    const it = items.find(item => item.day === i && item.period === p.n)
                    const delay = (0.12 + i * 0.06 + colNum * 0.05).toFixed(2) + 's'
                    const key = `${i}-${p.n}`
                    const isDimmed = dimmedItems.has(key)
                    const isNow = currentPeriod === p.n && today === i
                    
                    if (!it) {
                      return (
                        <td key={pIdx} className="free" style={{ '--d': delay }}>
                        </td>
                      )
                    }
                    
                    const cls = colorClass(it)
                    const planAttr = planAttrs(it)
                    
                    return (
                      <td 
                        key={pIdx} 
                        className={`lesson ${cls} ${isNow ? 'now' : ''}`} 
                        data-day={i} 
                        data-p={p.n}
                        style={{ '--d': delay }}
                      >
                        <i className="live" title="الآن"></i>
                        <div 
                          className={`slot ${isDimmed ? 'dim' : ''}`}
                          {...planAttr}
                          onClick={() => it.plan && onOpenPlan(true)}
                          onKeyDown={(e) => handleKeyDown(e, it)}
                        >
                          {body(it)}
                        </div>
                      </td>
                    )
                  })
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  // Build mobile day cards
  const renderMobileCards = () => {
    return (
      <div className="days" id="days">
        {DAYS.map((d, i) => {
          const dayItems = items.filter(it => it.day === i)
          const delay = (0.08 + i * 0.07).toFixed(2) + 's'
          const isToday = today === i
          
          return (
            <section 
              key={i} 
              className={`day-card ${isToday ? 'today' : ''}`} 
              data-day={i}
              style={{ '--d': delay }}
            >
              <h2>
                <span className="dd">{dates[i]}</span>
                {d}
                {isToday && <span className="tag">اليوم</span>}
                <span className="count">{dayItems.length} حصص</span>
              </h2>
              <ul>
                {dayItems.map((it, idx) => {
                  const p = PERIODS.find(p => !p.brk && p.n === it.period)
                  const key = `${i}-${it.period}`
                  const isDimmed = dimmedItems.has(key)
                  const isNow = currentPeriod === it.period && today === i
                  const planAttr = planAttrs(it)
                  
                  return (
                    <li 
                      key={idx}
                      className={`row ${colorClass(it)} ${isNow ? 'now' : ''}`}
                      data-day={i}
                      data-p={it.period}
                      {...planAttr}
                      onClick={() => it.plan && onOpenPlan(true)}
                      onKeyDown={(e) => handleKeyDown(e, it)}
                    >
                      <i className="live" title="الآن"></i>
                      <div className="when">
                        <b>{it.period}</b>
                        <span>{p ? p.t : ''}</span>
                      </div>
                      <div className={`what ${isDimmed ? 'dim' : ''}`}>
                        {body(it)}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    )
  }
  
  return (
    <>
      {renderTable()}
      {renderMobileCards()}
    </>
  )
}

export default TimetableGrid
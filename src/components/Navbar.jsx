import React from 'react'

function Navbar({ subtitle, disabled, onClick, onOpenPlan }) {
  return (
    <header className="bar">
      <span className="logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h5v5H7z"/></svg>
      </span>
      <div className="titles">
        <h1>جدول أ/ عمر</h1>
        <p id="sub">{subtitle}</p>
      </div>
      <button className="today-btn" id="todayBtn" type="button" disabled={disabled} onClick={onClick}>اليوم</button>
    </header>
  )
}

export default Navbar
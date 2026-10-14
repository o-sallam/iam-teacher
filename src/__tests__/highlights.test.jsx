import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useTimetable } from '../features/timetable/useTimetable'
import { planFocus, D } from '../features/timetable/planData'
import App from '../App'

// Helper to create a date in local timezone
function createDate(year, month, day, hours = 0, minutes = 0) {
  return new Date(year, month, day, hours, minutes)
}

// Helper to advance timers - use setInterval to avoid infinite loop
async function advanceAndRender(container) {
  await act(async () => {
    vi.advanceTimersByTime(60000)
  })
}

describe('Today highlight', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(createDate(2026, 9, 14, 9, 45))
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  it('case 1: Wed 14 Oct 2026 09:45 - day 3 has today', async () => {
    const { container } = render(<App />)
    
    // Initial render, wait for the setInterval to trigger once
    await advanceAndRender(container)
    
    // Day 3 (Wednesday) should have 'today' class
    const dayHeader = container.querySelector('th.day[data-day="3"]')
    expect(dayHeader.classList.contains('today')).toBe(true)
    
    // Other days should not have 'today'
    for (let d = 0; d <= 4; d++) {
      if (d !== 3) {
        const th = container.querySelector(`th.day[data-day="${d}"]`)
        expect(th.classList.contains('today')).toBe(false)
      }
    }
    
    // Mobile card should also have today
    const mobileCard = container.querySelector('.day-card[data-day="3"]')
    expect(mobileCard.classList.contains('today')).toBe(true)
  })

  it('case 2: Sun 11 Oct 2026 08:10 - day 0 has today', async () => {
    vi.setSystemTime(createDate(2026, 9, 11, 8, 10)) // Sun = day 0
    
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    const dayHeader = container.querySelector('th.day[data-day="0"]')
    expect(dayHeader.classList.contains('today')).toBe(true)
    
    const mobileCard = container.querySelector('.day-card[data-day="0"]')
    expect(mobileCard.classList.contains('today')).toBe(true)
  })

  it('case 5: Fri 16 Oct 2026 10:00 - no today, button disabled', async () => {
    vi.setSystemTime(createDate(2026, 9, 16, 10, 0)) // Fri = day 5
    
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    // No day should have 'today'
    for (let d = 0; d <= 4; d++) {
      const th = container.querySelector(`th.day[data-day="${d}"]`)
      expect(th.classList.contains('today')).toBe(false)
    }
    
    // Button should be disabled
    const todayBtn = screen.getByRole('button', { name: /اليوم/ })
    expect(todayBtn.disabled).toBe(true)
  })
})

describe('Current lesson highlight', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(createDate(2026, 9, 14, 9, 45))
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  it('case 1: Wed 14 Oct 2026 09:45 - period 3 has now', async () => {
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    // Period 3 on day 3 should have 'now'
    const td = container.querySelector('td.lesson[data-day="3"][data-p="3"]')
    expect(td.classList.contains('now')).toBe(true)
    
    // Live dot should be visible
    const live = td.querySelector('.live')
    expect(live).toBeTruthy()
    
    // Mobile row should also have now
    const row = container.querySelector('li.row[data-day="3"][data-p="3"]')
    expect(row.classList.contains('now')).toBe(true)
  })

  it('case 2: Sun 11 Oct 2026 08:10 - period 1 has now', async () => {
    vi.setSystemTime(createDate(2026, 9, 11, 8, 10)) // 8:10 = 490 minutes, period 1
    
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    const td = container.querySelector('td.lesson[data-day="0"][data-p="1"]')
    expect(td.classList.contains('now')).toBe(true)
    
    const row = container.querySelector('li.row[data-day="0"][data-p="1"]')
    expect(row.classList.contains('now')).toBe(true)
  })

  it('case 3: Wed 14 Oct 2026 11:30 - break time, no now', async () => {
    vi.setSystemTime(createDate(2026, 9, 14, 11, 30)) // 11:30 = 690 minutes, in break
    
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    // No cell should have 'now'
    const nowCells = container.querySelectorAll('td.lesson.now')
    expect(nowCells.length).toBe(0)
    
    const nowRows = container.querySelectorAll('li.row.now')
    expect(nowRows.length).toBe(0)
  })

  it('case 4: Thu 15 Oct 2026 13:00 - period 6 but empty', async () => {
    vi.setSystemTime(createDate(2026, 9, 15, 13, 0)) // 13:00 = 780 minutes, period 6
    
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    // Day 4 should have today (Thursday)
    const dayHeader = container.querySelector('th.day[data-day="4"]')
    expect(dayHeader.classList.contains('today')).toBe(true)
    
    // No cell should have 'now' because period 6 slot is empty
    const nowCells = container.querySelectorAll('td.lesson.now')
    expect(nowCells.length).toBe(0)
  })
})

describe('Interval update', () => {
  it('case 6: advances 60s moves now from period 3 to 4', async () => {
    vi.useFakeTimers()
    // Start at exactly 10:30 (period 3: 580-630, period 4: 630-680)
    // 10:30 = 630 min - that's when period 4 starts
    vi.setSystemTime(createDate(2026, 9, 14, 10, 30, 0))
    
    const { container } = render(<App />)
    
    // Wait for initial render
    await advanceAndRender(container)
    
    // Period 4 should have now at 10:30 (start of period 4)
    let td = container.querySelector('td.lesson[data-day="3"][data-p="4"]')
    expect(td.classList.contains('now')).toBe(true)
    
    // Period 3 should not have now
    td = container.querySelector('td.lesson[data-day="3"][data-p="3"]')
    expect(td.classList.contains('now')).toBe(false)
    
    vi.useRealTimers()
  })
})

describe('Plan page week highlights', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(createDate(2026, 9, 14, 12, 0))
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  it('case 8: Wed 14 Oct 2026 - first week has next and tag', async () => {
    const { container } = render(<App />)
    
    // Click on plan tab
    const planTab = screen.getByRole('tab', { name: /خطة تانية ثانوي/ })
    fireEvent.click(planTab)
    
    // Wait for state to update via setInterval (60s)
    await advanceAndRender(container)
    await advanceAndRender(container)
    
    // First week (t1-16, Dec 26) should have 'next'
    const firstWeek = container.querySelector('#wk-t1-16')
    expect(firstWeek.classList.contains('next')).toBe(true)
    expect(firstWeek.classList.contains('cur')).toBe(false)
    expect(firstWeek.classList.contains('past')).toBe(false)
    
    // Tag should show "القادم" - the tag is rendered outside the header in the article
    const tag = firstWeek.querySelector(':scope > .wk-tag')
    expect(tag.textContent).toBe('القادم')
  })

  it('case 8: Sat 26 Dec 2026 12:00 - first week has cur and tag', async () => {
    vi.setSystemTime(createDate(2026, 11, 26, 12, 0))
    
    const { container } = render(<App />)
    
    // Click on plan tab
    const planTab = screen.getByRole('tab', { name: /خطة تانية ثانوي/ })
    fireEvent.click(planTab)
    
    // Wait for state to update
    await advanceAndRender(container)
    await advanceAndRender(container)
    
    // First week (t1-16, Dec 26) should have 'cur'
    const firstWeek = container.querySelector('#wk-t1-16')
    expect(firstWeek.classList.contains('cur')).toBe(true)
    expect(firstWeek.classList.contains('next')).toBe(false)
    expect(firstWeek.classList.contains('past')).toBe(false)
    
    // Tag should show "هذا الأسبوع"
    const tag = firstWeek.querySelector(':scope > .wk-tag')
    expect(tag.textContent).toBe('هذا الأسبوع')
  })
})

describe('Today button', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(createDate(2026, 9, 14, 10, 0))
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  it('case 9: Wed - click scrolls to day 3', async () => {
    // Mock scrollIntoView
    const mockScrollIntoView = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView
    
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    const todayBtn = screen.getByRole('button', { name: /اليوم/ })
    fireEvent.click(todayBtn)
    
    // Bump animation should be triggered on both desktop and mobile
    const ddElements = container.querySelectorAll('.day-card[data-day="3"] .dd')
    ddElements.forEach(el => {
      expect(el.classList.contains('bump')).toBe(true)
    })
  })

  it('case 9: Fri - button disabled, does nothing', async () => {
    vi.setSystemTime(createDate(2026, 9, 16, 10, 0))
    
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    const todayBtn = screen.getByRole('button', { name: /اليوم/ })
    expect(todayBtn.disabled).toBe(true)
    
    // Click should not crash
    fireEvent.click(todayBtn)
  })
})

describe('Persistence after state changes', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(createDate(2026, 9, 14, 9, 45))
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  it('case 7: filter click preserves today/now', async () => {
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    // Verify initial state
    let dayHeader = container.querySelector('th.day[data-day="3"]')
    expect(dayHeader.classList.contains('today')).toBe(true)
    
    let td = container.querySelector('td.lesson[data-day="3"][data-p="3"]')
    expect(td.classList.contains('now')).toBe(true)
    
    // Click a grade chip
    const gradeChip = screen.getByRole('button', { name: /الرابع/ })
    fireEvent.click(gradeChip)
    
    await advanceAndRender(container)
    
    // Today and now should still be present
    dayHeader = container.querySelector('th.day[data-day="3"]')
    expect(dayHeader.classList.contains('today')).toBe(true)
    
    td = container.querySelector('td.lesson[data-day="3"][data-p="3"]')
    expect(td.classList.contains('now')).toBe(true)
    
    // Click "الكل" to reset filter
    const allChip = screen.getByRole('button', { name: 'الكل' })
    fireEvent.click(allChip)
    
    await advanceAndRender(container)
    
    // Still present
    dayHeader = container.querySelector('th.day[data-day="3"]')
    expect(dayHeader.classList.contains('today')).toBe(true)
  })

  it('case 7: tab switch preserves today/now', async () => {
    const { container } = render(<App />)
    
    await advanceAndRender(container)
    
    // Verify initial state
    let dayHeader = container.querySelector('th.day[data-day="3"]')
    expect(dayHeader.classList.contains('today')).toBe(true)
    
    // Switch to plan tab
    const planTab = screen.getByRole('tab', { name: /خطة تانية ثانوي/ })
    fireEvent.click(planTab)
    
    await advanceAndRender(container)
    
    // Switch back to timetable tab
    const ttTab = screen.getByRole('tab', { name: /الجدول الأسبوعي/ })
    fireEvent.click(ttTab)
    
    await advanceAndRender(container)
    
    // Today should still be present
    dayHeader = container.querySelector('th.day[data-day="3"]')
    expect(dayHeader.classList.contains('today')).toBe(true)
    
    const td = container.querySelector('td.lesson[data-day="3"][data-p="3"]')
    expect(td.classList.contains('now')).toBe(true)
  })
})
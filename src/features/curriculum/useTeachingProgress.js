import { useCallback, useRef, useState } from 'react'
import { readProgress, STORAGE_KEY } from './curriculum.js'

export function useTeachingProgress() {
  const [initial] = useState(() => {
    try { return readProgress(window.localStorage) }
    catch { return readProgress({ getItem() { throw new Error('Storage unavailable') } }) }
  })
  const [progress, setProgress] = useState(initial.progress)
  const progressRef = useRef(progress)
  const [storageError, setStorageError] = useState(initial.error)

  const update = useCallback(transform => {
    const next = transform(progressRef.current)
    if (next === progressRef.current) return
    progressRef.current = next
    setProgress(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setStorageError('')
    } catch {
      setStorageError('تعذر حفظ التقدم في هذا المتصفح. التغييرات الحالية ستُفقد عند إغلاق الصفحة؛ أتح التخزين ثم أعد الحفظ.')
    }
  }, [])

  const retrySave = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progressRef.current))
      setStorageError('')
    } catch {
      setStorageError('ما زال الحفظ غير متاح. أتح التخزين في المتصفح ثم أعد المحاولة.')
    }
  }

  return { progress, update, storageError, retrySave }
}

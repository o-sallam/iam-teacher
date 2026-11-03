import React from 'react'

export default function StorageNotice({ error, onRetry }) {
  if (!error) return null
  return <div className="storage-error" role="alert">
    <span>{error}</span>
    <button className="text-action" type="button" onClick={onRetry}>إعادة حفظ التقدم</button>
  </div>
}

import { useState, useEffect } from 'react'

function useTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Placeholder
  }, [])
  
  return { teachers, loading }
}

export default useTeachers
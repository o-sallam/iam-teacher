import { useState, useEffect } from 'react'

function useSubjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Placeholder
  }, [])
  
  return { subjects, loading }
}

export default useSubjects
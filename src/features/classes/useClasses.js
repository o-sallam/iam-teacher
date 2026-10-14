import { useState, useEffect } from 'react'

function useClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Placeholder
  }, [])
  
  return { classes, loading }
}

export default useClasses
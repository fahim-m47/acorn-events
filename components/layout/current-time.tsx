'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function CurrentTime() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      setTime(format(new Date(), "h:mm a 'EST'"))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return null

  return (
    <span className="text-sm text-white font-medium hidden md:block">
      {time}
    </span>
  )
}

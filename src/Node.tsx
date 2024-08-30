import { FC, useEffect, useState } from 'react'
import './Node.css'

export const Node: FC = () => {
  const [ count, setCount ] = useState(0)

  useEffect(() => {
    if (count === 0) {
      setCount(1)
    }
  }, [ count ])

  return (
    <div className='bg-red-600'>Hello World { count }</div>
  )
}
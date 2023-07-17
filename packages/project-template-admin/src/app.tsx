import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { client } from './globalConfig'

export const App: React.FC = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const x = client.test.subscribe('999999', {
      onData:(v)=>{
        console.log(v)
      }
    })
    return ()=>x.unsubscribe()

  }, [])
  return (<>
    <Button onClick={() => setCount(count + 1)}>{count}</Button>
  </>)
}


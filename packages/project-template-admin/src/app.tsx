import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { trpcClient } from './globalConfig'

export const App: React.FC = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const x = trpcClient.test.subscribe('999999', {
      onData: (v) => {
        console.log(v)
      },
    })
    return () => x.unsubscribe()

  }, [count])
  return (<>
    <Button onClick={() => setCount(count + 1)}>{count}</Button>
  </>)
}


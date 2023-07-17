import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { client } from './globalConfig'

export const App: React.FC = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    client.test.query('999999')
  }, [])
  return (<>
    <Button onClick={() => setCount(count + 1)}>{count}</Button>
  </>)
}


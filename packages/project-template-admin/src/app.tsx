import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { trpcClient } from './socket'

export const App: React.FC = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const x = Promise.resolve()
      .then(async () => {
        await trpcClient.auth.login.mutate({
          username: 'admin',
          password: '123456',
        }).then(() => {
          console.log('success1')
        }).catch((e) => {
          console.log('fail1', e)
        })
      }).then(async () => {
        await trpcClient.auth.login.mutate({
          username: 'adminxx',
          password: '123456',
        }).then((e) => {
          console.log('success2', e)
        })
      }).then(async () => {
        await trpcClient.auth.login.mutate({
          username: 'admin',
          password: '123456',
        }).then(() => {
          console.log('success3')
        }).catch((e) => {
          console.log('fail3', e)
        })
      })

  }, [count])
  return (<>
    <Button onClick={() => setCount(count + 1)}>{count}</Button>
  </>)
}


import { useEffect } from 'react'

function Index({ user, userFollowStats }) {
  useEffect(() => {
    document.title = `Welcome, ${user.name.split(' ')[0]}`
  }, [])
  return <div>Home</div>
}

export default Index

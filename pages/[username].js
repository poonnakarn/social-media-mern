import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import { parseCookies } from 'nookies'
import { NoProfile } from '../components/Layout/NoData'
import cookie from 'js-cookie'

function ProfilePage({
  profile,
  followersLength,
  followingLength,
  errorLoading,
  user,
  userFollowStats,
}) {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true)
      try {
        const { username } = router.query
        const token = cookie.get('token')

        const res = axios.get(`${baseUrl}/api/profile/posts/${username}`, {
          headers: { Authorization: token },
        })

        setPosts(res.data)
      } catch (error) {
        alert('Error loading posts')
      }
    }

    getPosts()
  }, [])

  if (errorLoading) return <NoProfile />

  return <div></div>
}

// ProfilePage.getInitialProps = async (ctx) => {
//   const { username } = ctx.query

//   console.log({ username })
//   return {}
// }

ProfilePage.getInitialProps = async (ctx) => {
  try {
    const { username } = ctx.query
    const { token } = parseCookies(ctx)

    const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
      headers: {
        Authorization: token,
      },
    })

    const { profile, followersLength, followingLength } = res.data

    return { profile, followersLength, followingLength }
  } catch (error) {
    return { errorLoading: true }
  }
}

export default ProfilePage

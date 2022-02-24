import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import { parseCookies } from 'nookies'
import { NoProfile } from '../components/Layout/NoData'
import cookie from 'js-cookie'
import { Grid } from 'semantic-ui-react'
import ProfileMenuTabs from '../components/Profile/ProfileMenuTabs'
import ProfileHeader from '../components/Profile/ProfileHeader'
import { PlaceHolderPosts } from '../components/Layout/PlaceHolderGroup'
import CardPost from '../components/Post/CardPost'
import { PostDeleteToastr } from '../components/Layout/Toastr'

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

  const [activeItem, setActiveItem] = useState('profile')
  const handleItemClick = (item) => setActiveItem(item)

  const [loggedUserFollowStats, setLoggedUserFollowStats] =
    useState(userFollowStats)

  const [showToastr, setShowToastr] = useState(false)

  const ownAccount = profile.user._id === user._id

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true)
      try {
        const { username } = router.query
        const token = cookie.get('token')

        const res = await axios.get(
          `${baseUrl}/api/profile/posts/${username}`,
          {
            headers: { Authorization: token },
          }
        )

        setPosts(res.data)
        // console.log(res.data)
      } catch (error) {
        alert('Error loading posts')
      }
      setLoading(false)
    }

    getPosts()
  }, [])

  useEffect(() => {
    showToastr && setTimeout(() => setShowToastr(false), 3000)
  }, [showToastr])

  if (errorLoading) return <NoProfile />

  return (
    <>
      {showToastr && <PostDeleteToastr />}
      <Grid stackable>
        <Grid.Row>
          <Grid.Column>
            <ProfileMenuTabs
              activeItem={activeItem}
              handleItemClick={handleItemClick}
              followersLength={followersLength}
              followingLength={followingLength}
              ownAccount={ownAccount}
              loggedUserFollowStats={loggedUserFollowStats}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            {activeItem === 'profile' && (
              <>
                <ProfileHeader
                  profile={profile}
                  ownAccount={ownAccount}
                  loggedUserFollowStats={loggedUserFollowStats}
                  setLoggedUserFollowStats={setLoggedUserFollowStats}
                />

                {loading ? (
                  <PlaceHolderPosts />
                ) : (
                  posts.length > 0 &&
                  posts.map((post) => (
                    <CardPost
                      key={post._id}
                      post={post}
                      user={user}
                      setPosts={setPosts}
                      setShowToastr={setShowToastr}
                    />
                  ))
                )}
              </>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  )
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

import { useState, useEffect } from 'react'
import { Button, Image, List } from 'semantic-ui-react'
import Spinner from '../Layout/Spinner'
import axios from 'axios'
import baseUrl from '../../utils/baseUrl'
import cookies from 'js-cookie'

import { NoFollowData } from '../Layout/NoData'

function Following({
  user,
  loggedUserFollowStats,
  setUserFollowStats,
  profileUserId,
}) {
  const [following, setFollowing] = useState()
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    const getFollowing = async () => {
      setLoading(true)

      try {
        const res = await axios.get(
          `${baseUrl}/api/profile/following/${profileUserId}`,
          { headers: { Authorization: cookies.get('token') } }
        )
        setFollowing(res.data)
        // console.log(followers)
      } catch (error) {
        alert('Error Loading Followers')
      }

      setLoading(false)
    }

    getFollowing()
  }, [])

  return (
    <>
      {loading ? (
        <Spinner />
      ) : following.length > 0 ? (
        following.map((profileFollowing) => {
          const isFollowing =
            loggedUserFollowStats.following.length > 0 &&
            loggedUserFollowStats.following.filter(
              (following) => following.user === profileFollowing.user._id
            ).length > 0

          return (
            <>
              <List
                key={profileFollowing.user._id}
                divided
                verticalAlign='middle'
              >
                <List.Item>
                  <List.Content floated='right'>
                    {profileFollowing.user._id !== user._id && (
                      <Button
                        color={isFollowing ? 'instagram' : 'twitter'}
                        content={isFollowing ? 'Following' : 'Follow'}
                        icon={isFollowing ? 'check' : 'add user'}
                        disabled={followLoading}
                      />
                    )}
                  </List.Content>
                  <Image avatar src={profileFollowing.user.profilePicUrl} />
                  <List.Content
                    as='a'
                    href={`/${profileFollowing.user.username}`}
                  >
                    {profileFollowing.user.name}
                  </List.Content>
                </List.Item>
              </List>
            </>
          )
        })
      ) : (
        <NoFollowData followeingComponent={true} />
      )}
    </>
  )
}
export default Following

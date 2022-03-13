import axios from 'axios'
import baseUrl from './baseUrl'
import catchErrors from './catchErrors'
import cookie from 'js-cookie'

const Axios = axios.create({
  baseURL: `${baseUrl}/api/profile`,
  headers: { Authorization: cookie.get('token') },
})

export const followUser = async (userToFollowId, setUserFollowStat) => {
  try {
    await Axios.post(`/follow/${userToFollowId}`)

    setUserFollowStat((prev) => ({
      ...prev,
      following: [...prev.following, { user: userToFollowId }],
    }))
  } catch (error) {
    alert(catchErrors(error))
  }
}

export const unFollowUser = async (userToUnfollowId, setUserFollowStat) => {
  try {
    await Axios.put(`/unfollow/${userToUnfollowId}`)

    setUserFollowStat((prev) => ({
      ...prev,
      following: prev.following.filter(
        (following) => following.user !== userToUnfollowId
      ),
    }))
  } catch (error) {
    alert(catchErrors(error))
  }
}

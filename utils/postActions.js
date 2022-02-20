import axios from 'axios'
import baseUrl from './baseUrl'
import catchError from './catchErrors'
import cookie from 'js-cookie'

// preconfig axios with headers and baseUrl
const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: { Authorization: cookie.get('token') },
})

export const submitNewPost = async (
  text,
  location,
  picUrl,
  setPosts,
  setNewPost,
  setError
) => {
  try {
    const res = await Axios.post('/', { text, location, picUrl })

    setPosts((prev) => [res.data, ...prev])

    setNewPost({ text: '', location: '' })
  } catch (error) {
    const errorMsg = catchError(error)
    setError(errorMsg)
  }
}

export const deletePost = async (postId, setPosts, setShowToastr) => {
  try {
    await Axios.delete(`/${postId}`)
    setPosts((prev) => prev.filter((post) => post._id !== postId))
    setShowToastr(true)
  } catch (error) {
    alert(catchError(error))
  }
}

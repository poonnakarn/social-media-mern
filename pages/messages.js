import { useState } from 'react'
import axios from 'axios'
import { parseCookies } from 'nookies'

import baseUrl from '../utils/baseUrl'

function Messages({ chatsData, errorLoading }) {
  const [chats, setChats] = useState(chatsData)
  return <div>Messages</div>
}

Messages.getInitialProps = async (ctx) => {
  try {
    // Get token
    const { token } = parseCookies(ctx)

    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: {
        Authorization: token,
      },
    })

    return { chatsData: res.data }
  } catch (error) {
    return { errorLoading: true }
  }
}

export default Messages

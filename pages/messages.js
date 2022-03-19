import { parseCookies } from 'nookies'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import {
  Comment,
  Divider,
  Grid,
  Header,
  Icon,
  Segment,
} from 'semantic-ui-react'
import io from 'socket.io-client'

import baseUrl from '../utils/baseUrl'
import Chat from '../components/Chats/Chat'
import ChatListSearch from '../components/Chats/ChatListSearch'
import { NoMessages } from '../components/Layout/NoData'

function Messages({ chatsData, errorLoading, user }) {
  const [chats, setChats] = useState(chatsData)
  const router = useRouter()

  const socket = useRef()

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl)
    }

    if (socket.current) {
      socket.current.emit('helloWorld', {
        name: 'John Doe',
        age: '22',
      })

      socket.current.on('dataReceived', ({ msg }) => {
        console.log(msg)
      })
    }

    if (chats.length > 0 && !router.query.message)
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      })
  }, [])

  return (
    <Segment padded basic size='large' style={{ marginTop: '5px' }}>
      <Header
        icon='home'
        content='Go Back!'
        onClick={() => router.push('/')}
        style={{ cursor: 'pointer' }}
      />
      <Divider hidden />
      <div style={{ marginBottom: '10px' }}>
        <ChatListSearch chats={chats} setChats={setChats} />
      </div>

      {chats.length > 0 ? (
        <>
          <Grid stackable>
            <Grid.Column width={4}>
              <Comment.Group size='big'>
                <Segment
                  raised
                  style={{ overflow: 'auto', maxHeight: '32rem' }}
                >
                  {chats.map((chat, i) => (
                    <Chat key={i} chat={chat} setChats={setChats} />
                  ))}
                </Segment>
              </Comment.Group>
            </Grid.Column>
          </Grid>
        </>
      ) : (
        <NoMessages />
      )}
    </Segment>
  )
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

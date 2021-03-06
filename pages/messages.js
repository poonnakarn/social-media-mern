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
import Message from '../components/Messages/Message'
import MessageInputField from '../components/Messages/MessageInputField'
import Banner from '../components/Messages/Banner'
import getUserInfo from '../utils/getUserInfo'

function Messages({ chatsData, errorLoading, user }) {
  const [chats, setChats] = useState(chatsData)
  const router = useRouter()
  const [connectedUsers, setConnectedUsers] = useState([])
  const socket = useRef()

  const [messages, setMessages] = useState([])
  const [bannerData, setBannerData] = useState({ name: '', profilePicUrl: '' })

  // This ref is for persisting the state of query string in url through re-renders
  const openChatId = useRef('')

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl)
    }

    if (socket.current) {
      socket.current.emit('join', { userId: user._id })

      socket.current.on('connectedUsers', ({ users }) => {
        users.length > 0 && setConnectedUsers(users)
      })
    }

    if (chats.length > 0 && !router.query.message)
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      })

    // Clean up function
    return () => {
      if (socket.current) {
        socket.current.disconnect()
        socket.current.off()
      }
    }
  }, [])

  // LOAD MESSAGES
  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit('loadMessages', {
        userId: user._id,
        messagesWith: router.query.message,
      })

      socket.current.on('messagesLoaded', ({ chat }) => {
        // console.log(chat)

        setMessages(chat.messages)
        setBannerData({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl,
        })

        openChatId.current = chat.messagesWith._id
      })

      socket.current.on('noChatFound', async () => {
        const { name, profilePicUrl } = await getUserInfo(router.query.message)

        setBannerData({ name, profilePicUrl })
        setMessages([])
        openChatId.current = router.query.message
      })
    }

    if (socket.current && router.query.message) {
      loadMessages()
    }
  }, [router.query.message])

  // SENDING MESSAGES
  const sendMsg = (msg) => {
    if (socket.current) {
      console.log(openChatId.current)
      socket.current.emit('sendNewMsg', {
        userId: user._id,
        msgSendToUserId: openChatId.current,
        msg,
      })
    }
  }

  useEffect(() => {
    if (socket.current) {
      socket.current.on('msgSent', ({ newMsg }) => {
        if (newMsg.receiver === openChatId.current) {
          setMessages((prev) => [...prev, newMsg])
        }

        setChats((prev) => {
          const previousChat = prev.find(
            (chat) => chat.messagesWith === newMsg.receiver
          )

          previousChat.lastMessage = newMsg.msg
          previousChat.date = newMsg.date

          return [...prev]
        })
      })
    }
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
                    <Chat
                      connectedUsers={connectedUsers}
                      key={i}
                      chat={chat}
                      setChats={setChats}
                    />
                  ))}
                </Segment>
              </Comment.Group>
            </Grid.Column>
            <Grid.Column width={12}>
              {router.query.message && (
                <>
                  <div
                    style={{
                      overflow: 'auto',
                      overflowX: 'hidden',
                      maxHeight: '35rem',
                      height: '35rem',
                      backgroundColor: 'whitesmoke',
                    }}
                  >
                    <>
                      <div style={{ position: 'sticky', top: '0' }}>
                        <Banner bannerData={bannerData} />
                      </div>
                      {messages.length > 0 && (
                        <>
                          {messages.map((message, i) => (
                            <Message
                              bannerProfilePic={bannerData.profilePicUrl}
                              key={i}
                              message={message}
                              user={user}
                              setMessages={setMessages}
                              messagesWith={openChatId.current}
                            />
                          ))}
                        </>
                      )}
                    </>
                  </div>
                  <MessageInputField sendMsg={sendMsg} />
                </>
              )}
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

// no code 2

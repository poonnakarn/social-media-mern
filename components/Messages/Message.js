import { useState } from 'react'
import { Icon, Popup } from 'semantic-ui-react'
import calculateTime from '../../utils/calculateTime'

function Message({
  message,
  user,
  setMessages,
  messagesWith,
  bannerProfilePic,
}) {
  const [showDeleteIcon, setShowDeleteIcon] = useState(false)
  const ifYouSender = message.sender === user._id

  return (
    <div className='bubbleWrapper'>
      <div
        className={ifYouSender ? 'inlineContainer own' : 'inlineContainer'}
        onClick={() => ifYouSender && setShowDeleteIcon(!showDeleteIcon)}
      >
        <img
          src={ifYouSender ? user.profilePicUrl : bannerProfilePic}
          className='inlineIcon'
        />
        <div className={ifYouSender ? 'ownBubble own' : 'otherBubble other'}>
          {message.msg}
        </div>

        {showDeleteIcon && (
          <Popup
            trigger={
              <Icon name='trash' color='red' style={{ cursor: 'pointer' }} />
            }
            content='This will only delete the message from your inbox!'
            position='top right'
          />
        )}
      </div>
      <span className={ifYouSender ? 'own' : 'other'}>
        {calculateTime(message.date)}
      </span>
    </div>
  )
}
export default Message

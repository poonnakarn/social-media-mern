import moment from 'moment'
import Moment from 'react-moment'

const calculateTime = (createdAt) => {
  const TODAY = moment(Date.now()).startOf('day')
  const YESTERDAY = moment(Date.now()).subtract(1, 'days').startOf('day')
  const postDate = moment(createdAt).startOf('day')

  // const diffInHours = TODAY.diff(postDate, 'days')

  if (postDate.isSame(TODAY, 'd')) {
    return (
      <>
        Today <Moment format='hh:mm A'>{createdAt}</Moment>
      </>
    )
  } else if (postDate.isSame(YESTERDAY, 'd')) {
    return (
      <>
        Yesterday <Moment format='hh:mm A'>{createdAt}</Moment>
      </>
    )
  } else {
    return <Moment format='DD/MM/YYYY hh:mm A'>{createdAt}</Moment>
  }
}

export default calculateTime

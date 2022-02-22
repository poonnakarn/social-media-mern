import { useRouter } from 'next/router'
function ProfilePage() {
  const router = useRouter()
  const { username } = router.query
  return <div>{username}</div>
}

// ProfilePage.getInitialProps = async (ctx) => {
//   const { username } = ctx.query

//   console.log({ username })
//   return {}
// }

export default ProfilePage

import { Icon, Message, Divider } from 'semantic-ui-react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export const HeaderMessage = () => {
  const router = useRouter()
  const signupRoute = router.pathname === '/signup'

  return (
    <Message
      attached
      header={signupRoute ? 'ลงทะเบียน' : 'ยินดีต้อนรับกลับ'}
      icon={signupRoute ? 'settings' : 'privacy'}
      content={
        signupRoute ? 'Create New Account' : 'Login with Email and Password'
      }
    />
  )
}

export const FooterMessage = () => {
  const router = useRouter()
  const signupRoute = router.pathname === '/signup'

  return (
    <>
      {signupRoute ? (
        <>
          <Message attached='bottom' warning>
            <Icon name='help' />
            Existing User? <Link href='/login'>Login Here Instead</Link>
          </Message>
          <Divider hidden />
        </>
      ) : (
        <>
          <Message attached='bottom' warning>
            <Icon name='lock' />
            ผู้ใช้เก่า? <Link href='/login'>ลืมรหัสผ่าน</Link>
          </Message>
          <Message attached='bottom'>
            <Icon name='help' />
            ผู้ใช้ใหม่? <Link href='/login'>ลงทะเบียน</Link>
          </Message>
        </>
      )}
    </>
  )
}

// Custom App
import App from 'next/app'
import axios from 'axios'
import { parseCookies, destroyCookie } from 'nookies'
import baseUrl from '../utils/baseUrl'
import { redirectUser } from '../utils/authUser'
import Layout from '../components/Layout/Layout'
import 'semantic-ui-css/semantic.min.css'

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    // const { Component, ctx } = appContext
    const { token } = parseCookies(ctx)
    let pageProps = {}

    const protectedRoutes = ctx.pathname === '/'

    // not logged in
    if (!token) {
      protectedRoutes && redirectUser(ctx, '/login')
    } else {
      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx)
      }

      try {
        // get user data from api every when load any page
        const res = await axios.get(`${baseUrl}/api/auth`, {
          headers: { Authorization: token },
        })

        const { user, userFollowStats } = res.data

        // redirect if trying to access login/singup
        if (user) !protectedRoutes && redirectUser(ctx, '/')

        pageProps.user = user
        pageProps.userFollowStats = userFollowStats
      } catch (error) {
        destroyCookie(ctx, 'token')
        redirectUser(ctx, '/login')
      }
    }

    return { pageProps: pageProps }
  }

  render() {
    const { Component, pageProps } = this.props

    // console.log(this.props)

    return (
      <Layout {...pageProps}>
        <Component {...pageProps} />
      </Layout>
    )
  }
}

export default MyApp

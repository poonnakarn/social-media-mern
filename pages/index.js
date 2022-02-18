import axios from 'axios'

function Index({ posts }) {
  return (
    <div>
      {posts &&
        posts.length > 0 &&
        posts.map((post) => <h1 key={post.id}>{post.title}</h1>)}
    </div>
  )
}

Index.getInitialProps = async (context) => {
  try {
    const res = await axios.get('https://jsonplaceholder.typicode.com/posts')
    return { posts: res.data }
  } catch (error) {
    return { errorLoading: true }
  }
}

export default Index

import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)

  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    if (user) {
      blogService
        .getAll()
        .then(initialBlogs => {
          setBlogs(initialBlogs)
        })
    }
  }, [user])

  const createBlog = async (blogObject) => {
    const newBlog = await blogService.create(blogObject)
    setBlogs(blogs.concat({ ...newBlog, user }))
    blogFormRef.current.toggleVisibility()
  }

  const updateBlog = async (id, updatedBlog) => {
    blogService.update(id, updatedBlog).then((returnedBlog) => {
      setBlogs(blogs.map((b) => (b.id !== id ? b : { ...returnedBlog, user: b.user })))
    })
  }

  const deleteBlog = async (id) => {
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter((blog) => blog.id !== id))
      setNotificationMessage('Blog deleted successfully')
      setNotificationType('success')
      setTimeout(() => setNotificationMessage(null), 5000)
    } catch (exception) {
      setNotificationMessage('Failed to delete blog')
      setNotificationType('error')
      setTimeout(() => setNotificationMessage(null), 5000)
    }
  }


  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setNotificationMessage('Wrong username or password')
      setNotificationType('error')
      setTimeout(() => setNotificationMessage(null), 5000)
    }
    console.log('logging in with', username, password)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
  }

  const Notification = ({ message, type }) => {
    if (!message) return null

    const style = {
      padding: '10px',
      border: type === 'success' ? '2px solid green' : '2px solid red',
      color: type === 'success' ? 'green' : 'red',
      marginBottom: '10px'
    }

    return <div style={style}>{message}</div>
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  return (
    <div>

      {user === null
        ? <div>
          <h2>Log in to application</h2>
          <Notification message={notificationMessage} type={notificationType} />
          {loginForm()}
        </div>
        : <div>
          <h2>Blogs</h2>
          <Notification message={notificationMessage} type={notificationType} />
          <p>{user.name} logged-in</p>
          <button onClick={handleLogout}>logout</button>
          <Togglable buttonLabel="Create new blog" ref={blogFormRef}>
            <BlogForm createBlog={createBlog} />
          </Togglable>
          {blogs
            .sort((a, b) => b.likes - a.likes)
            .map((blog) => (
              <Blog key={blog.id} blog={blog} updateBlog={updateBlog} deleteBlog={deleteBlog} user={user} />
            ))}
        </div>
      }

    </div>
  )
}

export default App
import { useState } from 'react'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = async () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user
    }
    const returnedBlog = await updateBlog(blog.id, updatedBlog)
  }

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id)
    }
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle}>
      <div>
        <span className="blog-title">{blog.title}</span> 
        <span className="blog-author"> - {blog.author}</span>
        <button onClick={toggleVisibility}>
          {visible ? 'Hide' : 'View'}
        </button>
      </div>
      {visible && (
        <div>
          <p className="blog-url">URL: {blog.url}</p>
          <p className="blog-likes">
            Likes: {blog.likes}{' '}
            <button onClick={handleLike}>Like</button>
          </p>
          <p>Added by: {blog.user.name}</p>
          {blog.user.username === user.username && (
            <button onClick={handleDelete}>Remove</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog

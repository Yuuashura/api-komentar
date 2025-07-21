const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
let posts = [
  {
    id: 1,
    title: "Welcome Post",
    content: "Selamat datang di API kami!",
    author: "Admin",
    createdAt: new Date().toISOString()
  }
];
let nextId = 2;

// GET all posts
app.get('/api/posts', (req, res) => {
  res.json({
    success: true,
    message: 'Posts retrieved successfully',
    data: posts,
    total: posts.length
  });
});

// GET single post
app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  res.json({ success: true, message: 'Post retrieved successfully', data: post });
});

// CREATE post
app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title and content are required',
      required: ['title', 'content']
    });
  }

  const newPost = {
    id: nextId++,
    title: title.trim(),
    content: content.trim(),
    author: author ? author.trim() : 'Anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  posts.unshift(newPost);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: newPost
  });
});

// UPDATE post
app.put('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content, author } = req.body;

  const postIndex = posts.findIndex(p => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  if (title) posts[postIndex].title = title.trim();
  if (content) posts[postIndex].content = content.trim();
  if (author) posts[postIndex].author = author.trim();
  posts[postIndex].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Post updated successfully',
    data: posts[postIndex]
  });
});

// DELETE post
app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const deletedPost = posts.splice(postIndex, 1)[0];

  res.json({
    success: true,
    message: 'Post deleted successfully',
    data: deletedPost
  });
});

// Export handler for Vercel
module.exports = app;
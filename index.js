const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (untuk demo - di production gunakan database)
let posts = [
  {
    id: 1,
    title: "Welcome Post",
    content: "Selamat datang di API kami!",
    author: "Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
let nextId = 2;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GET - Menampilkan semua posts
app.get('/api/posts', (req, res) => {
  try {
    // Add query parameters for pagination if needed
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      message: 'Posts retrieved successfully',
      data: paginatedPosts,
      total: posts.length,
      page,
      totalPages: Math.ceil(posts.length / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET - Menampilkan post berdasarkan ID
app.get('/api/posts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Post retrieved successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST - Membuat post baru
app.post('/api/posts', (req, res) => {
  try {
    const { title, content, author } = req.body;
    
    // Validasi input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
        required: ['title', 'content']
      });
    }
    
    // Validasi panjang input
    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }
    
    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be less than 5000 characters'
      });
    }
    
    // Buat post baru
    const newPost = {
      id: nextId++,
      title: title.trim(),
      content: content.trim(),
      author: author ? author.trim() : 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    posts.unshift(newPost); // Tambahkan di awal array (newest first)
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT - Update post
app.put('/api/posts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content, author } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Validasi input jika ada
    if (title && title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }
    
    if (content && content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be less than 5000 characters'
      });
    }
    
    // Update post
    if (title) posts[postIndex].title = title.trim();
    if (content) posts[postIndex].content = content.trim();
    if (author) posts[postIndex].author = author.trim();
    posts[postIndex].updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: posts[postIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE - Hapus post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const deletedPost = posts.splice(postIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Post deleted successfully',
      data: deletedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler untuk API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/posts',
      'GET /api/posts/:id',
      'POST /api/posts',
      'PUT /api/posts/:id',
      'DELETE /api/posts/:id'
    ]
  });
});

// 404 handler untuk semua routes lainnya
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server (for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API documentation: http://localhost:${PORT}/api/posts`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
  });
}

// Export untuk Vercel
module.exports = app;
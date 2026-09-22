// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Blog from './pages/Blog'
import Post from './pages/Post'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Login from './pages/admin/Login'
import AdminPosts from './pages/admin/AdminPosts'
import PostEditor from './pages/admin/PostEditor'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/blog" element={<Blog />} />
            <Route path="/posts/:slug" element={<Post />} />
            <Route path="/about" element={<About />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminPosts /></ProtectedRoute>} />
          <Route path="/admin/posts/new" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
          <Route path="/admin/posts/:id/edit" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
// App.jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Blog from './pages/Blog'
import Post from './pages/Post'
import About from './pages/About'
import NotFound from './pages/NotFound'

// Lazy-loaded — their CSS/JS only loads when these routes are visited
const Login = lazy(() => import('./pages/admin/Login'))
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'))
const PostEditor = lazy(() => import('./pages/admin/PostEditor'))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/blog" replace />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/posts/:slug" element={<Post />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><AdminPosts /></ProtectedRoute>} />
            <Route path="/admin/posts/new" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
            <Route path="/admin/posts/:id/edit" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
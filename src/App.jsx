// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Blog from './pages/Blog'
import Post from './pages/Post'
import About from './pages/About'
import Publications from './pages/Publications'
import AuthorProfile from './pages/AuthorProfile'
import NotFound from './pages/NotFound'
import Login from './pages/admin/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProfile from './pages/admin/AdminProfile'
import AdminPosts from './pages/admin/AdminPosts'
import PostEditor from './pages/admin/PostEditor'
import AdminPublications from './pages/admin/AdminPublications'
import PublicationEditor from './pages/admin/PublicationEditor'
import ComingSoon from './pages/admin/ComingSoon'


import Register from './pages/Register'
import AdminUsers from './pages/admin/AdminUsers'

import RequireAuth from './components/RequireAuth'
import UserProfile from './pages/UserProfile'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/blog" replace />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/posts/:slug" element={<Post />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/about" element={<About />} />
            <Route path="/authors/:authorId" element={<AuthorProfile />} />
            <Route path="*" element={<NotFound />} />

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />
          </Route>

          <Route path="/admin/login" element={<Login />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="adminprofile" element={<AdminProfile />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="posts/new" element={<PostEditor />} />
            <Route path="posts/:id/edit" element={<PostEditor />} />
            <Route path="publications" element={<AdminPublications />} />
            <Route path="publications/new" element={<PublicationEditor />} />
            <Route path="publications/:id/edit" element={<PublicationEditor />} />
            <Route path="users" element={<AdminUsers />} />

            <Route path="testimonials" element={<ComingSoon title="Testimonials" />} />
            <Route path="messages" element={<ComingSoon title="Messages" />} />
            <Route path="events" element={<ComingSoon title="Events" />} />
            <Route path="services" element={<ComingSoon title="Services" />} />
            <Route path="projects" element={<ComingSoon title="Projects" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
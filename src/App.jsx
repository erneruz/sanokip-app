// src/App.jsx
import {
  BrowserRouter, Routes, Route, Navigate, Link, useLocation, useParams,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import SwitchSiteButton from './components/SwitchSiteButton'
import RequireAdmin from './components/RequireAdmin'
import RequireAuth from './components/RequireAuth'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Gateway from './pages/Gateway'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Post from './pages/Post'
import About from './pages/About'
import Projects from './pages/Projects'
import Publications from './pages/Publications'
import AuthorProfile from './pages/AuthorProfile'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProfile from './pages/admin/AdminProfile'
import AdminPosts from './pages/admin/AdminPosts'
import PostEditor from './pages/admin/PostEditor'
import AdminPublications from './pages/admin/AdminPublications'
import PublicationEditor from './pages/admin/PublicationEditor'
import AdminProjects from './pages/admin/AdminProjects'
import ProjectEditor from './pages/admin/ProjectEditor'
import ComingSoon from './pages/admin/ComingSoon'
import Services from './pages/Services'
import AdminServices from './pages/admin/AdminServices'
import AdminServiceRequests from './pages/admin/AdminServiceRequests'
import AdminMessages from './pages/admin/AdminMessages'
import AdminSubscribers from './pages/admin/AdminSubscribers'


import Register from './pages/Register'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserProfile from './pages/admin/AdminUserProfile'
import UserProfile from './pages/UserProfile'

// The page at "/".
// Normal visitors see the Gateway. But links that were made for the Engineering
// home (the unsubscribe link in subscriber emails, and the "Become a partner"
// button) still start with "/?...". Those are sent on to /engineering, keeping
// the same ?query and #section, so they keep working.
function RootRoute() {
  const { search, hash } = useLocation()
  const params = new URLSearchParams(search)

  if (params.has('unsubscribe') || params.has('topic') || hash === '#send-message') {
    return <Navigate to={`/engineering${search}${hash}`} replace />
  }
  return <Gateway />
}

// ← added: sends an OLD address to its NEW address under /engineering.
// Example: /posts/my-post  ->  /engineering/posts/my-post
// It keeps the ?query and the #section, so nothing is lost.
function LegacyRedirect({ to }) {
  const params = useParams()
  const { search, hash } = useLocation()

  // fills in :slug, :authorId ... with the real values
  const target = Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    to
  )
  return <Navigate to={`${target}${search}${hash}`} replace />
}

// TEMPORARY page for /entertainment (and anything under it) until the real
// Entertainment site is built.
function EntertainmentSoon() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F1F6F4] px-6 text-center">
      <span className="rounded-full bg-[#E6F1EE] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15">
        Peakstar Entertainment
      </span>
      <h1 className="mt-5 text-3xl font-bold text-[#0D3A31]">Coming very soon</h1>
      <p className="mt-3 max-w-md text-sm text-gray-600">
        We are building a home for talents in music, football, basketball, volleyball and more.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#154A3E]"
      >
        Back to the choice page
      </Link>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <SwitchSiteButton />
        <Routes>
          {/* "/" is the Gateway, with no navbar or footer around it */}
          <Route path="/" element={<RootRoute />} />

          {/* ── Peak Star Entertainment: everything starts with /entertainment ── */}
          {/* (temporary page for now: /entertainment, /entertainment/about, ...) */}
          <Route path="/entertainment/*" element={<EntertainmentSoon />} />

          {/* ── Peak Star Engineering: everything starts with /engineering ── */}
          {/* ← changed: all the public pages now live under /engineering */}
          <Route path="/engineering" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="blog" element={<Blog />} />
            <Route path="posts/:slug" element={<Post />} />
            <Route path="publications" element={<Publications />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="projects" element={<Projects />} />
            <Route path="authors/:authorId" element={<AuthorProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ── Shared pages and old addresses ── */}
          <Route element={<MainLayout />}>
            {/* accounts are shared by both sides, so they keep their short address */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />

            {/* ← added: OLD Engineering addresses are sent to the new ones */}
            <Route path="/blog" element={<LegacyRedirect to="/engineering/blog" />} />
            <Route path="/posts/:slug" element={<LegacyRedirect to="/engineering/posts/:slug" />} />
            <Route path="/publications" element={<LegacyRedirect to="/engineering/publications" />} />
            <Route path="/about" element={<LegacyRedirect to="/engineering/about" />} />
            <Route path="/services" element={<LegacyRedirect to="/engineering/services" />} />
            <Route path="/projects" element={<LegacyRedirect to="/engineering/projects" />} />
            <Route path="/authors/:authorId" element={<LegacyRedirect to="/engineering/authors/:authorId" />} />

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />

          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
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
            <Route path="events" element={<ComingSoon title="Events" />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="service-requests" element={<AdminServiceRequests />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/new" element={<ProjectEditor />} />
            <Route path="projects/:id/edit" element={<ProjectEditor />} />

            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:userId" element={<AdminUserProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
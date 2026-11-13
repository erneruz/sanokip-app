// src/routes/entertainmentAdminRoutes.jsx
// The admin pages of Peak Star Entertainment (everything under /admin/entertainment),
// plus the Staff & roles page. App.jsx only plugs this in, so this is the ONLY
// file to touch when an Entertainment admin page is added.
import { Outlet, Route } from 'react-router-dom'
import RequireAdmin from '../components/RequireAdmin'
import EntertainmentDashboard from '../pages/admin/EntertainmentDashboard'
import EntertainmentMembers from '../pages/admin/EntertainmentMembers'
import EntertainmentSubmissions from '../pages/admin/EntertainmentSubmissions'
import EntertainmentTakedowns from '../pages/admin/EntertainmentTakedowns'
import EntertainmentTalentCards from '../pages/admin/EntertainmentTalentCards'
import EntertainmentConsents from '../pages/admin/EntertainmentConsents'
import ComingSoon from '../pages/admin/ComingSoon'
import { ENT_CONTENT_KINDS } from '../constants/entertainmentAdmin'

// Content pages that are still "coming soon". When the real page exists, replace
// the <ComingSoon /> inside the element below.
const contentPages = ENT_CONTENT_KINDS.map((k) => ({ path: k.path, title: k.label }))

export const entertainmentAdminRoutes = (
  <>
    <Route
      path="entertainment"
      element={
        <RequireAdmin access="entertainment">
          <Outlet />
        </RequireAdmin>
      }
    >
      <Route index element={<EntertainmentDashboard />} />
      <Route
        path="members"
        element={
          <RequireAdmin access="entertainmentUsers">
            <EntertainmentMembers />
          </RequireAdmin>
        }
      />

      {/* the talent journey: only the scouting team */}
      <Route
        path="submissions"
        element={
          <RequireAdmin access="entertainmentScouting">
            <EntertainmentSubmissions />
          </RequireAdmin>
        }
      />
      <Route
        path="takedowns"
        element={
          <RequireAdmin access="entertainmentScouting">
            <EntertainmentTakedowns />
          </RequireAdmin>
        }
      />
      <Route
        path="talents"
        element={
          <RequireAdmin access="entertainmentScouting">
            <EntertainmentTalentCards />
          </RequireAdmin>
        }
      />
      <Route
        path="consents"
        element={
          <RequireAdmin access="entertainmentScouting">
            <EntertainmentConsents />
          </RequireAdmin>
        }
      />

      {contentPages.map((page) => (
        <Route
          key={page.path}
          path={page.path}
          element={
            <RequireAdmin access="entertainmentContent">
              <ComingSoon title={page.title} />
            </RequireAdmin>
          }
        />
      ))}
    </Route>

    <Route
      path="staff"
      element={
        <RequireAdmin access="staff">
          <ComingSoon title="Staff & roles" />
        </RequireAdmin>
      }
    />
  </>
)
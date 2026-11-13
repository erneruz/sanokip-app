// src/routes/entertainmentRoutes.jsx
// All the pages of Peak Star Entertainment (everything under /entertainment).
// App.jsx only plugs this in, so this is the ONLY file to touch when an
// Entertainment page is added or changed.
import { Route } from 'react-router-dom'
import EntertainmentLayout from '../layouts/EntertainmentLayout'
import EntertainmentPlaceholder from '../pages/entertainment/EntertainmentPlaceholder'
import EntertainmentLogin from '../pages/entertainment/EntertainmentLogin'
import EntertainmentRegister from '../pages/entertainment/EntertainmentRegister'
import EntertainmentAccount from '../pages/entertainment/EntertainmentAccount'
import ProfileView from '../pages/entertainment/account/ProfileView'
import ProfileEdit from '../pages/entertainment/account/ProfileEdit'
import AccountSecurity from '../pages/entertainment/account/AccountSecurity'
import TalentCard from '../pages/entertainment/account/TalentCard'
import Submissions from '../pages/entertainment/account/Submissions'
import Consents from '../pages/entertainment/account/Consents'
import Children from '../pages/entertainment/account/Children'
import NotFound from '../pages/NotFound'

// Pages that are still "coming soon". Each line is one page.
// When the real page is built, delete its line here and add a normal
// <Route path="..." element={<TheRealPage />} /> in the list below.
const placeholderPages = [
  {
    path: 'talents',
    eyebrow: 'Talents',
    title: 'Meet the talents',
    text: 'Verified talents in music, movies, dance and sports, discovered across Rwanda and beyond.',
  },
  {
    path: 'news',
    eyebrow: 'News',
    title: 'News and updates',
    text: 'Stories, announcements and updates from the talent world.',
  },
  {
    path: 'contact',
    eyebrow: 'Contact Us',
    title: 'Talk to the team',
    text: 'Questions, ideas or a partnership? Write to us.',
  },
  {
    path: 'opportunities',
    eyebrow: 'Opportunities',
    title: 'Chances waiting for talent',
    text: 'Trials, auditions, scouting events, scholarships and competitions.',
  },
  {
    path: 'partners',
    eyebrow: 'For partners',
    title: 'Meet verified talent',
    text: 'Clubs, academies, labels, studios, agents and brands: connect with talents ready for the market.',
  },
  {
    path: 'how-it-works',
    eyebrow: 'How it works',
    title: 'From a short clip to the spotlight',
    text: 'Send a clip. A scout verifies it. Real talent gets a showcase.',
  },
  {
    path: 'parents',
    eyebrow: 'For parents',
    title: 'Keeping young talents safe',
    text: 'How we protect young talents, with guardian consent and verified scouts.',
  },
  {
    path: 'stories',
    eyebrow: 'Success stories',
    title: 'Talents who got seen',
    text: 'Real talents, real opportunities.',
  },
  {
    path: 'submit',
    eyebrow: 'Submit a talent',
    title: 'Send us a clip',
    text: 'A short phone video is enough. No account needed.',
  },
  {
    path: 'track',
    eyebrow: 'Track submission',
    title: 'Follow your submission',
    text: 'Use the link we sent you by SMS or email to see where your clip stands.',
  },
  {
    path: 'about',
    eyebrow: 'About Us',
    title: 'About Peak Star Entertainment',
    text: 'Helping detect talents across the country and beyond, and bringing them visibility and opportunities.',
  },
]

// A single <Route> element: App.jsx places it inside <Routes>.
export const entertainmentRoutes = (
  <Route path="/entertainment" element={<EntertainmentLayout />}>
    <Route
      index
      element={
        <EntertainmentPlaceholder
          title="Welcome to Peak Star Entertainment"
          text="Where real talent gets seen."
        />
      }
    />

    {/* accounts of Peak Star Entertainment (separate from Engineering) */}
    <Route path="login" element={<EntertainmentLogin />} />
    <Route path="register" element={<EntertainmentRegister />} />

    {/* My profile: pages inside one frame (the talent pages only open for talents, parents and guardians) */}
    <Route path="account" element={<EntertainmentAccount />}>
      <Route index element={<ProfileView />} />
      <Route path="edit" element={<ProfileEdit />} />
      <Route path="card" element={<TalentCard />} />
      <Route path="children" element={<Children />} />
      <Route path="submissions" element={<Submissions />} />
      <Route path="consents" element={<Consents />} />
      <Route path="security" element={<AccountSecurity />} />
    </Route>

    {placeholderPages.map((page) => (
      <Route
        key={page.path}
        path={page.path}
        element={<EntertainmentPlaceholder eyebrow={page.eyebrow} title={page.title} text={page.text} />}
      />
    ))}

    <Route path="*" element={<NotFound />} />
  </Route>
)
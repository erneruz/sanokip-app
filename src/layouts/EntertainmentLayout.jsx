// src/layouts/EntertainmentLayout.jsx
import { Outlet } from 'react-router-dom'
import EntertainmentNavbar from '../components/entertainment/EntertainmentNavbar'

export default function EntertainmentLayout() {
  return (
    <div className="min-h-screen bg-[#F1F6F4]">
      <EntertainmentNavbar />
      <Outlet />
    </div>
  )
}
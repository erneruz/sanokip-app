import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import PartnersMarquee from '../components/PartnersMarquee'
import Footer from "../components/Footer";

const HIDE_PARTNERS_ON = ['/login', '/register']

function MainLayout() {
  const { pathname } = useLocation()
  const showPartners = !HIDE_PARTNERS_ON.includes(pathname)

  return (
    <>
      <Navbar />
      <Outlet />
      {showPartners && <PartnersMarquee />}
      <Footer />
    </>
  );
}

export default MainLayout;
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import PartnersMarquee from '../components/PartnersMarquee'
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <PartnersMarquee />
      <Footer />
    </>
  );
}

export default MainLayout;
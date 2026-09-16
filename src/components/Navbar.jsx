import {Link} from "react-router-dom";

function Navbar() {
    return (
        <header className="border-b border-gray-200 bg-white shadow-md backdrop-blur-md sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-semibold text-gray-900">
                    MapMind Group
                </Link>

                <div className="hidden md:flex items-center gap-6 space-x-6 text-sm">
                    <Link to="/" className="hover:text-blue-600 text-gray-500 transition-colors duration-300">
                        Home
                    </Link>

                    <Link to="/about" className="hover:text-blue-600 text-gray-500 transition-colors duration-300">
                        About Us
                    </Link>

                    <Link to="/services" className="hover:text-blue-600 text-gray-500 transition-colors duration-300">
                        Services
                    </Link>

                    <Link to="/blog" className="hover:text-blue-600 text-gray-500 transition-colors duration-300">
                        Blog & News
                    </Link>

                    <Link to="/community" className="hover:text-blue-600 text-gray-500 transition-colors duration-300">
                        Community
                    </Link>
                </div>

                <button className="rounded-lg bg-black text-white px-5 py-3 text-sm hover:bg-blue-700 transition-colors duration-300">
                    Contact Us
                </button>
            </nav>
        </header>

    );
}


export default Navbar;
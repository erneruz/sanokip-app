import {Link} from "react-router-dom";

function NotFound() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold">
                404 - Page Not Found
            </h1>
            <p className="text-gray-700 text-lg mt-4">
                The page you are looking for does not exist.
            </p>
            <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-300">
                Return to Home
            </Link>
        </main>
    );
}

export default NotFound;
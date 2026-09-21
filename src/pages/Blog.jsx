import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // ← added: read/write ?page= in the URL
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination'; // ← added
import { getPaginatedPosts } from '../services/postsService'; // ← changed: was getPublishedPosts


function Blog() {

    // ── added: track current page from the URL, default to 1 ──────────
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const [totalPages, setTotalPages] = useState(1);
    // ─────────────────────────────────────────────────────────────────

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [selectedCategory, setSelectedCategory] = useState("all");
    const filteredPosts = selectedCategory === "all" ? posts : posts.filter(post => post.categories?.slug === selectedCategory);



    useEffect(() => {
        let cancelled = false; // ← added: guard against a stale page's response overwriting a newer one

        async function loadPosts() {
            try {
                setLoading(true); // ← added: re-show loading state on every page change, not just first load
                const { posts, totalPages } = await getPaginatedPosts(currentPage); // ← changed
                if (cancelled) return; // ← added
                setPosts(posts);
                setTotalPages(totalPages); // ← added
            } catch (error) {
                if (!cancelled) setError("Unable to load posts. Please try again later.");
            } finally {
                if (!cancelled) setLoading(false); // ← changed: guarded with !cancelled
            }
        }

        loadPosts();

        return () => { cancelled = true; }; // ← added
    }, [currentPage]); // ← changed: was [], now re-fetches whenever the page changes

    // ── added: update the URL when a page button is clicked, and scroll up ──
    function handlePageChange(page) {
        setSearchParams({ page: String(page) });
        window.scrollTo(0, 0);
    }
    // ──────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <main className="max-w-6xl mx-auto py-12">
                Loading posts...
            </main>
        )
    }

    if (error) {
        return (
            <main className="max-w-6xl mx-auto py-12 text-red-600">
                {error}
            </main>
        )
    }

    return (
        <main>
            <section className="bg-black text-white py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-xs uppercase text-gray-400">
                        Blog
                    </p>

                    <div className="flex flex-col md:flex-row md:justify-between gap-6 mt-2">
                        <h1 className="text-2xl font-semibold">
                            Blog & News
                        </h1>
                        <p className="max-w-md text-sm text-gray-400">
                            Technical Articles, Geographic Write-ups, Urban Planning, Environment, Land Administration, GIS.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto py-10 px-6">
                {filteredPosts.length === 0 ? (
                    <p> No published posts are available</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}

                {/* ── added: pagination controls ── */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
                {/* ──────────────────────────────── */}
            </section>
        </main>
    )
}


export default Blog;
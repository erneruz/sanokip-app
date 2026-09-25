import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { getPaginatedPosts, getCategoriesWithCounts } from '../services/postsService';


function Blog() {

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const selectedCategory = searchParams.get('category') || 'all';
    const [totalPages, setTotalPages] = useState(1);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ── added: category list with counts, fetched once ─────────────────
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getCategoriesWithCounts()
            .then(setCategories)
            .catch(() => {}); // fail silently — filter bar just won't show if this errors
    }, []);
    // ─────────────────────────────────────────────────────────────────

    useEffect(() => {
        let cancelled = false;

        async function loadPosts() {
            try {
                setLoading(true);
                const { posts, totalPages } = await getPaginatedPosts(currentPage, selectedCategory);
                if (cancelled) return;
                setPosts(posts);
                setTotalPages(totalPages);
            } catch (error) {
                if (!cancelled) setError("Unable to load posts. Please try again later.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadPosts();

        return () => { cancelled = true; };
    }, [currentPage, selectedCategory]);

    function handlePageChange(page) {
        const next = { page: String(page) };
        if (selectedCategory !== 'all') next.category = selectedCategory;
        setSearchParams(next);
        window.scrollTo(0, 0);
    }

    function handleCategoryChange(slug) {
        setSearchParams(slug === 'all' ? { page: '1' } : { page: '1', category: slug });
        window.scrollTo(0, 0);
    }

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
                            Technical Articles, Geographic Write-ups, Science & Discovery, Research & Insights, Land Administration, GIS.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto py-10 px-6">

                {/* ── added: category filter bar, visually separated from the posts grid ── */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 mb-10">
                    <div className="flex flex-wrap gap-2.5">
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`cursor-pointer px-4 py-1.5 rounded-md text-sm border transition-shadow shadow-sm hover:shadow-md ${
                                    selectedCategory === cat.slug
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                {cat.name} <span className="font-bold">({cat.count})</span>
                            </button>
                        ))}
                    </div>
                </div>
                {/* ──────────────────────────────────────────────────────────────────────── */}

                {posts.length === 0 ? (
                    <p> No published posts are available</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
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
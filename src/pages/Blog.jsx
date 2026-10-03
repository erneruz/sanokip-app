// src/pages/Blog.jsx
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

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getCategoriesWithCounts()
            .then(setCategories)
            .catch(() => {}); // fail silently — filter bar just won't show if this errors
    }, []);

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

    const selectedCategoryName = categories.find((c) => c.slug === selectedCategory)?.name;

    return (
        <main>
            {/* ── Hero: title, description, and category filters all in one dark block ── */}
            <section className="bg-black text-white py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                        Blog
                    </p>

                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mt-2">
                        <h1 className="text-3xl font-semibold">
                            Blog & News
                        </h1>
                        <p className="max-w-md text-sm text-gray-400">
                            Technical Articles, Geographic Write-ups, Science & Discovery, Research & Insights, Perspectives & Stories.
                        </p>
                    </div>

                    {/* ── Category filters, styled for the dark background ── */}
                    <div className="mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-6">
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                                    selectedCategory === cat.slug
                                        ? 'bg-white text-black shadow-sm'
                                        : 'bg-white/5 text-gray-300 ring-1 ring-white/15 hover:bg-white/10 hover:text-white hover:ring-white/30'
                                }`}
                            >
                                {cat.name}{' '}
                                <span className={selectedCategory === cat.slug ? 'font-bold' : 'font-bold text-gray-400'}>
                                    ({cat.count})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto py-12 px-6">

                {/* ── Result context line: shows what's currently being viewed ── */}
                {!loading && (
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {selectedCategory === 'all' ? (
                                <>Showing all posts</>
                            ) : (
                                <>Showing posts in <span className="font-semibold text-gray-900">{selectedCategoryName}</span></>
                            )}
                        </p>
                    </div>
                )}

                {posts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
                        <p className="text-gray-500">No published posts are available in this category yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}

                <div className="mt-12">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </section>
        </main>
    )
}


export default Blog;
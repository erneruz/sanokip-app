// src/pages/Blog.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { getPaginatedPosts, getCategoriesWithCounts } from '../services/postsService';

/*
  Peak Star brand colours (taken from the logo)
    deep green   #1B5E4F   main brand colour: buttons, tags, header
    darker green #0D3A31   header depth
    mid green    #2F8F7A   small accents and icons
    pale green   #E6F1EE   soft tags and highlights
    page tint    #F1F6F4   background of the results area
*/

/* ---------- icons (all drawn here, no extra library needed) ---------- */
function Svg({ size = 16, className = '', strokeWidth = 2, children }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

function NewspaperIcon(props) {
    return (
        <Svg {...props}>
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
        </Svg>
    );
}

function LayersIcon(props) {
    return (
        <Svg {...props}>
            <path d="m12 3 9 5-9 5-9-5 9-5Z" />
            <path d="m3 13 9 5 9-5" />
        </Svg>
    );
}

function TagIcon(props) {
    return (
        <Svg {...props}>
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
            <circle cx="7.5" cy="7.5" r="1" />
        </Svg>
    );
}

function FileTextIcon(props) {
    return (
        <Svg {...props}>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h6" />
        </Svg>
    );
}

function FilterIcon(props) {
    return (
        <Svg {...props}>
            <path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z" />
        </Svg>
    );
}

function InboxIcon(props) {
    return (
        <Svg {...props}>
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z" />
        </Svg>
    );
}

function AlertIcon(props) {
    return (
        <Svg {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5h.01" />
        </Svg>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white shadow-sm">
            <div className="aspect-[16/9] w-full bg-[#DCE9E5]" />
            <div className="space-y-3 p-5">
                <div className="h-4 w-24 rounded-full bg-[#E6F1EE]" />
                <div className="h-5 w-4/5 rounded bg-[#DCE9E5]" />
                <div className="h-3 w-full rounded bg-[#E6F1EE]" />
                <div className="h-3 w-3/4 rounded bg-[#E6F1EE]" />
            </div>
        </div>
    );
}

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
            } catch {
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

    const selectedCategoryName = categories.find((c) => c.slug === selectedCategory)?.name;

    // Numbers for the little fact chips in the header (only shown when known)
    const totalArticles = categories.find((c) => c.slug === 'all')?.count;
    const categoryCount = categories.filter((c) => c.slug !== 'all').length;

    // On page 1 the newest post is shown big as the "featured" one
    const showFeatured = currentPage === 1 && posts.length > 1;
    const featuredPost = showFeatured ? posts[0] : null;
    const gridPosts = showFeatured ? posts.slice(1) : posts;

    // Category pills (on the green header)
    const pillClass = (active) =>
        `inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
            active
                ? 'border-white bg-white text-[#1B5E4F] shadow-sm'
                : 'border-white/25 bg-white/5 text-white/85 hover:border-white/60 hover:bg-white/10 hover:text-white'
        }`;

    // Little count bubble inside a pill
    const countClass = (active) =>
        `rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
            active ? 'bg-[#1B5E4F] text-white' : 'bg-white/15 text-white'
        }`;

    return (
        <main>
            {/* ── Green header: title, facts and category filters ── */}
            <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] text-white">
                {/* decoration: soft glows and a dot grid (the big corner icon was removed) */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
                    <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.12]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #ffffff 1.2px, transparent 1.4px)',
                            backgroundSize: '26px 26px',
                            WebkitMaskImage: 'radial-gradient(ellipse at 85% 20%, black 0%, transparent 65%)',
                            maskImage: 'radial-gradient(ellipse at 85% 20%, black 0%, transparent 65%)',
                        }}
                    />
                </div>

                <div className="mx-auto max-w-6xl px-6 py-12">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9]">
                        <NewspaperIcon size={14} />
                        Blog
                    </p>

                    <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
                        <h1 className="text-3xl font-bold md:text-4xl">
                            Blog &amp; News
                        </h1>
                        <p className="max-w-md text-sm text-white/70">
                            Technical Articles, Geographic Write-ups, Science &amp; Discovery, Research &amp; Insights, Perspectives &amp; Stories.
                        </p>
                    </div>

                    {/* quick facts */}
                    {(totalArticles != null || categoryCount > 0) && (
                        <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-medium">
                            {totalArticles != null && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                                    <FileTextIcon size={14} className="text-[#9FD8C9]" />
                                    {totalArticles} {totalArticles === 1 ? 'article' : 'articles'}
                                </span>
                            )}
                            {categoryCount > 0 && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                                    <LayersIcon size={14} className="text-[#9FD8C9]" />
                                    {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
                                </span>
                            )}
                        </div>
                    )}

                    {/* ── Category filters ── */}
                    {categories.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                            {categories.map((cat) => {
                                const active = selectedCategory === cat.slug;
                                const Icon = cat.slug === 'all' ? LayersIcon : TagIcon;
                                return (
                                    <button
                                        key={cat.slug}
                                        type="button"
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        className={pillClass(active)}
                                    >
                                        <Icon size={15} />
                                        {cat.name}
                                        <span className={countClass(active)}>{cat.count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Light green results area ── */}
            <section className="min-h-[60vh] bg-[#F1F6F4]">
                <div className="mx-auto max-w-6xl px-6 py-10">

                    {error && (
                        <div
                            role="alert"
                            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
                        >
                            <AlertIcon size={20} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {loading && !error && (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* ── Result context line: shows what's currently being viewed ── */}
                            <div className="mb-6 flex items-center">
                                <p className="inline-flex items-center gap-2 text-sm font-medium text-[#1B5E4F]">
                                    <FilterIcon size={15} />
                                    {selectedCategory === 'all' ? (
                                        <>Showing all posts</>
                                    ) : (
                                        <>Showing posts in <span className="font-bold text-[#0D3A31]">{selectedCategoryName}</span></>
                                    )}
                                </p>
                            </div>

                            {posts.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#1B5E4F]/30 bg-white/70 px-6 py-16 text-center text-gray-600">
                                    <span className="grid size-14 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
                                        <InboxIcon size={28} />
                                    </span>
                                    <p className="font-medium text-[#0D3A31]">No published posts are available in this category yet.</p>
                                    <p className="text-sm">Try a different category.</p>
                                </div>
                            ) : (
                                <>
                                    {featuredPost && (
                                        <div className="mb-8">
                                            <PostCard post={featuredPost} featured />
                                        </div>
                                    )}

                                    {gridPosts.length > 0 && (
                                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                            {gridPosts.map((post) => (
                                                <PostCard key={post.id} post={post} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {totalPages > 1 && (
                                <div className="mt-12">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}


export default Blog;
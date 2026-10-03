// src/components/PostCard.jsx
import { Link } from "react-router-dom";

function PostCard({ post }) {
    return (
        <Link to={`/posts/${post.slug}`} className="group block">
            <article className="h-full overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl">

                {/* ── Image only, no badge overlay ── */}
                <div className="overflow-hidden">
                    {post.cover_image_url ? (
                        <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="aspect-[16/9] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex aspect-[16/9] w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                            No image available
                        </div>
                    )}
                </div>

                {/* ── Text content ── */}
                <div className="p-5">
                    {/* ── Category, as a small gray caption above the title ── */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 transition-colors duration-300 group-hover:text-gray-600">
                        {post.categories?.name || "Article"}
                    </p>

                    <h2 className="mt-1.5 text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-600">
                        {post.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500">
                            {post.author_first_name} {post.author_second_name} ·{" "}
                            {post.published_at
                                ? new Date(post.published_at).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                  })
                                : "Unpublished"}
                        </p>

                        <span className="flex items-center gap-1 text-xs font-medium text-gray-900 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                            Read more
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default PostCard;
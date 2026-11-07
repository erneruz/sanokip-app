// src/components/PostCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

/* ---------- icons (drawn here, no extra library needed) ---------- */
function Svg({ size = 14, className = "", strokeWidth = 2, children }) {
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

function TagIcon(props) {
    return (
        <Svg {...props}>
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
            <circle cx="7.5" cy="7.5" r="1" />
        </Svg>
    );
}

function CalendarIcon(props) {
    return (
        <Svg {...props}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
        </Svg>
    );
}

function ArrowRightIcon(props) {
    return (
        <Svg {...props}>
            <path d="M5 12h14M13 5l7 7-7 7" />
        </Svg>
    );
}

function ImageIcon(props) {
    return (
        <Svg {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </Svg>
    );
}

function SparklesIcon(props) {
    return (
        <Svg {...props}>
            <path d="M12 3c.4 3.6 1.4 5.6 3 7.2 1.6 1.6 3.6 2.6 6 3-2.4.4-4.4 1.4-6 3-1.6 1.6-2.6 3.6-3 6-.4-2.4-1.4-4.4-3-6-1.6-1.6-3.6-2.6-6-3 2.4-.4 4.4-1.4 6-3 1.6-1.6 2.6-3.6 3-7.2Z" />
        </Svg>
    );
}

function formatDate(value) {
    if (!value) return "Unpublished";
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function PostCard({ post, featured = false }) {
    const [avatarFailed, setAvatarFailed] = useState(false);

    const authorName = `${post.author_first_name || ""} ${post.author_second_name || ""}`.trim();
    const initials =
        `${post.author_first_name?.[0] || ""}${post.author_second_name?.[0] || ""}`.toUpperCase() || "P";
    const categoryName = post.categories?.name || "Article";

    // The author's profile photo, if they uploaded one. Several possible field
    // names are checked so this works with however the post data is loaded.
    const avatarUrl =
        post.author_avatar_url ||
        post.author_avatar ||
        post.profiles?.avatar_url ||
        post.author?.avatar_url ||
        null;
    const showAvatar = Boolean(avatarUrl) && !avatarFailed;

    return (
        <Link to={`/posts/${post.slug}`} className="group block h-full">
            {/* The card has a fixed layout: the picture is placed inside a box of
                a fixed shape and cropped to fit it, so a tall or wide picture can
                never change the size of the card. */}
            <article
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white shadow-[0_1px_2px_rgba(13,58,49,0.06),0_10px_30px_-12px_rgba(13,58,49,0.20)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgba(13,58,49,0.08),0_22px_44px_-16px_rgba(13,58,49,0.32)] ${
                    featured ? "md:grid md:h-[24rem] md:grid-cols-[1.1fr_1fr]" : ""
                }`}
            >
                {/* ── Cover image (fixed-shape box, picture cropped to fill it) ── */}
                <div
                    className={`relative shrink-0 overflow-hidden bg-[#E6F1EE] ${
                        featured ? "aspect-[16/9] md:aspect-auto md:h-full" : "aspect-[16/9]"
                    }`}
                >
                    {post.cover_image_url ? (
                        <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E6F1EE] to-[#CFE5DE] text-[#1B5E4F]/50">
                            <ImageIcon size={40} strokeWidth={1.5} />
                        </div>
                    )}

                    {/* soft green fade at the bottom of the image, appears on hover */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0D3A31]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    {featured && (
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#1B5E4F] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md">
                            <SparklesIcon size={12} />
                            Latest
                        </span>
                    )}
                </div>

                {/* ── Text content ── */}
                <div
                    className={`flex min-h-0 flex-1 flex-col p-5 ${
                        featured ? "md:overflow-hidden md:p-8" : ""
                    }`}
                >
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#E6F1EE] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1B5E4F]">
                        <TagIcon size={11} />
                        {categoryName}
                    </span>

                    <h2
                        className={`mt-3 font-bold leading-snug tracking-tight text-[#0D3A31] transition-colors duration-300 group-hover:text-[#1B5E4F] ${
                            featured ? "line-clamp-3 text-xl md:line-clamp-2 md:text-2xl" : "line-clamp-3 text-lg"
                        }`}
                    >
                        {post.title}
                    </h2>

                    <div className="mt-3 h-[3px] w-10 shrink-0 rounded-full bg-[#2F8F7A] transition-all duration-300 group-hover:w-16" />

                    <p
                        className={`mt-3 text-sm leading-relaxed text-gray-600 ${
                            featured ? "line-clamp-3 md:text-[15px]" : "line-clamp-3"
                        }`}
                    >
                        {post.excerpt}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#1B5E4F]/10 pt-4">
                        <div className="flex min-w-0 items-center gap-2.5">
                            {showAvatar ? (
                                <img
                                    src={avatarUrl}
                                    alt={authorName || "Author"}
                                    onError={() => setAvatarFailed(true)}
                                    className="size-8 shrink-0 rounded-full object-cover ring-2 ring-[#E6F1EE]"
                                />
                            ) : (
                                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-[11px] font-bold text-white">
                                    {initials}
                                </span>
                            )}
                            <div className="min-w-0 text-xs">
                                {authorName && (
                                    <p className="truncate font-semibold text-[#0D3A31]">{authorName}</p>
                                )}
                                <p className="inline-flex items-center gap-1 text-gray-500">
                                    <CalendarIcon size={12} className="text-[#2F8F7A]" />
                                    {formatDate(post.published_at)}
                                </p>
                            </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1B5E4F] transition-all duration-300 group-hover:gap-2 group-hover:text-[#0D3A31]">
                            Read more
                            <ArrowRightIcon size={13} strokeWidth={2.5} />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default PostCard;
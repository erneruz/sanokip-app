// src/pages/Post.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { getPostBySlug } from "../services/postsService";
import PostReactions from "../components/PostReactions";
import CommentsSection from "../components/CommentsSection";
import ShareModal from "../components/ShareModal";

/*
  Peak Star brand colours (taken from the logo)
    deep green   #1B5E4F   main brand colour: buttons, tags, header
    darker green #0D3A31   header depth
    mid green    #2F8F7A   small accents and icons
    pale green   #E6F1EE   soft tags and highlights
    page tint    #F1F6F4   page background
*/

/* ---------- icons (all drawn here, no extra library needed) ---------- */
function Svg({ size = 16, className = "", strokeWidth = 2, children }) {
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

function HomeIcon(props) {
  return (
    <Svg {...props}>
      <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z" />
      <path d="M9 22V12h6v10" />
    </Svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <Svg {...props}>
      <path d="m9 6 6 6-6 6" />
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

function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  );
}

function ClockIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

function ArrowLeftIcon(props) {
  return (
    <Svg {...props}>
      <path d="M19 12H5M11 19l-7-7 7-7" />
    </Svg>
  );
}

function ShareIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
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

function Post() {
  const { slug } = useParams();

  // --------------------------------------------------
  // POST STATE
  // --------------------------------------------------

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState(false);

  // Reading time: tags are removed first so only the real words are counted
  const readingTime = post?.content
    ? Math.max(1, Math.ceil(post.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 200))
    : 0;


  // --------------------------------------------------
  // LOAD POST
  // --------------------------------------------------

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        setError("");

        const data = await getPostBySlug(slug);
        setPost(data);
      } catch (err) {
        console.error("Error loading post:", err);

        setError("Post not found.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);


  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#F1F6F4]">
        <div className="animate-pulse bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] py-16">
          <div className="mx-auto max-w-4xl space-y-4 px-6">
            <div className="h-3 w-48 rounded bg-white/20" />
            <div className="h-5 w-28 rounded-full bg-white/20" />
            <div className="h-8 w-3/4 rounded bg-white/25" />
            <div className="h-10 w-56 rounded-full bg-white/15" />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="animate-pulse overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white shadow-sm">
            <div className="aspect-[16/9] w-full bg-[#DCE9E5]" />
            <div className="space-y-3 p-8">
              <div className="h-3 w-full rounded bg-[#E6F1EE]" />
              <div className="h-3 w-5/6 rounded bg-[#E6F1EE]" />
              <div className="h-3 w-4/6 rounded bg-[#E6F1EE]" />
            </div>
          </div>
        </div>
      </main>
    );
  }


  // --------------------------------------------------
  // ERROR / POST NOT FOUND
  // --------------------------------------------------

  if (error || !post) {
    return (
      <main className="min-h-[60vh] bg-[#F1F6F4] px-6 py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-dashed border-[#1B5E4F]/30 bg-white/80 px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
            <AlertIcon size={28} />
          </span>

          <h1 className="text-2xl font-bold text-[#0D3A31]">
            Post Not Found
          </h1>

          <p className="text-sm text-gray-600">
            The article you are looking for could not be found.
          </p>

          <Link
            to="/blog"
            className="group mt-2 inline-flex items-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95"
          >
            <ArrowLeftIcon size={15} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }


  // --------------------------------------------------
  // AUTHOR DISPLAY HELPERS
  // --------------------------------------------------

  const authorName = post.profiles
    ? `${post.profiles.first_name ?? ""} ${post.profiles.last_name ?? ""}`.trim()
    : `${post.author_first_name ?? ""} ${post.author_second_name ?? ""}`.trim();

  const authorAvatar = post.profiles?.avatar_url;


  // --------------------------------------------------
  // MAIN POST PAGE
  // --------------------------------------------------

  return (
    <main className="bg-[#F1F6F4]">

      {/* -------------------------------------------- */}
      {/* HERO: breadcrumb, category, title, author, date, read time */}
      {/* -------------------------------------------- */}

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] py-12 text-white">
        {/* decoration: soft glows and a dot grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1.2px, transparent 1.4px)",
              backgroundSize: "26px 26px",
              WebkitMaskImage: "radial-gradient(ellipse at 85% 20%, black 0%, transparent 65%)",
              maskImage: "radial-gradient(ellipse at 85% 20%, black 0%, transparent 65%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl px-6">

          {/* BREADCRUMB */}
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-white/60">
            <Link to="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <HomeIcon size={13} />
              Home
            </Link>
            <ChevronRightIcon size={12} className="text-white/40" />
            <Link to="/blog" className="transition-colors hover:text-white">
              Blog &amp; News
            </Link>
            <ChevronRightIcon size={12} className="text-white/40" />
            <span className="line-clamp-1 text-white/80">{post.title}</span>
          </nav>

          {/* CATEGORY */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9] ring-1 ring-white/20">
            <TagIcon size={13} />
            {post.categories?.name || "Article"}
          </span>

          {/* TITLE */}
          <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />

          {/* AUTHOR + DATE, with avatar */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/15 ring-2 ring-white/30">
                {authorAvatar ? (
                  <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                    {authorName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </span>

              <div className="text-sm">
                {post.profiles ? (
                  <Link
                    to={`/authors/${post.profiles.id}`}
                    className="font-semibold text-white transition-colors hover:text-[#9FD8C9] hover:underline"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-semibold text-white">{authorName}</span>
                )}
                <p className="text-xs text-white/60">Author</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                <CalendarIcon size={14} className="text-[#9FD8C9]" />
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unpublished"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                <ClockIcon size={14} className="text-[#9FD8C9]" />
                {readingTime} min read
              </span>
            </div>
          </div>

        </div>
      </section>


      {/* -------------------------------------------- */}
      {/* BODY: cover image, article, reactions, comments — all in one shadowed card */}
      {/* -------------------------------------------- */}

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white shadow-[0_1px_2px_rgba(13,58,49,0.06),0_16px_40px_-16px_rgba(13,58,49,0.25)]">

          {/* COVER IMAGE */}
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="aspect-[16/9] w-full object-cover"
            />
          )}

          <div className="px-6 py-8 md:px-10">

            {/* ARTICLE CONTENT */}
            <article
              className="prose max-w-none break-words prose-headings:text-[#0D3A31] prose-a:text-[#1B5E4F] prose-strong:text-[#0D3A31] prose-blockquote:border-[#2F8F7A] prose-blockquote:text-gray-600 [&_img]:h-auto [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* BACK + SHARE */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#1B5E4F]/10 pt-6">
              <Link
                to="/blog"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#1B5E4F] transition-colors hover:text-[#0D3A31]"
              >
                <ArrowLeftIcon size={15} className="transition-transform duration-200 group-hover:-translate-x-1" />
                Back to Blog
              </Link>

              <button
                type="button"
                onClick={() => setShowShare(true)}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95"
              >
                <ShareIcon size={15} className="transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" />
                Share
              </button>
            </div>

            {/* REACTIONS */}
            <div className="mt-8 border-t border-[#1B5E4F]/10 pt-6">
              <PostReactions postId={post.id} />
            </div>

            {/* COMMENTS */}
            <div className="mt-8 border-t border-[#1B5E4F]/10 pt-6">
              <CommentsSection postId={post.id} />
            </div>

          </div>
        </div>
      </div>

      {/* SHARE POPUP */}
      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        url={window.location.href}
        title={post.title}
      />

    </main>
  );
}

export default Post;
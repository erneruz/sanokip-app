// src/pages/Post.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { getPostBySlug } from "../services/postsService";
import PostReactions from "../components/PostReactions";
import CommentsSection from "../components/CommentsSection";


function Post() {
  const { slug } = useParams();

  // --------------------------------------------------
  // POST STATE
  // --------------------------------------------------

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const readingTime = post?.content
    ? Math.ceil(post.content.trim().split(/\s+/).length / 200)
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
      <main className="max-w-4xl mx-auto px-6 py-12">

        <div className="text-gray-500">
          Loading article...
        </div>

      </main>
    );
  }


  // --------------------------------------------------
  // ERROR / POST NOT FOUND
  // --------------------------------------------------

  if (error || !post) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">

        <h1 className="text-3xl font-bold">
          Post Not Found
        </h1>

        <p className="text-gray-500 mt-3">
          The article you are looking for could not
          be found.
        </p>

        <Link
          to="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to Blog
        </Link>

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
    <main>

      {/* -------------------------------------------- */}
      {/* HERO: breadcrumb, category, title, author, date, read time */}
      {/* -------------------------------------------- */}

      <section className="bg-black text-white py-10">
        <div className="max-w-4xl mx-auto px-6">

          {/* BREADCRUMB */}
          <div className="text-xs text-gray-400 mb-6">
            <Link to="/" className="transition-colors hover:text-white">
              Home
            </Link>
            {" / "}
            <Link to="/blog" className="transition-colors hover:text-white">
              Blog & Reports
            </Link>
            {" / "}
            <span className="text-gray-300">{post.title}</span>
          </div>

          {/* CATEGORY */}
          <span className="inline-block rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-200 ring-1 ring-white/15">
            {post.categories?.name || "Article"}
          </span>

          {/* TITLE */}
          <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
            {post.title}
          </h1>

          {/* AUTHOR + DATE, with avatar */}
          <div className="mt-6 flex items-center gap-3">
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-300">
                  {authorName?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </span>

            <div className="text-sm text-gray-400">
              {post.profiles ? (
                <Link
                  to={`/authors/${post.profiles.id}`}
                  className="font-medium text-gray-100 transition-colors hover:text-white hover:underline"
                >
                  {authorName}
                </Link>
              ) : (
                <span className="font-medium text-gray-100">{authorName}</span>
              )}

              <div className="mt-0.5">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unpublished"}
                {" · "}
                {readingTime} min read
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* -------------------------------------------- */}
      {/* BODY: cover image, article, reactions, comments — all in one shadowed card */}
      {/* -------------------------------------------- */}

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">

          {/* COVER IMAGE */}
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full aspect-[16/9] object-cover"
            />
          )}

          <div className="px-6 py-8 md:px-10">

            {/* ARTICLE CONTENT */}
            <article
              className="prose max-w-none break-words [&_img]:max-w-full [&_img]:h-auto"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* REACTIONS */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <PostReactions postId={post.id} />
            </div>

            {/* COMMENTS */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <CommentsSection postId={post.id} />
            </div>

          </div>
        </div>
      </div>

    </main>
  );
}

export default Post;
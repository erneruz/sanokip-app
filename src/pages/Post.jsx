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
  // MAIN POST PAGE
  // --------------------------------------------------

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">

      {/* -------------------------------------------- */}
      {/* BREADCRUMB */}
      {/* -------------------------------------------- */}

      <div className="text-xs text-gray-500 mb-6">

        <Link
          to="/"
          className="hover:text-blue-600"
        >
          Home
        </Link>

        {" / "}

        <Link
          to="/blog"
          className="hover:text-blue-600"
        >
          Blog & Reports
        </Link>

        {" / "}

        <span>
          {post.title}
        </span>

      </div>


      {/* -------------------------------------------- */}
      {/* CATEGORY */}
      {/* -------------------------------------------- */}

      <span className="inline-block bg-gray-100 px-3 py-2 rounded-md text-xs text-gray-700">

        {post.categories?.name || "Article"}

      </span>


      {/* -------------------------------------------- */}
      {/* TITLE */}
      {/* -------------------------------------------- */}

      <h1 className="text-4xl font-bold leading-tight mt-5">

        {post.title}

      </h1>


      {/* -------------------------------------------- */}
      {/* AUTHOR + DATE */}
      {/* -------------------------------------------- */}

      <p className="text-sm text-gray-500 mt-4">

        {post.author_first_name}{" "}
        {post.author_second_name}

        {" · "}

        {post.published_at
          ? new Date(
              post.published_at
            ).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )
          : "Unpublished"}

          · {readingTime} min read

      </p>


      {/* -------------------------------------------- */}
      {/* COVER IMAGE */}
      {/* -------------------------------------------- */}

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="w-full aspect-[16/9] object-cover rounded-xl mt-8"
        />
      )}


      {/* -------------------------------------------- */}
      {/* ARTICLE CONTENT */}
      {/* -------------------------------------------- */}

      <article
        className="prose max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />


      {/* -------------------------------------------- */}
      {/* REACTIONS */}
      {/* -------------------------------------------- */}

      <PostReactions postId={post.id} />


      {/* -------------------------------------------- */}
      {/* COMMENTS */}
      {/* -------------------------------------------- */}

      <CommentsSection postId={post.id} />

    </main>
  );
}

export default Post;
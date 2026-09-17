import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import { getPostBySlug } from "../services/postsService";

import {
  submitReaction,
  getVisitorReaction,
  getReactionCounts,
} from "../services/reactionService";


function Post() {
  const { slug } = useParams();

  // --------------------------------------------------
  // POST STATE
  // --------------------------------------------------

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // --------------------------------------------------
  // REACTION STATE
  // --------------------------------------------------

  const [visitorId, setVisitorId] = useState(null);

  const [userReaction, setUserReaction] = useState(null);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  const [reactionLoading, setReactionLoading] = useState(false);

  const [reactionError, setReactionError] = useState("");

  const readingTime = post?.content
  ? Math.ceil(post.content.trim().split(/\s+/).length / 200)
  : 0;


  // --------------------------------------------------
  // CREATE / GET VISITOR ID
  // --------------------------------------------------

  useEffect(() => {
    let id = localStorage.getItem("blog_visitor_id");

    if (!id) {
      id = crypto.randomUUID();

      localStorage.setItem(
        "blog_visitor_id",
        id
      );
    }

    setVisitorId(id);
  }, []);


  // --------------------------------------------------
  // LOAD POST
  // --------------------------------------------------

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        setError("");

        const data = await getPostBySlug(slug);
        // console.log("post data:", data);
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
  // LOAD REACTIONS
  // --------------------------------------------------

  useEffect(() => {
    async function loadReactions() {
      if (!post?.id || !visitorId) {
        return;
      }

      try {
        setReactionError("");

        // Get the visitor's existing reaction
        const currentReaction =
          await getVisitorReaction({
            postId: post.id,
            visitorId,
          });

        setUserReaction(currentReaction);

        // Get total reaction counts
        const counts =
          await getReactionCounts(post.id);

        setLikes(counts.likes);
        setDislikes(counts.dislikes);

      } catch (err) {
        console.error(
          "Error loading reactions:",
          err
        );

        setReactionError(
          "Unable to load reactions."
        );
      }
    }

    loadReactions();
  }, [post?.id, visitorId]);


  // --------------------------------------------------
  // SUBMIT REACTION
  // --------------------------------------------------

  async function handleReaction(reaction) {
    if (!post?.id || !visitorId) {
      return;
    }

    try {
      setReactionLoading(true);
      setReactionError("");

      // Save reaction to Supabase
      await submitReaction({
        postId: post.id,
        visitorId,
        reaction,
      });

      // Update selected reaction immediately
      setUserReaction(reaction);

      // Update counts
      const counts =
        await getReactionCounts(post.id);

      setLikes(counts.likes);
      setDislikes(counts.dislikes);

    } catch (err) {
      console.error(
        "Error submitting reaction:",
        err
      );

      setReactionError(
        "Unable to save your reaction. Please try again."
      );

    } finally {
      setReactionLoading(false);
    }
  }


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

      <article className="prose max-w-none mt-8">

        <ReactMarkdown>
          {post.content}
        </ReactMarkdown>

      </article>


      {/* -------------------------------------------- */}
      {/* REACTIONS */}
      {/* -------------------------------------------- */}

      <section className="mt-12 pt-8 border-t border-gray-200">

        <h2 className="text-lg font-semibold text-gray-900 mb-4">

          Was this article helpful?

        </h2>


        <div className="flex items-center gap-3">

          {/* LIKE BUTTON */}

          <button
            type="button"
            onClick={() =>
              handleReaction("like")
            }
            disabled={reactionLoading}
            className={`
              flex items-center gap-2
              px-5 py-3
              rounded-lg
              border
              transition
              duration-200

              ${
                userReaction === "like"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }

              ${
                reactionLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >

            <span className="text-lg">
              👍
            </span>

            <span>
              Like
            </span>

            <span className="font-semibold">
              {likes}
            </span>

          </button>


          {/* DISLIKE BUTTON */}

          <button
            type="button"
            onClick={() =>
              handleReaction("dislike")
            }
            disabled={reactionLoading}
            className={`
              flex items-center gap-2
              px-5 py-3
              rounded-lg
              border
              transition
              duration-200

              ${
                userReaction === "dislike"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }

              ${
                reactionLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >

            <span className="text-lg">
              👎
            </span>

            <span>
              Dislike
            </span>

            <span className="font-semibold">
              {dislikes}
            </span>

          </button>

        </div>


        {/* ------------------------------------------ */}
        {/* REACTION MESSAGE */}
        {/* ------------------------------------------ */}

        {userReaction && (
          <p className="text-sm text-gray-500 mt-4">

            You reacted with{" "}

            <span className="font-medium">
              {userReaction === "like"
                ? "👍 Like"
                : "👎 Dislike"}
            </span>

            .

          </p>
        )}


        {/* ------------------------------------------ */}
        {/* ERROR MESSAGE */}
        {/* ------------------------------------------ */}

        {reactionError && (
          <p className="text-sm text-red-600 mt-4">

            {reactionError}

          </p>
        )}

      </section>

    </main>
  );
}

export default Post;
// import { supabase } from "./supabase";
import { supabase } from "../supabase";

/**
 * Submit or update a visitor's reaction to a post.
 *
 * A visitor can have only one reaction per post because
 * the database uses a unique constraint on:
 *
 * post_id + visitor_id
 */
export async function submitReaction({
  postId,
  visitorId,
  reaction,
}) {
  const { data, error } = await supabase
    .from("reactions")
    .upsert(
      {
        post_id: postId,
        visitor_id: visitorId,
        reaction,
      },
      {
        onConflict: "post_id,visitor_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/**
 * Get the current visitor's reaction for a specific post.
 *
 * Returns:
 *   "like"
 *   "dislike"
 *   null
 */
export async function getVisitorReaction({
  postId,
  visitorId,
}) {
  const { data, error } = await supabase
    .from("reactions")
    .select("reaction")
    .eq("post_id", postId)
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.reaction || null;
}


/**
 * Get total Like and Dislike counts for a post.
 */
export async function getReactionCounts(postId) {
  const { data, error } = await supabase
    .from("reactions")
    .select("reaction")
    .eq("post_id", postId);

  if (error) {
    throw error;
  }

  const likes =
    data?.filter((item) => item.reaction === "like").length || 0;

  const dislikes =
    data?.filter((item) => item.reaction === "dislike").length || 0;

  return {
    likes,
    dislikes,
  };
}
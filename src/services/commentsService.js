// src/services/commentsService.js
import { supabase } from "../supabase";

export async function getApprovedComments(postId) {
  const { data, error } = await supabase
    .from("comments")
    .select("id, name, comment, parent_id, created_at, user_id, profiles ( avatar_url )")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function submitComment({
  postId,
  name,
  email = null,
  comment,
  parentId = null,
  userId = null,
}) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      name,
      email,
      comment,
      parent_id: parentId,
      user_id: userId,
      status: "approved",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// ── added: admin delete ─────────────────────────────────────────────

export async function deleteComment(commentId) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    throw error;
  }
}

// ── end added ────────────────────────────────────────────────────────
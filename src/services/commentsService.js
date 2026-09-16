import {supabase} from "../supabase";


export async function getApprovedComments(postId) {
  const { data, error } = await supabase
    .from("comments")
    .select("id, name, comment, created_at")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function submitComment({
  postId,
  name,
  email,
  comment,
}) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      name,
      email,
      comment,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
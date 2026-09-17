import { supabase } from '../supabase';

export async function getPublishedPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      author_first_name,
      author_second_name,
      published_at,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      author_first_name,
      author_second_name,
      published_at,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
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

// ── added: pagination ──────────────────────────────────────────────

const PAGE_SIZE = 9;

export async function getPaginatedPosts(page = 1) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
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
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    posts: data ?? [],
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  };
}

// ── end added ───────────────────────────────────────────────────────


// ── added: search by title ──────────────────────────────────────────

export async function searchPosts(searchTerm) {
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
    .ilike('title', `%${searchTerm}%`)
    .order('published_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

// ── end added ──────────────────────────────────────────────────────
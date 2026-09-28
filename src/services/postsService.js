// src/services/postsService.js
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

// ── changed: added author_id and a profiles join, so the post page can
//    link to the author's public profile instead of showing plain text ──

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
      author_id,
      profiles (
        id,
        first_name,
        last_name,
        avatar_url
      ),
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

// ── end changed ──────────────────────────────────────────────────────

// ── added: pagination ──────────────────────────────────────────────

const PAGE_SIZE = 9;

export async function getPaginatedPosts(page = 1, categorySlug = 'all') {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
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
      categories${categorySlug !== 'all' ? '!inner' : ''} (
        id,
        name,
        slug
      )
    `, { count: 'exact' })
    .eq('status', 'published');

  // ── added: server-side category filter ──────────────────────────
  if (categorySlug !== 'all') {
    query = query.eq('categories.slug', categorySlug);
  }
  // ─────────────────────────────────────────────────────────────────

  const { data, count, error } = await query
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

// ── added: categories with post counts, in fixed display order ──────

const CATEGORY_ORDER = [
  'Articles',
  'Industry Trends',
  'GIS',
  'Urban Planning',
  'Land Administration',
  'Environment',
  'Other',
];

export async function getCategoriesWithCounts() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug');

  if (catError) {
    throw catError;
  }

  const { data: posts, error: postError } = await supabase
    .from('posts')
    .select('categories (id)')
    .eq('status', 'published');

  if (postError) {
    throw postError;
  }

  const counts = posts.reduce((acc, p) => {
    const catId = p.categories?.id;
    if (catId) acc[catId] = (acc[catId] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = [...categories].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a.name);
    const bIndex = CATEGORY_ORDER.indexOf(b.name);
    const aRank = aIndex === -1 ? CATEGORY_ORDER.length : aIndex;
    const bRank = bIndex === -1 ? CATEGORY_ORDER.length : bIndex;
    return aRank - bRank;
  });

  return [
    { id: 'all', name: 'All', slug: 'all', count: posts.length },
    ...sortedCategories.map((c) => ({
      ...c,
      count: counts[c.id] || 0,
    })),
  ];
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


// src/services/postsService.js (additions)

export async function getAllPostsForAdmin() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, status, published_at, categories (name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPost(post) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePost(id, post) {
  const { data, error } = await supabase
    .from('posts')
    .update({ ...post, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

export async function uploadCoverImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage.from('post-images').upload(fileName, file)
  if (error) throw error

  const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)
  return data.publicUrl
}

// ── added: list a specific author's published posts, for their public profile page ──

export async function getPostsByAuthor(authorId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      published_at,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('author_id', authorId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

// ── end added ────────────────────────────────────────────────────────

// ── added: paginated version of the above, 9 posts per page, plus the true
//    total count so the author page's "Articles (N)" number stays accurate
//    no matter which page you're currently viewing ──────────────────────────

const AUTHOR_PAGE_SIZE = 9;

export async function getPaginatedPostsByAuthor(authorId, page = 1) {
  const from = (page - 1) * AUTHOR_PAGE_SIZE;
  const to = from + AUTHOR_PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      published_at,
      categories (
        id,
        name,
        slug
      )
    `, { count: 'exact' })
    .eq('author_id', authorId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    posts: data ?? [],
    totalPages: Math.ceil((count ?? 0) / AUTHOR_PAGE_SIZE),
    totalCount: count ?? 0,
  };
}

// ── end added ────────────────────────────────────────────────────────
import {useState, useEffect} from 'react';
import PostCard from '../components/PostCard';
import {getPublishedPosts} from '../services/postsService';


function Blog() {
    
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [selectedCategory, setSelectedCategory] = useState("all");
    const filteredPosts = selectedCategory === "all" ? posts : posts.filter(post => post.categories?.slug === selectedCategory);



    useEffect(() => {
        async function loadPosts() {
            try {
                const data = await getPublishedPosts();
                setPosts(data);
            } catch (error) {
                setError("Unable to load posts. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        loadPosts();
    }, []);

    if (loading) {
        return (
            <main className="max-w-6xl mx-auto py-12">
                Loading posts...
            </main>
        )
    }

    if (error) {
        return (
            <main className="max-w-6xl mx-auto py-12 text-red-600">
                {error}
            </main>
        )
    }

    return (
        <main>
            <section className="bg-black text-white py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-xs uppercase text-gray-400">
                        Blog
                    </p>

                    <div className="flex flex-col md:flex-row md:justify-between gap-6 mt-2">
                        <h1 className="text-2xl font-semibold">
                            Blog & Reports
                        </h1>
                        <p className="max-w-md text-sm text-gray-400">
                            Technical Articles, Geographic Write-ups, Urban Planning, Environment, Land Administration, GIS.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto py-10 px-6">
                {filteredPosts.length === 0 ? (
                    <p> No published posts are available</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}


export async function searchPosts(searchTerm) {
    const { data, error } = await supabase
        .from("posts")
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
        .eq("status", "published")
        .ilike("title", `%${searchTerm}%`)
        .order("published_at", {
        ascending: false,
        });

    if (error) {
        throw error;
    }

    return data ?? [];
    }




export default Blog;
import {Link} from "react-router-dom";


function PostCard({post}) {
    return (
        <Link to={`/posts/${post.slug}`} className="block group">
            <article>
                <div>
                    {post.cover_image_url ? (
                        <img src={post.cover_image_url} alt={post.title} className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl" />
                    ):(
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                            No image available
                        </div>
                    )}

                    <span className="absolute top-3 left-3 bg-white px-3 py-2 rounded-md text-xs font-medium">
                        {post.categories?.name ||"Article"}
                    </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {post.title}
                </h2>

                <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                    {post.excerpt}
                </p>

                <p className="mt-4 text-xs text-gray-500">
                    {post.author_first_name} {post.author_second_name} .{""}
                    {post.published_at 
                     ? new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                     })
                     : "unpublished"
                     }
                </p>
            </article>
        </Link>
    );
}


export default PostCard;
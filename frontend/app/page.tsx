import Link from "next/link";
import { getBlogs } from "../lib/api";

export default async function Home() {
  const blogs = await getBlogs();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-10 text-center text-black-600">Latest Blogs</h1>
      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog: any) => {
          const contentText =
            blog.attributes.Content?.[0]?.children
              ?.map((child: any) => child.text)
              .join("") || "";

          const image =
            blog.attributes.CoverImage?.data?.[0]?.attributes?.url;

          return (
            <div
              key={blog.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              {/* Cover Image */}
              {image && (
                <img
                  src={`http://localhost:1337${image}`}
                  alt="cover"
                  className="w-full h-48 object-cover"
                />
              )}

              {/* Content */}
              <div className="p-5 space-y-3">
                {/* Title */}
                <Link href={`/blog/${blog.attributes.Slug}`}>
                  <h2 className="text-xl text-gray-600 font-semibold hover:text-blue-600 cursor-pointer">
                    {blog.attributes.Title}
                  </h2>
                </Link>

                {/* Preview Text */}
                <p className="text-gray-600 text-sm clamp-3">
                  {contentText}
                </p>

                {/* Date */}
                <p className="text-xs text-gray-400">
                  {new Date(blog.attributes.PublishDate).toDateString()}
                </p>

                {/* CTA */}
                <div className="flex justify-between items-center pt-3">
                  <Link
                    href={`/blog/${blog.attributes.Slug}`}
                    className="text-blue-600 font-medium text-sm hover:underline"
                  >
                    Read More →
                  </Link>

                  <button className="bg-black text-white px-3 py-1 rounded-full text-xs hover:bg-gray-800">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
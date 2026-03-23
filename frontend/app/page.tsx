import Link from "next/link";
import { getBlogs } from "../lib/api";

export default async function Home() {
  const blogs = await getBlogs();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Latest Insights & Blogs
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Explore our latest articles, industry insights, and expert knowledge.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
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
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
            >

              <div className="overflow-hidden">
                {image && (
                  <img
                    src={`http://localhost:1337${image}`}
                    alt="cover"
                    className="w-full h-52 object-cover group-hover:scale-105 transition duration-300"
                  />
                )}
              </div>
              <div className="p-6 flex flex-col justify-between h-[260px]">
                {/* Title */}
                <Link href={`/blog/${blog.attributes.Slug}`}>
                  <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition cursor-pointer line-clamp-2">
                    {blog.attributes.Title}
                  </h2>
                </Link>

                {/* Preview */}
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {contentText}
                </p>

                {/* Bottom Section */}
                <div className="mt-4 flex justify-between items-center">
                  {/* Date */}
                  <span className="text-xs text-gray-400">
                    {new Date(
                      blog.attributes.PublishDate
                    ).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/blog/${blog.attributes.Slug}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Read →
                  </Link>
                </div>

                {/* Subscribe Button */}
                {/* <button className="mt-4 w-full bg-black text-white py-2 rounded-full text-sm hover:bg-gray-800 transition">
                  Subscribe
                </button> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
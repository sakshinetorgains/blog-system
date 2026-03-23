import { getBlogBySlug } from "@/lib/api";
import SubscribeModal from "@/app/components/SubscribeModal";

type Props = {
  params: {
    slug: string;
  };
};

export default async function BlogDetail({ params }: Props) {
  const { slug } = await params;

  const blog = await getBlogBySlug(slug);
  if (!blog) return <div className="text-center py-20">Not Found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6">

        {/* Cover Image */}
        {blog.attributes.CoverImage?.data?.map((img: any, index: number) => (
          <div key={index} className="overflow-hidden rounded-3xl mb-6 shadow">
            <img
              src={`http://localhost:1337${img.attributes.url}`}
              alt="cover"
              className="w-full h-[350px] object-cover hover:scale-105 transition duration-300"
            />
          </div>
        ))}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-4">
          {blog.attributes.Title}
        </h1>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          <span>
            {new Date(blog.attributes.PublishDate).toLocaleDateString()}
          </span>
          <span>• 5 min read</span>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
          {blog.attributes.Content.map((block: any, index: number) => (
            <p key={index}>
              {block.children.map((child: any) => child.text).join("")}
            </p>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-12 border-gray-200" />

        {/* CTA Section */}
        <div className="bg-white p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6">

          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Enjoyed this article?
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Subscribe to get latest blogs, case studies & insights.
            </p>
          </div>

          <SubscribeModal source="blog" />
        </div>
      </div>
    </div>
  );
}
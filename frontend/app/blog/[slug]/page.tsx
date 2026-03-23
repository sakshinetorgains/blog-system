
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
    if (!blog) return <div>Not Found</div>;

    return (
        // <div className="p-6">
        //     {blog.attributes.CoverImage?.data?.map((img: any, index: number) => (
        //         <img
        //             key={index}
        //             src={`http://localhost:1337${img.attributes.url}`}
        //             alt="cover"
        //             className=" rounded mb-4 h-50 w-50"
        //         />
        //     ))}
        //     <h1 className="text-3xl font-bold">{blog.Title}</h1>
        //     {blog.attributes.Content.map((block: any, index: any) => (
        //         <p key={index}>
        //             {block.children.map((child: any) => child.text).join("")}
        //         </p>
        //     ))}
        //     {/* <button> Subscribe Modal</button> */}
        //     <SubscribeModal source="blog" />
        // </div>

          <div className="max-w-4xl mx-auto px-6 py-10">
      
      {/* Cover Image */}
     {blog.attributes.CoverImage?.data?.map((img: any, index: number) => (
                <img
                    key={index}
                    src={`http://localhost:1337${img.attributes.url}`}
                    alt="cover"
                    className=" rounded mb-4 h-50 w-full"
                />
            ))}

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4 leading-tight">
        {blog.attributes.Title}
      </h1>

      {/* Date */}
      <p className="text-gray-400 text-sm mb-8">
        {new Date(blog.attributes.PublishDate).toDateString()}
      </p>

      {/* Content */}
      <div className="space-y-6 text-black-700 leading-relaxed text-lg">
        {blog.attributes.Content.map((block: any, index: number) => (
          <p key={index}>
            {block.children.map((child: any) => child.text).join("")}
          </p>
        ))}
      </div>

      {/* Divider */}
      <hr className="my-10" />

      {/* CTA Section */}
      <div className=" p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <SubscribeModal source="blog" />
      </div>
    </div>
    );
}



// import { getBlogBySlug } from "@/lib/api";
// import SubscribeModal from "@/app/components/SubscribeModal";

// type Props = {
//   params: {
//     slug: string;
//   };
// };

// export default async function BlogDetail({ params }: Props) {
//   const { slug } = params;

//   const blog = await getBlogBySlug(slug);
//   if (!blog) return <div className="text-center py-20">Not Found</div>;

//   const image =
//     blog.attributes.CoverImage?.data?.[0]?.attributes?.url;

//   return (
//     <div className="max-w-4xl mx-auto px-6 py-10">
      
//       {/* Cover Image */}
//       {image && (
//         <img
//           src={`http://localhost:1337${image}`}
//           alt="cover"
//           className="w-full h-[350px] object-cover rounded-2xl mb-8"
//         />
//       )}

//       {/* Title */}
//       <h1 className="text-4xl font-bold mb-4 leading-tight">
//         {blog.attributes.Title}
//       </h1>

//       {/* Date */}
//       <p className="text-gray-400 text-sm mb-8">
//         {new Date(blog.attributes.PublishDate).toDateString()}
//       </p>

//       {/* Content */}
//       <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
//         {blog.attributes.Content.map((block: any, index: number) => (
//           <p key={index}>
//             {block.children.map((child: any) => child.text).join("")}
//           </p>
//         ))}
//       </div>

//       {/* Divider */}
//       <hr className="my-10" />

//       {/* CTA Section */}
//       <div className="bg-gray-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
//         <div>
//           <h3 className="text-xl font-semibold">
//             Enjoyed this article?
//           </h3>
//           <p className="text-gray-600 text-sm">
//             Subscribe to get more insights like this.
//           </p>
//         </div>

//         <SubscribeModal source="blog" />
//       </div>
//     </div>
//   );
// }
import Link from "next/link";
import React from "react";

// Dynamically generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>; // Adjusted to handle Promise
}) {
    const resolvedParams = await params; // Awaiting params
    const slug = decodeURIComponent(
      Array.isArray(resolvedParams.slug)
        ? resolvedParams.slug.join(" ")
        : resolvedParams.slug
    ).replace(/%20/g, " ");
    
  return {
    title: `${slug} - LMS`,
    description: `Course dashboard for ${slug} in the Learning Management System`,
  };
}

// Make the layout function async to await params
export default async function MyLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string | string[] }>;
  children: React.ReactNode;
}) {
  const resolvedParams = await params;
  const courseName = resolvedParams.slug
    ? Array.isArray(resolvedParams.slug)
      ? decodeURIComponent(resolvedParams.slug.join(" ").replace(/%20/g, " "))
      : decodeURIComponent(resolvedParams.slug.replace(/%20/g, " "))
    : "Unknown Course";

  return (
    <section>
      <div className="md:ml-[90px] mx-6 mb-4">
        <div className="my-4 px-2 pt-2 pb-8 bg-white border-2 shadow-md h-auto flex flex-col items-start">
          <p className="text-3xl sm:text-4xl ml-4 my-2 font-medium tracking-normal leading-relaxed select-none">
            {courseName}
          </p>
          <div className="mt-4 ml-4 flex flex-wrap">
            <div className="py-2 px-4 bg-slate-100 mr-2 mb-2 lg:mb-0 rounded-md">
              <Link href={"/student"} className="hover:underline">
                Dashboard
              </Link>
            </div>
            <div className="py-2 px-4 bg-slate-100 mr-2 mb-2 lg:mb-0 rounded-md">
              <Link href={"#"} className="hover:underline">
                My Courses
              </Link>
            </div>
            <div className="py-2 px-4 bg-slate-100 mr-2 mb-2 lg:mb-0 rounded-md">
              <Link href={"#"} className="hover:underline">
                Spring 2023
              </Link>
            </div>
            <div className="py-2 px-4 bg-slate-100 mr-2 mb-2 lg:mb-0 rounded-md">
              <Link href={"#"} className="hover:underline">
                Computer Science
              </Link>
            </div>
            {/* <div className="py-2 px-4 bg-slate-100 mr-2 mb-2 lg:mb-0 rounded-md">
              <Link href={"#"} className="hover:underline">
                CS-2103-CS-222-BS-CS-4C
              </Link>
            </div> */}
          </div>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

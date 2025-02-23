import Link from "next/link";
import React from "react";

type CourseDetailsType = {
  course_name: string;
  course_code: string;
  semester_number: number;
  section: string;
  p_id: string;
  program_name: string;
};

// Fetch course details
async function getCourseDetails(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/course?course_id=${slug}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch course details");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching course details:", error);
    return null;
  }
}

// Dynamically generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const courseId = (await params).slug;
  const courseDetails: CourseDetailsType = await getCourseDetails(courseId);

  return {
    title: courseDetails
      ? `${courseDetails.course_name} - LMS`
      : "Course - LMS",
    description: courseDetails
      ? `Course dashboard for ${courseDetails.course_name} in the LMS`
      : "Course dashboard in the LMS",
  };
}

// Make the layout function async to await params
export default async function MyLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const course_id = (await params).slug;
  const courseDetails: CourseDetailsType = await getCourseDetails(course_id);

  return (
    <section>
      <div className="md:ml-[90px] mx-6 mb-4">
        <div className="my-4 px-2 pt-2 pb-8 bg-white border-2 shadow-md h-auto flex flex-col items-start">
          <p className="text-3xl sm:text-4xl ml-4 my-2 font-medium tracking-normal leading-relaxed select-none">
            {courseDetails ? courseDetails.course_name : "Unknown Course"} - {" "}
            {courseDetails
              ? courseDetails.semester_number + courseDetails.section
              : "Unknown"}
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
            {/* <div className="py-2 px-4 bg-slate-100 mr-2 mb-2 lg:mb-0 rounded-md">
              <Link href={"#"} className="hover:underline">
                Spring 2023
              </Link>
            </div> */}
            <div className="py-2 px-4 bg-slate-100 mr-2 mb-2 lg:mb-0 rounded-md">
              <Link href={"#"} className="hover:underline">
                {courseDetails ? courseDetails.program_name : "Unknown Program"}
              </Link>
            </div>
            <div className="py-2 px-4 bg-slate-100 mr-2 mb-2 lg:mb-0 rounded-md">
              <Link href={"#"} className="hover:underline">
                {courseDetails
                  ? `${courseDetails.course_code}-BS-${courseDetails.p_id}-${courseDetails.semester_number}${courseDetails.section}`
                  : ""}
              </Link>
            </div>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

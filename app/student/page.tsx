"use client";
import CourseComponent from "./components/Course";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type CourseType = {
  course_id: string;
  course_name: string;
  t_id: string;
  semester_num: string;
  section: string;
  program_name: string;
};

interface ExtendedSession extends Session {
  user: {
    s_id: string;
    s_name: string;
    s_image?: string;
  } & Session["user"];
}

export default function Studentpage() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [complete, setComplete] = useState(false);

  // console.log(status);

  useEffect(() => {
    // Fetch courses only when session is authenticated
    if (status === "authenticated") {
      const fetchCourses = async () => {
        if (status === "authenticated") {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_URL}/api/student?s_id=${session?.user.s_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            );

            if (!res.ok) {
              throw new Error(
                `Failed to fetch courses: ${res.status} ${res.statusText}`
              );
            }

            const data = await res.json();
            // Set courses state and invert complete state
            setCourses(data); // Set fetched courses to state
            setComplete((prev) => !prev); // Invert the complete state
          } catch (error) {
            console.error("Error in getCourses:", error);
            return { error: "Failed to fetch courses" }; // Return an appropriate fallback or error object
          }
        }
      };

      fetchCourses(); // Call the fetchCourses function inside useEffect
    }
  }, [status, session?.user.s_id]); // Add session and status as dependencies

  // Loading and authenticated state
  if (status !== "authenticated" || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Once the courses are fetched and complete
  return (
    <div className="md:ml-[90px] mx-6">
      {complete ? (
        <div className="my-4 p-4 bg-white border-2 shadow-md h-52 flex flex-col sm:flex-row items-start">
          <Avatar className="w-28 h-28 select-none">
            <AvatarImage
              src={
                status === "authenticated"
                  && session?.user.s_image ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              }
              className="object-center object-cover"
            />
            <AvatarFallback>Profile Picture</AvatarFallback>
          </Avatar>
          <p className="text-3xl sm:text-4xl sm:ml-4 font-medium tracking-normal leading-relaxed select-none">
            {session?.user.s_name}
          </p>
        </div>
      ) : (
        <Skeleton className="w-full h-52 bg-gray-200" />
      )}
      <div className="border-2 border-t-2 border-t-black p-4 select-none">
        <p className="p-3 text-lg">Course Overview</p>
        {complete && courses.length > 0 ? (
          courses.map((course: CourseType) => (
            <CourseComponent
              key={course.course_id}
              course_id={course.course_id}
              course_name={course.course_name}
              teacher_id={course.t_id}
              student_id={session.user.s_id}
              semester_num={course.semester_num}
              section={course.section}
              course_value={"70"}
              program_name={course.program_name}
            />
          ))
        ) : (
          <>
            {complete && courses.length === 0 ? (
              <p className="flex justify-center items-center text-lg text-gray-600">No courses found.</p>
            ) : (
              <>
                <Skeleton className="w-full h-36 bg-gray-200 mb-2" />
                <Skeleton className="w-full h-36 bg-gray-200 mb-2" />
                <Skeleton className="w-full h-36 bg-gray-200 mb-2" />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

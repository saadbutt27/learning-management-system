"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Lecture from "./components/Lecture";
import Assignment from "./components/Assignment";
import { Session } from "next-auth";
import Announcement from "./components/Announcement";

interface ExtendedSession extends Session {
  user: {
    t_id: string;
    t_name: string;
    t_image?: string;
    accessToken: string;
  } & Session["user"];
}

type CourseType = {
  course_id: string;
  course_name: string;
  t_id: string;
  semester_num: string;
  section: string;
  program_name: string;
};

export default function UploadPage() {
  const pathName = usePathname();
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };

  const [activeButton, setActiveButton] = useState<string>();

  useEffect(() => {
    const pa = pathName.split(/[/]/);
    setActiveButton(() => pa[3]);
  }, [pathName]);

  const [courses, setCourses] = useState<CourseType[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      // Fetch courses only when session is authenticated
      if (status === "authenticated" && courses.length === 0) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/teacher?t_id=${session?.user.t_id}`,
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
        } catch (error) {
          console.error("Error in getCourses:", error);
          return { error: "Failed to fetch courses" }; // Return an appropriate fallback or error object
        }
      }
    };

    fetchCourses(); // Call the fetchCourses function inside useEffect
  }, [status, session?.user.t_id, courses.length]); // Add session and status as dependencies

  const renderContent = () => {
    switch (activeButton) {
      case "lecture":
        return <Lecture courses={courses} status={status} />;
      case "assignment":
        return <Assignment courses={courses} status={status} />;
      case "quiz":
      // return <Quiz />;
      case "announcement":
        return <Announcement courses={courses} status={status} />;
      default:
        return (
          <p className="flex justify-center items-center text-base text-gray-600">
            Choose any tab to upload
          </p>
        );
    }
  };

  if (status === "authenticated") {
    return (
      <div className="md:ml-[90px] mx-6 mt-4">
        <div className="border-2 border-t-2 border-t-black p-2 flex flex-wrap">
          {[
            { name: "lecture", label: "Lecture Slides" },
            { name: "assignment", label: "Assignment" },
            { name: "quiz", label: "Quiz" },
            { name: "announcement", label: "Announcements" },
          ].map(({ name, label }) => (
            <button
              key={name}
              className={`py-2 px-3 rounded-md shadow-lg m-4 text-center flex-grow ${
                activeButton === name ? "bg-black text-white" : "bg-slate-200"
              }`}
              onClick={() => setActiveButton(name)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="border-2 h-full mt-4 duration-500 p-4">
          {renderContent()}
        </div>
      </div>
    );
  }

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

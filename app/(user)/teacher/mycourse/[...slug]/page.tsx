"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Lecture from "./components/lecture/Lecture";
import Attendance from "./components/attendance/Attendance";
import Assignment from "./components/assignment/Assignment";
import Quiz from "./components/quiz/Quiz";
import Announcement from "./components/announcement/Announcement";

export default function Page() {
  const pathName = usePathname();
  const { status } = useSession() as {
    status: string;
  };

  const [activeButton, setActiveButton] = useState<string>();

  useEffect(() => {
    const pa = pathName.split(/[/]/);
    setActiveButton(() => pa[3]);
  }, [pathName]);

  // Handle the rendering of the Lecture component based on the active button
  const renderContent = () => {
    if (activeButton === "lecture") {
      return (
        <div className="border-2 h-full mt-4 duration-500 p-4">
          <Lecture />
        </div>
      ); // Pass necessary props to Lecture component
    } else if (activeButton === "attendance") {
      return (
        <div className="border-2 h-full mt-4 duration-500 p-4">
          <Attendance />
        </div>
      );
    } else if (activeButton === "assignment") {
      return (
        <div className="border-2 h-full mt-4 duration-500 p-4">
          <Assignment />
        </div>
      );
    } else if (activeButton === "quiz") {
      return (
        <div className="border-2 h-full mt-4 duration-500 p-4">
          <Quiz />
        </div>
      );
    } else if (activeButton === "announcement") {
      return (
        <div className="border-2 h-full mt-4 duration-500 p-4">
          <Announcement />
        </div>
      );
    }

    return (
      <div className="border-2 h-full mt-4 duration-500 p-4">
        <p className="flex justify-center items-center text-base text-gray-600">
          Choose any tab to view the content
        </p>
      </div>
    );
  };

  if (status == "authenticated") {
    return (
      <>
        <div className="border-2 border-t-2 border-t-black p-2 flex flex-wrap">
          <div className="flex flex-grow">
            <button
              className={`py-2 px-4 rounded-md shadow-lg m-4 text-center flex-grow ${
                activeButton === "lecture"
                  ? "bg-black text-white"
                  : "bg-slate-200"
              }`}
              onClick={() => setActiveButton("lecture")} // Set activeButton to "lecture" when clicked
            >
              Lecture Slides
            </button>
          </div>
          <div className="flex flex-grow">
            <button
              className={`py-2 px-4 rounded-md shadow-lg m-4 text-center flex-grow ${
                activeButton === "attendance"
                  ? "bg-black text-white"
                  : "bg-slate-200"
              }`}
              onClick={() => setActiveButton("attendance")} // Set activeButton to "attendance" when clicked
            >
              Attendance
            </button>
          </div>
          <div className="flex flex-grow">
            <button
              className={`py-2 px-4 rounded-md shadow-lg m-4 text-center flex-grow ${
                activeButton === "assignment"
                  ? "bg-black text-white"
                  : "bg-slate-200"
              }`}
              onClick={() => setActiveButton("assignment")} // Set activeButton to "assignment" when clicked
            >
              Assignment
            </button>
          </div>
          <div className="flex flex-grow">
            <button
              className={`py-2 px-4 rounded-md shadow-lg m-4 text-center flex-grow ${
                activeButton === "quiz" ? "bg-black text-white" : "bg-slate-200"
              }`}
              onClick={() => setActiveButton("quiz")} // Set activeButton to "quiz" when clicked
            >
              Quiz
            </button>
          </div>
          <div className="flex flex-grow">
            <button
              className={`py-2 px-4 rounded-md shadow-lg m-4 text-center flex-grow ${
                activeButton === "announcement"
                  ? "bg-black text-white"
                  : "bg-slate-200"
              }`}
              onClick={() => setActiveButton("announcement")} // Set activeButton to "announcement" when clicked
            >
              Announcements
            </button>
          </div>
        </div>

        {/* Conditionally render the Lecture component */}
        {renderContent()}
      </>
    );
  }
  return (
    <div className="border-2 h-full mt-4 duration-500 p-4">
      <p className="flex justify-center items-center text-base text-gray-600">
        LOADING...
      </p>
    </div>
  );
}

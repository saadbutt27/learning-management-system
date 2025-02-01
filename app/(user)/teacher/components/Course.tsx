"use client";
import React from "react";
import Link from "next/link";

const colors: string[] = [
  "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
  "bg-gradient-to-r from-cyan-500 to-blue-500",
  "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% ",
  "bg-gradient-to-r from-fuchsia-800 to-red-600",
  "bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500",
  "bg-gradient-to-r from-sky-500 to-indigo-500",
  "bg-gradient-to-r from-purple-400 md:from-yellow-500",
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-violet-500 to-fuchsia-500",
];

const randomValue = () => {
  return Math.floor(Math.random() * 9) + 1;
};

const generateGrad = () => {
  return colors[randomValue() - 1];
};

type Props = {
  course_name: string;
  // course_value: string;
  course_id: string;
  teacher_id: string;
  student_id: string;
  semester_num: string;
  section: string;
  program_name: string;
};

// Function to get initials from course name
const getInitials = (name: string) => {
  return name
    .split(" ") // Split words
    .map((word) => word[0]?.toUpperCase()) // Get first letter and uppercase
    .filter((initial) => initial !== undefined) // Filter out undefined values
    .join(""); // Join all initials
};

const CourseComponent = ({
  course_name,
  // course_value,
  course_id,
  teacher_id,
  student_id,
  semester_num,
  section,
  program_name,
}: Props) => {
  const initials = getInitials(course_name); // Get initials
  return (
    <>
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 pt-4 pb-10 px-2 my-1">
        <div className="flex basis-full sm:basis-1/2">
          <div className="flex items-center justify-center h-full">
            {/* Circle with initials */}
            <div
              className={`${generateGrad()} w-20 h-20 rounded-full flex items-center justify-center`}
            >
              <span className={`text-white font-bold ${
                initials.length > 4 ? 'text-lg' : 'text-2xl'
              }`}>{initials}</span>
            </div>
          </div>
          <span className="ml-2">
            <p className="text-xs sm:text-sm">{program_name}</p>
            <Link
              href={{
                pathname: `/teacher/mycourse/${course_name}`,
                query: { course_id, teacher_id, student_id },
              }}
            >
              <p className="text-base sm:text-xl">{`${course_name} (${semester_num}${section})`}</p>
            </Link>
          </span>
        </div>

        {/* <div className="sm:block hidden w-64 h-2 bg-gray-400 relative ml-0">
          <div
            className="h-full bg-black absolute top-0 left-0"
            style={{
              width: `${course_value}%`,
            }}
          ></div>
          <p className="text-xs pt-6">{course_value}% complete</p>
        </div> */}
      </div>
    </>
  );
};

export default CourseComponent;

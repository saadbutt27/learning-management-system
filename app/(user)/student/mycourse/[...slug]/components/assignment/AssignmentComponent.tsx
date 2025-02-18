"use client";
import Link from "next/link";
import React, { useState } from "react";
import MyTooltip from "@/components/reusable/MyTooltip";

type Props = {
  assignment: {
    assignment_id: number;
    assignment_description: string;
    course_name: string;
    due_date: string;
    teacher_name: string;
    upload_date: string;
    file: string;
    topic: string;
    is_edit_allowed_after_submission: boolean;
  };
};

export default function AssignmentComponent({ assignment }: Props) {
  const [click, clickResult] = useState(false);

  // Upload date
  const localUploadDate = new Date(assignment.upload_date).toLocaleString(
    "en-US",
    {
      timeZone: "Asia/Karachi",
    }
  );

  const currentDate = new Date(); // Current local time
  const dueDateUTC = new Date(assignment.due_date); // Due date from DB (UTC)

  // Convert dueDate from UTC to Local Time
  const dueDateLocal = new Date(
    dueDateUTC.getTime() + new Date().getTimezoneOffset() * 60000
  );

  // Compare as local time
  const isPastDue = currentDate > dueDateLocal;

  return (
    <li className="border-t-2 border-black my-2 py-4">
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 py-4 px-5 my-1">
        <div className="flex basis-full">
          <div className="flex lg:flex-row flex-col justify-between select-none w-full">
            <div className="basis-1/2">
              <p className="text-2xl font-medium">{assignment.topic}</p>
              <p className="text-sm lg:text-base mt-2">
                {assignment.assignment_description}
              </p>
            </div>
            <div className="">
              <div className="flex flex-col items-start lg:items-end mt-2 lg:mt-0">
                <MyTooltip
                  upload_date={localUploadDate}
                  due_date={assignment.due_date}
                  isPastDue={isPastDue}
                />
                {assignment.file && (
                  <Link
                    href={assignment.file}
                    target="_blank"
                    className="hover:text-gray-600 font-semibold underline"
                  >
                    Download Assignment
                  </Link>
                )}
                <button
                  className={`border-2 border-black py-1 px-4 rounded-md text-white bg-black ${
                    isPastDue && !assignment.is_edit_allowed_after_submission
                      ? "opacity-30 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => clickResult(!click)}
                  disabled={
                    isPastDue && !assignment.is_edit_allowed_after_submission
                  }
                >
                  {click ? "Close" : "Submit"}
                </button>
              </div>
              {/* Form Container with Smooth Transition */}
              <div
                className={`my-2 transition-all duration-500 ease-in-out overflow-hidden ${
                  click
                    ? "opacity-100 max-h-screen scale-100"
                    : "opacity-0 max-h-0 scale-95"
                }`}
              >
                <form action="">
                  <label
                    htmlFor="assignment_file"
                    className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
                  >
                    Upload assignemnt
                  </label>
                  <input
                    type="file"
                    id="assignment_file"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                    aria-describedby="user_assignment_help"
                  />
                  <div
                    className="text-sm text-gray-500 p-2"
                    id="user_assignment_help"
                  >
                    Upload pdf/doc/jpeg/png
                  </div>
                  <button
                    type="button"
                    className={`text-white font-medium rounded-lg text-sm px-5 py-2 my-2 lg:float-right
        ${
          isPastDue
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gray-800 hover:bg-gray-900"
        }`}
                    disabled={isPastDue}
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

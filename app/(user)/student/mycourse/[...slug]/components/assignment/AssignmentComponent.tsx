"use client";
import Link from "next/link";
import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/dateFormatter";

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
  };
};

export default function AssignmentComponent({ assignment }: Props) {
  const [click, clickResult] = useState(false);
  const currentDate = new Date();
  const dueDate = new Date(assignment.due_date);
  const isPastDue = currentDate > dueDate;
  return (
    <Tooltip>
      <li className="border-t-2 border-black my-2 py-4">
        <div className="sm:flex items-center justify-between border-2 bg-slate-100 pt-4 pb-10 px-5 my-1">
          <div className="flex basis-full">
            <div className="flex lg:flex-row flex-col justify-between select-none w-full">
              <div className="basis-1/2">
                <p className="text-2xl font-medium">{assignment.topic}</p>
                <p className="text-sm lg:text-base mt-2">
                  {assignment.assignment_description}
                </p>
              </div>
              <div className="my-2 lg:my-0">
                <div className="flex flex-col lg:items-end mt-2 lg:mt-0">
                  <button
                    type="button"
                    className={`text-white w-28 font-medium rounded-lg text-sm px-5 py-2 my-2 lg:float-right 
                        ${
                          isPastDue
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-gray-800 hover:bg-gray-900"
                        } 
                        hover:scale-110 hover:duration-200`}
                  >
                    <TooltipTrigger>Due Date</TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="text-xs lg:text-sm mb-3 mr-1.5 bg-white text-black shadow-md border-black"
                    >
                      Upload: {formatDateTime(assignment.upload_date)} <br />
                      Due: {formatDateTime(assignment.due_date)}
                    </TooltipContent>
                  </button>
                  {assignment.file && (
                    <Link
                      href={assignment.file}
                      target="_blank"
                      className="hover:underline hover:text-gray-600 "
                    >
                      Download Assignment
                    </Link>
                  )}
                  <p
                    className={`hover:underline ${
                      isPastDue
                        ? "text-gray-400 cursor-not-allowed"
                        : "hover:text-gray-600 cursor-pointer"
                    }`}
                    onClick={() => !isPastDue && clickResult(!click)}
                  >
                    Submit Assignment
                  </p>
                </div>
                <div
                  className={
                    (click ? `opacity-100` : `hidden `) +
                    ` my-2 opacity-0 transition-opacity duration-600 ease-in-out`
                  }
                >
                  <form action="">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor="user_avatar"
                    >
                      Upload file
                    </label>
                    <input
                      className="block w-full text-sm text-gray-900 border-2 border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                      aria-describedby="user_avatar_help"
                      id="user_avatar"
                      type="file"
                    />
                    <div
                      className="mt-1 text-sm text-gray-500 dark:text-gray-300"
                      id="user_avatar_help"
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
    </Tooltip>
  );
}

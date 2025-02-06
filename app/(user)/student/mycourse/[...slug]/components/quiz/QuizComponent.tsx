"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import { compareDate } from "@/lib/dateFormatter";
import MyTooltip from "@/components/reusable/MyTooltip";

type Props = {
  quiz: {
    q_id: number;
    q_topic: string;
    q_desc: string;
    q_upload_date: string;
    q_due_date: string;
    q_time: number;
    marks_obtained: number;
    total_marks: number;
    attempt: number | null;
  };
};

export default function QuizComponent({ quiz }: Props) {
  const searchParams = useSearchParams();
  const { course_id, student_id } = {
    course_id: searchParams.get("course_id"),
    student_id: searchParams.get("student_id"),
  };

  const currentDate = new Date();
  const dueDate = new Date(quiz.q_due_date);
  const isPastDue = currentDate > dueDate;

  return (
    <li className="border-t-2 border-black my-2 py-4">
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 pt-4 pb-10 px-5 my-1">
        <div className="flex basis-full">
          <div className="select-none w-full">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
              <div className="">
                <p className="text-2xl font-medium">{quiz.q_topic}</p>
                <p className="text-sm lg:text-base mt-2">{quiz.q_desc}</p>
              </div>
              <div className="flex items-center gap-x-2 self-start order-last mt-2 lg:mt-0">
                <MyTooltip
                  upload_date={quiz.q_upload_date}
                  due_date={quiz.q_due_date}
                  isPastDue={isPastDue}
                />
              </div>
            </div>

            <div className="mt-2 flex justify-between flex-wrap">
              {compareDate(quiz.q_due_date) ? (
                <>
                  <span className="cursor-not-allowed">Quiz Closed</span>
                  <p className="">{`Duration: ${quiz.q_time}mins`}</p>
                </>
              ) : !quiz.attempt ? (
                <>
                  <Link
                    href={{
                      pathname: "/my/attempt",
                      query: { course_id, q_id: quiz.q_id, student_id },
                    }}
                    className="hover:underline hover:text-gray-600 font-medium flex items-center"
                  >
                    Go to Quiz
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="w-5 h-5 ml-2 transition-transform transform-gpu hover:translate-x-1 hover:duration-200"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                  <p className="">{`Duration: ${quiz.q_time} mins`}</p>
                </>
              ) : (
                <>
                  <span className="text-green-600">Attempted ✔</span>
                  <p className="text-lg">{`Score: ${quiz.marks_obtained}/${quiz.total_marks}`}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

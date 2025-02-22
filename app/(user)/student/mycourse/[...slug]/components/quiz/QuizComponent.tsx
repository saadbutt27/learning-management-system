"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import MyTooltip from "@/components/reusable/MyTooltip";
import { MoveRight } from "lucide-react";

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

  const localUploadDate = new Date(quiz.q_upload_date).toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
  });

  const currentDate = new Date(); // Current local time
  const dueDateUTC = new Date(quiz.q_due_date); // Due date from DB (UTC)

  // Convert dueDate from UTC to Local Time
  const dueDateLocal = new Date(
    dueDateUTC.getTime() + new Date().getTimezoneOffset() * 60000
  );

  // Compare as local time
  const isPastDue = currentDate > dueDateLocal;

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
                  upload_date={localUploadDate}
                  due_date={quiz.q_due_date}
                  isPastDue={isPastDue}
                />
              </div>
            </div>

            <div className="mt-2 flex justify-between items-center flex-wrap">
              <div>
                {isPastDue ? (
                  <>
                    <p className="">Quiz Closed</p>
                    {!quiz.attempt ? (
                      <span className="text-red-600">Not Attempted ❌</span>
                    ) : (
                      <span className="text-green-600">Attempted ✔</span>
                    )}
                  </>
                ) : quiz.attempt ? (
                  <span className="text-green-600">Attempted ✔</span>
                ) : (
                  <Link
                    href={{
                      pathname: "/student/quiz_attempt/",
                      query: { course_id, q_id: quiz.q_id, student_id },
                    }}
                    className="group hover:underline hover:text-gray-600 font-medium flex items-center duration-300"
                  >
                    Go to Quiz
                    <MoveRight className="w-5 h-5 ml-1.5 transition-transform transform-gpu group-hover:translate-x-1 group-hover:duration-200" />
                  </Link>
                )}
              </div>

              {/* Score is always on the right */}
              <div className="text-right">
                <p className="">{`Duration: ${quiz.q_time} mins`}</p>
                {quiz.attempt && (
                  <p className="text-lg">{`Score: ${quiz.marks_obtained}/${quiz.total_marks}`}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

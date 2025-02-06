"use client";
import React, { useEffect, useState } from "react";
import QuizComponent from "./QuizComponent";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    s_id: string;
    s_name: string;
    s_image?: string;
    accessToken: string;
  } & Session["user"];
}

type QuizType = {
  q_id: number;
  q_topic: string;
  q_desc: string;
  q_upload_date: string;
  q_due_date: string;
  q_time: number;
};

export default function Quiz() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const searchParams = useSearchParams();
  const { course_id, teacher_id } = {
    course_id: searchParams.get("course_id"),
    teacher_id: searchParams.get("teacher_id"),
  };
  const [quizzes, setQuizzes] = useState<QuizType[]>();
  useEffect(() => {
    if (status === "authenticated") {
      fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/quiz_teacher?course_id=${course_id}&teacher_id=${teacher_id}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setQuizzes(data);
          console.log(data);
        });
    }
  }, [status, course_id, teacher_id, session?.user.accessToken]);

  const handleDeleteQuiz = (quizId: number) => {
    setQuizzes((prevQuizzes) =>
      prevQuizzes?.filter((quiz) => quiz.q_id !== quizId)
    );
  };

  if (status === "authenticated" && quizzes && quizzes.length) {
    return (
      <div className="px-2">
        <h2 className="text-3xl font-medium">Quizzes</h2>
        <TooltipProvider delayDuration={100}>
          <ul>
            {typeof quizzes != "string" && quizzes.length > 0
              ? quizzes.map((quiz) => {
                  return (
                    <QuizComponent
                      key={quiz.q_id}
                      quiz={quiz}
                      onDelete={handleDeleteQuiz}
                    />
                  );
                })
              : "No Quiz!"}
          </ul>
        </TooltipProvider>
      </div>
    );
  } else if (quizzes?.length === 0) {
    return (
      <p className="flex justify-center items-center text-2xl font-bold text-gray-600">
        Quizzes not uploaded!
      </p>
    );
  } else {
    return (
      <p className="flex justify-center items-center text-2xl font-bold">
        LOADING...
      </p>
    );
  }
}

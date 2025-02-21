"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AssignmentComponent from "./AssignmentComponent";
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

type Assignment = {
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

export default function Assignment() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const { course_id, teacher_id, student_id } = {
    course_id: searchParams.get("course_id"),
    teacher_id: searchParams.get("teacher_id"),
    student_id: searchParams.get("student_id"),
  };
  const [assignments, setAssignments] = useState<Assignment[]>();

  useEffect(() => {
    if (status === "authenticated") {
      fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/assignment_student?course_id=${course_id}&teacher_id=${teacher_id}&student_id=${student_id}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setAssignments(data);
        });
    }
  }, [status, course_id, teacher_id, student_id, session?.user.accessToken]);

  if (status === "authenticated" && assignments && assignments.length > 0) {
    return (
      <TooltipProvider delayDuration={100}>
        <div>
          <h2 className="text-3xl font-medium select-none">Assignments</h2>
          <ul>
            {assignments.length > 0
              ? assignments.map((assignment: Assignment, index: number) => {
                  return (
                    <AssignmentComponent
                      assignment={assignment}
                      s_id={session?.user.s_id || "stxxx"}
                      key={index}
                    />
                  );
                })
              : "NO ASSIGNMENTS"}
          </ul>
        </div>
      </TooltipProvider>
    );
  } else if (assignments?.length === 0) {
    return (
      <p className="flex justify-center items-center text-2xl font-bold text-gray-600">
        Assignments not uploaded!
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

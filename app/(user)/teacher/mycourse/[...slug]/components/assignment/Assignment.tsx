"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import AssignmentComponent from "./AssignmentComponent";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    t_id: string;
    t_name: string;
    t_image?: string;
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
  topic: string;
  file: string;
};
export default function Assignment() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const { course_id, teacher_id } = {
    course_id: searchParams.get("course_id"),
    teacher_id: searchParams.get("teacher_id"),
  };
  const [assignments, setAssignments] = useState<Assignment[]>();

  useEffect(() => {
    if (status === "authenticated") {
      fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/assignment_teacher?course_id=${course_id}&teacher_id=${teacher_id}`,
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
  }, [status, course_id, teacher_id, session?.user.accessToken]);

  const handleDeleteAssignment = (assignmentId: number) => {
    setAssignments((prevAssignments) =>
      prevAssignments?.filter(
        (assignment) => assignment.assignment_id !== assignmentId
      )
    );
  };

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
                      key={index}
                      onDelete={handleDeleteAssignment}
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

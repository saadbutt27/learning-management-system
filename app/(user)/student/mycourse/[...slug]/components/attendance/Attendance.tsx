"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    s_id: string;
    s_name: string;
    s_image?: string;
    accessToken: string;
  } & Session["user"];
}

import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Row from "./Row";

type AttendanceType = {
  date_of_attendance: string;
  attendance_state: string;
};

export default function Attendance() {
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
  const [attendance, setAttendance] = useState<AttendanceType[]>();
  useEffect(() => {
    if (status === "authenticated") {
      fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/attendance_student?course_id=${course_id}&teacher_id=${teacher_id}&student_id=${student_id}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setAttendance(data);
        });
    }
  }, [status, course_id, session?.user.accessToken, student_id, teacher_id]);

  if (status === "authenticated" && attendance && attendance.length > 0) {
    return (
      <div className="px-2 select-none">
        <h2 className="text-3xl font-medium mb-4">Attendance</h2>
        <Table>
          <TableCaption>Attendance Records.</TableCaption>
          <TableHeader className="lg:text-lg text-base">
            <TableRow>
              <TableHead className="lg:w-1/5">Date</TableHead>
              <TableHead className="lg:w-3/5 ">Session</TableHead>
              <TableHead className="lg:w-1/5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {typeof attendance != "string" && attendance.length > 0
              ? attendance.map((attend, index) => {
                  return (
                    <Row
                      key={index}
                      date_of_attendance={attend.date_of_attendance}
                      attendance_status={attend.attendance_state}
                    />
                  );
                })
              : ""}
          </TableBody>
        </Table>
      </div>
    );
  } else if (attendance?.length === 0) {
    return (
      <p className="flex justify-center items-center text-2xl font-bold text-gray-600">
        No record for your attendance!
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

"use client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Material from "./Material";
import { Session } from "next-auth";
import { Suspense } from "react";

interface ExtendedSession extends Session {
  user: {
    s_id: string;
    s_name: string;
    s_image?: string;
    accessToken: string;
  } & Session["user"];
}

type LectureType = {
  description: string;
  upload_date: string;
  m_file: string;
  topic: string;
};

export default function Lecture() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const searchParams = useSearchParams();
  const { course_id, student_id } = {
    course_id: searchParams.get("course_id"),
    student_id: searchParams.get("student_id"),
  };
  const [lectures, setLectures] = useState<LectureType[]>();
  useEffect(() => {
    if (status === "authenticated") {
      fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/lecture_student?course_id=${course_id}&student_id=${student_id}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${session?.user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch lectures");
          }
          return response.json();
        })
        .then((data: LectureType[]) => setLectures(data))
        .catch((error) => {
          console.error("Error fetching lectures:", error);
        });
    }
  }, [status, course_id, session?.user.accessToken, student_id]);

  if (status === "authenticated" && lectures && lectures.length > 0) {
    return (
      <div className="px-2">
        <h2 className="text-3xl font-medium">Lectures</h2>
        <ul>
          <Suspense
            fallback={
              <p className="flex justify-center items-center text-2xl font-bold text-gray-600">
                Lectures not uploaded!
              </p>
            }
          >
            {lectures.map((lecture, index) => (
              <Material
                key={index}
                topic={lecture.topic}
                file={lecture.m_file}
                description={lecture.description}
                uploadDate={lecture.upload_date}
              />
            ))}
          </Suspense>
        </ul>
      </div>
    );
  } else if (lectures?.length === 0) {
    return (
      <p className="flex justify-center items-center text-2xl font-bold text-gray-600">
        Lectures not uploaded!
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

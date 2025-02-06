"use client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import AnnnouncementComponent from "./AnnouncementComponent";
import { Session } from "next-auth";
import { Megaphone } from "lucide-react";

interface ExtendedSession extends Session {
  user: {
    s_id: string;
    s_name: string;
    s_image?: string;
    accessToken: string;
  } & Session["user"];
}

type AnnouncementType = {
  topic: string;
  description: string;
  upload_date: string;
};
export default function Announcement() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const searchParams = useSearchParams();
  const { course_id, student_id } = {
    course_id: searchParams.get("course_id"),
    student_id: searchParams.get("student_id"),
  };
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>();
  useEffect(() => {
    if (status === "authenticated") {
      fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/announcement_student?course_id=${course_id}&student_id=${student_id}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setAnnouncements(data);
        });
    }
  }, [status, course_id, student_id, session?.user.accessToken]);

  if (status === "authenticated" && announcements && announcements.length > 0) {
    return (
      <>
        <div className="flex items-center gap-x-2">
          <h2 className="text-3xl font-medium select-none">Announcements</h2>
          <Megaphone className="w-8 h-8" />
        </div>
        {announcements.map((announcement: AnnouncementType, index:number) => {
          return <AnnnouncementComponent key={index} announcement={announcement} />;
        })}
      </>
    );
  } else if (announcements?.length === 0) {
    return (
      <p className="flex justify-center items-center text-2xl font-bold text-gray-600">
        No announcements!
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

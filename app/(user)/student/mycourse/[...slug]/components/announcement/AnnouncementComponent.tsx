import { formatUploadDateTime } from "@/lib/dateFormatter";
import React from "react";

type Props = {
  announcement: {
    topic: string;
    description: string;
    upload_date: string;
  };
};
export default function AnnouncementComponent({ announcement }: Props) {
  return (
    <li className="list-none border-t-2 border-black my-2 py-4">
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 pt-4 pb-10 px-5 my-1">
        <div className="flex flex-col justify-between select-none w-full">
          <p className="text-2xl font-medium">{announcement.topic}</p>
          <p className="text-sm lg:text-base mt-2">
            {announcement.description}
          </p>
        </div>
        <p className="self-start">
          <span className="font-semibold">Upload Date</span>:{" "}
          {formatUploadDateTime(announcement.upload_date)}
        </p>
      </div>
    </li>
  );
}

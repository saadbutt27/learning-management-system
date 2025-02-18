import { formatUploadDateTime } from "@/lib/dateFormatter";
import React from "react";
import Link from "next/link";

type Props = {
  description: string;
  uploadDate: string;
  topic: string;
  file: string;
};

export default function Material({
  description,
  uploadDate,
  topic,
  file,
}: Props) {
  return (
    <li className="border-t-2 border-black my-2 py-4">
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 pt-4 pb-10 px-5 my-1">
        <div className="flex basis-full sm:basis-1/2">
          <div className="select-none">
            <p className="text-xl sm:text-2xl font-medium mb-1.5">{topic}</p>
            <p className="text-base sm:text-lg font-medium mb-1.5">{description}</p>
            {file && (
              <Link
                href={file}
                target={"_blank"}
                className="hover:text-gray-600 font-semibold underline"
              >
                Download Lecture
              </Link>
            )}
            <p>
              <span className="font-semibold">Upload Date:</span>{" "}
              {formatUploadDateTime(uploadDate)}{" "}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

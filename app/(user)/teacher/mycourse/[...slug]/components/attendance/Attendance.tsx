"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Attendance() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const searchParams = useSearchParams();
  const { course_id } = { course_id: searchParams.get("course_id") };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const form = e.target as HTMLFormElement;
    const time = form.at_time.value;
    const date = form.at_date.value;
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/attendance_session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        date: `${date} ${time}:00`,
        c_id: course_id,
      }),
    });

    const { a_id } = await res.json();
    router.push(`/teacher/mark_attendance?a_id=${a_id}&c_id=${course_id}`);
    setUploading(false);
  };

  return (
    <>
      <div className="select-none mx-6 my-4">
        <h2 className="text-3xl font-medium mb-2">Attendance</h2>
        <h2 className="text-base text-gray-700 mb-4">Please create a session to mark the attendance</h2>
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="my-6">
            <label
              htmlFor="at_date"
              className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
            >
              Date
            </label>
            <input
              type="date"
              id="at_date"
              name="at_date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="at_time"
              className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
            >
              Session time
            </label>
            <input
              type="time"
              id="at_time"
              name="at_time"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
              placeholder="HH:MM am"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="cursor-pointer text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center hover:scale-110 duration-300"
          >
            Mark attendance
          </button>
        </form>
      </div>
    </>
  );
}

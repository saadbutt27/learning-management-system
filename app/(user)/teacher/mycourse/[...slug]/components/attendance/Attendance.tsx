"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useSession } from "next-auth/react";

import { formatDateTime } from "@/lib/dateFormatter";

interface SessionI {
  a_id: string;
  date: string;
  time: string;
  is_marked: boolean;
}

export default function Attendance() {
  const { status } = useSession() as {
    status: string;
  };
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [sessions, setSessions] = useState<SessionI[] | null>(null);
  const searchParams = useSearchParams();
  const course_id = searchParams.get("course_id");

  useEffect(() => {
    if (status === "authenticated") {
      fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/attendance_session?c_id=${course_id}`,
        {
          method: "GET",
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch sessions");
          }
          return response.json();
        })
        .then((data) => {
          // Add is_marked as true for all fetched sessions
          const updatedSessions = data.sessions.map(
            (session: { a_id: string; date_of_attendance: string }) => {
              // Call formatDateTime function to get the formatted date and time
              const formattedDateTime = formatDateTime(
                session.date_of_attendance
              );

              // Split the string into parts
              const dateTimeParts = formattedDateTime.split(" "); // ['Feb', '02', '2025', '5:00:00', 'PM']

              // Construct date and time separately
              const date = `${dateTimeParts[0]} ${dateTimeParts[1]} ${dateTimeParts[2]}`; // "Feb 02 2025"
              const time = `${dateTimeParts[3]} ${dateTimeParts[4]}`;

              return {
                ...session,
                date: date, // Assign formatted date (e.g., "Feb 02 2025")
                time: time, // Assign formatted time (e.g., "5:00:00 PM")
                is_marked: true, // Set is_marked to true
              };
            }
          );
          setSessions(updatedSessions);
        })
        .catch((error) => {
          console.error("Error fetching sessions:", error);
        });
    }
  }, [course_id, status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const form = e.target;
    const time = (form as HTMLFormElement).at_time.value;
    const date = (form as HTMLFormElement).at_date.value;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/attendance_session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          date: `${date} ${time}:00`,
          c_id: course_id,
        }),
      }
    );

    const { a_id } = await res.json();
    router.push(`/teacher/mark_attendance?a_id=${a_id}&c_id=${course_id}`);
    setUploading(false);
  };

  return (
    <div className="select-none mx-6 my-4">
      <div className="my-8">
        <h3 className="text-3xl font-medium mb-4">Previous Sessions</h3>
        {status === "authenticated" ? (
          sessions === null ? ( // Check if the fetch is still in progress
            <p className="text-gray-600">Loading...</p>
          ) : sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
                <thead>
                  <tr className="text-lg font-medium text-gray-900">
                    <th className="px-6 py-3 border-b text-left">Date</th>
                    <th className="px-6 py-3 border-b text-left">Time</th>
                    <th className="px-6 py-3 border-b text-left">
                      Attendance Status
                    </th>
                    <th className="px-6 py-3 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.a_id}
                      className="hover:bg-gray-100 text-base"
                    >
                      <td className="px-6 py-4 border-b text-gray-700">
                        {session.date}
                      </td>
                      <td className="px-6 py-4 border-b text-gray-700">
                        {session.time}
                      </td>
                      <td className="px-6 py-4 border-b text-gray-700">
                        {session.is_marked ? "Marked" : "Not Marked"}
                      </td>
                      <td className="px-6 py-4 border-b">
                        <button
                          onClick={() =>
                            router.push(
                              `/teacher/mark_attendance?a_id=${session.a_id}&c_id=${course_id}`
                            )
                          }
                          className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No sessions found.</p>
          )
        ) : (
          <p className="text-gray-600">Loading...</p>
        )}
      </div>

      <h2 className="text-3xl font-medium mb-2">Attendance</h2>
      <h2 className="text-base text-gray-700 mb-4">
        Please create a session to mark the attendance
      </h2>
      <form onSubmit={handleSubmit}>
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
            placeholder="HH:MM"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="cursor-pointer text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center hover:scale-110 duration-300"
        >
          {uploading ? "Uploading..." : "Mark attendance"}
        </button>
      </form>
    </div>
  );
}

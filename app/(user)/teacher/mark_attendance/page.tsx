"use client";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

interface Student {
  id: string;
  name: string;
}
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarkAttendance />
    </Suspense>
  );
}

function MarkAttendance() {
  const [attendance, setAttendance] = useState<
    Record<string, boolean | number>
  >({});
  const searchParams = useSearchParams();
  const [initial, setInitial] = useState(false);
  const [students, setStudents] = useState<Student[]>();
  const { a_id, c_id } = {
    a_id: searchParams.get("a_id"),
    c_id: searchParams.get("c_id"),
  };
  const [isAlreadyMarked, setIsAlreadyMarked] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const attendanceResponse = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/attendance_mark?a_id=${a_id}`
        );
        const attendanceData = await attendanceResponse.json();

        if (attendanceData.length > 0) {
          const formattedAttendance = attendanceData.reduce(
            (
              acc: Record<string, boolean>,
              {
                s_id,
                attendance_state,
              }: { s_id: string; attendance_state: boolean }
            ) => {
              acc[s_id] = attendance_state;
              return acc;
            },
            {}
          );

          const studentsList = attendanceData.map(
            ({ s_id, s_name }: { s_id: string; s_name: string }) => ({
              id: s_id,
              name: s_name,
            })
          );

          setAttendance(formattedAttendance);
          setStudents(studentsList);
          setIsAlreadyMarked(true);
        } else {
          const studentResponse = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/attendance_course_student?c_id=${c_id}`
          );
          const studentsData = await studentResponse.json();
          setStudents(studentsData);
        }

        setInitial(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAttendanceData();
  }, [a_id, c_id]);

  const [isModified, setIsModified] = useState(false);
  const handleStatusChange = (studentId: string, status: boolean) => {
    setAttendance((prev) => {
      if (prev[studentId] !== status) setIsModified(true);
      return { ...prev, [studentId]: status };
    });
  };

  const handleSelectAll = (status: boolean) => {
    const updatedAttendance = students?.reduce((acc, student) => {
      acc[student.id] = status;
      return acc;
    }, {} as Record<string, boolean>);

    setAttendance(updatedAttendance || {});
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/attendance_mark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            a_id,
            attendance,
            c_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          alert(`Error: ${errorData.error}`);
        } else {
          alert("An unexpected error occurred. Please try again.");
        }
        return;
      }

      // If successful, navigate to the teacher page
      router.push("/teacher");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert(
        "Failed to submit attendance due to a network error. Please try again."
      );
    }
  };

  const handleUpdate = async () => {
    try {
      // Prepare attendance data in the desired format: array of { s_id, attendance_state }
      const attendanceData = Object.entries(attendance).map(
        ([s_id, attendance_state]) => ({
          s_id,
          attendance_state,
        })
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/attendance_mark`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            a_id,
            attendance: attendanceData, // Sending as array of objects
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          alert(`Error: ${errorData.error}`);
        } else {
          alert("An unexpected error occurred. Please try again.");
        }
        return;
      }

      // If successful, navigate to the teacher page
      router.push(`${process.env.NEXT_PUBLIC_URL}/teacher`);
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert(
        "Failed to update attendance due to a network error. Please try again."
      );
    }
  };

  if (initial) {
    return (
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg md:ml-[90px] mx-6 my-4">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-base text-gray-700 uppercase bg-gray-50 border-b-2 border-b-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">
                Student ID
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3 flex">
                <input
                  type="radio"
                  name="status"
                  onChange={() => handleSelectAll(true)}
                />
                <label className="ml-1.5 mr-3.5" htmlFor={"ca"}>
                  P
                </label>
                <input
                  type="radio"
                  name="status"
                  onChange={() => handleSelectAll(false)}
                />
                <label className="mx-1.5" htmlFor={"ca"}>
                  A
                </label>
              </th>
            </tr>
          </thead>
          <tbody>
            {students?.map((student) => (
              <tr
                key={student.id}
                className="text-sm border-b bg-white even:bg-gray-100"
              >
                <td className="px-6 py-4">{student.id}</td>
                <td
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {student.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`status_${student.id}`}
                      value="present"
                      checked={attendance[student.id] === true}
                      className="mr-2"
                      onChange={() => handleStatusChange(student.id, true)}
                    />
                    <label
                      htmlFor={`status_${student.id}`}
                      className="mr-4"
                    ></label>
                    <input
                      type="radio"
                      name={`status_${student.id}`}
                      value="absent"
                      checked={attendance[student.id] === false}
                      className="mr-2"
                      onChange={() => handleStatusChange(student.id, false)}
                    />
                    <label htmlFor={`status_${student.id}`}></label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="submit"
          className={clsx(
            "text-white bg-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center float-right my-4 mx-2",
            isAlreadyMarked
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 hover:scale-110 duration-300"
          )}
          onClick={() => handleSubmit()}
          disabled={isAlreadyMarked}
        >
          Submit attendance
        </button>
        <button
          type="button"
          className={clsx(
            "text-white bg-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center float-right my-4 mx-2",
            !isAlreadyMarked || !isModified
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 hover:scale-110 duration-300"
          )}
          onClick={handleUpdate}
          disabled={!isAlreadyMarked || !isModified}
        >
          Update Attendance
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div role="status">
        <svg
          aria-hidden="true"
          className="w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

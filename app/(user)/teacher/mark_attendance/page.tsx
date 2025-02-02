"use client";
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
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/attendance_course_student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        c_id,
      }),
    })
      .then((data) => data.json())
      .then((data) => setStudents(data))
      .then(() => setInitial(true));
  }, [c_id]);

  const handleStatusChange = (studentId: string, status: boolean | number) => {
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [studentId]: status,
    }));
  };

  const handleSelectAll = (selectAll: boolean, caller: boolean | number) => {
    const updatedAttendance: Record<string, boolean | number> = {};

    students?.forEach((student) => {
      updatedAttendance[student.id] = caller;
    });

    setAttendance(updatedAttendance);
  };

  const handleSubmit = () => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/attendance_mark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        a_id,
        attendance,
      }),
    }).then(() => router.push("/teacher"));
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
                  onChange={(e) => handleSelectAll(e.target.checked, true)}
                />
                <label className="ml-1.5 mr-3.5" htmlFor={"ca"}>
                  P
                </label>
                <input
                  type="radio"
                  name="status"
                  onChange={(e) => handleSelectAll(e.target.checked, false)}
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
          className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center float-right my-4 mx-10 hover:scale-110 duration-300"
          onClick={() => handleSubmit()}
        >
          Submit attendance
        </button>
      </div>
    );
  }
  return <h1>Loading...</h1>;
}

"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { X, Trash2, CircleAlert } from "lucide-react";
import MyTooltip from "@/components/reusable/MyTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUploadDateTime } from "@/lib/dateFormatter";
import { useSearchParams } from "next/navigation";

type Props = {
  assignment: {
    assignment_id: number;
    assignment_description: string;
    course_name: string;
    due_date: string;
    teacher_name: string;
    upload_date: string;
    topic: string;
    file: string;
  };
  onDelete: (assignmentId: number) => void; // Add this
};

interface FormValues {
  // Define the fields of your form and their respective types
  updatedDate: string;
  dueDate: string;
  // ...
}

export default function AssignmentComponent({ assignment, onDelete }: Props) {
  const [click, clickResult] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attemptsOpen, setAttemptsOpen] = useState(false);

  const [updatedDate, setUpdatedDate] = useState<string>(assignment.due_date);
  const formRef = useRef<HTMLFormElement>(null);
  let formValues: FormValues;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current) {
      const formData = new FormData(formRef.current);
      formValues = Object.fromEntries(
        formData.entries()
      ) as unknown as FormValues;

      // Use form values as needed
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/assignment_teacher`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            a_id: assignment.assignment_id,
            due_date: formValues.dueDate,
          }),
        }
      );

      const data = await res.json();

      assignment = { ...assignment, due_date: data.updated_due_date };
      setUpdatedDate(assignment.due_date);
      closeUpdate();
    }
  };
  const handleOpenUpdate = () => {
    setIsUpdateOpen((prev) => !prev);
  };
  const closeUpdate = () => {
    setIsUpdateOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenAttemptsModal = () => {
    setAttemptsOpen(true);
  };
  const closeAttemptsModal = () => {
    setAttemptsOpen(false);
  };

  const handleDelete = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/assignment_teacher?at_id=${assignment.assignment_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(() => {
        closeModal();
        onDelete(assignment.assignment_id); // Call the parent function to remove it
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Upload date
  const localUploadDate = new Date(assignment.upload_date).toLocaleString(
    "en-US",
    {
      timeZone: "Asia/Karachi",
    }
  );

  const currentDate = new Date(); // Current local time
  const dueDateUTC = new Date(assignment.due_date); // Due date from DB (UTC)

  // Convert dueDate from UTC to Local Time
  const dueDateLocal = new Date(
    dueDateUTC.getTime() + new Date().getTimezoneOffset() * 60000
  );

  // Compare as local time
  const isPastDue = currentDate > dueDateLocal;

  return (
    <li className="border-t-2 border-black my-2 py-4">
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 pt-4 pb-10 px-5 my-1">
        <div className="flex basis-full">
          <div className="flex lg:flex-row flex-col justify-between select-none w-full">
            <div className="basis-1/2">
              <p className="text-2xl font-medium">
                {assignment.topic || "Assignment"}
              </p>
              <p className="text-sm lg:text-base mt-2">
                {assignment.assignment_description}
              </p>
            </div>
            <div className="my-2 lg:my-0">
              <div className="flex flex-col lg:items-end">
                <div className="flex items-center gap-x-2">
                  {isUpdateOpen ? (
                    <div className="px-1 py-2 text-center">
                      <form action="" ref={formRef} onSubmit={handleSubmit}>
                        <div>
                          <div className="flex justify-between items-center">
                            <label
                              htmlFor="dueDate"
                              className="text-left block mb-2 text-base font-medium text-gray-900 dark:text-white"
                            >
                              Update Due Date
                            </label>
                            <button onClick={handleOpenUpdate}>
                              <X className="w-6 h-6 cursor-pointer" />
                            </button>
                          </div>
                          <input
                            type="datetime-local"
                            id="dueDate"
                            name="dueDate"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                            placeholder=""
                          />
                          <div className="flex items-center gap-x-2 lg:justify-end">
                            <button className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 mt-4 text-center">
                              Update
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="lg:self-end space-x-2">
                        <button onClick={handleOpenUpdate}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </button>
                        <button onClick={handleOpenModal}>
                          <Trash2 className="w-8 h-8 text-red-500" />
                        </button>
                      </div>
                      <MyTooltip
                        upload_date={localUploadDate}
                        due_date={updatedDate}
                        isPastDue={isPastDue}
                      />
                    </div>
                  )}
                </div>
                {assignment.file && (
                  <Link
                    href={assignment.file}
                    target={"_blank"}
                    className="hover:text-gray-600 font-semibold underline"
                  >
                    Download Assignment
                  </Link>
                )}
              </div>

              {/*  Delete confoirmation modal */}
              <div>
                {isModalOpen && (
                  <div
                    id="popup-modal"
                    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center top-0 left-[10%] right-[10%] lg:left-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}
                  >
                    <div className="relative w-full max-w-md max-h-full">
                      <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow dark:bg-gray-700">
                        <div className="flex flex-col  items-center p-6 text-center gap-y-5">
                          <CircleAlert className="w-10 h-10" />
                          <h3 className="lg:mb-5 mb-2 lg:text-lg text-sm font-normal text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this assignment?
                          </h3>
                          <div>
                            <button
                              data-modal-hide="popup-modal"
                              type="button"
                              className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg lg:text-sm text-xs inline-flex items-center lg:px-5 lg:py-2.5 px-3 py-1.5 text-center mr-2"
                              onClick={handleDelete}
                            >
                              Yes, I&apos;m sure
                            </button>
                            <button
                              data-modal-hide="popup-modal"
                              type="button"
                              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 lg:text-sm text-xs font-medium lg:px-5 lg:py-2.5 px-3 py-1.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                              onClick={closeModal}
                            >
                              No, cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 group">
                <button
                  className="flex items-center hover:text-gray-600 font-semibold underline"
                  onClick={handleOpenAttemptsModal}
                >
                  See Attempts
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 ml-1 transition-transform transform-gpu group-hover:translate-x-1 group-hover:duration-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>

              {/* Attempts modal */}
              <div>
                {attemptsOpen && (
                  <div
                    id="popup-modal"
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
                  >
                    <div className="relative w-full min-w-[300px] max-w-4xl bg-white border-2 border-gray-300 rounded-lg shadow dark:bg-gray-700 p-6 overflow-auto max-h-[80vh]">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <h2 className="sm:text-2xl text-xl font-semibold mb-4">
                          Assignment Submissions
                        </h2>
                        <button
                          data-modal-hide="popup-modal"
                          type="button"
                          className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 lg:text-sm text-xs font-medium lg:px-5 lg:py-2.5 px-3 py-1.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                          onClick={closeAttemptsModal}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Content */}
                      <SeeAttempts assignment_id={assignment.assignment_id} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

interface Student {
  s_id: number;
  s_name: string;
  upload_date: string | null;
  marks: number | null;
  total_marks: number;
  assignment_file: string;
}

const SeeAttempts = ({ assignment_id }: { assignment_id: number }) => {
  const searchParams = useSearchParams();
  const course_id = searchParams.get("course_id");
  const teacher_id = searchParams.get("teacher_id");

  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!assignment_id || !teacher_id || !course_id) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/student_assignment_attempts?a_id=${assignment_id}&t_id=${teacher_id}&c_id=${course_id}`
        );
        const data = await res.json();
        console.log("data: ", data);
        setStudents(data);
        console.log("students: ", students);
      } catch (error) {
        console.error("Error fetching student submissions data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [assignment_id, teacher_id, course_id]);

  return (
    <div className="select-none">
      {loading ? (
        <SkeletonTable />
      ) : students && students.length > 0 ? (
        <StudentTable students={students} />
      ) : (
        <p className="flex justify-center items-center text-xl font-bold">
          There are no attempts!
        </p>
      )}
    </div>
  );
};

const StudentTable = ({ students }: { students: Student[] }) => {
  const [studentData, setStudentData] = useState<Student[]>(students);
  const [grades, setGrades] = useState<{ [key: number]: number | null }>({});

  // Function to handle input change for grades
  const handleGradeChange = (studentId: number, value: string) => {
    const grade = value === "" ? null : Number(value);
    setGrades((prev) => ({ ...prev, [studentId]: grade }));
  };

  // Function to submit marks
  const submitGrade = async (studentId: number) => {
    if (grades[studentId] === null || grades[studentId] === undefined) {
      alert("Please enter a valid mark before submitting.");
      return;
    }

    try {
      const response = await fetch("/api/teacher_assignment_attempts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, marks: grades[studentId] }),
      });

      if (response.ok) {
        alert("Marks submitted successfully!");

        // Update the marks in state without reloading
        setStudentData((prevData) =>
          prevData.map((student) =>
            student.s_id === studentId
              ? { ...student, marks: grades[studentId] }
              : student
          )
        );

        // Clear input field after submission
        setGrades((prev) => ({ ...prev, [studentId]: null }));
      } else {
        alert("Failed to submit marks. Try again.");
      }
    } catch (error) {
      console.error("Error submitting marks:", error);
    }
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-base text-gray-700 uppercase bg-gray-50 border-b-2 border-b-gray-700">
          <tr>
            <th className="px-6 py-3">Student ID</th>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Submission Date</th>
            <th className="px-6 py-3">Submitted File</th>
            <th className="px-6 py-3">
              Marks (out of{" "}
              {studentData[0].total_marks
                ? studentData[0].total_marks
                : "Not updated"}
              )
            </th>
          </tr>
        </thead>
        <tbody>
          {studentData.map((student) => (
            <tr
              key={student.s_id}
              className={`text-gray-900 text-sm border-b ${
                student.marks === null
                  ? "bg-white even:bg-gray-100"
                  : student.marks === student.total_marks
                  ? "bg-green-500 text-white"
                  : student.marks === 0
                  ? "bg-red-600 text-white"
                  : ""
              }`}
            >
              <td className="px-6 py-4">{student.s_id}</td>
              <td className="px-6 py-4 font-medium whitespace-nowrap">
                {student.s_name}
              </td>
              <td className="px-6 py-4 font-medium whitespace-nowrap">
                {student.upload_date
                  ? formatUploadDateTime(student.upload_date)
                  : "N/A"}
              </td>
              <td className="px-6 py-4 font-medium tracking-widest whitespace-nowrap">
                {student.assignment_file === null ? (
                  "Not Submitted"
                ) : (
                  <Link
                    href={student.assignment_file}
                    target="_blank"
                    className="font-semibold underline"
                  >
                    Submitted file
                  </Link>
                )}
              </td>
              <td className="px-6 py-4 font-medium tracking-widest whitespace-nowrap">
                {student.marks === null
                  ? student.assignment_file
                    ? "Pending"
                    : "Not Attempted"
                  : `${student.marks} / ${student.total_marks}`}
              </td>
              <td className="px-6 py-4 flex gap-2">
                <input
                  type="number"
                  className="w-20 px-2 py-1 border rounded"
                  placeholder="Marks"
                  value={grades[student.s_id] ?? ""}
                  onChange={(e) =>
                    handleGradeChange(student.s_id, e.target.value)
                  }
                />
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => submitGrade(student.s_id)}
                >
                  Submit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SkeletonTable = () => (
  <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-base text-gray-700 uppercase bg-gray-50 border-b-2 border-b-gray-700">
        <tr>
          <th className="px-6 py-3">Student ID</th>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Submission Date</th>
          <th className="px-6 py-3">Quiz Marks</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, index) => (
          <tr key={index}>
            <td className="px-2 py-4">
              <Skeleton className="w-full h-10 bg-gray-200" />
            </td>
            <td className="px-2 py-4">
              <Skeleton className="w-full h-10 bg-gray-200" />
            </td>
            <td className="px-2 py-4">
              <Skeleton className="w-full h-10 bg-gray-200" />
            </td>
            <td className="px-2 py-4">
              <Skeleton className="w-full h-10 bg-gray-200" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

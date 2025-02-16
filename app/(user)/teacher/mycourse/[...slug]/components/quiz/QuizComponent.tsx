"use client";
import MyTooltip from "@/components/reusable/MyTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/dateFormatter";
import { Trash2, X, CircleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

type Props = {
  quiz: {
    q_id: number;
    q_topic: string;
    q_desc: string;
    q_upload_date: string;
    q_due_date: string;
    q_time: number;
  };
  onDelete: (assignmentId: number) => void; // Add this
};

interface FormValues {
  // Define the fields of your form and their respective types
  updatedDate: string;
  dueDate: string;
  // ...
}

export default function QuizComponent({ quiz, onDelete }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attemptsOpen, setAttemptsOpen] = useState(false);

  const [updatedDate, setUpdatedDate] = useState<string>(quiz.q_due_date);
  const formRef = useRef<HTMLFormElement>(null);
  let formValues: FormValues;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current) {
      const formData = new FormData(formRef.current);
      formValues = Object.fromEntries(
        formData.entries()
      ) as unknown as FormValues;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/quiz_teacher`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            q_id: quiz.q_id,
            due_date: formValues.dueDate,
          }),
        }
      );

      const data = await res.json();
      // Use form values as needed
      quiz = { ...quiz, q_due_date: data.updated_due_date };
      setUpdatedDate(quiz.q_due_date);
      closeUpdate();
    }
  };
  const handleOpenUpdate = () => {
    setIsUpdateOpen(true);
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
      `${process.env.NEXT_PUBLIC_URL}/api/quiz_teacher?q_id=${quiz.q_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(() => {
        closeModal();
        onDelete(quiz.q_id); // Call the parent function to remove it
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const currentDate = new Date();
  const dueDate = new Date(quiz.q_due_date);
  const isPastDue = currentDate > dueDate;

  return (
    <li className="border-t-2 border-black py-4">
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 pt-4 pb-10 px-5 my-1">
        <div className="flex basis-full">
          <div className="select-none w-full">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
              <div className="">
                <p className="text-2xl font-medium">{quiz.q_topic}</p>
                <p className="text-sm lg:text-base mt-2">{quiz.q_desc}</p>
              </div>
              <div className="flex items-center gap-x-2 self-start order-last mt-2 lg:mt-0">
                {isUpdateOpen ? (
                  <div className="px-1 py-2 text-center">
                    <form action="" ref={formRef} onSubmit={handleSubmit}>
                      <div>
                        <div className="flex justify-between items-center">
                          <label
                            htmlFor="dueDate"
                            className="text-left block text-base font-medium text-gray-900 dark:text-white"
                          >
                            Update Due Date
                          </label>
                          <button onClick={closeUpdate}>
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
                      upload_date={quiz.q_upload_date}
                      due_date={updatedDate}
                      isPastDue={isPastDue}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal for delete confirmation */}
            <div>
              {isModalOpen && (
                <div
                  id="popup-modal"
                  className={`flex items-center justify-center fixed top-0 left-[10%] right-[10%] lg:left-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}
                >
                  <div className="relative w-full max-w-md max-h-full">
                    <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow dark:bg-gray-700">
                      <div className="flex flex-col  items-center p-6 text-center gap-y-5">
                        <CircleAlert className="w-10 h-10" />
                        <h3 className="lg:mb-5 lg:text-lg text-sm font-normal text-gray-500 dark:text-gray-400">
                          Are you sure you want to delete this quiz?
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
                {/* <Link
                  href={{
                    pathname: "/teacher/attempts",
                    query: { q_id: quiz.q_id, c_id: course_id },
                  }}
                  className="flex items-center hover:text-gray-600 font-semibold underline"
                > */}
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
                {/* </Link> */}
              </button>
            </div>

            {/* Modal for attempts */}
            <div>
              {attemptsOpen && (
                <div
                  id="popup-modal"
                  className={`flex items-center justify-center fixed top-0 left-[10%] right-[10%] lg:left-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}
                >
                  <div className="relative w-full max-w-fit max-h-full">
                    <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow dark:bg-gray-700 p-6">
                      <div className="flex items-start justify-between text-center gap-y-5">
                        <h2 className="sm:text-2xl text-xl font-semibold mb-4">
                          Quiz Submissions
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
                      <SeeAttempts quiz_id={quiz.q_id} />
                    </div>
                  </div>
                </div>
              )}
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
  marks_obtained: number | null;
  total_marks: number;
}

const SeeAttempts = ({ quiz_id }: { quiz_id: number }) => {
  const searchParams = useSearchParams();
  const course_id = searchParams.get("course_id");
  const teacher_id = searchParams.get("teacher_id");

  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!quiz_id || !teacher_id || !course_id) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/student_quiz_attempts?q_id=${quiz_id}&t_id=${teacher_id}&c_id=${course_id}`
        );
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [quiz_id, teacher_id, course_id]);

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

const StudentTable = ({ students }: { students: Student[] }) => (
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
        {students.map((student) => (
          <tr
            key={student.s_id}
            className={`text-gray-900 text-sm border-b ${
              student.marks_obtained === null
                ? "bg-white even:bg-gray-100"
                : student.marks_obtained === student.total_marks
                ? "bg-green-500 text-white"
                : student.marks_obtained === 0
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
                ? formatDateTime(student.upload_date)
                : "N/A"}
            </td>
            <td className="px-6 py-4 font-medium tracking-widest whitespace-nowrap">
              {student.marks_obtained === null
                ? "Not Attempted"
                : `${student.marks_obtained}/${student.total_marks}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

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

"use client";
import MyTooltip from "@/components/reusable/MyTooltip";
import { Trash2, X, CircleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useRef } from "react";

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
  const searchParams = useSearchParams();
  const { course_id } = {
    course_id: searchParams.get("course_id"),
  };
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <li className="border-t-2 border-black my-2 py-4">
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
                            className="text-left block mb-2 text-base font-medium text-gray-900 dark:text-white"
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

            <div className="">
              {isModalOpen && (
                <div
                  id="popup-modal"
                  className={`flex items-center justify-center fixed top-0 left-[10%] right-[10%] lg:left-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}
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

            <div className="mt-2">
              {
                <Link
                  href={{
                    pathname: "/teacher/attempts",
                    query: { q_id: quiz.q_id, c_id: course_id },
                  }}
                  className="hover:underline hover:text-gray-600 font-medium flex items-center"
                >
                  See Attempts
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5 ml-2 transition-transform transform-gpu hover:translate-x-1 hover:duration-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              }
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

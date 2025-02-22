// import MyTooltip from "@/components/reusable/MyTooltip";
import { formatUploadDateTime } from "@/lib/dateFormatter";
import { CircleAlert, Trash2, X } from "lucide-react";
import React, { useRef, useState } from "react";

type Props = {
  announcement: {
    an_id: number;
    topic: string;
    description: string;
    upload_date: string;
  };
  onDelete: (assignmentId: number) => void; // Add this
};

export default function AnnouncementComponent({
  announcement: initialAnnouncement,
  onDelete,
}: Props) {
  const [announcement, setAnnouncement] = useState(initialAnnouncement);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const updatedValues = {
        topic: formData.get("topic") || announcement.topic,
        description: formData.get("description") || announcement.description,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/announcement_teacher`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ an_id: announcement.an_id, ...updatedValues }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAnnouncement((prev) => ({
          ...prev,
          topic: data.updated_topic,
          description: data.updated_description,
        }));
        closeUpdate();
      } else {
        console.error("Failed to update announcement");
      }
    }
  };

  const handleOpenUpdate = () => setIsUpdateOpen((prev) => !prev);
  const closeUpdate = () => setIsUpdateOpen(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/announcement_teacher?an_id=${announcement.an_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json(); // Parse response JSON

      closeModal();
      if (response.ok && data.code === 1) {
        onDelete(announcement.an_id); // Call the parent function to remove it
      } else {
        alert("Failed to delete announcement");
        console.error(
          "Failed to delete announcement:",
          data.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error in delete request:", error);
    }
  };

  return (
    <li className="border-t-2 border-black my-2 py-4">
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 pt-4 pb-10 px-5 my-1">
        <div className="flex basis-full">
          <div className="flex lg:flex-row flex-col justify-between select-none w-full">
            <div className="basis-1/2">
              {isUpdateOpen ? (
                <form ref={formRef} onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-y-2">
                    <input
                      type="text"
                      id="topic"
                      name="topic"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                      placeholder="Topic"
                    />
                    <textarea
                      id="description"
                      name="description"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                      placeholder="Description"
                    />
                  </div>
                  <div className="flex items-center gap-x-2 lg:justify-end">
                    <button className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 mt-4 text-center">
                      Update
                    </button>
                    <button onClick={handleOpenUpdate}>
                      <X className="w-6 h-6 cursor-pointer mt-3" />
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-xl lg:text-2xl font-medium">
                    {announcement.topic || "Announcement"}
                  </p>
                  <p className="text-base lg:text-lg mt-2">
                    {announcement.description}
                  </p>
                </>
              )}
            </div>
            <div className="my-2 lg:my-0">
              <div className="flex flex-col lg:items-end">
                <div className="flex items-center gap-x-2">
                  <div className="flex flex-col">
                    <div className="lg:self-end space-x-2">
                      {isUpdateOpen ? (
                        <></>
                      ) : (
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
                      )}
                      <button onClick={handleOpenModal}>
                        <Trash2 className="w-8 h-8 text-red-500" />
                      </button>
                    </div>
                    <p className="text-base lg:text-lg font-medium">
                      <span className="font-semibold">Upload Date</span>:{" "}
                      {formatUploadDateTime(announcement.upload_date)}
                    </p>
                  </div>
                </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

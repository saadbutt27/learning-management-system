"use client";

import React, { useState, ChangeEvent } from "react";

// Type Definitions
interface CourseType {
  course_id: string;
  course_name: string;
  t_id: string;
  semester_num: string;
  section: string;
}

interface PdfFile {
  fileUrl: string;
  fileKey: string;
}

interface AssignmentProps {
  courses: CourseType[];
  status: string;
}

const Assignment: React.FC<AssignmentProps> = ({ courses, status }) => {
  const [uploading, setUploading] = useState(false);
  const [pdf, setPdf] = useState<PdfFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const uploadFileToAWS = async (file: File) => {
    try {
      const presignedURL = new URL(
        `${process.env.NEXT_PUBLIC_URL}/api/presigned`,
        window.location.href
      );
      presignedURL.searchParams.set("fileName", file.name);
      presignedURL.searchParams.set("contentType", file.type);

      const res = await fetch(presignedURL.toString()).then((res) =>
        res.json()
      );
      const body = new Blob([await file.arrayBuffer()], { type: file.type });

      await fetch(res.signedUrl, { body, method: "PUT" });

      return { fileUrl: res.signedUrl.split("?")[0], fileKey: file.name };
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const form = e.target as HTMLFormElement;
    const topic = form.topic.value.trim();
    const desc = form.desc.value.trim();
    const dueDate = form.dueDate.value;

    const selectedCourses = courses
      .filter((course) => {
        const checkbox = form.elements.namedItem(
          `c${course.course_id}`
        ) as HTMLInputElement;
        return checkbox?.checked;
      })
      .map((course) => course.course_id);

    let uploadedFile = null;
    if (selectedFile) {
      uploadedFile = await uploadFileToAWS(selectedFile);
    }

    const payload = {
      topic,
      desc,
      selectedCourses,
      fileLink: uploadedFile ? uploadedFile.fileUrl : null,
      dueDate,
    };

    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/upload_assignment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Reset form and state
    form.reset();
    setUploading(false);
    setPdf([]);
    setSelectedFile(null);
  };

  if (status !== "authenticated") return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="topic"
          className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
        >
          Topic
        </label>
        <input
          type="text"
          id="topic"
          name="topic"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
          required
        />
      </div>

      <div>
        <label
          htmlFor="desc"
          className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
        >
          Description
        </label>
        <textarea
          id="desc"
          name="desc"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
          rows={4}
          required
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="lecture_file"
          className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
        >
          Any file
        </label>
        <input
          type="file"
          id="lecture_file"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
          onChange={handleFileSelect}
        />
        {selectedFile && (
          <p className="text-blue-600 py-1.5">
            File selected: {selectedFile.name}
          </p>
        )}
        {pdf.length > 0 && (
          <p className="text-green-600 py-1.5">File Uploaded ✔</p>
        )}
      </div>

      <div>
        <label
          htmlFor="due_date"
          className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
        >
          Due Date
        </label>
        <input
          type="datetime-local"
          id="due_date"
          name="dueDate"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
          required
        />
      </div>

      <fieldset>
        <p className="block mb-2 text-base font-medium text-gray-900 dark:text-white">
          Select courses for this lecture
        </p>
        <legend className="sr-only">Checkbox variants</legend>
        {courses
          .sort((a, b) => a.section.localeCompare(b.section)) // Sort by section
          .map((course) => (
            <div
              key={course.course_id}
              className="flex items-center space-x-2 mb-4"
            >
              <input
                id={course.course_id + "checkbox"}
                type="checkbox"
                name={`c${course.course_id}`}
                value={course.course_id}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor={course.course_id + "checkbox"}
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                {course.course_name} ({course.semester_num}
                {course.section})
              </label>
            </div>
          ))}
      </fieldset>

      <button
        type="submit"
        className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
      >
        {uploading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
};

export default Assignment;

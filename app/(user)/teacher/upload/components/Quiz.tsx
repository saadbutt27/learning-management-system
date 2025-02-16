"use client";

import React, { useState, ChangeEvent } from "react";
import { Plus } from "lucide-react";

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

interface QuizProps {
  courses: CourseType[];
  status: string;
}

type QuestionState = {
  question: string;
  optA: string;
  optB: string;
  optC: string;
  optD: string;
  correctOpt: number | null;
};

const Quiz: React.FC<QuizProps> = ({ courses, status }) => {
  const [uploading, setUploading] = useState(false);
  //   const [pdf, setPdf] = useState<PdfFile[]>([]);
  //   const [selectedFile, setSelectedFile] = useState<File | null>(null);

  //   const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
  //     const file = e.target.files?.[0] || null;
  //     setSelectedFile(file);
  //   };

  const [data, setData] = useState<QuestionState[]>([]);

  const handleClick = () => {
    setData([
      ...data,
      {
        question: "",
        optA: "",
        optB: "",
        optC: "",
        optD: "",
        correctOpt: null,
      },
    ]);
  };

  const handleChange = (index: number, fieldName: string, value: string) => {
    setData((prevForms) => {
      const updatedForms = [...prevForms];
      fieldName === "question"
        ? (updatedForms[index].question = value)
        : fieldName === "optA"
        ? (updatedForms[index].optA = value)
        : fieldName === "optB"
        ? (updatedForms[index].optB = value)
        : fieldName === "optC"
        ? (updatedForms[index].optC = value)
        : fieldName === "optD"
        ? (updatedForms[index].optD = value)
        : (updatedForms[index].correctOpt = +value);
      return updatedForms;
    });
  };

  const handleDelete = (index: number) => {
    setData((prevForms) => {
      const updatedForms = [...prevForms];
      updatedForms.splice(index, 1);
      return updatedForms;
    });
  };

  //   const uploadFileToAWS = async (file: File) => {
  //     try {
  //       const presignedURL = new URL(
  //         `${process.env.NEXT_PUBLIC_URL}/api/presigned`,
  //         window.location.href
  //       );
  //       presignedURL.searchParams.set("fileName", file.name);
  //       presignedURL.searchParams.set("contentType", file.type);

  //       const res = await fetch(presignedURL.toString()).then((res) =>
  //         res.json()
  //       );
  //       const body = new Blob([await file.arrayBuffer()], { type: file.type });

  //       await fetch(res.signedUrl, { body, method: "PUT" });

  //       return { fileUrl: res.signedUrl.split("?")[0], fileKey: file.name };
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //       return null;
  //     }
  //   };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data.length === 0) {
      alert("Please add at least one question before submitting the quiz.");
      return;
    }

    setUploading(true);

    try {
      const form = e.target as HTMLFormElement;
      const topic = form.topic.value.trim();
      const desc = form.desc.value.trim();
      const dueDate = form.dueDate.value;
      const duration = form.duration.value;

      const selectedCourses = courses
        .filter((course) => {
          const checkbox = form.elements.namedItem(
            `c${course.course_id}`
          ) as HTMLInputElement;
          return checkbox?.checked;
        })
        .map((course) => course.course_id);

      // let uploadedFile = null;
      // if (selectedFile) {
      //   uploadedFile = await uploadFileToAWS(selectedFile);
      // }

      const payload = {
        topic,
        desc,
        selectedCourses,
        //   fileLink: uploadedFile ? uploadedFile.fileUrl : null,
        dueDate,
        duration,
        questions: data,
      };

      // console.log(payload);
      // return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/upload_quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload quiz. (${response.status})`);
      }

      // Reset form and state
      // form.reset();

      // setPdf([]);
      // setSelectedFile(null);
    } catch (error: any) {
      console.log(error);
    } finally {
      setUploading(false);
    }
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
          placeholder="Quiz topic here..."
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
          placeholder="Quiz description here..."
          required
        ></textarea>
      </div>

      {/* <div>
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
      </div> */}

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

      <div>
        <label
          htmlFor="duration"
          className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
        >
          Duration (minutes)
        </label>
        <input
          type="number"
          id="duration"
          name="duration"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
          placeholder="Quiz duration here (5 min to 60 min)"
          min={5}
          max={60}
          required
        />
      </div>

      {/* Quiz Question bank */}
      {data.map((val, index) => (
        <div id="form" className={"transition-opacity duration-300"}>
          <span className="text-lg font-medium">Question no. {index + 1}</span>
          <div className="my-6">
            <label
              htmlFor="question"
              className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
            >
              Question
            </label>
            <textarea
              id="question"
              name="question"
              value={val.question || ""}
              onChange={(e) => handleChange(index, "question", e.target.value)}
              rows={2}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500"
              placeholder=""
              required
            ></textarea>
          </div>
          <div className="sm:mb-6 flex sm:flex-row flex-col sm:space-x-5">
            <div className="mb-6 sm:mb-0 flex-grow">
              <label
                htmlFor="optA"
                className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
              >
                Option 1
              </label>
              <textarea
                id="optA"
                name="optA"
                value={val.optA || ""}
                onChange={(e) => handleChange(index, "optA", e.target.value)}
                rows={2}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                placeholder=""
                required
              ></textarea>
            </div>
            <div className="mb-6 sm:mb-0 flex-grow">
              <label
                htmlFor="optB"
                className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
              >
                Option 2
              </label>
              <textarea
                id="optB"
                name="optB"
                value={val.optB || ""}
                onChange={(e) => handleChange(index, "optB", e.target.value)}
                rows={2}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                placeholder=""
                required
              ></textarea>
            </div>
          </div>
          <div className="sm:mb-6 flex sm:flex-row flex-col sm:space-x-5">
            <div className="mb-6 sm:mb-0 flex-grow">
              <label
                htmlFor="optC"
                className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
              >
                Option 3
              </label>
              <textarea
                id="optC"
                name="optC"
                value={val.optC || ""}
                onChange={(e) => handleChange(index, "optC", e.target.value)}
                rows={2}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                placeholder=""
                required
              ></textarea>
            </div>
            <div className="mb-6 sm:mb-0 flex-grow">
              <label
                htmlFor="optD"
                className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
              >
                Option 4
              </label>
              <textarea
                id="optD"
                name="optD"
                value={val.optD || ""}
                onChange={(e) => handleChange(index, "optD", e.target.value)}
                rows={2}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                placeholder=""
                required
              ></textarea>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="correctOpt"
              className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
            >
              Correct option (1 to 4)
            </label>
            <input
              type="number"
              id="correctOpt"
              name="correctOpt"
              value={val.correctOpt || ""}
              onChange={(e) =>
                handleChange(index, "correctOpt", e.target.value)
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
              placeholder=""
              required
            />
          </div>
          <button
            className="mb-0 text-white bg-red-600 hover:scale-110 hover:duration-300  focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-auto px-5 py-2.5 text-center transition-opacity duration-300"
            onClick={() => handleDelete(index)}
          >
            Delete
          </button>
        </div>
      ))}

      <button
        onClick={handleClick}
        className="flex items-center mb-6 text-sm w-auto p-2.5 text-center transition-opacity duration-300"
      >
        <Plus className="w-8 h-8 text-white p-1 bg-black hover:bg-gray-800  duration-300 font-medium rounded-md" />
        <span className="text-base font-medium ml-2">Add questions</span>
      </button>

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

export default Quiz;

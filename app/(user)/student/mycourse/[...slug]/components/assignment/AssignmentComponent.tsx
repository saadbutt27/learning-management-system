"use client";
import Link from "next/link";
import React, { ChangeEvent, useEffect, useState, useCallback } from "react";
import MyTooltip from "@/components/reusable/MyTooltip";

type Props = {
  assignment: {
    assignment_id: number;
    assignment_description: string;
    course_name: string;
    due_date: string;
    teacher_name: string;
    upload_date: string;
    file: string;
    topic: string;
    is_edit_allowed_after_submission: boolean;
  };
  s_id: string;
};

type AssignmentAttributes = {
  assignment_file: string;
  upload_date: string;
  attempt: boolean;
  marks: number;
};

export default function AssignmentComponent({ assignment, s_id }: Props) {
  const [click, setClick] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean | null>(null);
  const [submissionDetails, setSubmissionDetails] =
    useState<AssignmentAttributes | null>(null);

  const checkSubmissionStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/student_assignment_submission?assignment_id=${assignment.assignment_id}&student_id=${s_id}`
      );
      if (!res.ok) throw new Error("Failed to fetch submission status");

      const data = await res.json();
      setIsSubmitted(data?.submitted ?? false);
      setSubmissionDetails(data?.submission ?? null);
    } catch (error) {
      console.error("Error fetching submission status:", error);
      setIsSubmitted(false);
    }
  }, [assignment.assignment_id, s_id]);

  useEffect(() => {
    checkSubmissionStatus();
  }, [checkSubmissionStatus]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  }, []);

  const uploadFileToAWS = async (file: File) => {
    try {
      const presignedURL = `${process.env.NEXT_PUBLIC_URL}/api/presigned?fileName=${encodeURIComponent(
        file.name
      )}&contentType=${encodeURIComponent(file.type)}`;

      const res = await fetch(presignedURL);
      const { signedUrl } = await res.json();

      await fetch(signedUrl, { body: file, method: "PUT" });

      return { fileUrl: signedUrl.split("?")[0], fileKey: file.name };
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setUploading(true);

      try {
        let uploadedFile = null;
        if (selectedFile) {
          uploadedFile = await uploadFileToAWS(selectedFile);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/student_assignment_submission`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assignment_id: assignment.assignment_id,
              student_id: s_id,
              fileLink: uploadedFile?.fileUrl ?? null,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to submit assignment");

        setSelectedFile(null);
        setClick((prev) => !prev);
        setIsSubmitted(true);
      } catch (error) {
        console.error("Error submitting assignment:", error);
        alert("Submission failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [selectedFile, assignment.assignment_id, s_id]
  );

  const localUploadDate = new Date(assignment.upload_date).toLocaleString(
    "en-US",
    { timeZone: "Asia/Karachi" }
  );

  const isPastDue = new Date() > new Date(assignment.due_date);

  const isSubmissionAllowed =
    !isPastDue || assignment.is_edit_allowed_after_submission;

  return (
    <li className="border-t-2 border-black my-2 py-4">
      <div className="sm:flex items-center justify-between border-2 bg-slate-100 py-4 px-5 my-1">
        <div className="flex flex-col lg:flex-row justify-between w-full">
          <div className="lg:w-1/2">
            <p className="text-2xl font-medium">{assignment.topic}</p>
            <p className="text-sm lg:text-base mt-2">
              {assignment.assignment_description}
            </p>
          </div>
          <div className="lg:w-1/2 flex flex-col items-start lg:items-end gap-2">
            <MyTooltip
              upload_date={localUploadDate}
              due_date={assignment.due_date}
              isPastDue={isPastDue}
            />
            {assignment.file && (
              <Link
                href={assignment.file}
                target="_blank"
                className="hover:text-gray-600 font-semibold underline"
              >
                Download Assignment
              </Link>
            )}
            {isSubmitted ? (
              <div>
                <p className="text-sm text-green-600">Submitted ✔</p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Marks</span>:{" "}
                  {submissionDetails?.marks ?? "Not given yet!"}
                </p>
                {submissionDetails?.assignment_file && (
                  <Link
                    href={submissionDetails.assignment_file}
                    target="_blank"
                    className="text-sm text-gray-600 hover:text-gray-600 font-semibold underline"
                  >
                    Assignment file
                  </Link>
                )}
              </div>
            ) : isPastDue && !assignment.is_edit_allowed_after_submission ? (
              <p className="text-sm text-red-600">Submission Closed ❌</p>
            ) : null}

            <button
              className={`border-2 border-black py-1 px-4 rounded-md text-white bg-black ${
                isSubmissionAllowed ? "cursor-pointer" : "opacity-30 cursor-not-allowed"
              }`}
              onClick={() => setClick((prev) => !prev)}
              disabled={!isSubmissionAllowed}
            >
              {click ? "Close" : isSubmitted ? "Edit Assignment" : "Submit Assignment"}
            </button>

            {click && (
              <form onSubmit={handleSubmit} className="w-full transition-opacity duration-500">
                <input type="file" onChange={handleFileSelect} required />
                {selectedFile && <p>File: {selectedFile.name}</p>}
                <button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Submit"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

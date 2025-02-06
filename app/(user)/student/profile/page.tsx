"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    s_id: string;
    s_name: string;
    s_image?: string;
  } & Session["user"];
}

interface UserProfile {
  s_id: string;
  s_name: string;
  s_image: string;
  // userPassword: string;
  p_id: string;
  semester_num: string;
}

export default function ProfilePage() {
  const [password, setPassword] = useState(false);
  const {
    data: session,
    status,
    update,
  } = useSession() as {
    data: ExtendedSession | null;
    status: string;
    // update: () => Promise<Session | null>;
    update: <T>(data: T) => Promise<Session | null>;
  };
  const [user, setUser] = useState<UserProfile | null>(null);
  const [passUpdated, setPassUpdated] = useState<string | null>(null);
  const [passMatched, setPassMatched] = useState(true);
  const [uploading, setUploading] = useState(false);

  // console.log("Session(profile):", session);

  useEffect(() => {
    if (status === "authenticated") {
      fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/student_profile?s_id=${session?.user.s_id}`
      )
        .then((data) => data.json())
        .then((data) => setUser(data));
    }
  }, [status, session?.user.s_id]);

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | null | undefined = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileData = event.target?.result;
      if (fileData) {
        try {
          // Fetch presigned URL and save reference in Postgres (powered by Neon)
          const presignedURL = new URL(
            `${process.env.NEXT_PUBLIC_URL}/api/presigned`,
            window.location.href
          );
          presignedURL.searchParams.set("fileName", file.name);
          presignedURL.searchParams.set("contentType", file.type);
          fetch(presignedURL.toString())
            .then((res) => res.json())
            .then((res) => {
              const body = new Blob([fileData], { type: file.type });
              fetch(res.signedUrl, {
                body,
                method: "PUT",
              }).then(() => {
                // Save reference to the object in Postgres (powered by Neon)
                fetch(
                  `${process.env.NEXT_PUBLIC_URL}/api/student_profile?s_id=${session?.user.s_id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      objectUrl: res.signedUrl.split("?")[0],
                    }),
                  }
                ).then(async () => {
                  // Update user profile with the new file reference
                  // update({ user: { s_image: res.signedUrl.split("?")[0] } });
                  await update({
                    user: { s_image: res.signedUrl.split("?")[0] },
                  }); // <=== Updating session here
                });
              });
              setUploading(false);
              e.target.value = "";
            });
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteProfilePic = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/presigned?fileName=${user?.s_image
          ?.split("/")
          .pop()}`,
        {
          method: "DELETE",
        }
      );

      // console.log(response);

      if (response.ok) {
        // Delete profile picture reference in Postgres (powered by Neon)
        await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/student_profile?s_id=${session?.user.s_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        ).then(async () => {
          // Update user profile with the new file reference
          await update({ user: { s_image: null } });
        });
      } else {
        throw new Error("Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPassMatched(true);
    setPassUpdated(null);

    const form = e.target as HTMLFormElement;

    const newPassword = (e.target as HTMLFormElement).newPass.value;
    const confirmPassword = (e.target as HTMLFormElement).cnfNewPass.value;

    if (newPassword !== confirmPassword) {
      setPassMatched(false);
      return;
    }

    try {
      const res = await fetch(`/api/student_profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          s_id: session?.user.s_id,
          oldPassword: (e.target as HTMLFormElement).oldPass.value,
          newPassword: newPassword,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setPassUpdated("incorrect");
        }
        return;
      }

      const data = await res.json();
      if (data) {
        setPassUpdated("changed");
        form.reset(); // Clears the input fields after success
      } else {
        setPassUpdated("incorrect");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      // setPassUpdated("error");
    }
  };

  if (user) {
    const src =
      user.s_image ||
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    return (
      <div className="md:ml-[80px] m-4 px-2">
        <div className="my-4 px-6 pt-2 pb-8 bg-white border-2 shadow-md h-auto flex flex-col items-start">
          <h1 className="text-3xl text-left font-medium tracking-normal leading-snug select-none">
            My LMS Profile
          </h1>
          <form
            action=""
            // onSubmit={(e) => handleUpdateProfile(e)}
          >
            <div className="my-6 flex sm:flex-row flex-col sm:items-center sm:justify-between">
              <label
                htmlFor="stName"
                className="mb-2 mr-16 text-base font-semibold text-gray-900"
              >
                Name{" "}
              </label>
              <input
                type="text"
                name="stName"
                id="stName"
                value={user.s_name}
                className="w-full sm:w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 p-2.5 cursor-not-allowed"
                disabled
              />
            </div>
            <div className="my-6 flex sm:flex-row flex-col sm:items-center sm:justify-between">
              <label
                htmlFor="stId"
                className="mb-2 mr-16 text-base font-semibold text-gray-900"
              >
                Student ID{" "}
              </label>
              <input
                type="text"
                name="stId"
                id="stId"
                value={user.s_id}
                className="w-full sm:w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 p-2.5 cursor-not-allowed sel"
                disabled
              />
            </div>
            <div className="my-6 flex sm:flex-row flex-col sm:items-center sm:justify-between">
              <label
                htmlFor="stProgram"
                className="mb-2 mr-0 text-base font-semibold text-gray-900"
              >
                Student Program{" "}
              </label>
              <input
                type="text"
                name="stProgram"
                id="stProgram"
                value={user.p_id}
                className="w-full sm:w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 p-2.5 cursor-not-allowed sel"
                disabled
              />
            </div>
            <div className="my-6 flex sm:flex-row flex-col sm:items-center sm:justify-between">
              <label
                htmlFor="stSemester"
                className="mb-2 mr-0 text-base font-semibold text-gray-900"
              >
                Student Semeter{" "}
              </label>
              <input
                type="text"
                name="stSemester"
                id="stSemester"
                value={user.semester_num}
                className="w-full sm:w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 p-2.5 cursor-not-allowed sel"
                disabled
              />
            </div>
            <div className="my-6 flex items-center ">
              <label
                htmlFor="prfPic"
                className="mb-2 mr-16 text-base font-semibold text-gray-900"
              >
                Profile Picture{" "}
              </label>
              <div>
                <Avatar className="mb-2 w-16 h-16 select-none">
                  <AvatarImage
                    src={src}
                    className="object-center object-cover"
                  />
                  <AvatarFallback>Profile Picture</AvatarFallback>
                </Avatar>
                <div className="flex items-center"></div>
                {user.s_image && (
                  <button
                    className="mb-6 bg-gray-900 hover:bg-gray-900 hover:scale-110 hover:duration-200 text-white w-auto font-medium rounded-md text-sm px-2 py-1"
                    onClick={handleDeleteProfilePic}
                  >
                    Delete picture
                  </button>
                )}
              </div>
            </div>
            <div className="my-6 flex sm:flex-row flex-col sm:items-center sm:justify-between">
              <label
                htmlFor="newPic"
                className="mb-2 mr-16 text-base font-semibold text-gray-900"
              >
                New Picture{" "}
              </label>
              <div className="flex items-start gap-x-2">
                <input onChange={uploadFile} type="file" disabled={uploading} />
              </div>
              {uploading && (
                <p className="text-lg text-semibold">Uploading...</p>
              )}
            </div>
          </form>
          <button
            className="mb-2 text-base font-medium text-gray-900 underline"
            onClick={() => setPassword(!password)}
          >
            Reset Password
          </button>
          {password && (
            <form action="" onSubmit={(e) => handlePasswordReset(e)}>
              <div className="my-6 flex sm:flex-row flex-col sm:items-center sm:justify-between">
                <label
                  htmlFor="oldPass"
                  className="basis-2/5 mb-2 text-base font-semibold text-gray-900"
                >
                  Old Password{" "}
                </label>
                <div className="basis-3/5 w-full sm:w-2/3 sm:ml-6">
                  <input
                    type="password"
                    name="oldPass"
                    id="oldPass"
                    className={`w-full ${
                      passUpdated === "incorrect" ? "bg-red-300" : "bg-gray-50"
                    } border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 p-2.5`}
                    required
                  />
                  {passUpdated === "incorrect" ? (
                    <p className="text-red-600">Incorrect Password</p>
                  ) : null}
                </div>
              </div>

              <div className="my-6 flex sm:flex-row flex-col sm:items-center sm:justify-between">
                <label
                  htmlFor="newPass"
                  className="basis-2/5 mb-2 text-base font-semibold text-gray-900"
                >
                  New Password{" "}
                </label>
                <input
                  type="password"
                  name="newPass"
                  id="newPass"
                  className="basis-3/5 w-full sm:w-2/3 sm:ml-6 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 p-2.5"
                  required
                />
              </div>
              <div className="my-6 flex sm:flex-row flex-col sm:items-center sm:justify-between">
                <label
                  htmlFor="newPass"
                  className="basis-2/5 mb-2 text-base font-semibold text-gray-900"
                >
                  Confirm Password{" "}
                </label>
                <div className="basis-3/5 w-full sm:w-2/3 sm:ml-6">
                  <input
                    type="password"
                    name="cnfNewPass"
                    id="cnfNewPass"
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 p-2.5"
                    required
                  />
                  {passUpdated === "changed" && (
                    <p className="text-green-600">Password Changed ✔</p>
                  )}
                  {!passMatched && (
                    <p className="text-red-600">
                      Password doesn&apos;t matched ❌
                    </p>
                  )}
                </div>
              </div>
              <button className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                Set password
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center h-screen">
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

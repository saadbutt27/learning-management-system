"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { UploadButton } from "@uploadthing/react";
// import { OurFileRouter } from "../../api/uploadthing/core";
// import "@uploadthing/react/styles.css";
import { getSession, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

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

interface IImage {
  fileUrl: string;
  fileKey: string;
}

export default function ProfilePage() {
  const [password, setPassword] = useState(false);
  const [image, setImage] = useState<IImage[] | null>(null);
  const {
    data: session,
    status,
    update,
  } = useSession() as {
    data: ExtendedSession | null;
    status: string;
    update: any;
  };
  const [user, setUser] = useState<UserProfile | null>(null);
  //   const router = useRouter();
  const [passUpdated, setPassUpdated] = useState<string | null>(null);
  const [passMatched, setPassMatched] = useState(true);

//   console.log("Session(profile):", session);

  useEffect(() => {
    if (status === "authenticated") {
      const res = fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/student_profile?s_id=${session?.user.s_id}`
      )
        .then((data) => data.json())
        .then((data) => setUser(data));
    }
  }, [status]);

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | null | undefined = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileData = event.target?.result;
      if (fileData) {
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
              );
            });
            if (user) {
              user.s_image = res.signedUrl.split("?")[0]; // Update the UI
            }
          });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteProfilePic = async () => {
    try {
      //   const response = await fetch(
      //     `/api/presigned?fileName=${encodeURIComponent(fileName)}`,
      //     {
      //       method: "DELETE",
      //     }
      //   );

      //   if (!response.ok) {
      //     const errorData = await response.json();
      //     console.error("Failed to delete file:", errorData.error);
      //     return { success: false, error: errorData.error };
      //   }

      //   const data = await response.json();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/student_profile?s_id=${session?.user.s_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then(async (data) => {
        // The session is not being updated after deletion
        await update();
      });
      //   console.log("File deleted successfully:", data.message);
      //   return { success: true, message: data.message };
    } catch (error) {
      console.error("Error deleting file:", error);
      //   return { success: false, error: error.message };
    }
  };

//   const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     let deleteCheckbox = (e.target as HTMLFormElement).deleteCheckbox.checked;
//     if (image && image[0]) {
//       const res = fetch(
//         `http://localhost:3000/api/student_profile?s_id=${session?.user.s_id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ image: image[0].fileUrl, s_id: user?.s_id }),
//         }
//       ).then((data) => {
//         (e.target as HTMLFormElement).deleteCheckbox.checked = false;
//         setImage(null);
//         update();
//       });
//     } else if (deleteCheckbox) {
//       const res = fetch(
//         `http://localhost:3000/api/student_profile?s_id=${session?.user.s_id}`,
//         {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       ).then((data) => {
//         (e.target as HTMLFormElement).deleteCheckbox.checked = false;
//         update();
//       });
//     }
//   };

  const handlePasswordReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPassMatched(true);
    setPassUpdated(null);

    if (
      (e.target as HTMLFormElement).newPass.value !==
      (e.target as HTMLFormElement).cnfNewPass.value
    ) {
      setPassMatched(false);
      return;
    }

    const res = fetch("http://localhost:3000/api/student_profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        s_id: session?.user.s_id,
        oldPassword: (e.target as HTMLFormElement).oldPass.value,
        newPassword: (e.target as HTMLFormElement).newPass.value,
      }),
    })
      .then((data) => data.json())
      .then((data) => {
        data ? setPassUpdated("changed") : setPassUpdated("incorrect");
      });
  };

  if (user) {
    const src =
      user.s_image ||
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    return (
      <>
        <div className="md:ml-[80px] m-4 px-2">
          <div className="my-4 px-6 pt-2 pb-8 bg-white border-2 shadow-md h-auto flex flex-col items-start">
            <h1 className="text-3xl text-left font-medium tracking-normal leading-snug select-none">
              My LMS Profile
            </h1>
            <form action="" 
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
                  <div className="flex items-center">
                    {/* <input
                      id="checkbox-1"
                      type="checkbox"
                      value=""
                      name="deleteCheckbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      disabled={
                        src ===
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                      }
                    />
                    <label
                      htmlFor="checkbox-1"
                      className={
                        (src ===
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                          ? ` opacity-70 `
                          : ` opacity-100 `) +
                        `ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none`
                      }
                    >
                      Delete picture
                    </label> */}
                  </div>
                  <button
                    className="mb-6 bg-gray-900 hover:bg-gray-900 hover:scale-110 hover:duration-200 text-white w-auto font-medium rounded-md text-sm px-2 py-1"
                    onClick={handleDeleteProfilePic}
                  >
                    Delete picture
                  </button>
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
                  <input onChange={uploadFile} type="file" />;
                  {image && (
                    <p className="text-4xl text-green-500 duration-500">✔</p>
                  )}
                </div>
              </div>
              {/* <button className="mb-6 bg-gray-900 hover:bg-gray-900 hover:scale-110 hover:duration-200 text-white w-auto font-medium rounded-lg text-sm px-4 py-2">
                Update Profile
              </button> */}
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
                        passUpdated === "incorrect"
                          ? "bg-red-300"
                          : "bg-gray-50"
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
                        Password doesn't matched ❌
                      </p>
                    )}
                  </div>
                </div>
                <button
                  // type="submit"
                  className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                >
                  Set password
                </button>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }
  return <p>Loading...</p>;
}

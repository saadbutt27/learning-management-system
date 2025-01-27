"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const id = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const [disable, setDisable] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null); // To store fetched photo URL
  const [error, setError] = useState<string | null>(null); // State to store error messages

  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY; // Replace with your Unsplash API access key
  const url = `https://api.unsplash.com/photos/random?client_id=${accessKey}&count=1&query=study,books&w=300&h=320`;

  // Fetch random photo on component mount
  useEffect(() => {
    async function fetchPhoto() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch image.");
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setPhotoUrl(data[0].urls.regular); // Use the regular size for better quality
        }
      } catch (error) {
        console.error("Error fetching photo:", error);
      }
    }
    fetchPhoto();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDisable(true);
    setError(null); // Reset error message

    try {
      const result = await signIn("credentials", {
        userId: id.current?.value,
        password: password.current?.value,
        redirect: false,
        callbackUrl: "/student",
      });
      // console.log(id.current?.value, password.current?.value);
      // console.log("result: ", result);
      if (result?.error) {
        // Handle error (e.g., show an error message to the user)
        // console.error("Login failed:", result.error);
        setError("Invalid credentials. Try again!");
      } else {
        // Redirect to the callback URL or any other route
        window.location.href = result?.url || "/student";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setDisable(false);
    }
  };

  return (
    <div className="md:flex h-screen">
      <div className="flex items-center justify-center mt-28 md:mt-0 md:flex-grow">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight leading-loose m-6">
            Log in to your LMS
          </h2>
          {error && ( // Display error message if it exists
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}
          <form action="" onSubmit={handleSubmit}>
            <div className="relative z-0 w-full mb-6 group">
              <input
                type="text"
                name="id"
                id="my_email"
                className="block py-3 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                placeholder=" "
                required
                ref={id}
              />
              <label
                htmlFor="my_email"
                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                User Id
              </label>
            </div>

            <div className="relative z-0 w-full mb-6 group">
              <input
                type="password"
                name="password"
                id="my_password"
                className="block py-3 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:border-gray-600 focus:outline-none peer"
                placeholder=" "
                required
                ref={password}
              />
              <label
                htmlFor="my_password"
                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Password
              </label>
            </div>
            <button
              type="submit"
              disabled={disable}
              className={`border-2 rounded-md bg-black focus:bg-gray-800 text-white w-full py-2 px-10 flex justify-center items-center ${
                disable ? "bg-gray-700" : "bg-black"
              }`}
            >
              <div role="status" className={disable ? "block" : "hidden"}>
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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

              {!disable ? "Log in" : ""}
            </button>
          </form>
        </div>
      </div>
      <Image
        src={
          photoUrl ||
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTM2NjB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Mzc4MTQ5MDh8&ixlib=rb-4.0.3&q=80&w=1080"
        } // Fallback image if Unsplash fails to load
        height={1000}
        width={1000}
        alt="Random Unsplash"
        className="w-1/2 object-cover hidden md:block bg-gradient-to-tr from-gray-900 to-gray-800"
      />
    </div>
  );
}

"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you have a custom button component
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    s_id: string;
    s_name: string;
    s_image?: string;
    t_id: string;
    t_name: string;
    t_image?: string;
  } & Session["user"];
}

export default function Home() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-10">
      <div className="text-center p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          LMS - Learning Management System
        </h1>
        {!session && status === "loading" ? (
          <div className="flex flex-col justify-center items-center">
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
        ) : status === "authenticated" && session ? (
          <div className="flex flex-col items-center gap-x-2">
            <p className="text-lg text-gray-700 mb-4">
              Welcome back, {session?.user?.s_name}! You are logged in.
            </p>
            <div className="flex sm:flex-row flex-col sm:items-baseline items-center gap-2">
              <Link
                href={
                  session.user.t_id
                    ? "/teacher"
                    : session.user.s_id
                    ? "/student"
                    : "/admin"
                }
              >
                <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                  Go to Dashboard
                </Button>
              </Link>
              <p className="text-xl font-bold">OR</p>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-lg text-gray-600 mb-4">
              You are not logged in. Please log in to access your LMS.
            </p>
            <Link href="/login">
              <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                Go to Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

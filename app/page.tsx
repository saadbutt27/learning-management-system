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
  } & Session["user"];
}

export default function Home() {
  const { data: session } = useSession() as {
      data: ExtendedSession | null;
      status: string;
    };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">LMS - Learning Management System</h1>
        {session ? (
          <>
            <p className="text-lg text-gray-700 mb-4">
              Welcome, {session?.user?.s_name}! You are logged in.
            </p>
            <Button
              className="mt-4 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </Button>
          </>
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

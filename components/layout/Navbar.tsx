"use client";
import React from "react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };

  console.log(session);

  const src =
    session?.user.s_image ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <header className="flex items-center justify-between px-6 py-2 border-b-2 shadow-md sticky top-0 z-50 bg-white">
      <div className="flex items-center py-2">
        <div
          onClick={() => {
            setOpen(!open);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </div>
        <Link href={"/my"}>
          {" "}
          <h1 className="font-bold text-3xl ml-10 hidden md:block cursor-pointer select-none">
            Learn&Grow
          </h1>
        </Link>
        <div
          className={
            (open ? `w-20 md:w-64` : `w-0 md:w-20`) +
            ` fixed left-0 top-[82px] h-full bg-white duration-500 shadow-2xl`
          }
        >
          <ul className="cursor-pointer select-none">
            <Link href={{ pathname: "my" }}>
              <li
                className={
                  (open ? `px-6` : `justify-center px-2 ml-2`) +
                  ` flex items-center py-4 bg-white`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 md:mr-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                  />
                </svg>
                {open && screen.width > 768 ? "Dashboard" : ""}
              </li>
            </Link>
            <Link href={{ pathname: "/my" }}>
              <li
                className={
                  (open ? `px-6` : `justify-center px-2 ml-2`) +
                  ` flex items-center py-4 bg-white`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 md:mr-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                {open && screen.width > 768 ? "Home" : ""}
              </li>
            </Link>

            <Link href={{ pathname: "/my" }}>
              <li
                className={
                  (open ? `px-6` : `justify-center px-2 ml-2`) +
                  ` flex items-center py-4 bg-white`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 md:mr-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                  />
                </svg>
                {open && screen.width > 768 ? "My Courses" : ""}
              </li>
            </Link>
            <li
              className={
                (open ? `px-6` : `justify-center px-2 ml-2`) +
                ` flex items-center py-4 bg-white`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 md:mr-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002"
                />
              </svg>

              {open && screen.width > 768 ? "Attendance" : ""}
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-between group py-2 cursor-pointer">
        {
          <Avatar className="w-14 h-14 mr-4 select-none">
            <AvatarImage
              src={status === "authenticated" ? src : undefined}
              className="object-cover object-center"
            />
            <AvatarFallback>Profile Picture</AvatarFallback>
          </Avatar>
        }
        <div className="sm:min-w-0 absolute right-6 top-[72px]">
          <ul
            className="flex flex-col group-hover:border-2 border-gray-300 group-hover:max-h-max max-h-0 overflow-hidden 
                       duration-300 bg-white group-hover:shadow-md cursor-pointer select-none"
          >
            <li className="flex items-center py-2 px-4 border-b-2 border-black bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 mr-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p>
                {status === "authenticated"
                  ? 
                    session?.user.s_name || session?.user.t_name
                  : "Loading..."}
              </p>
            </li>
            <Link href={{ pathname: session?.user.s_id ? "/student" : session?.user.t_id ? "/teacher" : "#" }}>
              <li className="flex items-center py-2 px-4 hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 mr-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                  />
                </svg>
                <p>Dashboard</p>
              </li>
            </Link>
            <Link href={"/my/profile"}>
              <li className="flex items-center py-2 px-4 hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 mr-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p>Profile</p>
              </li>
            </Link>
            <li className="flex items-center py-2 px-4 hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 mr-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <p>Grades</p>
            </li>
            <li
              className="flex items-center py-2 px-4 hover:bg-gray-100"
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 mr-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              <p>Log out</p>
            </li>
          </ul>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </header>
  );
};

export default Navigation;

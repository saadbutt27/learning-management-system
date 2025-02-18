import React from "react";
import {
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import { formatUploadDateTime, formatDueDateTime } from "@/lib/dateFormatter";

type Props = {
  upload_date: string;
  due_date: string;
  isPastDue: boolean;
};

export default function MyTooltip({ upload_date, due_date, isPastDue }: Props) {
  return (
    <Tooltip>
      <button
        type="button"
        className={`text-white w-28 font-medium rounded-lg text-sm px-5 py-2 my-2 lg:float-right 
                              ${
                                isPastDue
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-gray-800 hover:bg-gray-900"
                              } `}
      >
        {" "}
        <TooltipTrigger>Due Date</TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="text-xs lg:text-sm mb-2 ml-[5.5rem] lg:mr-44 bg-white text-black shadow-md border-black"
        >
          Upload: {formatUploadDateTime(upload_date)} <br />
          Due: {formatDueDateTime(due_date)}
        </TooltipContent>
      </button>
    </Tooltip>
  );
}

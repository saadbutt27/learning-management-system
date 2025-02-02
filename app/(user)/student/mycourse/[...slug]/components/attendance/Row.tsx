import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/dateFormatter";
import React from "react";

type Props = {
  date_of_attendance: string;
  attendance_status: string;
};

export default function Row({ date_of_attendance, attendance_status }: Props) {
  const dateTime = formatDateTime(date_of_attendance);
  const [date, time] = [dateTime.slice(0, 11), dateTime.slice(12)];
  return (
    <TableRow className="lg:text-base text-xs">
      <TableCell>{date}</TableCell>
      <TableCell>{time}</TableCell>
      <TableCell>{attendance_status == "1" ? "Present" : "Absent"}</TableCell>
    </TableRow>
  );
}

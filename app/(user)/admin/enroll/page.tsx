"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  c_id: number;
  course_name: string;
  course_code: string;
  semester_number: number;
}

interface Person {
  id: string;
  name: string;
}

interface StudentEnrollment {
  s_id: string;
  s_name: string;
  c_id: number;
  course_name: string;
  semester_number: number;
  section: string;
}

const sections: string[] = ["A", "B", "C", "D"];

export default function Enroll() {
  const [enrollment, setEnrollment] = useState<StudentEnrollment[] | null>(
    null
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const [students, setStudents] = useState<Person[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [teacher, setTeacher] = useState("");
  const [student, setStudent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, studentsRes] = await Promise.all([
          fetch("/api/course?course_id=all"),
          fetch("/api/students"),
        ]);
        if (!coursesRes.ok || !studentsRes.ok)
          throw new Error("Failed to fetch data");

        const coursesData: Course[] = await coursesRes.json();
        setCourses(coursesData);
        setSemesters([
          ...new Set(coursesData.map((course) => course.semester_number)),
        ]);

        setStudents(await studentsRes.json());
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSemester !== null) {
      // Filter courses based on selected semester
      const filtered = courses.filter(
        (course) => course.semester_number === selectedSemester
      );
      setFilteredCourses(filtered);
    }
  }, [selectedSemester, courses]);

  const handleAssign = async (role: "Student" | "Teacher") => {
    const assignee = role === "Teacher" ? teacher : student;
    if (!selectedCourse || !assignee) {
      toast.error(`Please select ${role} and courses before assigning.`);
      return;
    }

    if (role === "Teacher") {
      try {
        const response = await fetch("/api/course_assignment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            t_id: assignee,
            c_id: selectedCourse,
            section: selectedSection, // Modify as needed
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to assign teacher");
        }

        toast.success(`Teacher ${assignee} assigned successfully.`);
      } catch (error) {
        toast.error("Failed to assign teacher.");
        console.error(error);
      }
    } else if (role === "Student") {
      try {
        const response = await fetch("/api/enroll_students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            s_id: assignee,
            c_id: selectedCourse,
            section: selectedSection, // Modify as needed
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to assign course to student");
        }

        toast.success(`Student ${assignee} assigned successfully.`);
        setStudent("");
        setTeacher("");
        setSelectedSemester(null);
        setSelectedCourse(null);
        setSelectedSection("");
      } catch (error) {
        toast.error("Failed to assign course to student.");
        console.error(error);
      }
    }

    // const newAssignment: CourseAssignment = {
    //   id: assignments.length + 1,
    //   course_id: selectedCourse,
    //   assignedTo: assignee,
    //   role,
    // };
    // setAssignments([...assignments, newAssignment]);
    toast.success(`${role} ${assignee} assigned to selected courses.`);
    // role === "Teacher" ? setTeacher("") : setStudent("");
    // setSelectedCourse(null);
    // setSelectedSection("");
    // setTeacher("");
    // setStudent("");
  };

  const handleSearchEnrollment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setEnrollment([]);
    const formData = new FormData(e.currentTarget);
    const s_id = formData.get("s_id");
    const response = await fetch(`/api/enroll_students?s_id=${s_id}`);
    if (!response.ok) {
      toast.error("Failed to fetch enrolled students");
      return;
    }

    const enrollmentData = await response.json();
    if (!enrollmentData.success)
      toast.error("Failed to fetch enrolled students");
    setEnrollment(enrollmentData.data);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enroll Students in Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select onValueChange={(value) => setSelectedSemester(+value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"s"}>Select a semester</SelectItem>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester.toString()}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setSelectedCourse(+value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"s"}>
                  {filteredCourses.length > 0
                    ? "Select a course"
                    : "No courses available for this semester"}
                </SelectItem>

                {filteredCourses.map((course) => (
                  <SelectItem key={course.c_id} value={course.c_id.toString()}>
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setSelectedSection(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setStudent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.id} - {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleAssign("Student")}>Enroll</Button>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <form
          onSubmit={handleSearchEnrollment}
          className="p-6 flex items-center gap-2 border-gray-200"
        >
          <label htmlFor="s_id" className="text-gray-700 font-medium">
            Search using Student ID:
          </label>
          <Input
            name="s_id"
            id="s_id"
            placeholder="Enter Student ID"
            className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />
          <Button
            type="submit"
            className="bg-black text-white font-semibold px-4 py-2 rounded-lg transition duration-300"
          >
            Search
          </Button>
        </form>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Course ID</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Semester no.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollment && enrollment.length === 0
                ? [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      {[...Array(6)].map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : enrollment &&
                  enrollment.map((enroll) => (
                    <TableRow
                      key={`${enroll.s_id}-${enroll.c_id}-${enroll.section}`}
                    >
                      <TableCell>{enroll.s_id}</TableCell>
                      <TableCell>{enroll.s_name}</TableCell>
                      <TableCell>{enroll.c_id}</TableCell>
                      <TableCell>{enroll.course_name}</TableCell>
                      <TableCell>{enroll.section}</TableCell>
                      <TableCell>{enroll.semester_number}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

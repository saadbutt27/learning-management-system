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
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import { toast } from "sonner";

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

interface Program {
  p_id: string;
  program_name: string;
}

interface CourseAssignment {
  id: number;
  course_id: number;
  assignedTo: string;
  role: "Student" | "Teacher";
}

const sections: string[] = ["A", "B", "C", "D"];

export default function Enroll() {
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const [teachers, setTeachers] = useState<Person[]>([]);
  const [students, setStudents] = useState<Person[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [teacher, setTeacher] = useState("");
  const [student, setStudent] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [creditHours, setCreditHours] = useState<number | null>(null);
  const [semesterNumber, setSemesterNumber] = useState<number | null>(null);
  const [program, setProgram] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/course?course_id=all");
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data: Course[] = await response.json();
        setCourses(data);
        // Extract unique semester numbers
        const uniqueSemesters = Array.from(
          new Set(data.map((course: Course) => course.semester_number))
        );
        setSemesters(uniqueSemesters);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/programs");
        if (!response.ok) throw new Error("Failed to fetch programs");
        const data = await response.json();
        setPrograms(data);
      } catch (error) {
        console.error("Error fetching programs:", error);
        toast.error("Failed to load programs");
      }
    };

    const fetchPrograms = async () => {
      try {
        const response = await fetch("/api/students");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      }
    };

    fetchCourses();
    fetchStudents();
    fetchPrograms();
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

    const newAssignment: CourseAssignment = {
      id: assignments.length + 1,
      course_id: selectedCourse,
      assignedTo: assignee,
      role,
    };
    setAssignments([...assignments, newAssignment]);
    toast.success(`${role} ${assignee} assigned to selected courses.`);
    // role === "Teacher" ? setTeacher("") : setStudent("");
    // setSelectedCourse(null);
    // setSelectedSection("");
    // setTeacher("");
    // setStudent("");
  };

  const handleCreateCourse = async () => {
    if (
      !courseName ||
      !courseCode ||
      !creditHours ||
      !semesterNumber ||
      !program
    ) {
      toast.error("Please enter course details.");
      return;
    }
    // API call to create course can be added here
    try {
      const response = await fetch("/api/create_course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_name: courseName,
          course_code: courseCode,
          credit_hours: creditHours,
          semester_number: semesterNumber,
          p_id: program,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign course to student");
      }

      const responseData = await response.json();
      toast.success(
        `Course created successfully. This is the course id: ${responseData.c_id}`
      );
    } catch (error) {
      toast.error("Failed to create course.");
      console.error(error);
    }
    toast.success(`Course ${courseName} created.`);
    setCourseName("");
    setCourseCode("");
    setCreditHours(null);
    setSemesterNumber(null);
    setProgram("");
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enroll Students in Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap sm:flex-nowrap gap-4">
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
    </div>
  );
}

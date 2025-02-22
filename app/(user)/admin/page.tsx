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

interface Course {
  c_id: number;
  course_name: string;
  course_code: string;
}

interface Person {
  id: number;
  name: string;
}

interface CourseAssignment {
  id: number;
  courses: string[];
  assignedTo: string;
  role: "Student" | "Teacher";
}

export default function AdminPanel() {
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [students, setStudents] = useState<Person[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [teacher, setTeacher] = useState("");
  const [student, setStudent] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [creditHours, setCreditHours] = useState(1);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/course");
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await fetch("/api/teachers");
        if (!response.ok) throw new Error("Failed to fetch teachers");
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Failed to load teachers");
      }
    };

    const fetchStudents = async () => {
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
    fetchTeachers();
    fetchStudents();
  }, []);

  const handleAssign = (role: "Student" | "Teacher") => {
    const assignee = role === "Teacher" ? teacher : student;
    if (selectedCourses.length === 0 || !assignee) {
      toast.error(`Please select ${role} and courses before assigning.`);
      return;
    }
    const newAssignment: CourseAssignment = {
      id: assignments.length + 1,
      courses: selectedCourses,
      assignedTo: assignee,
      role,
    };
    setAssignments([...assignments, newAssignment]);
    toast.success(`${role} ${assignee} assigned to selected courses.`);
    role === "Teacher" ? setTeacher("") : setStudent("");
    setSelectedCourses([]);
  };

  const handleCreateCourse = async () => {
    if (!courseName || !courseCode) {
      toast.error("Please enter course name and code.");
      return;
    }
    // API call to create course can be added here
    toast.success(`Course ${courseName} created.`);
    setCourseName("");
    setCourseCode("");
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Courses to Teachers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select onValueChange={(value) => setSelectedCourses([value])}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Courses" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.c_id} value={course.course_name}>
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setTeacher}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((person) => (
                  <SelectItem key={person.id} value={person.name}>
                    {person.id} - {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleAssign("Teacher")}>Assign</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign Courses to Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select onValueChange={(value) => setSelectedCourses([value])}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Courses" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.c_id} value={course.course_name}>
                    {course.course_code} - {course.course_name}
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
                  <SelectItem key={person.id} value={person.name}>
                    {person.id} - {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleAssign("Student")}>Assign</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Course Code"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
          <Input
            type="number"
            min={1}
            max={3}
            placeholder="Credit Hours"
            value={creditHours}
            onChange={(e) => setCreditHours(Number(e.target.value))}
          />
          <Button onClick={handleCreateCourse}>Create Course</Button>
        </CardContent>
      </Card>
    </div>
  );
}

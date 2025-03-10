"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface CoursesAssigned {
  t_id: string;
  t_name: string;
  c_id: number;
  course_name: string;
  section: string;
}

const sections = ["A", "B", "C", "D"];

export default function Assign() {
  const [assigned, setAssigned] = useState<CoursesAssigned[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [teacher, setTeacher] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, teachersRes, assignmentsRes] = await Promise.all([
          fetch("/api/course?course_id=all"),
          fetch("/api/teachers"),
          fetch("/api/course_assignment"),
        ]);
        if (!coursesRes.ok || !teachersRes.ok || !assignmentsRes.ok)
          throw new Error("Failed to fetch data");

        const coursesData: Course[] = await coursesRes.json();
        setCourses(coursesData);
        setSemesters([
          ...new Set(coursesData.map((course) => course.semester_number)),
        ]);

        setTeachers(await teachersRes.json());

        const result = await assignmentsRes.json();
        if (!result.success) throw new Error("Failed to fetch assignments");

        setAssigned(result.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSemester !== null) {
      setFilteredCourses(
        courses.filter((course) => course.semester_number === selectedSemester)
      );
    }
  }, [selectedSemester, courses]);

  const handleAssign = async () => {
    if (!selectedCourse || !teacher || !selectedSection) {
      toast.error("Please select all required fields before assigning.");
      return;
    }

    try {
      const response = await fetch("/api/course_assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          t_id: teacher,
          c_id: selectedCourse,
          section: selectedSection,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign teacher");

      const assignedCourse = courses.find(
        (course) => course.c_id === selectedCourse
      );
      const result = await response.json();
      if (!result.success) throw new Error("Failed to assign teacher");

      const newAssignment: CoursesAssigned = {
        t_id: teacher,
        t_name: teachers.find((t) => t.id === teacher)?.name || "",
        c_id: selectedCourse,
        course_name: assignedCourse?.course_name || "",
        section: selectedSection,
      };

      setAssigned((prev) => [newAssignment, ...prev]); // Add new assignment at the top
      setFilteredCourses((prev) =>
        prev.filter((course) => course.c_id !== selectedCourse)
      ); // Remove assigned course from selection

      // Reset selections
      setSelectedSection("");
      setSelectedCourse(null);
      setSelectedSection("");
      setTeacher("");

      toast.success(`Teacher assigned successfully.`);
    } catch (error) {
      toast.error("Failed to assign teacher.");
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Courses to Teachers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select onValueChange={(value) => setSelectedSemester(+value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester.toString()}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCourse?.toString() || ""}
              onValueChange={(value) => setSelectedCourse(+value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.length === 0 && (
                  <SelectItem value="s">
                    {selectedSemester
                      ? "No courses available"
                      : "Select a semester first"}
                  </SelectItem>
                )}
                {filteredCourses.map((course) => (
                  <SelectItem key={course.c_id} value={course.c_id.toString()}>
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
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

            <Select value={teacher} onValueChange={setTeacher}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleAssign}>Assign</Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course ID</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Teacher ID</TableHead>
                <TableHead>Teacher Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assigned.length === 0
                ? [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      {[...Array(5)].map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : assigned.map((assignment) => (
                    <TableRow
                      key={`${assignment.t_id}-${assignment.c_id}-${assignment.section}`}
                    >
                      <TableCell>{assignment.c_id}</TableCell>
                      <TableCell>{assignment.course_name}</TableCell>
                      <TableCell>{assignment.section}</TableCell>
                      <TableCell>{assignment.t_id}</TableCell>
                      <TableCell>{assignment.t_name}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

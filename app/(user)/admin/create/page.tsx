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
import { toast } from "sonner";

interface Course {
  //   c_id: number;
  course_name: string;
  course_code: string;
  credit_hours: number;
  semester_number: number;
  p_id: string;
}

interface Program {
  p_id: string;
  program_name: string;
}

interface Teacher {
  t_id: string;
  t_name: string;
  password: string;
}

interface Student {
  s_id: string;
  s_name: string;
  password: string;
  semester_number: number;
  p_id: string;
}

export default function Create() {
  const [programs, setPrograms] = useState<Program[]>([]);

  const [courseData, setCourseData] = useState<Course>({
    course_name: "",
    course_code: "",
    credit_hours: 0,
    semester_number: 0,
    p_id: "",
  });

  const [teacherData, setTeacherData] = useState<Teacher>({
    t_id: "",
    t_name: "",
    password: "",
  });

  const [studentData, setStudentData] = useState<Student>({
    s_id: "",
    s_name: "",
    password: "",
    semester_number: 0,
    p_id: "",
  });

  useEffect(() => {
    const fetchPrograms = async () => {
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
    fetchPrograms();
  }, []);

  const handleChange = <T,>(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => {
    const { name, value, type } = e.target;
    setter((prev: T) => ({
      ...prev,
      [name]: type === "number" ? Number(value) || "" : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    endpoint: string,
    data: Course | Teacher | Student,
    successMessage: string
  ) => {
    e.preventDefault();
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Request failed");
      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process request");
    } finally {
      // Reset form fields
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Create Course */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <form
          onSubmit={(e) =>
            handleSubmit(
              e,
              "/api/create_course",
              courseData,
              "Course created successfully!"
            )
          }
        >
          <CardContent className="space-y-4">
            <Input
              name="course_name"
              placeholder="Course Name"
              value={courseData.course_name}
              onChange={(e) => handleChange(e, setCourseData)}
            />
            <Input
              name="course_code"
              placeholder="Course Code"
              value={courseData.course_code}
              onChange={(e) => handleChange(e, setCourseData)}
            />
            <Input
              name="credit_hours"
              type="number"
              placeholder="Credit Hours"
              value={courseData.credit_hours || ""}
              min={1}
              max={3}
              onChange={(e) => handleChange(e, setCourseData)}
            />
            <Input
              name="semester_number"
              type="number"
              placeholder="Semester Number"
              value={courseData.semester_number || ""}
              min={1}
              max={8}
              onChange={(e) => handleChange(e, setCourseData)}
            />
            <Select
              onValueChange={(value) =>
                setCourseData((prev) => ({ ...prev, p_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.p_id} value={p.p_id}>
                    {p.program_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Create Course</Button>
          </CardContent>
        </form>
      </Card>

      {/* Create Teacher Account */}
      <Card>
        <CardHeader>
          <CardTitle>Create Teacher Account</CardTitle>
        </CardHeader>
        <form
          onSubmit={(e) =>
            handleSubmit(
              e,
              "/api/create_teacher",
              teacherData,
              "Teacher account created successfully!"
            )
          }
        >
          <CardContent className="space-y-4">
            <Input
              type="text"
              name="t_id"
              placeholder="Teacher ID"
              value={teacherData.t_id}
              onChange={(e) => handleChange(e, setTeacherData)}
            />
            <Input
              type="text"
              name="t_name"
              placeholder="Teacher Name"
              value={teacherData.t_name}
              onChange={(e) => handleChange(e, setTeacherData)}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={teacherData.password}
              onChange={(e) => handleChange(e, setTeacherData)}
            />
            <Button type="submit">Create Account</Button>
          </CardContent>
        </form>
      </Card>

      {/* Create Student Account */}
      <Card>
        <CardHeader>
          <CardTitle>Create Student Account</CardTitle>
        </CardHeader>
        <form
          onSubmit={(e) =>
            handleSubmit(
              e,
              "/api/create_student",
              studentData,
              "Student account created successfully!"
            )
          }
        >
          <CardContent className="space-y-4">
            <Input
              name="s_id"
              placeholder="Student ID"
              value={studentData.s_id}
              onChange={(e) => handleChange(e, setStudentData)}
            />
            <Input
              name="s_name"
              placeholder="Student Name"
              value={studentData.s_name}
              onChange={(e) => handleChange(e, setStudentData)}
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={studentData.password}
              onChange={(e) => handleChange(e, setStudentData)}
            />
            <Input
              name="semester_number"
              type="number"
              placeholder="Semester Number"
              value={studentData.semester_number || ""}
              min={1}
              max={8}
              onChange={(e) => handleChange(e, setStudentData)}
            />
            <Select
              onValueChange={(value) =>
                setStudentData((prev) => ({ ...prev, p_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.p_id} value={p.p_id}>
                    {p.program_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Create Account</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

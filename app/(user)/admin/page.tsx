// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// import { toast } from "sonner";

// interface Course {
//   c_id: number;
//   course_name: string;
//   course_code: string;
//   semester_number: number;
// }

// interface Person {
//   id: string;
//   name: string;
// }

// interface Program {
//   p_id: string;
//   program_name: string;
// }

// interface CourseAssignment {
//   id: number;
//   course_id: number;
//   assignedTo: string;
//   role: "Student" | "Teacher";
// }

// const sections: string[] = ["A", "B", "C", "D"];

// export default function AdminPanel() {
//   const [assignments, setAssignments] = useState<CourseAssignment[]>([]);

//   const [courses, setCourses] = useState<Course[]>([]);
//   const [semesters, setSemesters] = useState<number[]>([]);
//   const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
//   const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

//   const [teachers, setTeachers] = useState<Person[]>([]);
//   const [students, setStudents] = useState<Person[]>([]);
//   const [programs, setPrograms] = useState<Program[]>([]);
//   const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
//   const [selectedSection, setSelectedSection] = useState<string>("");
//   const [teacher, setTeacher] = useState("");
//   const [student, setStudent] = useState("");
//   const [courseName, setCourseName] = useState("");
//   const [courseCode, setCourseCode] = useState("");
//   const [creditHours, setCreditHours] = useState<number | null>(null);
//   const [semesterNumber, setSemesterNumber] = useState<number | null>(null);
//   const [program, setProgram] = useState("");

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const response = await fetch("/api/course?course_id=all");
//         if (!response.ok) throw new Error("Failed to fetch courses");
//         const data: Course[] = await response.json();
//         setCourses(data);
//         // Extract unique semester numbers
//         const uniqueSemesters = Array.from(
//           new Set(data.map((course: Course) => course.semester_number))
//         );
//         setSemesters(uniqueSemesters);
//       } catch (error) {
//         console.error("Error fetching courses:", error);
//         toast.error("Failed to load courses");
//       }
//     };

//     const fetchTeachers = async () => {
//       try {
//         const response = await fetch("/api/teachers");
//         if (!response.ok) throw new Error("Failed to fetch teachers");
//         const data = await response.json();
//         setTeachers(data);
//       } catch (error) {
//         console.error("Error fetching teachers:", error);
//         toast.error("Failed to load teachers");
//       }
//     };

//     const fetchStudents = async () => {
//       try {
//         const response = await fetch("/api/programs");
//         if (!response.ok) throw new Error("Failed to fetch programs");
//         const data = await response.json();
//         setPrograms(data);
//       } catch (error) {
//         console.error("Error fetching programs:", error);
//         toast.error("Failed to load programs");
//       }
//     };

//     const fetchPrograms = async () => {
//       try {
//         const response = await fetch("/api/students");
//         if (!response.ok) throw new Error("Failed to fetch students");
//         const data = await response.json();
//         setStudents(data);
//       } catch (error) {
//         console.error("Error fetching students:", error);
//         toast.error("Failed to load students");
//       }
//     };

//     fetchCourses();
//     fetchTeachers();
//     fetchStudents();
//     fetchPrograms();
//   }, []);

//   useEffect(() => {
//     if (selectedSemester !== null) {
//       // Filter courses based on selected semester
//       const filtered = courses.filter(
//         (course) => course.semester_number === selectedSemester
//       );
//       setFilteredCourses(filtered);
//     }
//   }, [selectedSemester, courses]);

//   const handleAssign = async (role: "Student" | "Teacher") => {
//     const assignee = role === "Teacher" ? teacher : student;
//     if (!selectedCourse || !assignee) {
//       toast.error(`Please select ${role} and courses before assigning.`);
//       return;
//     }

//     if (role === "Teacher") {
//       try {
//         const response = await fetch("/api/course_assignment", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             t_id: assignee,
//             c_id: selectedCourse,
//             section: selectedSection, // Modify as needed
//           }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to assign teacher");
//         }

//         toast.success(`Teacher ${assignee} assigned successfully.`);
//       } catch (error) {
//         toast.error("Failed to assign teacher.");
//         console.error(error);
//       }
//     } else if (role === "Student") {
//       try {
//         const response = await fetch("/api/enroll_students", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             s_id: assignee,
//             c_id: selectedCourse,
//             section: selectedSection, // Modify as needed
//           }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to assign course to student");
//         }

//         toast.success(`Student ${assignee} assigned successfully.`);
//         setStudent("");
//         setTeacher("");
//         setSelectedSemester(null);
//         setSelectedCourse(null);
//         setSelectedSection("");

//       } catch (error) {
//         toast.error("Failed to assign course to student.");
//         console.error(error);
//       }
//     }

//     const newAssignment: CourseAssignment = {
//       id: assignments.length + 1,
//       course_id: selectedCourse,
//       assignedTo: assignee,
//       role,
//     };
//     setAssignments([...assignments, newAssignment]);
//     toast.success(`${role} ${assignee} assigned to selected courses.`);
//     // role === "Teacher" ? setTeacher("") : setStudent("");
//     // setSelectedCourse(null);
//     // setSelectedSection("");
//     // setTeacher("");
//     // setStudent("");
//   };

//   const handleCreateCourse = async () => {
//     if (
//       !courseName ||
//       !courseCode ||
//       !creditHours ||
//       !semesterNumber ||
//       !program
//     ) {
//       toast.error("Please enter course details.");
//       return;
//     }
//     // API call to create course can be added here
//     try {
//       const response = await fetch("/api/create_course", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           course_name: courseName,
//           course_code: courseCode,
//           credit_hours: creditHours,
//           semester_number: semesterNumber,
//           p_id: program,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to assign course to student");
//       }

//       const responseData = await response.json();
//       toast.success(
//         `Course created successfully. This is the course id: ${responseData.c_id}`
//       );
//     } catch (error) {
//       toast.error("Failed to create course.");
//       console.error(error);
//     }
//     toast.success(`Course ${courseName} created.`);
//     setCourseName("");
//     setCourseCode("");
//     setCreditHours(null);
//     setSemesterNumber(null);
//     setProgram("");
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Assign Courses to Teachers</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex flex-wrap sm:flex-nowrap gap-4">
//             <Select onValueChange={(value) => setSelectedSemester(+value)}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Semester" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value={"s"}>Select a semester</SelectItem>
//                 {semesters.map((semester) => (
//                   <SelectItem key={semester} value={semester.toString()}>
//                     {semester}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select onValueChange={(value) => setSelectedCourse(+value)}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Courses" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value={"s"}>
//                   {filteredCourses.length > 0
//                     ? "Select a course"
//                     : "No courses available for this semester"}
//                 </SelectItem>

//                 {filteredCourses.map((course) => (
//                   <SelectItem key={course.c_id} value={course.c_id.toString()}>
//                     {course.course_code} - {course.course_name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select onValueChange={(value) => setSelectedSection(value)}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Section" />
//               </SelectTrigger>
//               <SelectContent>
//                 {sections.map((section) => (
//                   <SelectItem key={section} value={section}>
//                     {section}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select onValueChange={setTeacher}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Teacher" />
//               </SelectTrigger>
//               <SelectContent>
//                 {teachers.map((person) => (
//                   <SelectItem key={person.id} value={person.id}>
//                     {person.id} - {person.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Button onClick={() => handleAssign("Teacher")}>Assign</Button>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Enroll Students in Courses</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex flex-wrap sm:flex-nowrap gap-4">
//             <Select onValueChange={(value) => setSelectedSemester(+value)}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Semester" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value={"s"}>Select a semester</SelectItem>
//                 {semesters.map((semester) => (
//                   <SelectItem key={semester} value={semester.toString()}>
//                     {semester}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select onValueChange={(value) => setSelectedCourse(+value)}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Courses" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value={"s"}>
//                   {filteredCourses.length > 0
//                     ? "Select a course"
//                     : "No courses available for this semester"}
//                 </SelectItem>

//                 {filteredCourses.map((course) => (
//                   <SelectItem key={course.c_id} value={course.c_id.toString()}>
//                     {course.course_code} - {course.course_name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select onValueChange={(value) => setSelectedSection(value)}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Section" />
//               </SelectTrigger>
//               <SelectContent>
//                 {sections.map((section) => (
//                   <SelectItem key={section} value={section}>
//                     {section}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select onValueChange={setStudent}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Student" />
//               </SelectTrigger>
//               <SelectContent>
//                 {students.map((person) => (
//                   <SelectItem key={person.id} value={person.id}>
//                     {person.id} - {person.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Button onClick={() => handleAssign("Student")}>Enroll</Button>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Create New Course</CardTitle>
//         </CardHeader>
//         <form onSubmit={handleCreateCourse}>
//           <CardContent className="space-y-4">
//             <Input
//               type="text"
//               placeholder="Course Name"
//               value={courseName}
//               onChange={(e) => setCourseName(e.target.value)}
//             />
//             <Input
//               type="text"
//               placeholder="Course Code"
//               value={courseCode}
//               onChange={(e) => setCourseCode(e.target.value)}
//             />
//             <Input
//               type="number"
//               min={1}
//               max={3}
//               placeholder="Credit Hours"
//               value={creditHours ?? ""}
//               onChange={(e) => setCreditHours(Number(e.target.value))}
//             />
//             <Input
//               type="number"
//               min={1}
//               max={8}
//               placeholder="Semeter number"
//               value={semesterNumber ?? ""}
//               onChange={(e) => setSemesterNumber(Number(e.target.value))}
//             />
//             <Select onValueChange={setProgram}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Program" />
//               </SelectTrigger>
//               <SelectContent>
//                 {programs.map((program) => (
//                   <SelectItem key={program.p_id} value={program.p_id}>
//                     {program.p_id} - {program.program_name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Button type="submit">Create Course</Button>
//           </CardContent>
//         </form>
//       </Card>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SummaryStats {
  totalCourses: number;
  totalTeachers: number;
  totalStudents: number;
}

const recentActivities = [
  { id: 1, message: 'New course "Machine Learning" created.' },
  { id: 2, message: "Teacher John Doe assigned to Data Science 101." },
  { id: 3, message: "Student Alice Johnson enrolled in AI Fundamentals." },
];

export default function AdminPanel() {
  const [stats, setStats] = useState<SummaryStats>({
    totalCourses: 0,
    totalTeachers: 0,
    totalStudents: 0,
  });

  // Fetch summary statistics from API on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/summary_stats");
        if (!response.ok) {
          throw new Error("Failed to fetch summary statistics");
        }
        const data = await response.json();
        // console.log(data);
        if (data.success)
          setStats(data.stats);
      } catch (error) {
        console.error(error);
        // Optionally, you can show an error notification here.
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalCourses}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalTeachers}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/create">
            <Button variant="secondary">Create Course</Button>
          </Link>
          <Link href="/admin/assign">
            <Button variant="secondary">Assign Teacher</Button>
          </Link>
          <Link href="/admin/enroll">
            <Button variant="secondary">Enroll Student</Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Activity</h2>
        <div className="space-y-2">
          {recentActivities.map((activity) => (
            <Card key={activity.id} className="p-2">
              <CardContent>{activity.message}</CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      {/* <div className="space-y-4">
        <h2 className="text-2xl font-bold">Search</h2>
        <Input type="text" placeholder="Search by name, ID, etc." />
      </div> */}

      {/* Upcoming Deadlines */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Upcoming Deadlines</h2>
        <Card className="p-4">
          <CardContent>
            <p>No upcoming deadlines.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";

import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseCode: string) => void;
  /** ลงทะเบียนให้นักศึกษาในรายวิชา */
  enrollStudentsToCourse: (courseCode: string, studentIds: string[]) => void;
  /** ถอนวิชาออกจากนักศึกษาเฉพาะคน */
  removeStudentFromCourse: (courseCode: string, studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter(
            (student) => student.studentId !== studentId
          ),
        })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter(
            (course) => course.courseCode !== courseCode
          ),
          students: state.students.map((student) => ({
            ...student,
            enrolledCourses: (student.enrolledCourses ?? []).filter(
              (code) => code !== courseCode
            ),
          })),
        })),

      enrollStudentsToCourse: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((student) => {
            if (studentIds.includes(student.studentId)) {
              const currentEnrolled = student.enrolledCourses ?? [];
              if (!currentEnrolled.includes(courseCode)) {
                return {
                  ...student,
                  enrolledCourses: [...currentEnrolled, courseCode],
                };
              }
            }
            return student;
          }),
        })),

      removeStudentFromCourse: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.studentId === studentId
              ? {
                  ...student,
                  enrolledCourses: (student.enrolledCourses ?? []).filter(
                    (code) => code !== courseCode
                  ),
                }
              : student
          ),
        })),
    }),
    {
      name: "lab16-2569-680610660",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    }
  )
);
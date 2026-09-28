import { useEffect, useRef, useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = {
  value: string;
  label: string;
};

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(value) => onChange(value as string)}
    >
      <SelectTrigger
        id={id}
        className="w-full min-w-0 overflow-hidden"
      >
        <SelectValue
          placeholder={placeholder}
          className="min-w-0 flex-1 overflow-hidden text-left text-ellipsis whitespace-nowrap"
        />
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses } = useEnrollmentStore();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const studentBoxRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        studentBoxRef.current &&
        !studentBoxRef.current.contains(event.target as Node)
      ) {
        setStudentDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const courseOptions: Option[] = courses.map((course) => ({
    value: course.courseCode,
    label: `${course.courseCode} — ${course.courseTitle}`,
  }));

  const studentOptions: Option[] = students.map((student) => ({
    value: student.studentId,
    label: `${student.studentId} — ${student.firstName} ${student.lastName}`,
  }));

  const availableStudents = formCourse
    ? students.filter(
        (student) =>
          !student.enrolledCourses.includes(formCourse)
      )
    : [];

  const filteredStudents = availableStudents.filter((student) => {
    const keyword = studentSearch.trim().toLowerCase();
    if (!keyword) {
      return true;
    }
    return (
      student.studentId.toLowerCase().includes(keyword) ||
      student.firstName.toLowerCase().includes(keyword) ||
      student.lastName.toLowerCase().includes(keyword) ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(keyword)
    );
  });

  const toggleStudent = (studentId: string) => {
    setFormStudents((current) => {
      if (current.includes(studentId)) {
        return current.filter((id) => id !== studentId);
      }

      return [...current, studentId];
    });

    setStudentSearch("");
  };

  const removeSelectedStudent = (studentId: string) => {
    setFormStudents((current) =>
      current.filter((id) => id !== studentId)
    );
  };

  const handleCourseChange = (courseCode: string) => {
    setFormCourse(courseCode);

    setFormStudents([]);

    setStudentSearch("");

    setStudentDropdownOpen(false);
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) {
      return;
    }
    useEnrollmentStore.setState((state) => ({
      students: state.students.map((student) => {
        if (!formStudents.includes(student.studentId)) {
          return student;
        }
        if (student.enrolledCourses.includes(formCourse)) {
          return student;
        }
        return {
          ...student,
          enrolledCourses: [
            ...student.enrolledCourses,
            formCourse,
          ],
        };
      }),
    }));

    setEnrollDialogOpen(false);
    setFormCourse(null);
    setFormStudents([]);
    setStudentSearch("");
    setStudentDropdownOpen(false);
  };

  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
      setStudentSearch("");
      setStudentDropdownOpen(false);
    }
  };

  const handleRemoveStudent = (
    studentId: string,
    courseCode: string
  ) => {
    useEnrollmentStore.setState((state) => ({
      students: state.students.map((student) => {
        if (student.studentId !== studentId) {
          return student;
        }
        return {
          ...student,
          enrolledCourses: student.enrolledCourses.filter(
            (code) => code !== courseCode
          ),
        };
      }),
    }));
  };

  const rows = courses
    .filter((course) => {
      if (mode === "course") {
        return (
          filterCourse === "all" ||
          course.courseCode === filterCourse
        );
      }
      const student = students.find(
        (item) => item.studentId === filterStudent
      );
      if (filterStudent === "all") {
        return true;
      }
      return student?.enrolledCourses.includes(
        course.courseCode
      );
    })
    .map((course) => {
      const enrolledStudents = students.filter((student) =>
        student.enrolledCourses.includes(course.courseCode)
      );
      return {
        course,
        enrolledStudents,
      };
    });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          จัดการการลงทะเบียน
        </h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>
      <Dialog
        open={enrollDialogOpen}
        onOpenChange={handleEnrollDialogOpenChange}
      >
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ลงทะเบียนให้นักศึกษา
            </DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาได้มากกว่า 1 คน
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">
                วิชา
              </Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={handleCourseChange}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>
                นักศึกษา
              </Label>
              <div
                ref={studentBoxRef}
                className="relative"
              >
                <div
                  className={`
                    flex min-h-9 w-full flex-wrap
                    items-center gap-1 rounded-md
                    border bg-background px-2 py-1
                    text-sm
                    ${
                      formCourse
                        ? "cursor-text"
                        : "cursor-not-allowed opacity-50"
                    }
                  `}
                  onClick={() => {
                    if (formCourse) {
                      setStudentDropdownOpen(true);
                    }
                  }}
                >
                  {formStudents.map((studentId) => {
                    const student = students.find(
                      (item) =>
                        item.studentId === studentId
                    );
                    if (!student) {
                      return null;
                    }
                    return (
                      <Badge
                        key={studentId}
                        variant="secondary"
                        className="max-w-[220px] shrink-0 gap-1"
                      >
                        <span className="max-w-[170px] truncate">
                          {student.firstName}{" "}
                          {student.lastName}
                        </span>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            removeSelectedStudent(
                              studentId
                            );
                          }}
                          className="shrink-0 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                    <Input
                      value={studentSearch}
                      disabled={!formCourse}
                      onFocus={() => {
                        if (formCourse) {
                          setStudentDropdownOpen(true);
                        }
                      }}
                      onChange={(event) => {
                        setStudentSearch(event.target.value);

                        if (formCourse) {
                          setStudentDropdownOpen(true);
                        }
                      }}
                      placeholder={
                        formStudents.length === 0
                          ? formCourse
                            ? "ค้นหา/เลือกนักศึกษา"
                            : "เลือกวิชาก่อน"
                          : ""
                      }
                      className="h-7 min-w-[140px] flex-1 border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-0"
                    />
                </div>
                {studentDropdownOpen && formCourse && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                    {filteredStudents.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        ไม่พบนักศึกษา
                      </div>
                    ) : (
                      filteredStudents.map((student) => {
                        const selected =
                          formStudents.includes(
                            student.studentId
                          );
                        return (
                          <button
                            key={student.studentId}
                            type="button"
                            onClick={() =>
                              toggleStudent(
                                student.studentId
                              )
                            }
                            className={`
                              flex w-full items-center
                              justify-between rounded-md
                              px-3 py-2 text-left text-sm
                              hover:bg-accent
                              hover:text-accent-foreground
                              ${
                                selected
                                  ? "bg-accent"
                                  : ""
                              }
                            `}
                          >
                            <span className="min-w-0 truncate">
                              {student.studentId} —{" "}
                              {student.firstName}{" "}
                              {student.lastName}
                            </span>
                            {selected && (
                              <span className="ml-2 shrink-0">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={
                !formCourse ||
                formStudents.length === 0
              }
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Tabs
        value={mode}
        onValueChange={(value) =>
          setMode(
            value as "course" | "student"
          )
        }
      >
        <TabsList>
          <TabsTrigger value="course">
            ค้นหาตามวิชา
          </TabsTrigger>
          <TabsTrigger value="student">
            ค้นหาตามนักศึกษา
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="course"
          className="pt-2"
        >
          <OptionSelect
            id="filterCourse"
            options={[
              {
                value: "all",
                label: "ทุกวิชา",
              },
              ...courseOptions,
            ]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent
          value="student"
          className="pt-2"
        >
          <OptionSelect
            id="filterStudent"
            options={[
              {
                value: "all",
                label: "ทุกคน",
              },
              ...studentOptions,
            ]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                รหัสวิชา
              </TableHead>
              <TableHead>
                ชื่อวิชา
              </TableHead>
              <TableHead>
                จำนวนนักศึกษา
              </TableHead>
              <TableHead>
                นักศึกษาที่ลงทะเบียน
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              rows.map(
                ({
                  course,
                  enrolledStudents,
                }) => (
                  <TableRow
                    key={course.courseCode}
                  >
                    <TableCell>
                      {course.courseCode}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[280px] truncate">
                        {course.courseTitle}
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrolledStudents.length}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2 ">
                        {enrolledStudents.length === 0 ? (
                          <span className="text-sm text-muted-foreground ">
                            ยังไม่มีนักศึกษา
                          </span>
                        ) : (
                          enrolledStudents.map(
                            (student) => (
                              <Badge
                                key={student.studentId}
                                variant="secondary"
                                className="max-w-[220px] gap-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                              >
                                <span className="max-w-[170px] truncate ">
                                  {student.firstName}{" "}
                                  {student.lastName}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveStudent(
                                      student.studentId,
                                      course.courseCode
                                    )
                                  }
                                  className="shrink-0 rounded-full hover:bg-muted"
                                  title="ยกเลิกการลงทะเบียน"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            )
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
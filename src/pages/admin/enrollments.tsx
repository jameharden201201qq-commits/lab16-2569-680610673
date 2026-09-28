import { useState } from "react";
import { Plus, Trash2, UserCheck, BookOpen, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(v) => onChange(v as string)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudentsToCourse, removeStudentFromCourse } =
    useEnrollmentStore();

  const [formStudent, setFormStudent] = useState<string | null>(null);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));

  const courseOptions: Option[] = courses.map((c) => {
    const code = c.courseCode ?? c.courseId ?? "";
    return {
      value: code,
      label: `${code} — ${c.courseTitle}`,
    };
  });

  const selectedStudentObj = students.find((s) => s.studentId === formStudent);
  const studentEnrolledList = selectedStudentObj?.enrolledCourses ?? [];

  const availableCourseOptions = courseOptions.filter(
    (c) => !studentEnrolledList.includes(c.value)
  );

  const handleEnroll = () => {
    if (!formStudent || !formCourse) return;
    enrollStudentsToCourse(formCourse, [formStudent]);
    setEnrollDialogOpen(false);
  };

  const handleUnenroll = (studentId: string, courseCode: string) => {
    removeStudentFromCourse(courseCode, studentId);
  };

  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudent(null);
      setFormCourse(null);
    }
  };

  const allEnrollmentRows: { studentId: string; courseCode: string }[] = [];
  students.forEach((s) => {
    const enrolled = s.enrolledCourses ?? [];
    enrolled.forEach((code) => {
      allEnrollmentRows.push({
        studentId: s.studentId,
        courseCode: code,
      });
    });
  });

  const rows = allEnrollmentRows.filter((e) =>
    mode === "course"
      ? filterCourse === "all" || e.courseCode === filterCourse
      : filterStudent === "all" || e.studentId === filterStudent
  );

  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };

  const titleOf = (courseCode: string) => {
    const c = courses.find((x) => (x.courseCode ?? x.courseId) === courseCode);
    return c?.courseTitle ?? "-";
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">จัดการการลงทะเบียน</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ลงทะเบียนรายวิชาให้นักศึกษา และยกเลิกรายการลงทะเบียนในระบบ
          </p>
        </div>

        <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
          <DialogTrigger>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              ลงทะเบียนให้นักศึกษา
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                ลงทะเบียนให้นักศึกษา
              </DialogTitle>
              <DialogDescription>
                เลือกนักศึกษาที่ต้องการ จากนั้นเลือกวิชาที่ยังไม่ได้ลงทะเบียน
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="formStudent" className="text-sm font-medium">
                  นักศึกษา
                </Label>
                <OptionSelect
                  id="formStudent"
                  options={studentOptions}
                  value={formStudent}
                  placeholder="เลือกนักศึกษา..."
                  onChange={(v) => {
                    setFormStudent(v);
                    setFormCourse(null);
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="formCourse" className="text-sm font-medium">
                  รายวิชา
                </Label>
                <OptionSelect
                  id="formCourse"
                  options={availableCourseOptions}
                  value={formCourse}
                  disabled={!formStudent || availableCourseOptions.length === 0}
                  placeholder={
                    !formStudent
                      ? "โปรดเลือกนักศึกษาก่อน"
                      : availableCourseOptions.length === 0
                      ? "นักศึกษาลงทะเบียนครบทุกวิชาแล้ว"
                      : "เลือกวิชา..."
                  }
                  onChange={setFormCourse}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!formStudent || !formCourse}
                onClick={handleEnroll}
                className="w-full sm:w-auto gap-2"
              >
                <Plus className="h-4 w-4" />
                ยืนยันการลงทะเบียน
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Card Wrapper */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-medium">รายการลงทะเบียนทั้งหมด</CardTitle>
              <CardDescription>
                พบข้อมูลการลงทะเบียนทั้งหมด {rows.length} รายการ
              </CardDescription>
            </div>

            {/* Tabs Filter */}
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "course" | "student")}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-2 w-full md:w-[260px]">
                <TabsTrigger value="course" className="gap-1.5 text-xs sm:text-sm">
                  <BookOpen className="h-3.5 w-3.5" />
                  กรองตามวิชา
                </TabsTrigger>
                <TabsTrigger value="student" className="gap-1.5 text-xs sm:text-sm">
                  <GraduationCap className="h-3.5 w-3.5" />
                  กรองตามนักศึกษา
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filter Dropdown Select */}
          <div className="pt-2 max-w-xs">
            {mode === "course" ? (
              <OptionSelect
                id="filterCourse"
                options={[{ value: "all", label: "แสดงทุกวิชา" }, ...courseOptions]}
                value={filterCourse}
                onChange={setFilterCourse}
              />
            ) : (
              <OptionSelect
                id="filterStudent"
                options={[{ value: "all", label: "แสดงทุกคน" }, ...studentOptions]}
                value={filterStudent}
                onChange={setFilterStudent}
              />
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[140px]">รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead className="w-[120px]">รหัสวิชา</TableHead>
                  <TableHead>ชื่อวิชา</TableHead>
                  <TableHead className="text-right w-[100px]">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      ไม่พบข้อมูลการลงทะเบียน
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((e) => (
                    <TableRow key={`${e.studentId}-${e.courseCode}`} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium">{e.studentId}</TableCell>
                      <TableCell>{nameOf(e.studentId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono font-normal">
                          {e.courseCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{titleOf(e.courseCode)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                          onClick={() => handleUnenroll(e.studentId, e.courseCode)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          ถอน
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
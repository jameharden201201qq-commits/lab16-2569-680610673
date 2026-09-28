import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PlusCircle,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
export default function AdminCoursesPage() {
  const { courses,removeCourse} = useEnrollmentStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [formInstructors, setFormInstructors] = useState<string[]>([]);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorDropdownOpen,setInstructorDropdownOpen] = useState(false);
  const instructorBoxRef = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen,setDeleteDialogOpen] = useState(false);
  const [deleteCourseCode, setDeleteCourseCode] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        instructorBoxRef.current &&
        !instructorBoxRef.current.contains(
          event.target as Node
        )
      ) {
        setInstructorDropdownOpen(false);
      }
    };
    document.addEventListener(
      "mousedown",
      handleClickOutside
    );
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const allInstructors = useMemo(() => {
    const instructorSet = new Set<string>();
    courses.forEach((course) => {
      course.instructors?.forEach(
        (instructor) => {
          const name =
            instructor.trim();
          if (name) {
            instructorSet.add(name);
          }
        }
      );
    });
    return Array.from(
      instructorSet
    ).sort();
  }, [courses]);

  const instructorOptions = useMemo(() => {
    const instructorSet = new Set<string>();
    allInstructors.forEach(
      (instructor) =>
        instructorSet.add(instructor)
    );
    formInstructors.forEach(
      (instructor) =>
        instructorSet.add(instructor)
    );
    return Array.from(
      instructorSet
    ).sort();
  }, [
    allInstructors,
    formInstructors,
  ]);

  const filteredInstructors =
    instructorOptions.filter(
      (instructor) =>
        instructor
          .toLowerCase()
          .includes(
            instructorSearch.trim().toLowerCase())
);
  const typedInstructor = instructorSearch.trim();
  const instructorAlreadyExists =
    instructorOptions.some(
      (instructor) =>
        instructor.toLowerCase() === typedInstructor.toLowerCase()
  );

  const toggleInstructor = (
    instructor: string
  ) => {
    setFormInstructors((current) => {
      if (
        current.includes(instructor)
      ) {
        return current.filter(
          (name) =>
            name !== instructor
        );
      }
      return [
        ...current,
        instructor,
      ];
    });
    setInstructorSearch("");
  };

  const removeFormInstructor = (
    instructor: string
  ) => {
    setFormInstructors((current) =>
      current.filter(
        (name) =>
          name !== instructor
      )
    );
  };

  const addNewInstructor = () => {
    const name =
      instructorSearch.trim();
    if (!name) {
      return;
    }
    setFormInstructors((current) => {
      const exists =
        current.some(
          (instructor) =>
            instructor.toLowerCase() ===
            name.toLowerCase()
        );
      if (exists) {
        return current;
      }
      return [
        ...current,
        name,
      ];
    });
    setInstructorSearch("");
  };

  const codeAlreadyExists =
    courses.some(
      (course) =>
        course.courseCode.toLowerCase() ===
        courseCode
          .trim().toLowerCase()
  );

  const handleAddCourse = () => {
    const code =
      courseCode.trim();
    const title =
      courseTitle.trim();
    if (
      !code ||
      !title ||
      codeAlreadyExists
    ) {
      return;
    }
    useEnrollmentStore.setState(
      (state) => ({
        courses: [
          ...state.courses,
          {
            courseCode: code,
            courseTitle: title,
            ...(formInstructors.length >
            0
              ? {
                  instructors:
                    formInstructors,
                }
              : {}),
          },
        ],
      })
    );
    setCourseCode("");
    setCourseTitle("");
    setFormInstructors([]);
    setInstructorSearch("");
    setInstructorDropdownOpen(false);
    setDialogOpen(false);
  };

  const openDeleteDialog = (
    courseCode: string
  ) => {
    setDeleteCourseCode(
      courseCode
    );
    setDeleteDialogOpen(true);
  };

  const confirmRemoveCourse = () => {
    if (!deleteCourseCode) {
      return;
    }
    removeCourse(
      deleteCourseCode
    );
    setDeleteCourseCode(null);
    setDeleteDialogOpen(false);
  };

  const handleDialogOpenChange = (
    open: boolean
  ) => {
    setDialogOpen(open);
    if (!open) {
      setCourseCode("");
      setCourseTitle("");
      setFormInstructors([]);
      setInstructorSearch("");
      setInstructorDropdownOpen(false);
    }
  };

  const handleRemoveInstructor = (
    courseCode: string,
    instructorToRemove: string
  ) => {
    useEnrollmentStore.setState(
      (state) => ({
        courses:
          state.courses.map(
            (course) => {
              if (
                course.courseCode !==
                courseCode
              ) {
                return course;
              }
              const instructors =
                course.instructors?.filter(
                  (instructor) =>
                    instructor !==
                    instructorToRemove
                );
              return {
                ...course,
                instructors,
              };
            }
          ),
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            จัดการวิชาเรียน
          </h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={
            handleDialogOpenChange
          }
        >
          <DialogTrigger
            render={<Button />}
          >
            <PlusCircle className="h-4 w-4" />
            เพิ่มวิชา
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                เพิ่มวิชาใหม่
              </DialogTitle>
              <DialogDescription>
                กรอกข้อมูลวิชาและเลือกผู้สอนได้หลายคน
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="courseCode">
                  รหัสวิชา
                </Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  aria-invalid={
                    codeAlreadyExists
                  }
                  onChange={(event) =>
                    setCourseCode(
                      event.target.value
                    )
                  }
                  placeholder="เช่น CS101"
                  className={
                    codeAlreadyExists
                      ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      : ""
                  }
                />
                {codeAlreadyExists && (
                  <p className="text-sm text-destructive">
                    มีรหัสวิชา{" "}
                    {courseCode.trim()}{" "}
                    นี้แล้ว
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">
                  ชื่อวิชา
                </Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(event) =>
                    setCourseTitle(
                      event.target.value
                    )
                  }
                  placeholder="เช่น Computer Programming"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>
                  ผู้สอน
                </Label>
                <div
                  ref={instructorBoxRef}
                  className="relative"
                >
                  <div
                    className="flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border bg-background px-2 py-1"
                    onClick={() =>
                      setInstructorDropdownOpen(
                        true
                      )
                    }
                  >
                    {formInstructors.map(
                      (instructor) => (
                        <Badge
                          key={instructor}
                          variant="secondary"
                          className="max-w-[220px] gap-1"
                        >
                          <span className="max-w-[170px] truncate">
                            {instructor}
                          </span>
                          <button
                            type="button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();
                              removeFormInstructor(
                                instructor
                              );
                            }}
                            className="shrink-0 rounded-full hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    )}
                    <Input
                      value={
                        instructorSearch
                      }
                      onFocus={() =>
                        setInstructorDropdownOpen(
                          true
                        )
                      }
                      onChange={(event) => {
                        setInstructorSearch(
                          event.target.value
                        );

                        setInstructorDropdownOpen(
                          true
                        );
                      }}
                      placeholder={
                        formInstructors.length ===
                        0
                          ? "ค้นหาหรือเพิ่มผู้สอน"
                          : ""
                      }
                      className="h-7 min-w-[120px] flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  {instructorDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                      {filteredInstructors.map(
                        (instructor) => {
                          const selected =
                            formInstructors.includes(
                              instructor
                            );
                          return (
                            <button
                              key={instructor}
                              type="button"
                              onClick={() =>
                                toggleInstructor(
                                  instructor
                                )
                              }
                              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              <span className="min-w-0 truncate">
                                {instructor}
                              </span>
                              {selected && (
                                <Check className="h-4 w-4 shrink-0" />
                              )}
                            </button>
                          );
                        }
                      )}
                      {typedInstructor &&
                        !instructorAlreadyExists && (
                          <button
                            type="button"
                            onClick={
                              addNewInstructor
                            }
                            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            + เพิ่มผู้สอน "
                            {
                              typedInstructor
                            }
                            "
                          </button>
                        )}
                      {filteredInstructors.length ===
                        0 &&
                        !typedInstructor && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            ยังไม่มีผู้สอน
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={
                  !courseCode.trim() ||
                  !courseTitle.trim() ||
                  codeAlreadyExists
                }
                onClick={
                  handleAddCourse
                }
              >
                บันทึก
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>
      </div>
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
                ผู้สอน
              </TableHead>
              <TableHead className="text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ยังไม่มีรายวิชา
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow
                  key={
                    course.courseCode
                  }
                >
                  <TableCell>
                    {course.courseCode}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[350px] truncate">
                      {
                        course.courseTitle
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.instructors &&
                    course.instructors
                      .length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {course.instructors.map(
                          (instructor) => (
                            <Badge
                              key={
                                instructor
                              }
                              variant="outline"
                              className=" gap-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                            >
                              <span className="max-w-[150px] truncate ">
                                { instructor }
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveInstructor(
                                    course.courseCode,
                                    instructor
                                  )
                                }
                                className="shrink-0 rounded-full hover:bg-muted "
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        openDeleteDialog(
                          course.courseCode
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={
          setDeleteDialogOpen
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ยืนยันการลบวิชา
            </AlertDialogTitle>
            <AlertDialogDescription>
              ลบวิชา{" "}
              <span className="font-semibold">
                {deleteCourseCode}
              </span>{" "}
              ออกจากรายการที่เปิดสอนหรือไม่?
              <br />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmRemoveCourse
              }
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
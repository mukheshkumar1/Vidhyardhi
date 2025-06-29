/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, User, Phone, Search } from "lucide-react";
import "../../../index.css";
import DeleteStudent from "./DeleteStudent";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Badge } from "@mui/material";
import { Button } from "@/components/ui/button";
import PromoteStudent from "./PromoteStudent";
import { ScrollArea } from "@/components/ui/scroll-area";
import EditStudentProfile from "./editStudentProfile";
import StudentProfileImage from "./profileImage";
import PromoteStudentDialog from "./Promotesinglestudent";
import StudentFeeDetails from "./Getfeedetails";
import StudentGalleryUploader from "./studentGallery";

interface Attendance {
  yearly: {
    workingDays: number;
    presentDays: number;
    percentage: number;
  };
}
interface Performance {
  quarterly?: Record<string, any>;
  halfYearly?: Record<string, any>;
  annual?: Record<string, any>;
}
interface HistoryEntry {
  className: string;
  feeStructure: { paid: number; balance: number };
  performance: Performance;
  promotedAt: string;
}
interface FeeStructure {
  total: number;
  tuition?: {
    firstTerm: number;
    secondTerm: number;
  };
  transport: number;
  paid: number;
  balance: number;
}
interface Student {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  className: string;
  profilePicture?: {
    imageUrl?: string;
  };
  attendance?: Attendance;
  performance?: Performance;
  history?: HistoryEntry[];
  isCurrentLeader?: boolean;
  feeStructure?: FeeStructure;
}

const defaultAvatar = "https://www.w3schools.com/howto/img_avatar.png";

const StudentsByClass: React.FC = () => {
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/students", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const response = await res.json();
      setStudentsByClass(response);
    } catch (error: any) {
      toast.error(error.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openDrawer = (student: Student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedStudent(null);
    setDrawerOpen(false);
  };

  const filteredByClass = filterClass
    ? { [filterClass]: studentsByClass[filterClass] || [] }
    : studentsByClass;

  const filteredStudentsByClass = Object.entries(filteredByClass).reduce((acc, [grade, students]) => {
    const filtered = students.filter((s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) acc[grade] = filtered;
    return acc;
  }, {} as Record<string, Student[]>);

  const workingDays = selectedStudent?.attendance?.yearly.workingDays ?? 0;
  const presentDays = selectedStudent?.attendance?.yearly.presentDays ?? 0;
  const percentage = selectedStudent?.attendance?.yearly.percentage ?? 0;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">All Students</h2>

        <div className="flex flex-wrap justify-center gap-4 mb-8 items-center">
          <div className="flex items-center border rounded px-3 py-2 w-full sm:w-auto sm:min-w-[250px]">
            <Search className="text-gray-500 w-5 h-5 mr-1" />
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none w-full"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border px-3 py-2 rounded focus:outline-none min-w-[150px] text-black"
          >
            <option value="">All Classes</option>
            {Object.keys(studentsByClass).map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading students...</p>
        ) : (
          Object.entries(filteredStudentsByClass).map(([className, students]) => (
            <div key={className} className="mb-10 relative">
              <div className="flex items-center justify-between flex-wrap">
                <h3 className="text-xl font-semibold text-blue-600 mx-auto mb-2 sm:mb-0">{className}</h3>

                {className !== "Old Students" && (
                  <div className="ml-auto">
                    <PromoteStudent />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center mt-6">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="relative bg-white/20 backdrop-filter backdrop-blur-lg bg-opacity-40 shadow-md rounded-xl p-4 border hover:shadow-lg transition cursor-pointer text-left flex flex-col items-center"
                    onClick={() => openDrawer(student)}
                  >
                    {student.isCurrentLeader && (
                      <div className="absolute top-2 right-2">
                        <EmojiEventsIcon className="text-yellow-400 drop-shadow" titleAccess="Leader" />
                      </div>
                    )}

                    <img
                      src={student.profilePicture?.imageUrl || defaultAvatar}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover mb-2 border border-white"
                    />
                    <h4 className="font-bold text-lg mb-1 text-center">{student.fullName}</h4>
                    <p className="text-sm text-white text-center truncate w-full max-w-xs">{student.email}</p>
                    <p className="text-sm text-white text-center truncate w-full max-w-xs">{student.phone}</p>

                    <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm w-full">
                      <span className="text-purple-600">
                        {student.attendance?.yearly?.percentage || 0}%
                      </span>
                      <DeleteStudent
                        studentId={student._id}
                        studentName={student.fullName}
                        onDeleted={fetchStudents}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          {selectedStudent && (
            <DrawerContent
              className="bg-gradient-to-br from-[#80cb2e]/30 to-[#69306d]/30 text-white backdrop-blur-xl px-4 sm:px-6"
              style={{ width: "100vw", height: "100vh", margin: 0, borderRadius: 0 }}
            >
              <ScrollArea className="overflow-y-auto py-4" style={{ height: "100%" }}>
                <div className="text-center space-y-4 relative z-10 text-white max-w-4xl mx-auto">
                  <StudentProfileImage
                    studentId={selectedStudent._id}
                    currentImage={selectedStudent.profilePicture?.imageUrl || defaultAvatar}
                  />

                  <DrawerHeader>
                    <DrawerTitle className="text-2xl font-bold text-blue-300 tracking-wide">
                      {selectedStudent.fullName}
                    </DrawerTitle>
                    <DrawerDescription className="text-gray-200">
                      Details of the student. You can delete or edit below if needed.
                    </DrawerDescription>

                    {selectedStudent.isCurrentLeader && (
                      <div className="mt-2 flex justify-end">
                        <Badge
                          color="warning"
                          badgeContent={
                            <span className="flex items-center gap-1 text-white">
                              <EmojiEventsIcon fontSize="small" />
                              <span className="text-sm font-semibold">Leader</span>
                            </span>
                          }
                          anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        ></Badge>
                      </div>
                    )}
                  </DrawerHeader>

                  <div className="space-y-6 py-2 text-left text-sm px-2 sm:px-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-6 items-center">
                      <div className="flex-1 space-y-2">
                        <p className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-500" /> {selectedStudent.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-blue-500" /> {selectedStudent.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-500" /> {selectedStudent.className}
                        </p>
                      </div>
                    </div>

                    {/* Attendance */}
                    <p className="font-semibold mt-4 text-lg">Attendance (Yearly):</p>
                    <p>Working Days: {workingDays}</p>
                    <p>Present Days: {presentDays}</p>
                    <span className={`font-bold ${percentage < 75 ? "text-red-400" : "text-green-400"}`}>
                      {percentage}%
                    </span>
                    {percentage < 75 ? (
                      <span className="inline-block mt-2 px-3 py-1 text-xs font-bold text-red-500 bg-red-100/20 rounded-full animate-pulse">
                        Low Attendance
                      </span>
                    ) : (
                      <span className="inline-block mt-2 px-3 py-1 text-xs font-bold text-green-500 bg-green-100/10 rounded-full">
                        Good Attendance
                      </span>
                    )}

                    {/* Promote & Fee */}
                    <div className="flex flex-wrap gap-4 mt-4 justify-center">
                      {selectedStudent.className !== "Old Students" && (
                        <Button
                          onClick={() => setPromoteOpen(true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Promote Student
                        </Button>
                      )}
                      <Button
                        onClick={() => setFeeDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Fee Details
                      </Button>
                      <Button
                        onClick={() => setGalleryDialogOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        + Add Gallery
                      </Button>
                    </div>
                  </div>

                  {/* Dialogs */}
                  <PromoteStudentDialog
                    isOpen={promoteOpen}
                    onClose={() => setPromoteOpen(false)}
                    studentId={selectedStudent._id}
                    currentClass={selectedStudent.className}
                  />
                  <StudentFeeDetails
                    studentId={selectedStudent._id}
                    isOpen={feeDialogOpen}
                    onClose={() => setFeeDialogOpen(false)}
                  />
                  <StudentGalleryUploader
                    studentId={selectedStudent._id}
                    studentName={selectedStudent.fullName}
                    open={galleryDialogOpen}
                    onClose={() => setGalleryDialogOpen(false)}
                  />

                  {/* Edit/Delete */}
                  <div className="mt-6 flex justify-center">
                    <DeleteStudent
                      studentId={selectedStudent._id}
                      studentName={selectedStudent.fullName}
                      onDeleted={closeDrawer}
                    />
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button onClick={() => setEditDialogOpen(true)} variant="default">
                      Edit Profile
                    </Button>
                  </div>

                  {selectedStudent && selectedStudent.feeStructure && (
                    <EditStudentProfile
                      open={editDialogOpen}
                      setOpen={setEditDialogOpen}
                      studentId={selectedStudent._id}
                      fullName={selectedStudent.fullName}
                      feeStructure={selectedStudent.feeStructure}
                      onUpdateSuccess={() => {
                        fetchStudents();
                        toast.success("Student updated successfully!");
                      }}
                    />
                  )}

                  <div className="mt-6 flex justify-center">
                    <DrawerClose asChild>
                      <Button variant="outline">Close</Button>
                    </DrawerClose>
                  </div>
                </div>
              </ScrollArea>
            </DrawerContent>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default StudentsByClass;

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Phone, BadgeInfo, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch as MUISwitch, FormControlLabel } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import ToggleAdmin from "./ToggleAdmin";
import DeleteStaff from "./DeleteStaff";
import ToggleEditPermissionButton from "./togglePermissions";
import StaffAttendanceReport from "./getStaffAttendance"; // attendance report component

const defaultAvatar = "https://www.w3schools.com/howto/img_avatar.png";

type Staff = {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  profilePicture?: { imageUrl?: string };
  role: "admin" | "staff";
  teaching: boolean;
  permissions?: {
    canEditStudents?: boolean;
  };
};

const GetStaff: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdmins, setShowAdmins] = useState(false);
  const [tab, setTab] = useState("teaching");

  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceStaff, setAttendanceStaff] = useState<Staff | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const endpoint = showAdmins ? "admin" : "staff";
      const res = await fetch(`http://localhost:5000/api/admin/${endpoint}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch staff");

      const list = showAdmins ? data.admins : data.staff;
      if (!Array.isArray(list)) throw new Error("Invalid staff data format");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const castList = list.map((staff: any) => ({
        ...staff,
        role: staff.role === "admin" ? "admin" : "staff",
      }));

      setStaffList(castList);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Error loading staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdmins]);

  const openDialog = (staff: Staff) => {
    setSelectedStaff(staff);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedStaff(null);
  };

  const filteredStaff = staffList.filter((staff) =>
    staff.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teachingStaff = filteredStaff.filter((staff) => staff.teaching);
  const nonTeachingStaff = filteredStaff.filter((staff) => !staff.teaching);
  const editPermissionStaff = filteredStaff.filter(
    (staff) => staff.permissions?.canEditStudents
  );

  const renderStaffCards = (list: Staff[]) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {list.map((staff) => (
        <motion.div
          key={staff._id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/20 backdrop-blur-md rounded-xl p-4 border hover:shadow-lg"
        >
          <div onClick={() => openDialog(staff)} className="cursor-pointer">
            <img
              src={staff.profilePicture?.imageUrl || defaultAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border border-white"
            />
            <h4 className="font-bold text-lg text-center">{staff.fullName}</h4>
            <p className="text-sm text-white text-center">{staff.email}</p>
            <p className="text-sm text-white text-center">{staff.mobileNumber}</p>
            <div className="mt-2 flex justify-center text-sm gap-2">
              <span className="bg-blue-600 text-white px-3 py-1 text-xs rounded-full">
                {staff.role}
              </span>
              {!showAdmins && (
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    staff.teaching ? "bg-green-500" : "bg-gray-500"
                  } text-white`}
                >
                  {staff.teaching ? "Teaching" : "Non-Teaching"}
                </span>
              )}
            </div>
          </div>

          {/* Attendance Button */}
          <Button
            variant="outline"
            className="mt-3 w-full text-white bg-slate-400 rounded-xl"
            onClick={() => {
              setAttendanceStaff(staff);
              setAttendanceDialogOpen(true);
            }}
          >
            View Attendance
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">
          {showAdmins ? "Admin Members" : "Staff Directory"}
        </h2>

        <div className="flex flex-wrap justify-center gap-6 mb-6 items-center">
          <FormControlLabel
            control={
              <MUISwitch
                checked={showAdmins}
                onChange={(e) => setShowAdmins(e.target.checked)}
                color="primary"
              />
            }
            label="Show Admin"
          />
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
        </div>

        <Tabs value={tab} onValueChange={setTab} className="text-left">
          <TabsList className="mb-6 flex flex-wrap justify-center gap-4">
            <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
            <TabsTrigger value="non-teaching">Non-Teaching Staff</TabsTrigger>
            <TabsTrigger value="edit-permission">Edit Permission</TabsTrigger>
          </TabsList>

          {loading ? (
            <p className="text-gray-300">Loading...</p>
          ) : (
            <AnimatePresence mode="wait">
              <TabsContent value="teaching">
                {renderStaffCards(teachingStaff)}
              </TabsContent>
              <TabsContent value="non-teaching">
                {renderStaffCards(nonTeachingStaff)}
              </TabsContent>
              <TabsContent value="edit-permission">
                {renderStaffCards(editPermissionStaff)}
              </TabsContent>
            </AnimatePresence>
          )}
        </Tabs>

        {/* Staff Detail Dialog */}
        {dialogOpen && selectedStaff && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-gray-300 shadow-md">
              <h3 className="text-xl font-semibold">{selectedStaff.fullName}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDialog}
                aria-label="Close dialog"
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-grow p-6 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-gray-300 max-h-[80vh] overflow-y-auto">
              <div className="max-w-md mx-auto space-y-4">
                <img
                  src={selectedStaff.profilePicture?.imageUrl || defaultAvatar}
                  alt="Avatar"
                  className="w-40 h-40 rounded-full object-cover border border-white mx-auto"
                />
                <DeleteStaff
                  staffId={selectedStaff._id}
                  role={selectedStaff.role}
                  onDeleted={fetchStaff}
                />
                <div className="flex justify-center mb-2">
                  <ToggleAdmin
                    staffId={selectedStaff._id}
                    currentRole={selectedStaff.role}
                    onToggle={fetchStaff}
                  />
                </div>
                <p className="flex items-center gap-2">
                  <BadgeInfo className="w-5 h-5" /> Role: {selectedStaff.role}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Email: {selectedStaff.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-5 h-5" /> Mobile: {selectedStaff.mobileNumber}
                </p>
                <p>Gender: {selectedStaff.gender}</p>
                <p>Teaching Staff: {selectedStaff.teaching ? "Yes" : "No"}</p>
              </div>

              <ToggleEditPermissionButton
                staffId={selectedStaff._id}
                initialPermission={selectedStaff.permissions?.canEditStudents || false}
              />
            </ScrollArea>
          </div>
        )}

        {/* Attendance Dialog */}
        {attendanceDialogOpen && attendanceStaff && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-gray-300 shadow-md">
              <h3 className="text-xl font-semibold">
                {attendanceStaff.fullName}'s Attendance
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAttendanceDialogOpen(false);
                  setAttendanceStaff(null);
                }}
                aria-label="Close dialog"
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-grow p-6 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-gray-300 max-h-[80vh] overflow-y-auto">
              <StaffAttendanceReport staffId={attendanceStaff._id} />
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetStaff;

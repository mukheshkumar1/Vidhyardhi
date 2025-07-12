// pages/AdminPage.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import useLogout from "@/hooks/useLogout";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import AdminSidebar from "./components/AdminSidebar";
import StudentsByClass from "./components/getStudents";
import AddStudent from "./components/AddStudent";
import StaffList from "./components/getStaff";
import AddStaffSection from "./components/AddStaffButton";
import GalleryAdmin from "./components/AddGallery";
import Calendar from "./components/AdminEventCalender";
import Registrations from "./components/Registration";
import AddBulkStudentsDialog from "./components/AddBulkStudent";
import SetClassLeaderCandidates from "./components/selectclassLeader";
import VotingPeriodForm from "./components/VotingPeriodForm";
import VotingStats from "./components/VotingStats";
import AssignClassLeader from "./components/AssignLeader";
import CloseVoting from "./components/closeVoting";
import AdminHolidayCalendar from "./components/HolidayCalendar";
import StaffAttendancePanel from "./components/staffAttendancePanel";
import AdminProfile from "./components/AdminProfile";

const AdminPage = () => {

  const [activeTab, setActiveTab] = useState<
    "students" | "staff" |"staffattendance"| "gallery" | "registrations"  | "selectclassleader" |"holidaycalendar" | "profile"
  >("students");

  const [studentsCount, setStudentsCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const { logout, loading } = useLogout();
  const [backWarning, setBackWarning] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };
   
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setBackWarning(true);
      window.history.pushState(null, "", window.location.pathname);
    };
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (backWarning) {
      const timer = setTimeout(() => setBackWarning(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [backWarning]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [studentsRes, staffRes] = await Promise.all([
          fetch("https://vidhyardhi.onrender.com/api/admin/students", {
            credentials: "include",
          }).then((res) => res.json()),
          fetch("https://vidhyardhi.onrender.com/api/admin/staff", {
            credentials: "include",
          }).then((res) => res.json()),
        ]);

        const studentsArray = Array.isArray(studentsRes)
        ? studentsRes
        : Object.values(studentsRes).flat();
      
      const totalStudents = studentsArray.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (student: any) => student.className !== "Old Students"
      ).length;

        let totalStaff = 0;
        if (Array.isArray(staffRes)) {
          totalStaff = staffRes.length;
        } else if (typeof staffRes === "object" && staffRes !== null) {
          totalStaff = Object.values(staffRes).flat().length;
        }

        setStudentsCount(totalStudents);
        setStaffCount(totalStaff);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("https://vidhyardhi.onrender.com/api/admin/profile", {
          credentials: "include",
        });
        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
      }
    };
    fetchAdmin();
  }, []);
  

  return (
    <div className="flex min-h-screen bg-[#58931d]  text-white">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} admin={admin} />


      <motion.main className="flex-1 p-8 overflow-y-auto">
        {backWarning && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Please logout first before leaving this page.
          </div>
        )}

        <div className="flex justify-end mb-6">
          <Button
            onClick={logout}
            disabled={loading}
            variant="destructive"
            className="flex items-center gap-2 px-5 py-2 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-red-600 hover:bg-red-700"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">
              {loading ? "Logging out..." : "Logout"}
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-6 text-yellow-300"
          >
            <p className="text-lg font-semibold">Total Students</p>
            <h2 className="text-4xl font-bold">{studentsCount}</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-6 text-green-300"
          >
            <p className="text-lg font-semibold">Total Staff</p>
            <h2 className="text-4xl font-bold">{staffCount}</h2>
          </motion.div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "students" && (
            <motion.div
              key="students"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <AddStudent />
              <AddBulkStudentsDialog />
              <StudentsByClass />
            </motion.div>
          )}

          {activeTab === "staff" && (
            <motion.div
              key="staff"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <AddStaffSection />
              <StaffList />
            </motion.div>
          )}
          {activeTab === "staffattendance" && (
            <motion.div
              key="staff"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
             <StaffAttendancePanel/>
            </motion.div>
          )}

          {activeTab === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <GalleryAdmin isAdmin />
              <Calendar isAdmin />
            </motion.div>
          )}

          {activeTab === "registrations" && (
            <motion.div
              key="registrations"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Registrations />
            </motion.div>
          )}

          {/* {activeTab === "schoolimages" && (
            <motion.div
              key="schoolimages"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <ManageSchoolImages />
            </motion.div>
          )} */}

{activeTab === "selectclassleader" && (
  <motion.div
    key="selectclassleader"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -20, opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="space-y-6"
  >
    
    <div
  className="rounded-xl border border-gray-200 bg-white/10 backdrop-blur-md shadow-lg text-black"
>
<button
  className="w-full text-left px-4 py-3 flex justify-between items-center font-semibold text-purple-700 rounded-xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-md hover:shadow-md"
  onClick={() => toggleSection("selectCandidate")}
>
    🗳️ Select Candidate
    {expandedSection === "selectCandidate" ? <ChevronUp /> : <ChevronDown />}
  </button>
  {expandedSection === "selectCandidate" && (
    <div className="px-4 pb-4">
      <SetClassLeaderCandidates />
    </div>
  )}
</div>

<div
  className="rounded-xl border border-gray-200 bg-white/10 backdrop-blur-md shadow-lg text-black"
>
<button
  className="w-full text-left px-4 py-3 flex justify-between items-center font-semibold text-purple-700 rounded-xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-md hover:shadow-md"
  onClick={() => toggleSection("closeVoting")}
>
    ⛔ Close Voting
    {expandedSection === "closeVoting" ? <ChevronUp /> : <ChevronDown />}
  </button>
  {expandedSection === "closeVoting" && (
    <div className="px-4 pb-4">
      <CloseVoting />
    </div>
  )}
</div>

    {/* Voting Period Setup */}
    <div
  className="rounded-xl border border-gray-200 bg-white/10 backdrop-blur-md shadow-lg text-black"
>
<button
  className="w-full text-left px-4 py-3 flex justify-between items-center font-semibold text-purple-700 rounded-xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-md hover:shadow-md"
  onClick={() => toggleSection("votingPeriod")}
>
    🗓️ Set Voting Period
    {expandedSection === "votingPeriod" ? <ChevronUp /> : <ChevronDown />}
  </button>
  {expandedSection === "votingPeriod" && (
    <div className="px-4 pb-4">
      <VotingPeriodForm />
    </div>
  )}
</div>


    {/* Voting Stats */}
    <div
  className="rounded-xl border border-gray-200 bg-white/10 backdrop-blur-md shadow-lg text-black"
>
<button
  className="w-full text-left px-4 py-3 flex justify-between items-center font-semibold text-purple-700 rounded-xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-md hover:shadow-md"
  onClick={() => toggleSection("votingStats")}
>
    📊 Voting Statistics
    {expandedSection === "votingStats" ? <ChevronUp /> : <ChevronDown />}
  </button>
  {expandedSection === "votingStats" && (
    <div className="px-4 pb-4">
      <VotingStats />
    </div>
  )}
</div>


    {/* Assign Leader */}
    <div
  className="rounded-xl border border-gray-200 bg-white/10 backdrop-blur-md shadow-lg text-black"
>
<button
  className="w-full text-left px-4 py-3 flex justify-between items-center font-semibold text-purple-700 rounded-xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-md hover:shadow-md"
  onClick={() => toggleSection("assignLeader")}
>
    🏆 Assign Class Leader
    {expandedSection === "assignLeader" ? <ChevronUp /> : <ChevronDown />}
  </button>
  {expandedSection === "assignLeader" && (
    <div className="px-4 pb-4">
      <AssignClassLeader />
    </div>
  )}
</div>

    
  </motion.div>
)}
  {activeTab === "holidaycalendar" && (
            <motion.div
              key="holidaycalendar"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <AdminHolidayCalendar />
            </motion.div>
          )}
          {activeTab === "profile" && (
  <motion.div
    key="profile"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -20, opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="space-y-6"
  >
    <AdminProfile />
  </motion.div>
)}

        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default AdminPage;

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Menu, User, X, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import StudentProfile from "../components/studentProfile";
import MyHomeworkPage from "../components/StudentHomework";
import StudentAcademicDetails from "../components/Report Card";
import StudentAttendance from "../components/StudentAttendance";
import StudentFeeDetails from "../components/feePay";
import ClassLeaderVoting from "./studentVote";
import StudentGalleryView from "./studentGalleryView";
import { useLocation } from "react-router-dom";
import StudentHolidayCalendar from "./StudentHoliday";

import logo from "@/assets/images/logo.png"; // ✅ Add your logo path here

export default function StudentPanel() {
  const [activeKey, setActiveKey] = useState("homework");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [backWarning, setBackWarning] = useState(false);
  const location = useLocation();

  const [studentProfile, setStudentProfile] = useState({
    fullName: "Student Name",
    profilePicture: "",
    isCurrentLeader: false,
  });

  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:5000/api/student/profile", {
          credentials: "include",
        });
        const data = await res.json();
        setStudentProfile({
          fullName: data.fullName || "Student Name",
          profilePicture: data.profilePicture || "/placeholder.jpg",
          isCurrentLeader: data.isCurrentLeader || false,
        });
        setStudentId(data._id);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setBackWarning(true);
      window.history.pushState(null, "", window.location.href);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Please logout before leaving the page.";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (backWarning) {
      const timer = setTimeout(() => setBackWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [backWarning]);

  const studentLinks = [
    { name: "My Homework", component: <MyHomeworkPage />, key: "homework" },
    { name: "Profile", component: <StudentProfile />, key: "profile" },
    {
      name: "Report Card",
      component: <StudentAcademicDetails studentId={studentId} />,
      key: "report",
    },
    { name: "Attendance", component: <StudentAttendance />, key: "attendance" },
    {
      name: "Fee Details",
      component: <StudentFeeDetails studentId={studentId} />,
      key: "Fee Details",
    },
    { name: "Vote Leader", component: <ClassLeaderVoting />, key: "vote" },
    {
      name: "Gallery",
      component: <StudentGalleryView studentId={studentId} />,
      key: "gallery",
    },
    {
      name: "Calendar",
      component: <StudentHolidayCalendar />,
      key: "calendar",
    },
  ];

  const activeLink = studentLinks.find((link) => link.key === activeKey);

  const ProfileButton = () => (
    <div
      className="mt-auto pt-4 border-t flex items-center gap-3 cursor-pointer hover:bg-muted/60 rounded-md p-2"
      onClick={() => setActiveKey("profile")}
    >
      <img
        src={studentProfile.profilePicture}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover shadow"
      />
      <div className="flex flex-col">
        <span className="font-medium text-sm flex items-center gap-1">
          {studentProfile.fullName}
          {studentProfile.isCurrentLeader && (
            <Crown size={14} className="text-[#6366f1]" />
          )}
        </span>
        <span className="text-xs text-primary underline hover:text-primary/80 flex items-center gap-1">
          <User size={14} />
          View Profile
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row relative">
      {backWarning && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Please logout first before leaving this page.
        </div>
      )}

      {/* 🌐 Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40 p-4">
        {/* ✅ Logo */}
        <div className="flex flex-col items-center mb-4">
          <img src={logo} alt="Logo" className="h-36 w-auto mb-2" />
          <div className="text-lg font-semibold text-muted-foreground uppercase">
            Student Panel
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow mt-4">
          {studentLinks
            .filter((link) => link.key !== "profile")
            .map(({ name, key }) => (
              <button
                key={key}
                onClick={() => setActiveKey(key)}
                className={cn(
                  buttonVariants({
                    variant: activeKey === key ? "default" : "ghost",
                  }),
                  "w-full justify-start text-left"
                )}
              >
                {name}
              </button>
            ))}
        </nav>
        <ProfileButton />
      </aside>

      {/* 📱 Mobile Top Bar */}
      <div className="md:hidden w-full flex items-center justify-between p-4 border-b bg-muted/40 relative z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Menu />
          </button>
          <div className="text-lg font-semibold text-muted-foreground uppercase">
            {studentLinks.find((link) => link.key === activeKey)?.name || "Student Panel"}
          </div>
        </div>
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-white z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 📱 Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-background shadow-lg z-50 flex flex-col transform transition-transform duration-300 md:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <X />
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4 flex-grow">
          {studentLinks
            .filter((link) => link.key !== "profile")
            .map(({ name, key }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveKey(key);
                  setMobileSidebarOpen(false);
                }}
                className={cn(
                  buttonVariants({
                    variant: activeKey === key ? "default" : "ghost",
                  }),
                  "w-full justify-start text-left"
                )}
              >
                {name}
              </button>
            ))}
        </nav>
        <div className="p-4 border-t">
          <ProfileButton />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">{activeLink?.component}</main>
    </div>
  );
}

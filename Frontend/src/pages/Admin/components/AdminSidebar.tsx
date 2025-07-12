import {
    Users,
    UserCheck,
    Image,
    CalendarCheck,
    ClipboardList,
    Gavel,
    Menu,
    X,
    CheckCircle,
  } from "lucide-react";
  import React, { useState } from "react";
  
  type NavTabType =
  | "students"
  | "staff"
  | "staffattendance"
  | "gallery"
  | "registrations"
  | "selectclassleader"
  | "holidaycalendar"; // only tabs shown in tabInfo

type TabType = NavTabType | "profile"; // includes profile for switching, but not in sidebar

  interface Admin {
    fullName: string;
    profilePicture: {
      imageUrl: string;
    };
  }
  
  interface SidebarProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    admin?: Admin | null; // Make it optional for safety
  }
  
  
  const tabInfo: Record<NavTabType, { label: string; icon: React.ReactNode; color: string }> = {
    students: {
      label: "Manage Students",
      icon: <Users size={20} />,
      color: "yellow-400",
    },
    staff: {
      label: "Manage Staff",
      icon: <UserCheck size={20} />,
      color: "green-400",
    },
    staffattendance: {
      label: "Staff Attendance",
      icon: <CheckCircle size={20} />,
      color: "orange-400",
    },
    gallery: {
      label: "Gallery & Events",
      icon: <Image size={20} />,
      color: "blue-400",
    },
    registrations: {
      label: "Registrations",
      icon: <ClipboardList size={20} />,
      color: "purple-400",
    },
    // schoolimages: {
    //   label: "School Images",
    //   icon: <CalendarCheck size={20} />,
    //   color: "indigo-400",
    // },
    selectclassleader: {
      label: "Select Class Leader",
      icon: <Gavel className="w-5 h-5" />,
      color: "Teal-400",
    },
    holidaycalendar: {
      label: "Holiday Calendar",
      icon: <CalendarCheck size={20} />,
      color: "red-400",
    },
  };
  
  
  export default function AdminSidebar({ activeTab, setActiveTab, admin }: SidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
  
    const renderNavItems = () => (
      <nav className="flex-1 mt-8">
        {Object.entries(tabInfo).map(([key, { label, icon }]) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key as TabType);
                setIsMobileOpen(false); // Close menu on mobile after selection
              }}
              className={`flex items-center gap-4 w-full px-6 py-3 text-left font-semibold text-lg rounded-r-full transition
                ${isActive ? "text-black shadow-lg" : "text-white hover:bg-white/10"}`}
              style={isActive ? { backgroundColor: "#be6cc9" } : {}}
              aria-current={isActive ? "page" : undefined}
              type="button"
            >
              <span className={`flex-shrink-0 ${isActive ? "text-black" : "text-white"}`}>
                {icon}
              </span>
              {label}
            </button>
          );
        })}
        <div className="mt-auto px-6 py-4 border-t border-white/20">
  <button
    onClick={() => setActiveTab("profile" as TabType)}
    className="flex items-center gap-3 w-full text-white hover:bg-white/10 rounded-md p-2"
  >
    <img
      src={admin?.profilePicture?.imageUrl || "/default-avatar.png"}
      alt="Admin"
      className="w-8 h-8 rounded-full object-cover border border-white"
    />
    <span className="text-white font-medium truncate">
      {admin?.fullName || "My Profile"}
    </span>
  </button>
</div>
      </nav>
    );
  
    return (
      <>
        {/* Hamburger Button (Mobile Only) */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            className="text-white bg-black bg-opacity-60 p-2 rounded-md"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
  
        {/* Sidebar for Mobile and Desktop */}
        <aside
          className={`fixed md:static top-0 left-0 z-40 min-h-screen w-64 bg-[#737373]  text-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
          {/* Logo Section */}
          <div className="p-6 flex justify-center border-b border-white/20">
            <img
              src="../../src/assets/images/logo5.jpg"
              alt="Vidhyardhi Logo"
              className="object-contain max-h-20"
            />
          </div>
  
          {/* Navigation Items */}
          {renderNavItems()}
  
          {/* Footer Section (optional) */}
          <div className="p-6 border-t border-white/20">
            {/* Add Logout or version info here */}
          </div>
        </aside>
  
        {/* Overlay for Mobile */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </>
    );
  }
  
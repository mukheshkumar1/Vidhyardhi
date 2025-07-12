/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useLogout from "@/hooks/useLogout";
import StudentPanel from "./components/studentsidebar";

export default function StudentPage() {
  const { logout, loading } = useLogout();
  const [backWarning, setBackWarning] = useState(false);

  useEffect(() => {
    // Prevent back to login
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
  }, []);

  useEffect(() => {
    if (backWarning) {
      const timer = setTimeout(() => setBackWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [backWarning]);

  return (
    <div className="flex min-h-screen">
      <StudentPanel />

      <main className="flex-1 p-4 relative">
        {/* Logout Button */}
        <div className="absolute top-6 right-6 z-10">
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

        {/* Warning */}
        {backWarning && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Please logout first before leaving this page.
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}

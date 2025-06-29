
// components/staff/StaffDashboard.tsx
import StaffSidebar from '../Staff/Components/sidebar';
import { Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useLogout from "@/hooks/useLogout";

export default function StaffDashboard() {
  const { logout, loading } = useLogout();

  return (
    <div className="flex min-h-screen">
      <StaffSidebar />

      <main className="flex-1 p-4 relative">
        {/* Logout Button at top right */}
        <div className="absolute top-6 right-6 z-10">
          <Button
            onClick={logout}
            disabled={loading}
            variant="destructive"
            className="flex items-center gap-2 px-5 py-2 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-red-600 hover:bg-red-700"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">{loading ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>

        {/* Nested routes will render here */}
        <Outlet />
      </main>
    </div>
  );
}


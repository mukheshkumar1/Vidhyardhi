import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Staff = {
  _id: string;
  fullName: string;
  profilePicture?: { imageUrl?: string };
};

const AttendanceStatuses = ["present", "absent", "holiday"] as const;

export default function StaffAttendancePanel() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchStaff = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/staff", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setStaffList(data.staff);
      else toast.error("Failed to load staff list");
    } catch {
      toast.error("Error loading staff list");
    }
  };

  const handleStatusChange = (staffId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [staffId]: status }));
  };

  const submitAttendance = async () => {
    const attendanceList = Object.entries(attendance).map(([staffId, status]) => ({ staffId, status }));
    if (attendanceList.length === 0) return toast.error("No attendance selected");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/staff/attendance/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceList }),
      });
      const data = await res.json();
      res.ok ? toast.success(data.message) : toast.error(data.message || "Bulk marking failed");
    } catch {
      toast.error("Bulk attendance failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-indigo-700">📋 Staff Attendance Panel</h2>
        <p className="text-gray-500 mt-1 italic">{today}</p>
      </div>

      {staffList.length === 0 ? (
        <p className="text-center text-gray-500 text-sm">Loading staff...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <Card
              key={staff._id}
              className="bg-white/60 backdrop-blur-lg border border-indigo-100 shadow-md rounded-xl transition hover:shadow-xl"
            >
              <CardHeader className="flex items-center gap-4">
                <img
                  src={staff.profilePicture?.imageUrl || "https://www.w3schools.com/howto/img_avatar.png"}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-300"
                />
                <div>
                  <h4 className="text-indigo-800 font-bold">{staff.fullName}</h4>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={attendance[staff._id] || ""}
                  onValueChange={(status) => handleStatusChange(staff._id, status)}
                  className="space-y-2"
                >
                  {AttendanceStatuses.map((status) => (
                    <div
                      key={status}
                      className="flex items-center space-x-3 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-md transition"
                    >
                      <RadioGroupItem
                        value={status}
                        id={`${staff._id}-${status}`}
                        className="text-indigo-600"
                      />
                      <Label
                        htmlFor={`${staff._id}-${status}`}
                        className="capitalize text-sm font-medium text-indigo-800"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <Button
          onClick={submitAttendance}
          disabled={loading}
          className="px-6 py-3 text-white font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg hover:opacity-90 transition"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
          Submit Attendance
        </Button>
      </div>
    </div>
  );
}

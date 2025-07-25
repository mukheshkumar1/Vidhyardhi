import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // or your own modal component
import { PartyPopper } from "lucide-react";

const AdminBirthdayPopup = () => {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/student/birthday", {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.birthdaysToday?.length > 0) {
          setStudents(data.birthdaysToday);
          setOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch birthday students", error);
      }
    };
    fetchBirthdays();
  }, []);

  if (!students.length) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-lg shadow-lg max-w-md glassmorphism bg-white/30 border border-white/20 backdrop-blur-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-700 mb-2 flex justify-center items-center gap-2">
            <PartyPopper className="text-yellow-500" />
            Today's Birthdays
          </h2>
          <ul className="text-gray-900">
            {students.map((student: any) => (
              <li key={student._id} className="my-1">
                🎉 <strong>{student.fullName}</strong> — Class {student.className}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setOpen(false)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBirthdayPopup;

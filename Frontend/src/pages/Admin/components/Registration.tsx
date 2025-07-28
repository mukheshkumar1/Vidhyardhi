import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Printer } from "lucide-react"; // Optional icon

type Registration = {
  _id: string;
  fullName: string;
  parentName: string;
  studentAge: string;
  relation: string;
  previousSchool: string;
  siblings: string;
  email: string;
  phone: string;
  className: string;
  date: string;
};

const Registrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/register/", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch registrations");
      const data = await res.json();
      setRegistrations(data);
    } catch {
      toast.error("Error fetching registrations");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/register/${selectedId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete registration");

      setRegistrations((prev) => prev.filter((reg) => reg._id !== selectedId));
      toast.success("Registration deleted successfully");
    } catch {
      toast.error("Error deleting registration");
    } finally {
      setShowDialog(false);
      setSelectedId(null);
    }
  };

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    const printWindow = window.open("", "", "width=1000,height=800");
    if (printWindow && printContents) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Registrations</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
              th { background: #f0f0f0; }
              h2 { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h2>Student Registrations</h2>
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Student Registrations</h2>
        <Button
          onClick={handlePrint}
          className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 rounded-lg shadow px-4 py-2"
        >
          <Printer size={18} /> Download / Print
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : registrations.length === 0 ? (
        <p>No registrations found.</p>
      ) : (
        <div className="overflow-x-auto" ref={printRef}>
          <table className="min-w-full border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Class Applied</th>
                <th className="px-4 py-2 text-left">Student Age</th>
                <th className="px-4 py-2 text-left">Parent Name</th>
                <th className="px-4 py-2 text-left">Relation</th>
                <th className="px-4 py-2 text-left">Previous Schooling</th>
                <th className="px-4 py-2 text-left">Siblings</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">{reg.fullName}</td>
                  <td className="px-4 py-2">{reg.className}</td>
                  <td className="px-4 py-2">{reg.studentAge}</td>
                  <td className="px-4 py-2">{reg.parentName}</td>
                  <td className="px-4 py-2">{reg.relation}</td>
                  <td className="px-4 py-2">{reg.previousSchool}</td>
                  <td className="px-4 py-2">{reg.siblings}</td>
                  <td className="px-4 py-2">{reg.email}</td>
                  <td className="px-4 py-2">{reg.phone}</td>
                  <td className="px-4 py-2">
                    {new Date(reg.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Button
                      variant="secondary"
                      className="bg-red-500 rounded-xl shadow-inner hover:shadow-lg hover:-translate-y-0.5 hover:brightness-110 transition-all duration-300"
                      onClick={() => confirmDelete(reg._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white/30 backdrop-blur-md border border-white/40 shadow-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <p className="text-sm text-white">
              Are you sure you want to delete this registration? This action
              cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Registrations;

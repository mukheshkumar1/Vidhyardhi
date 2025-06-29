import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

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

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/register/", {
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
      const res = await fetch(`http://localhost:5000/api/register/${selectedId}`, {
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

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Student Registrations</h2>

      {loading ? (
        <p>Loading...</p>
      ) : registrations.length === 0 ? (
        <p>No registrations found.</p>
      ) : (
        <div className="overflow-x-auto">
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
                  <td className="px-4 py-2">{new Date(reg.date).toLocaleString()}</td>
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
            <p className="text-sm text-white ">
              Are you sure you want to delete this registration? This action cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-red-500 text-white hover:bg-red-600" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Registrations;

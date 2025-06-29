import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { ShieldCheck, UserCog2 } from "lucide-react";

type ToggleAdminProps = {
  staffId: string;
  currentRole: "admin" | "staff"; // expects only these two roles
  onToggle?: () => void; // Callback to refresh data
};

const ToggleAdmin: React.FC<ToggleAdminProps> = ({ staffId, currentRole, onToggle }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/staff/${staffId}/toggle-admin`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to toggle admin rights");

      toast.success(`Success: ${data.message}`, {
        description: `User is now ${data.staff.role}`,
      });

      if (onToggle) onToggle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className={`gap-2 px-4 py-2 rounded-md ${
          currentRole === "admin" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {currentRole === "admin" ? (
          <>
            <UserCog2 className="w-4 h-4" />
            Revoke Admin
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Make Admin
          </>
        )}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {currentRole === "admin" ? "Revoke Admin Rights" : "Grant Admin Rights"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            {currentRole === "admin" ? "remove admin access" : "grant admin access"} to this staff
            member?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmToggle} disabled={loading}>
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ToggleAdmin;

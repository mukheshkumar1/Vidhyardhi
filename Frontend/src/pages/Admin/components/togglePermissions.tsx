import React, { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  staffId: string;
  initialPermission: boolean;
};

const ToggleEditPermissionButton: React.FC<Props> = ({
  staffId,
  initialPermission,
}) => {
  const [canEdit, setCanEdit] = useState(initialPermission);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const newPermission = !canEdit;
    setLoading(true);

    try {
      const res = await fetch(
        `https://vidhyardhi.onrender.com/api/admin/staff/${staffId}/permissions`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ canEditStudents: newPermission }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update permission");
      }

      setCanEdit(newPermission);
      toast.success(`Permission ${newPermission ? "granted" : "revoked"} successfully`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Error updating permission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <Button
        onClick={handleToggle}
        disabled={loading}
        className={`transition-all px-6 py-2 text-sm font-medium rounded-full border ${
          canEdit
            ? "bg-green-600 text-white hover:bg-green-700 border-green-500"
            : "bg-red-600 text-white hover:bg-red-700 border-red-500"
        }`}
      >
        {canEdit ? (
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Granted Permission
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShieldX className="w-4 h-4" />
            Revoked Permission
          </span>
        )}
      </Button>
    </div>
  );
};

export default ToggleEditPermissionButton;

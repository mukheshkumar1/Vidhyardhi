/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TextField, MenuItem } from "@mui/material";

const CloseVoting = () => {
  const [className, setClassName] = useState("Grade 1");
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/voting/status?className=${encodeURIComponent(className)}`
      );
      const data = await res.json();
      setIsOpen(data.isOpen);
    } catch {
      toast.error("Failed to fetch voting status");
      setIsOpen(null);
    }
  };

  useEffect(() => {
    if (className) fetchStatus();
  }, [className]);

  const handleClose = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/voting/close", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Error closing voting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-8 backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-indigo-800">
          🚫 Close Class Leader Election
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <TextField
          select
          label="🎓 Select Class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          fullWidth
          size="small"
          sx={{
            background: "rgba(255,255,255,0.85)",
            borderRadius: "12px",
            fontWeight: 500,
          }}
        >
          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </TextField>

        <div className="text-md font-medium text-gray-800">
          Status:{" "}
          <span
            className={`font-bold ${
              isOpen === null
                ? "text-gray-500"
                : isOpen
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isOpen === null ? "Loading..." : isOpen ? "Open" : "Closed"}
          </span>
        </div>

        <Button
          disabled={loading || !isOpen}
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg rounded-xl hover:opacity-90"
        >
          {loading ? "Closing..." : "🚫 Close Voting"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CloseVoting;

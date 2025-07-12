/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField, MenuItem, Avatar } from "@mui/material";

const AssignClassLeader = () => {
  const [className, setClassName] = useState("Grade 1");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!className) return;

    const encodedClass = encodeURIComponent(className);
    fetch(`http://localhost:5000/api/admin/voting/candidates?className=${encodedClass}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch candidates.");
        return res.json();
      })
      .then((data) => {
        setCandidates(data || []);
        if (Array.isArray(data) && data.length > 0) {
          const topCandidate = data.reduce((prev, curr) =>
            curr.votes > prev.votes ? curr : prev
          );
          setSelected(topCandidate._id);
        } else {
          setSelected("");
        }
      })
      .catch(() => {
        toast.error("Unable to load candidates.");
        setCandidates([]);
        setSelected("");
      });
  }, [className]);

  const assignLeader = async () => {
    if (!selected) {
      toast.warning("Please select a candidate.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/voting/assign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, studentId: selected }),
      });

      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.message);
    } catch {
      toast.error("Failed to assign class leader.");
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-8 backdrop-blur-md bg-white/70 border rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-indigo-800 text-lg font-bold">🏆 Assign Class Leader</CardTitle>
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
            background: "rgba(255,255,255,0.9)",
            borderRadius: "12px",
          }}
        >
          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </TextField>

        {candidates.length > 0 ? (
          <TextField
            select
            fullWidth
            label="👤 Select Candidate"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            size="small"
            sx={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: "12px",
            }}
          >
            {candidates.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={c.profilePicture?.imageUrl || "/default-avatar.png"}
                    sx={{ width: 30, height: 30 }}
                  />
                  <span className="text-sm font-medium">
                    {c.fullName} ({c.votes} votes)
                  </span>
                </div>
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <p className="text-gray-500 text-sm italic">No candidates available for this class.</p>
        )}

        <Button
          onClick={assignLeader}
          disabled={!selected}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-md hover:opacity-90"
        >
          ✅ Assign as Class Leader
        </Button>
      </CardContent>
    </Card>
  );
};

export default AssignClassLeader;

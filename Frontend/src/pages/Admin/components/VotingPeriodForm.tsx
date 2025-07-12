/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField, MenuItem } from "@mui/material";

const VotingPeriodForm = () => {
  const [className, setClassName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async () => {
    if (!className || !startDate || !endDate) {
      toast.warning("All fields are required.");
      return;
    }

    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/admin/voting/deadline", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, startDate, endDate }),
      });

      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.message);
    } catch (error) {
      toast.error("Failed to set voting deadline.");
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-8 rounded-2xl shadow-lg border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-100 to-white">
      <CardHeader>
        <CardTitle className="text-purple-800 text-xl font-bold">
          🗓️ Set Voting Deadline
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <TextField
          fullWidth
          select
          label="Select Class"
          variant="outlined"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          sx={{
            backgroundColor: "#ffffffcc",
            borderRadius: 2,
          }}
        >
          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            backgroundColor: "#ffffffcc",
            borderRadius: 2,
          }}
        />

        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            backgroundColor: "#ffffffcc",
            borderRadius: 2,
          }}
        />

        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg hover:opacity-90 rounded-xl transition-all"
        >
          💾 Save Deadline
        </Button>
      </CardContent>
    </Card>
  );
};

export default VotingPeriodForm;

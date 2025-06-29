/* eslint-disable @typescript-eslint/no-unused-vars */
import  { useState } from "react";
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
      const res = await fetch("http://localhost:5000/api/admin/voting/deadline", {
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
    <Card className="max-w-xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Set Voting Deadline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextField
          fullWidth
          select
          label="Select Class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        >
          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade7"].map((cls) => (
            <MenuItem key={cls} value={cls}>
              Class {cls}
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
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
        />

        <Button onClick={handleSubmit}>Save Deadline</Button>
      </CardContent>
    </Card>
  );
};

export default VotingPeriodForm;

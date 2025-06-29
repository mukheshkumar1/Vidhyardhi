/* eslint-disable react-hooks/exhaustive-deps */
import  { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Avatar, TextField, MenuItem } from "@mui/material";

type Candidate = {
  _id: string;
  fullName: string;
  votes: number;
  profilePicture?: { imageUrl: string };
};

const VotingStats = () => {
  const [className, setClassName] = useState("10");
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    fetchStats();
  }, [className]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/voting/stats/${className}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) setCandidates(data);
      else toast.error(data.message);
    } catch {
      toast.error("Error fetching voting stats.");
    }
  };

  return (
    <Card className="max-w-5xl mx-auto mt-8">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Live Voting Stats - Class {className}</CardTitle>
        <TextField
          select
          size="small"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        >
          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </TextField>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={candidates}>
            <XAxis dataKey="fullName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="votes" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {candidates.map((c) => (
            <div
              key={c._id}
              className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg"
            >
              <Avatar src={c.profilePicture?.imageUrl} />
              <div>
                <p className="font-semibold">{c.fullName}</p>
                <p className="text-sm text-muted-foreground">{c.votes} votes</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingStats;

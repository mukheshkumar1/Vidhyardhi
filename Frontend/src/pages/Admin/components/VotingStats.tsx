/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Avatar, TextField, MenuItem } from "@mui/material";

type Candidate = {
  _id: string;
  fullName: string;
  votes: number;
  profilePicture?: { imageUrl: string };
};

const VotingStats = () => {
  const [className, setClassName] = useState("Grade 1");
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    fetchStats();
  }, [className]);

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `https://vidhyardhi.onrender.com/api/admin/voting/stats/${className}`,
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
    <Card className="max-w-6xl mx-auto mt-10 bg-gradient-to-br from-indigo-100 via-purple-50 to-white shadow-xl rounded-2xl border border-purple-200">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl font-extrabold text-purple-800">
          🔥 Live Voting Stats - {className}
        </CardTitle>
        <TextField
          select
          size="small"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          variant="outlined"
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
        >
          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map(
            (cls) => (
              <MenuItem key={cls} value={cls}>
                {cls}
              </MenuItem>
            )
          )}
        </TextField>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={candidates}>
            <XAxis dataKey="fullName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="votes" fill="#a855f7" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <h3 className="mt-8 text-lg font-bold text-purple-800 mb-4">
          🧑‍🎓 Candidates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {candidates.map((c) => (
            <div
              key={c._id}
              className="flex items-center gap-4 p-4 rounded-xl shadow-lg backdrop-blur-md bg-white/30 border border-white/40 transition-all hover:scale-[1.02]"
            >
              <Avatar
                src={c.profilePicture?.imageUrl}
                alt={c.fullName}
                sx={{ width: 50, height: 50 }}
              />
              <div>
                <p className="font-bold text-purple-900 text-lg">
                  {c.fullName}
                </p>
                <p className="text-sm text-gray-700">{c.votes} votes</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingStats;

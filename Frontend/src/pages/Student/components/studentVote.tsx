/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import confetti from "canvas-confetti";

interface Student {
  _id: string;
  fullName: string;
  className: string;
  profilePicture?: { imageUrl: string };
  votes?: number;
}

const classOptions = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
];

const ClassLeaderVoting = () => {
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  const fetchCandidates = async (cls: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/student/leader?className=${encodeURIComponent(cls)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch candidates.");
      setCandidates(data.candidates || []);
    } catch (err: any) {
      setSnackbar(err.message || "Could not load candidates.");
    } finally {
      setLoading(false);
    }
  };

  const vote = async (candidateId: string, className: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/student/vote", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, className }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setVoted(true);
      setSelected(candidateId);
      setSnackbar("🎉 Your vote has been recorded!");
      fireConfetti();
      fetchCandidates(className); // Refresh after vote
    } catch (err: any) {
      setSnackbar(err.message || "Voting failed.");
    } finally {
      setLoading(false);
    }
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <Card sx={{ maxWidth: 700, margin: "auto", mt: 4, p: 3, borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          <HowToVoteIcon sx={{ mr: 1, fontSize: 32 }} />
          Class Leader Election
        </Typography>

        {/* Class Dropdown */}
        <Box my={2}>
          <Typography variant="subtitle1">Select Your Class:</Typography>
          <select
            value={selectedClass}
            onChange={(e) => {
              const cls = e.target.value;
              setSelectedClass(cls);
              setVoted(false);
              setCandidates([]);
              fetchCandidates(cls);
            }}
            style={{ padding: "8px", fontSize: "16px", borderRadius: "5px", marginTop: "4px" }}
          >
            <option value="">-- Select Class --</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && !selectedClass && (
          <Alert severity="info">Please select your class to view candidates.</Alert>
        )}

        {!loading && selectedClass && candidates.length === 0 && (
          <Alert severity="warning">No candidates found for {selectedClass}.</Alert>
        )}

        {!loading && selectedClass && !voted && candidates.length > 0 && (
          <>
            {candidates.map((candidate) => (
              <Card
                key={candidate._id}
                variant="outlined"
                sx={{
                  my: 2,
                  p: 2,
                  borderRadius: 2,
                  border: selected === candidate._id ? "2px solid green" : "1px solid #ccc",
                  backgroundColor: selected === candidate._id ? "#e8f5e9" : "#fafafa",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "scale(1.01)",
                  },
                }}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <Avatar
                    src={candidate.profilePicture?.imageUrl || ""}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Typography ml={2} fontWeight={600}>
                    {candidate.fullName}
                  </Typography>
                  <Box ml="auto">
                    <Typography variant="body2" fontWeight="bold">
                      🗳️ {candidate.votes || 0} Votes
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2, width: "100%" }}
                  onClick={() => vote(candidate._id, selectedClass)}
                >
                  Vote
                </Button>
              </Card>
            ))}
          </>
        )}

        {!loading && voted && (
          <Alert severity="success">✅ You have already voted for {selectedClass}.</Alert>
        )}
      </CardContent>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar("")}
        message={snackbar}
      />
    </Card>
  );
};

export default ClassLeaderVoting;

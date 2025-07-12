import { useEffect, useState, ChangeEvent } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface Homework {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  fileUrl?: string;
  marks?: number | null;
  comments?: string;
}

export default function MyHomeworkPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://vidhyardhi.onrender.com/api/homework/student-class", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch homework");
        return res.json();
      })
      .then((data: { homework: Homework[] }) => {
        setHomeworks(data.homework || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load homework");
        setLoading(false);
      });
  }, []);

  const handleFileChange = (
    homeworkId: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    setFiles((prev) => ({ ...prev, [homeworkId]: file }));
    if (file) {
      toast.success(`File selected: ${file.name}`);
    }
  };

  const submitHomework = async (homeworkId: string) => {
    const file = files[homeworkId];
    if (!file) {
      toast.error("Please select a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/homework/submit/${homeworkId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Submission failed");
      }

      toast.success("📤 Homework submitted successfully!");
      setHomeworks((prev) =>
        prev.map((hw) =>
          hw._id === homeworkId ? { ...hw, status: "Submitted" } : hw
        )
      );
      setFiles((prev) => ({ ...prev, [homeworkId]: null }));
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error("❌ Submission failed. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Checked":
        return <span className="px-2 py-1 rounded text-white bg-blue-600 text-xs">Checked</span>;
      case "Submitted":
        return <span className="px-2 py-1 rounded text-white bg-green-600 text-xs">Submitted</span>;
      default:
        return <span className="px-2 py-1 rounded text-white bg-yellow-600 text-xs">Pending</span>;
    }
  };

  return (
    <Paper className="p-6">
      <Typography variant="h5" gutterBottom>
        My Homework
      </Typography>

      {loading ? (
        <div className="flex justify-center mt-6">
          <CircularProgress />
        </div>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : homeworks.length === 0 ? (
        <Typography>No homework assigned yet.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Submit / File</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {homeworks.map((hw) => (
                <TableRow key={hw._id}>
                  <TableCell>{hw.title}</TableCell>
                  <TableCell>{hw.description}</TableCell>
                  <TableCell>
                    {new Date(hw.deadline).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(hw.status)}</TableCell>
                  <TableCell>
                    {hw.status === "Checked" && hw.marks !== null ? hw.marks : "-"}
                  </TableCell>
                  <TableCell>
                    {hw.status === "Checked" && hw.comments ? hw.comments : "-"}
                  </TableCell>
                  <TableCell>
                    {hw.status === "Submitted" || hw.status === "Checked" ? (
                      hw.fileUrl ? (
                        <a
                          href={hw.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Submission
                        </a>
                      ) : (
                        "Submitted"
                      )
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(hw._id, e)}
                          className="w-full px-2 py-1 border rounded text-white bg-black file:text-white file:bg-neutral-900 file:border-none file:rounded"
                        />
                        <Button
                          onClick={() => submitHomework(hw._id)}
                          disabled={!files[hw._id]}
                          className="min-w-[110px] font-semibold flex items-center gap-1"
                        >
                          <UploadCloud size={18} /> Submit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

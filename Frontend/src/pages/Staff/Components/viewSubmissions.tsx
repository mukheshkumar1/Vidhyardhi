import { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

type Submission = {
  studentId: string;
  studentName: string;
  submitted: boolean;
  status: string;
  fileUrl: string;
  marks?: string;
  comments?: string;
};

export default function ViewSubmissionsPage({ homeworkId }: { homeworkId: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [inputData, setInputData] = useState<Record<string, { marks: string; comments: string }>>({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetch(`https://vidhyardhi.onrender.com/api/homework/submissions/${homeworkId}/submissions`)
      .then((res) => res.json())
      .then((data: Submission[]) => {
        setSubmissions(data);
        const initInputData: Record<string, { marks: string; comments: string }> = {};
        data.forEach((sub) => {
          initInputData[sub.studentId] = {
            marks: sub.marks || '',
            comments: sub.comments || '',
          };
        });
        setInputData(initInputData);
      });
  }, [homeworkId]);

  const handleInputChange = (id: string, field: 'marks' | 'comments', value: string) => {
    setInputData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const markChecked = async (student: Submission) => {
    setLoadingIds((prev) => [...prev, student.studentId]);
    try {
      const payload = {
        homeworkId,
        studentId: student.studentId,
        marks: inputData[student.studentId]?.marks || '',
        comments: inputData[student.studentId]?.comments || '',
      };

      const response = await fetch('https://vidhyardhi.onrender.com/api/homework/mark', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const { updatedSubmission } = await response.json();
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.studentId === student.studentId
              ? { ...sub, ...updatedSubmission }
              : sub
          )
        );
      } else {
        const errData = await response.json();
        alert('Failed to mark as checked: ' + errData.message);
      }
    } catch (err) {
      console.error('Mark checked error:', err);
      alert('Failed to mark as checked due to network error');
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== student.studentId));
    }
  };

  // Delete Homework handler
  const handleDeleteHomework = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://vidhyardhi.onrender.com/api/homework/${homeworkId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        alert('Homework deleted successfully');
        // Option 1: Redirect or notify parent to refresh homework list
        // For now just reload page or clear submissions
        setSubmissions([]);
      } else {
        const errData = await response.json();
        alert('Failed to delete homework: ' + errData.message);
      }
    } catch (err) {
      console.error('Delete Homework error:', err);
      alert('Failed to delete homework due to network error');
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Homework Submissions Overview</Typography>
        <Button
          color="error"
          variant="contained"
          onClick={() => setConfirmOpen(true)}
          disabled={deleteLoading}
        >
          {deleteLoading ? 'Deleting...' : 'Delete Homework'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow
                key={sub.studentId}
                sx={{
                  backgroundColor:
                    sub.status === 'checked'
                      ? '#e3f2fd'
                      : sub.submitted
                      ? '#e8f5e9'
                      : '#ffebee',
                }}
              >
                <TableCell>{sub.studentName}</TableCell>
                <TableCell
                  style={{
                    color:
                      sub.status === 'checked'
                        ? 'blue'
                        : sub.submitted
                        ? 'green'
                        : 'red',
                  }}
                >
                  {sub.status === 'checked'
                    ? 'Checked'
                    : sub.submitted
                    ? 'Submitted'
                    : 'Not Submitted'}
                </TableCell>
                <TableCell>
                  {sub.fileUrl ? (
                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer">
                      View File
                    </a>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={inputData[sub.studentId]?.marks || ''}
                    onChange={(e) => handleInputChange(sub.studentId, 'marks', e.target.value)}
                    disabled={sub.status === 'checked'}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={inputData[sub.studentId]?.comments || ''}
                    onChange={(e) => handleInputChange(sub.studentId, 'comments', e.target.value)}
                    disabled={sub.status === 'checked'}
                  />
                </TableCell>
                <TableCell>
                  {sub.status !== 'checked' && (
                    <Button
                      variant="outlined"
                      onClick={() => markChecked(sub)}
                      disabled={loadingIds.includes(sub.studentId)}
                    >
                      {loadingIds.includes(sub.studentId) ? 'Marking...' : 'Mark Checked'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete Homework</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this homework? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteHomework} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

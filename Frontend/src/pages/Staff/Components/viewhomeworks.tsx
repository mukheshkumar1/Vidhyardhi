import { useEffect, useState } from 'react';
import ViewSubmissionsPage from '../Components/viewSubmissions';
import {
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

type Homework = {
  _id: string;
  title: string;
  className: string;
  subject?: string;
  // Add other relevant fields if needed
};

export default function HomeworkSubmissionsWrapper() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHomeworks() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/homework/by-staff', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('Homework data from backend:', data);

        // Determine if response is grouped or flat
        const flatHomeworks: Homework[] = Array.isArray(data)
          ? data
          : Object.values(data).flat();

        setHomeworks(flatHomeworks);
        if (flatHomeworks.length > 0) {
          setSelectedHomeworkId(flatHomeworks[0]._id);
        }
      } catch (err) {
        console.error('Error fetching homework:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeworks();
  }, []);

  if (loading) return <CircularProgress sx={{ m: 5 }} />;

  if (homeworks.length === 0)
    return (
      <Typography sx={{ m: 3 }}>
        No homework assigned to your classes yet.
      </Typography>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select Homework to View Submissions
      </Typography>
      <Select
        value={selectedHomeworkId}
        onChange={(e) => setSelectedHomeworkId(e.target.value)}
        sx={{ mb: 3, minWidth: 300 }}
      >
        {homeworks.map((hw) => (
          <MenuItem key={hw._id} value={hw._id}>
            {hw.title} - {hw.className}
          </MenuItem>
        ))}
      </Select>

      {selectedHomeworkId && (
        <ViewSubmissionsPage homeworkId={selectedHomeworkId} />
      )}
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Box
} from '@mui/material';

interface Homework {
  _id: string;
  subject: string;
  description: string;
  dueDate: string;
}

interface HomeworkTrackerProps {
  selectedClass: string;
}

const HomeworkTracker: React.FC<HomeworkTrackerProps> = ({ selectedClass }) => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClass) return;

    setLoading(true);

    fetch(`https://vidhyardhi.onrender.com/api/staff/class/${selectedClass}/homework`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.homeworks)) {
          setHomeworks(data.homeworks);
        } else {
          setHomeworks([]); // fallback if data.homeworks is not array
        }
      })
      .catch(() => setHomeworks([]))
      .finally(() => setLoading(false));
  }, [selectedClass]);

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>
        Homework for {selectedClass}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : homeworks.length > 0 ? (
        <List>
          {homeworks.map((hw) => (
            <Paper key={hw._id} elevation={2} style={{ marginBottom: '10px', padding: '10px' }}>
              <ListItem>
                <ListItemText
                  primary={`${hw.subject}: ${hw.description}`}
                  secondary={`Due: ${new Date(hw.dueDate).toLocaleDateString()}`}
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Typography>No homework assigned.</Typography>
      )}
    </Box>
  );
};

export default HomeworkTracker;

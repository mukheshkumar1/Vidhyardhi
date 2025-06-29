// src/pages/AssignHomework.tsx
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import axios from 'axios';

interface Student {
  _id: string;
  name: string;
}

interface AssignHomeworkProps {
  student: Student;
}

const AssignHomework: React.FC<AssignHomeworkProps> = ({ student }) => {
  const [title, setTitle] = useState<string>('');
  const [driveLink, setDriveLink] = useState<string>('');

  const handleAssign = async () => {
    try {
      await axios.post('http://localhost:5000/api/staff/assign', {
        studentId: student._id,
        title,
        driveLink,
      });
      alert('Homework assigned successfully!');
      setTitle('');
      setDriveLink('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Failed to assign homework');
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Assign Homework to {student.name}
      </Typography>
      <TextField
        label="Homework Title"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Google Drive Link"
        fullWidth
        value={driveLink}
        onChange={(e) => setDriveLink(e.target.value)}
        margin="normal"
      />
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleAssign}>
          Assign Homework
        </Button>
      </Box>
    </Container>
  );
};

export default AssignHomework;

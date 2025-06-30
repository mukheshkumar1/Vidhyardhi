import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';

interface Student {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  className: string;
}

interface StudentListProps {
  selectedClass: string;
  onSelectStudent: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ selectedClass, onSelectStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    setLoading(true);

    fetch('https://vidhyardhi.onrender.com/api/staff/students')
      .then(res => res.json())
      .then(data => {
        // data is an object grouped by class, e.g. { "Nursery": [...], "Grade 1": [...] }
        if (data && typeof data === 'object' && data[selectedClass]) {
          setStudents(data[selectedClass]);
        } else {
          setStudents([]);
        }
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [selectedClass]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <Typography variant="h6" gutterBottom>
        Students in {selectedClass}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : students.length > 0 ? (
        <List>
          {students.map(student => (
            <Paper
              key={student._id}
              style={{ marginBottom: '10px', padding: '10px', cursor: 'pointer' }}
              onClick={() => onSelectStudent(student)}
            >
              <ListItem>
                <ListItemText
                  primary={student.fullName}
                  secondary={`${student.email} | ${student.phone}`}
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Typography>No students found.</Typography>
      )}
    </div>
  );
};

export default StudentList;

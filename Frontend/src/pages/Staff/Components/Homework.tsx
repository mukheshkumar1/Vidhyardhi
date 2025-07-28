import { useState } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
} from '@mui/material';
import { toast } from 'sonner';
import logoBackground from '../../../assets/images/logo.png';

const classes = [
  'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7',
];

const subjects = ['Telugu', 'Hindi', 'English', 'Maths', 'Science', 'Social Studies'];

export default function AssignHomeworkPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    className: '',
    subject: '',
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { title, description, deadline, className, subject } = formData;
    if (!title || !description || !deadline || !className || !subject) {
      toast.error('Please fill all required fields');
      return false;
    }

    const selectedDate = new Date(deadline);
    if (selectedDate < new Date()) {
      toast.error('Deadline must be a future date');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch('https://vidhyardhi.onrender.com/api/homework/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Homework assigned successfully!');
        setFormData({
          title: '',
          description: '',
          deadline: '',
          className: '',
          subject: '',
        });
        setPreviewOpen(false);
      } else {
        toast.error(data.message || 'Failed to assign homework');
      }
    } catch (err) {
      console.error('Submit Error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openPreview = () => {
    if (!validateForm()) return;
    setPreviewOpen(true);
  };

  return (
    <>
       <Paper
  sx={{
    position: "relative", // for absolute child
    p: 4,
    maxWidth: 700,
    width: "100%",
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    boxShadow: 6,
    borderRadius: 3,
    overflow: "hidden", // to prevent logo from overflowing
  }}
>
  {/* Logo Background Layer */}
  <Box
    component="div"
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundImage: `url(${logoBackground})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: "300px auto",
      opacity: 0.3,
      width: "100%",
      height: "100%",
      zIndex: 0,
    }}
  />
  
  {/* Content Layer */}
  <Box sx={{ position: "relative", zIndex: 1 }}>
    {/* Your content goes here */}
  </Box>
        <Typography variant="h5" gutterBottom color="purple" fontFamily={'cursive'}>
          Assign Homework
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          🕒 <strong>Note:</strong> All student submissions will be automatically deleted
          from the server after 7 days to save storage.
        </Alert>

        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          type="date"
          label="Deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          select
          fullWidth
          label="Class"
          name="className"
          value={formData.className}
          onChange={handleChange}
          margin="normal"
          required
        >
          {classes.map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          margin="normal"
          required
        >
          {subjects.map((subj) => (
            <MenuItem key={subj} value={subj}>
              {subj}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" onClick={openPreview}>
            Preview
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Assigning...' : 'Assign'}
          </Button>
        </Box>
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Preview Homework</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1"><strong>Title:</strong> {formData.title}</Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            <strong>Description:</strong><br /> {formData.description}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}><strong>Deadline:</strong> {formData.deadline}</Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}><strong>Class:</strong> {formData.className}</Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}><strong>Subject:</strong> {formData.subject}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Assigning...' : 'Confirm & Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

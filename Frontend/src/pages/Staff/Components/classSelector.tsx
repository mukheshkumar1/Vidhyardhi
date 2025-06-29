// src/components/ClassSelector.tsx
import React, { useEffect, useState } from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface ClassSelectorProps {
  onSelect: (selectedClass: string) => void;
}

const defaultClasses = [
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
];

const ClassSelector: React.FC<ClassSelectorProps> = ({ onSelect }) => {
  const [classList, setClassList] = useState<string[]>(defaultClasses);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:5000/api/staff/students')
      .then(res => res.json())
      .then(data => {
        const classNames = Object.keys(data);
        if (Array.isArray(classNames)) {
          setClassList(classNames);
        }
      })
      .catch(() => {
        // fallback to default classes if fetch fails
        setClassList(defaultClasses);
      });
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelected(value);
    onSelect(value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Select Class</InputLabel>
      <Select
        value={selected}
        onChange={handleChange}
        label="Select Class"
      >
        {classList.map((cls) => (
          <MenuItem key={cls} value={cls}>
            {cls}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ClassSelector;

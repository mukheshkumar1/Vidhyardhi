/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface FormData {
  fullName: string;
  className: string;
  email: string;
  phone: string;
  tuition: string;
  transport: string;
  kit: string;
}

export default function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    className: '',
    email: '',
    phone: '',
    tuition: '',
    transport: '',
    kit: '',
  });

  const classOptions = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const feeStructure: Record<string, number> = {};
    ['tuition', 'transport', 'kit'].forEach((key) => {
      const feeValue = formData[key as keyof FormData];
      if (feeValue) {
        feeStructure[key] = parseInt(feeValue);
      }
    });

    try {
      const res = await fetch('http://localhost:5000/api/admin/student/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          className: formData.className,
          email: formData.email,
          phone: formData.phone,
          feeStructure,
        }),
      });

      if (!res.ok) throw new Error('Failed to add student');

      toast.success('Student added successfully!');
      setFormData({
        fullName: '',
        className: '',
        email: '',
        phone: '',
        tuition: '',
        transport: '',
        kit: '',
      });
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-500 hover:bg-violet-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-900 text-white max-w-2xl  border box-shadow">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Add New Student</DialogTitle>
          <DialogDescription className="text-white">
            Enter student information and fees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <Label>Class</Label>
            <Select
              value={formData.className}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, className: value }))
              }
            >
              <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="bg-black border-zinc-700 text-white">
                {classOptions.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tuition">Tuition Fee</Label>
              <Input
                id="tuition"
                name="tuition"
                type="number"
                value={formData.tuition}
                onChange={handleChange}
                placeholder="Optional"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="transport">Transport Fee</Label>
              <Input
                id="transport"
                name="transport"
                type="number"
                value={formData.transport}
                onChange={handleChange}
                placeholder="Optional"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="kit">Kit Fee</Label>
              <Input
                id="kit"
                name="kit"
                type="number"
                value={formData.kit}
                onChange={handleChange}
                placeholder="Optional"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-violet-500 hover:bg-violet-600 text-white"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

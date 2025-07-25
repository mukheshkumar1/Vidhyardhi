import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarIcon } from "lucide-react";

interface FormData {
  fullName: string;
  className: string;
  email: string;
  phone: string;
  dob: Date | null;
  address: string;
  secondaryPhone: string;
  motherName: string;
  fatherName: string;
  aadharNumber: string;
  tuition: string;
  transport: string;
  kit: string;
}

const defaultFeeStructureByClass: Record<string, { tuition: number; transport: number; kit: number }> = {
  "Grade 1": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 2": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 3": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 4": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 5": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 6": { tuition: 75000, transport: 0, kit: 15000 },
  "Grade 7": { tuition: 75000, transport: 0, kit: 15000 },
};

export default function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    className: "",
    email: "",
    phone: "",
    dob: null,
    address: "",
    secondaryPhone: "",
    motherName: "",
    fatherName: "",
    aadharNumber: "",
    tuition: "",
    transport: "",
    kit: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "className") {
      const fees = defaultFeeStructureByClass[value];
      if (fees) {
        setFormData((prev) => ({
          ...prev,
          className: value,
          tuition: fees.tuition.toString(),
          transport: fees.transport.toString(),
          kit: fees.kit.toString(),
        }));
      } else {
        setFormData((prev) => ({ ...prev, className: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const feeStructure = {
      tuition: parseInt(formData.tuition) || 0,
      transport: parseInt(formData.transport) || 0,
      kit: parseInt(formData.kit) || 0,
    };

    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/admin/student/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          className: formData.className,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob ? format(formData.dob, "yyyy-MM-dd") : "",
          address: formData.address,
          secondaryPhone: formData.secondaryPhone,
          motherName: formData.motherName,
          fatherName: formData.fatherName,
          aadharNumber: formData.aadharNumber,
          feeStructure,
          transportOpted: Boolean(feeStructure.transport),
        }),
      });

      if (!res.ok) throw new Error("Failed to add student");

      toast.success("Student added successfully");

      setFormData({
        fullName: "",
        className: "",
        email: "",
        phone: "",
        dob: null,
        address: "",
        secondaryPhone: "",
        motherName: "",
        fatherName: "",
        aadharNumber: "",
        tuition: "",
        transport: "",
        kit: "",
      });

      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-800 text-white rounded-xl">Add Student</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-xl border border-white/50 bg-white/50 backdrop-blur-md shadow-lg p-4 max-h-[90vh] overflow-y-auto">
        <motion.h2
          className="text-xl font-semibold mb-2 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          📋 Add Student Details
        </motion.h2>

        <div className="grid grid-cols-2 gap-4 rounded-xl">
          <Input name="fullName" value={formData.fullName} onChange={handleChange}
          className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
           placeholder="Full Name" />

          <select
            name="className"
            value={formData.className}
            onChange={handleChange}
            className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
          >
            <option value="">Select Class</option>
            {Object.keys(defaultFeeStructureByClass).map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <Input name="email" value={formData.email} onChange={handleChange} 
          className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
          placeholder="Email" />
          <Input name="phone" value={formData.phone} onChange={handleChange}
          className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
           placeholder="Phone" />

          {/* DOB Calendar */}
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1 block">Date of Birth</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dob ? format(formData.dob, "PPP") : <span className="text-muted-foreground">Select DOB</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dob ?? undefined}
                  onSelect={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      dob: date ?? null,
                    }))
                  }
                  className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
                  captionLayout="dropdown"
                  fromYear={1980}
                  toYear={2030}
                  initialFocus

                />
              </PopoverContent>
            </Popover>
          </div>

          <Input name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} 
          className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
          placeholder="Aadhar Number" />
          <Input name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
           placeholder="Father's Name" />
          <Input name="motherName" value={formData.motherName} onChange={handleChange} className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
          placeholder="Mother's Name" />
          <Input name="secondaryPhone" value={formData.secondaryPhone} onChange={handleChange} className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
          placeholder="Secondary Phone" />
          <Input name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
           placeholder="Address" />

          {/* Fee Fields */}
          <Input name="tuition" value={formData.tuition} onChange={handleChange} className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
           placeholder="Tuition Fee" />
          <Input name="transport" value={formData.transport} onChange={handleChange}  className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
          placeholder="Transport Fee" />
          <Input name="kit" value={formData.kit} onChange={handleChange} className="w-full p-2 border rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-sm"
          placeholder="Kit Fee" />
        </div>

        <div className="flex justify-end mt-6">
  <Button
    onClick={handleSubmit}
    className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
    disabled={loading}
  >
    {loading ? "Submitting..." : "Submit"}
  </Button>
</div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import * as SwitchPrimitive from "@radix-ui/react-switch";
 // or 'react-hot-toast'

export default function AddStaffCard() {

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    gender: "male",
    teaching: false,
    subjects: "",
    salary: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic frontend validation
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.mobileNumber.trim() ||
      !formData.salary.trim() ||
      (formData.teaching && !formData.subjects.trim())
    ) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        subjects: formData.teaching
          ? formData.subjects.split(",").map(s => s.trim())
          : []
      };

      const res = await fetch("http://localhost:5000/api/admin/staff/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
         credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(data.message || "Staff added successfully");

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        mobileNumber: "",
        gender: "male",
        teaching: false,
        subjects: "",
        salary: ""
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-8 shadow-lg border-blue-200">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="text-blue-500" />
          <CardTitle className="text-blue-700 text-lg">Add New Staff</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label>Gender</Label>
            <RadioGroup
              defaultValue="male"
              className="flex space-x-4"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, gender: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="r1" />
                <Label htmlFor="r1">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="r2" />
                <Label htmlFor="r2">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
        <label
          htmlFor="teaching-switch"
          className="flex items-center space-x-2 cursor-pointer select-none"
        >
          <SwitchPrimitive.Root
            id="teaching-switch"
            checked={formData.teaching}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, teaching: checked }))
            }
            className="w-[42px] h-[25px] bg-gray-300 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <SwitchPrimitive.Thumb
              className="block w-[21px] h-[21px] bg-white rounded-full shadow-md transform data-[state=checked]:translate-x-[17px] transition-transform"
            />
          </SwitchPrimitive.Root>
          <span>Is Teaching Staff?</span>
        </label>
      </div>


          {formData.teaching && (
            <div>
              <Label>Subjects (comma separated)</Label>
              <Input
                name="subjects"
                value={formData.subjects}
                onChange={handleChange}
                placeholder="Math, Science"
              />
            </div>
          )}

          <div>
            <Label>Salary</Label>
            <Input
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              placeholder="40000"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Staff"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

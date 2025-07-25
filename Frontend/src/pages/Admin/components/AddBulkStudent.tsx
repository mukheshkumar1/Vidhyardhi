import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function AddBulkStudentsDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read & parse file for preview info
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;

      // Parse sheet to count rows and transform DOB if needed
      const binary = atob(result.split(",")[1]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const workbook = XLSX.read(bytes, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      if (jsonData.length === 0) {
        toast.error("Empty sheet. Please check your Excel file.");
        return;
      }

      // Format DOB to "12 Apr 2018" if present
      jsonData.forEach((row) => {
        if (row.dob) {
          try {
            const date = new Date(row.dob);
            if (!isNaN(date.getTime())) {
              const formatted = date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              row.dob = formatted; // Replace with formatted
            }
          } catch (err) {
            console.warn("Invalid DOB format:", row.dob);
          }
        }
      });

      setStudentCount(jsonData.length);
      setEstimatedTime(Math.ceil(jsonData.length * 0.5)); // ~0.5s per student

      // Convert cleaned data to new base64 file
      const newSheet = XLSX.utils.json_to_sheet(jsonData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");
      const newExcel = XLSX.write(newWorkbook, {
        bookType: "xlsx",
        type: "base64",
      });

      await submitBase64Excel(newExcel);
    };

    reader.readAsDataURL(file);
  };

  const submitBase64Excel = async (fileBase64: string) => {
    setLoading(true);
    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/admin/add-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileBase64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk upload failed");

      toast.success(`✅ ${data.results.length} students uploaded successfully.`);
      setOpen(false);
    } catch (error: any) {
      console.error("Bulk Upload Error:", error);
      toast.error(error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <UploadCloud className="mr-2 h-4 w-4" />
          Add Bulk Students
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-black bg-opacity-90 text-white max-w-xl backdrop-blur-xl border border-zinc-700">
        <DialogHeader>
          <DialogTitle>Add Bulk Students</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Upload an Excel file with columns:{" "}
            <span className="text-white font-medium">Full Name, Class, DOB, Email, Phone</span>.
            <br />
            <span className="text-sm text-green-300">DOBs like 12-04-2018 will be auto-formatted to 12 Apr 2018.</span>
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center mt-4 space-y-4">
          <Button
            onClick={triggerFileInput}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="animate-spin w-4 h-4" />
                Uploading...
              </span>
            ) : (
              "Choose Excel File"
            )}
          </Button>

          {studentCount > 0 && (
            <div className="text-sm text-zinc-300 text-center">
              📦 <strong>{studentCount}</strong> students to upload<br />
              ⏱️ Estimated time: <strong>{estimatedTime} sec</strong>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

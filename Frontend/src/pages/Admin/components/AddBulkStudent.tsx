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
  import { UploadCloud } from "lucide-react";
  import { useRef, useState } from "react";
  
  export default function AddBulkStudentsDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
  
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(",")[1]; // remove `data:...;base64,`
        await submitBase64Excel(base64String);
      };
      reader.readAsDataURL(file);
    };
  
    const submitBase64Excel = async (fileBase64: string) => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/admin/add-bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fileBase64 }),
        });
  
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Bulk upload failed");
  
        toast.success(`Successfully uploaded ${data.results.length} students`);
        setOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Bulk Upload Error:", error);
        toast.error(error.message || "Upload failed");
      } finally {
        setLoading(false);
      }
    };
  
    const triggerFileInput = () => {
      fileInputRef.current?.click();
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <UploadCloud className="mr-2 h-4 w-4" />
            Add Bulk Students
          </Button>
        </DialogTrigger>
  
        <DialogContent className="bg-black bg-opacity-80 text-white max-w-xl backdrop-blur-xl border border-zinc-700">
          <DialogHeader>
            <DialogTitle>Add Bulk Students</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Upload an Excel (.xlsx or .xls) file. Each row should contain Full Name, Class, Email, Phone.
            </DialogDescription>
          </DialogHeader>
  
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
  
          <div className="flex items-center justify-center mt-4">
            <Button
              onClick={triggerFileInput}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Choose Excel File"}
            </Button>
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
  
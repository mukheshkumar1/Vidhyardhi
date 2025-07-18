/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Award } from "lucide-react";
import { toast } from "sonner";

const classOptions = [
  "Grade 1", "Grade 2", "Grade 3",
  "Grade 4", "Grade 5", "Grade 6",
  "Grade 7"
];

const subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies"];

export default function ClassToppers() {
  const [selectedClass, setSelectedClass] = useState("");
  const [toppers, setToppers] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchToppers = async () => {
    if (!selectedClass) {
      toast.warning("Please select a class");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/admin/toppers/${selectedClass}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setToppers(data.toppers);
      } else {
        toast.error(data.error || "Failed to fetch toppers");
      }
    } catch (err) {
      toast.error("Error fetching toppers");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (examType: string) => {
    const data = toppers?.[examType] || [];
    return (
      <div className="overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Name</TableHead>
              {subjects.map((s) => (
                <TableHead key={s} className="text-center">{s}</TableHead>
              ))}
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">%</TableHead>
              <TableHead className="text-center">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-4">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((student: any, idx: number) => (
                <TableRow
                key={student._id}
                className="hover:bg-purple-600 hover:text-white transition-colors duration-200"
              >
              
                  <TableCell className="font-bold text-center">{idx + 1}</TableCell>
                  <TableCell>{student.fullName}</TableCell>
                  {subjects.map((s) => (
                    <TableCell key={s} className="text-center">
                      {student.marks?.[s] ?? "-"}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-medium">{student.total}</TableCell>
                  <TableCell className="text-center">{student.percentage}%</TableCell>
                  <TableCell className="text-center text-teal-700 font-semibold">
                    {student.grade}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <Card className="backdrop-blur-md bg-white/30 border border-white/20 shadow-2xl rounded-xl">

        <CardHeader>
          <CardTitle className="text-blue-600 flex justify-center items-center gap-2 text-xl ">
            <Award className="w-6 h-6" />
            Class Toppers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black shadow-md border border-gray-200">
  {classOptions.map((cls) => (
    <SelectItem key={cls} value={cls} className="hover:bg-teal-50">
      {cls}
    </SelectItem>
  ))}
</SelectContent>

            </Select>

            <button
              onClick={fetchToppers}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Loading..." : "Load Toppers"}
            </button>
          </div>

          {Object.keys(toppers).length > 0 && (
            <Tabs defaultValue="quarterly" className="w-full mt-4">
           <TabsList className="bg-muted p-1 rounded-lg gap-2">
  <TabsTrigger
    value="quarterly"
    className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-4 py-2 rounded-md"
  >
    Quarterly
  </TabsTrigger>
  <TabsTrigger
    value="halfYearly"
    className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-4 py-2 rounded-md"
  >
    Half-Yearly
  </TabsTrigger>
  <TabsTrigger
    value="annual"
    className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-4 py-2 rounded-md"
  >
    Annual
  </TabsTrigger>
</TabsList>

              <TabsContent value="quarterly" className="mt-4">
                {renderTable("quarterly")}
              </TabsContent>
              <TabsContent value="halfYearly" className="mt-4">
                {renderTable("halfYearly")}
              </TabsContent>
              <TabsContent value="annual" className="mt-4">
                {renderTable("annual")}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

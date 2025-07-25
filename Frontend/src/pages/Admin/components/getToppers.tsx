/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Award } from "lucide-react";
import { toast } from "sonner";

const classOptions = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7",
];

const subjects = [
  "Telugu",
  "Hindi",
  "English",
  "Maths",
  "Science",
  "Social Studies",
  "computer",
];

const assessments = [
  "formativeAssessment1",
  "formativeAssessment2",
  "formativeAssessment3",
  "formativeAssessment4",
  "summativeAssessment1",
  "summativeAssessment2",
];

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
      const res = await fetch(
        `https://vidhyardhi.onrender.com/api/admin/toppers/${selectedClass}`,
        {
          credentials: "include",
        }
      );
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
      <div className="overflow-x-auto rounded-xl border">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Rank</TableHead>
              <TableHead>Name</TableHead>
              {subjects.map((s) => (
                <TableHead key={s} className="text-center">
                  {s}
                </TableHead>
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
                  className="hover:bg-purple-600 hover:text-white transition"
                >
                  <TableCell className="text-center font-bold">{idx + 1}</TableCell>
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
      <Card className="bg-white/30 backdrop-blur-md border border-white/20 shadow-2xl rounded-xl">
        <CardHeader>
        <CardTitle className="flex flex-col items-center gap-1">
    <div className="flex items-center gap-2">
      <Award className="w-7 h-7 text-yellow-400 animate-pulse drop-shadow-md" />
      <span className="bg-gradient-to-r from-orange-700 via-orange-500 to-orange-700 bg-clip-text text-transparent font-extrabold text-3xl tracking-wide drop-shadow-xl">
        Class Toppers
      </span>
    </div>
    <p className="text-sm text-gray-200 font-medium mt-1 tracking-wide">
      Celebrating the best performers of the class!
    </p>
  </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
  <SelectTrigger className="w-[220px] bg-white text-black border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200">
    {/* Removed className from SelectValue — it causes placeholder to break */}
    <SelectValue placeholder="🎓 Select Class" />
  </SelectTrigger>

  <SelectContent className="bg-white border border-gray-300 rounded-xl shadow-lg">
    {classOptions.map((cls) => (
      <SelectItem
        key={cls}
        value={cls}
        className="cursor-pointer px-4 py-2 hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700 rounded-md transition-all duration-150"
      >
        {cls}
      </SelectItem>
    ))}
  </SelectContent>
</Select>



            <button
              onClick={fetchToppers}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Loading..." : "Load Toppers"}
            </button>
          </div>

          {Object.keys(toppers).length > 0 && (
            <Tabs defaultValue="formativeAssessment1" className="w-full mt-6">
              <div className="overflow-x-auto no-scrollbar">
                <TabsList className="w-max bg-muted rounded-lg gap-2 p-1">
                  {assessments.map((a) => (
                    <TabsTrigger
                      key={a}
                      value={a}
                      className="whitespace-nowrap px-4 py-2 rounded-md data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      {a.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {assessments.map((a) => (
                <TabsContent key={a} value={a} className="mt-4">
                  {renderTable(a)}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

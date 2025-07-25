import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trophy } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Activity {
  activityName: string;
  scored: number;
  outOf: number;
}

interface StudentPerformance {
  _id: string;
  fullName: string;
  className: string;
  totalScored: number;
  totalOutOf: number;
  percentage: string;
  extraCurricular: Activity[];
}

const classList = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];

export default function AdminExtraCurricularPerformance() {
  const [selectedClass, setSelectedClass] = useState("Grade 1");
  const [data, setData] = useState<StudentPerformance[]>([]);
  const [filteredData, setFilteredData] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("extracurricular");
  const [selectedActivity, setSelectedActivity] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const encoded = encodeURIComponent(selectedClass);
      const res = await fetch(`https://vidhyardhi.onrender.com/api/admin/extraactivities/${encoded}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch");
      setData(json.students);
      setFilteredData(json.students);
    } catch (error) {
      toast.error("Failed to load student activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedActivity("");
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedActivity) {
      setFilteredData(data);
    } else {
      const filtered = data
        .map((student) => {
          const matchedActivities = student.extraCurricular.filter(
            (act) => act.activityName === selectedActivity
          );
          if (matchedActivities.length === 0) return null;

          const totalScored = matchedActivities.reduce((a, b) => a + b.scored, 0);
          const totalOutOf = matchedActivities.reduce((a, b) => a + b.outOf, 0);
          const percentage = totalOutOf ? ((totalScored / totalOutOf) * 100).toFixed(2) : "0";

          return {
            ...student,
            totalScored,
            totalOutOf,
            percentage,
            extraCurricular: matchedActivities,
          };
        })
        .filter(Boolean) as StudentPerformance[];

      setFilteredData(filtered);
    }
  }, [selectedActivity, data]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Extra-Curricular Performance – ${selectedClass}`, 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [["Name", "Total Scored", "Out Of", "Percentage", "Activities"]],
      body: filteredData.map((student) => [
        student.fullName,
        student.totalScored,
        student.totalOutOf,
        `${student.percentage}%`,
        student.extraCurricular.map((a) => `${a.activityName} (${a.scored}/${a.outOf})`).join(", "),
      ]),
    });
    doc.save(`ExtraCurricular_${selectedClass}.pdf`);
  };

  const allActivityNames = Array.from(
    new Set(data.flatMap((student) => student.extraCurricular.map((act) => act.activityName)))
  );

  return (
    <div className="p-6 rounded-xl backdrop-blur-md bg-white/30 border border-white/40 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2">
          <Trophy size={24} /> Extra-Curricular Performance
        </h2>
        <Button onClick={downloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Download size={18} className="mr-2" /> Download PDF
        </Button>
      </div>

      <div className="flex gap-4 mb-4 text-black">
        <select
          className="border px-3 py-2 rounded text-sm"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {classList.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded text-sm"
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
        >
          <option value="">All Activities</option>
          {allActivityNames.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>

        <Button
          onClick={() => setActiveTab("extracurricular")}
          className={`px-4 ${activeTab === "extracurricular" ? "bg-green-600 text-white" : ""}`}
        >
          Extra Curricular
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredData.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-green-100 text-green-800 font-semibold">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Out Of</th>
                <th className="px-4 py-2 border">Percentage</th>
                <th className="px-4 py-2 border">Activities</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((student, idx) => (
                <tr key={student._id} className="hover:bg-purple-900">
                  <td className="px-4 py-2 border text-center">{idx + 1}</td>
                  <td className="px-4 py-2 border">{student.fullName}</td>
                  <td className="px-4 py-2 border text-center">{student.totalScored}</td>
                  <td className="px-4 py-2 border text-center">{student.totalOutOf}</td>
                  <td className="px-4 py-2 border text-center">{student.percentage}%</td>
                  <td className="px-4 py-2 border">
                    <ul className="list-disc ml-5">
                      {student.extraCurricular.map((act, index) => (
                        <li key={index}>
                          {act.activityName}: {act.scored}/{act.outOf}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

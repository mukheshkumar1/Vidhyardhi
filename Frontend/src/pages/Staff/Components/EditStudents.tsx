import React from "react";
import PerformanceUpdateForm from "../Components/PerformanceUpdate";
import AttendanceManager from "../Components/AttendanceUpdate"; // ✅ Imported new manager
import StudentsByClassList from "../Components/studentsByClass";

type Props = {
  canEditStudents: boolean;
};

const EditStudents: React.FC<Props> = ({ canEditStudents }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Student Data</h1>

      {canEditStudents ? (
        <>
          {/* ✅ Integrated AttendanceManager */}
          <div className="p-4 bg-green-50 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Attendance Management</h2>
            <AttendanceManager />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Update Performance</h2>
            <PerformanceUpdateForm studentId="sample-student-id" />
          </div>

          <div className="p-4 bg-white border rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">View Students by Class</h2>
            <StudentsByClassList />
          </div>
        </>
      ) : (
        <div className="p-4 bg-yellow-100 rounded shadow text-red-600 font-medium">
          You do not have permission to edit student data.
        </div>
      )}
    </div>
  );
};

export default EditStudents;

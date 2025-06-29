// import React, { useEffect, useState } from "react";
// import ToggleEditPermissionButton from "../../Admin/components/togglePermissions";
// import EditStudents from "../Components/EditStudents"; // New component

// const StaffWrapper: React.FC = () => {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const [staff, setStaff] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchStaffData = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/staff/profile/staff", {
//         credentials: "include",
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "Failed to fetch staff");

//       setStaff(data);
//     } catch (err) {
//       console.error("Error fetching staff data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStaffData();
//   }, []);

//   const handlePermissionChange = (newPermission: boolean) => {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     setStaff((prev: any) => ({
//       ...prev,
//       canEditStudents: newPermission,
//     }));
//   };

//   if (loading) return <p className="p-4">Loading staff info...</p>;
//   if (!staff) return <p className="p-4 text-red-600">Failed to load staff info.</p>;

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 p-4">
//       <ToggleEditPermissionButton
//         staffId={staff._id}
//         initialPermission={staff.canEditStudents}
//         onPermissionChange={handlePermissionChange}
//       />

//       <EditStudents canEditStudents={staff.canEditStudents} />
//     </div>
//   );
// };

// export default StaffWrapper;

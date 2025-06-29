// // EditStudentDialog.tsx
// import Dialog from "@mui/material/Dialog";
// import DialogContent from "@mui/material/DialogContent";
// import IconButton from "@mui/material/IconButton";
// import CloseIcon from "@mui/icons-material/Close";
// import { Student } from "./StudentsByClass"; // If you have exported the interface
// import EditStudentProfile from "./EditStudentProfile";
// import { FC } from "react";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   student: Student | null;
//   onUpdate: () => void;
// }

// const EditStudentDialog: FC<Props> = ({ open, onClose, student, onUpdate }) => {
//   if (!student) return null;

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       scroll="paper"
//       fullWidth
//       maxWidth="sm"
//       PaperProps={{ sx: { maxHeight: "90vh" } }}
//     >
//       <IconButton
//         onClick={onClose}
//         sx={{
//           position: "absolute",
//           right: 8,
//           top: 8,
//           zIndex: 10,
//           color: (theme) => theme.palette.grey[500],
//         }}
//       >
//         <CloseIcon />
//       </IconButton>

//       <DialogContent dividers>
//         <EditStudentProfile
//           studentId={student._id}
//           fullName={student.fullName}
//           feeStructure={student.feeStructure}
//           onUpdateSuccess={onUpdate}
//         />
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EditStudentDialog;

import { Route, Routes } from "react-router-dom"
import Homepage from "./pages/Homepage/Homepage"
import { Toaster } from "sonner";
import LoginInfoPage from "./pages/Login/LoginPage"
import AdminLogin from "./pages/Login/logins/AdminLogin"
import StaffLogin from "./pages/Login/logins/StaffLogin"
import AdminPage from "./pages/Admin/adminPage"

import {  useAuthContext } from "./context/authContext"
import StudentInfo from "./pages/Admin/components/StudentInfo"
import AboutSchool from "./pages/Homepage/otherpages/AboutSchool"
import AboutStaff from "./pages/Homepage/otherpages/AboutStaff"
import AboutAcademics from "./pages/Homepage/otherpages/AboutAcademics"
import StaffPage from "./pages/Staff/StaffPage";
import StudentPage from "./pages/Student/StudentPage";
import StudentLogin from "./pages/Login/logins/ParentLogin";
import ForgotPassword from "./pages/Login/logins/components/forgotPassword";
import ResetPassword from "./pages/Login/logins/components/resetPassword";
import StudentForgotPassword from "./pages/Login/logins/components/studentForgotPassword";
import StudentResetPassword from "./pages/Login/logins/components/studentResetPssword";






function App() {

const {authUser} = useAuthContext();
  return (
    <>
    <Routes>
     <Route path="/" element={<Homepage/>} />
     <Route path="/school" element={<AboutSchool/>} />
     <Route path="/staff" element={<AboutStaff/>} />
     <Route path="/academics" element={<AboutAcademics/>} />
     <Route path="/login-info" element={<LoginInfoPage/>} />
     <Route path="/login/admin" element={<AdminLogin/>} />
     <Route path="/admin/dashboard" element={authUser?.role === "admin" ? <AdminPage/> :<Homepage/>} />
     <Route path="/admin/studentinfo" element={authUser?.role === "admin" ? <StudentInfo/> :<LoginInfoPage/>}/>
     <Route path="/login/staff" element={<StaffLogin/>} />
     <Route path="/forgotpassword" element={<ForgotPassword />} />
    <Route path="/resetpassword" element={<ResetPassword />} />
     <Route path="/login/student" element={<StudentLogin/>} />
     <Route path="/forgotpasswordstudent" element={<StudentForgotPassword />} />
     <Route path="/resetpasswordstudent" element={<StudentResetPassword />} />
     <Route path="/staff/dashboard" element={authUser?.role === "staff" ? <StaffPage/> :<Homepage/>}/>
     <Route path="/student/dashboard" element={authUser?.role === "student" ? <StudentPage/> :<Homepage/>}/>
     </Routes>
     <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          className:
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700 animate-slideIn",
        }}
      />
    </>
  )
}

export default App

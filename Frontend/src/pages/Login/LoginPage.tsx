import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Users, GraduationCap } from "lucide-react";

const roles = [
  {
    role: "Admin",
    path: "/login/admin",
    icon: <UserCog className="h-10 w-10 text-[#f09c13]" />,
    description: "Login as Administrator",
  },
  {
    role: "Staff",
    path: "/login/staff",
    icon: <Users className="h-10 w-10 text-[#80cb2e]" />,
    description: "Login as Staff Member",
  },
  {
    role: "Student",
    path: "/login/student",
    icon: <GraduationCap className="h-10 w-10 text-[#f09c13]" />,
    description: "Login as Student",
  },
];

const LoginInfoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-[#0e103d] via-[#737373] to-[#80cb2e] min-h-screen px-4 py-16 text-center text-white">
      <motion.h1
        className="text-4xl font-extrabold mb-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Login As
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {roles.map(({ role, path, icon, description }, index) => (
          <motion.div
            key={role}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card
              onClick={() => navigate(path)}
              className="cursor-pointer backdrop-blur-md bg-white/10 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="flex flex-col items-center gap-4 py-8">
                {icon}
                <CardTitle className="text-2xl font-semibold text-white">{role}</CardTitle>
                <p className="text-sm text-gray-200">{description}</p>
                <Button
                  variant="outline"
                  className="mt-4 border-white text-white hover:bg-white/10"
                >
                  Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LoginInfoPage;

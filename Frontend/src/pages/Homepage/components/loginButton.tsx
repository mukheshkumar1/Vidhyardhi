import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const LoginButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login-info");  // redirect to login info page
  };

  return (
    <Button
    onClick={handleClick}
    variant="default"
    className="bg-gradient-to-r from-[#69306d] to-[#a4508b] text-white hover:from-[#a4508b] hover:to-[#69306d] px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
  >
    <LogIn className="w-5 h-5 mr-2" />
    Login
  </Button>
  );
};

export default LoginButton;

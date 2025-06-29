import { Button } from "@/components/ui/button";
import useLogout from "@/hooks/useLogout"; // adjust path as needed

const LogoutButton = () => {
  const { loading, logout } = useLogout();

  return (
    <Button
      onClick={logout}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutButton;

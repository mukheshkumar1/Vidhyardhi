import { useEffect } from "react";
import useLogout from "@/hooks/useLogout";

const AUTO_LOGOUT_TIME =  30 * 30 * 1000; // 30 minutes in milliseconds

const useAutoLogout = () => {
  const { logout } = useLogout();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout();
      }, AUTO_LOGOUT_TIME);
    };

    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    // Start the initial timer
    resetTimer();

    return () => {
      clearTimeout(timeout);
      activityEvents.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [logout]);
};

export default useAutoLogout;

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthRedirect() {
  const navigate = useNavigate();

  const redirectByRole = useCallback((user) => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  return { redirectByRole };
}

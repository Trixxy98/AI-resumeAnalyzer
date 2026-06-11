import { useCallback } from "react";
import { useAuth } from "~/lib/auth-context";
import { useSessionTimeout } from "~/hooks/useSessionTimeout";

const DEFAULT_TIMEOUT_MINUTES = 30;

const getTimeoutMs = () => {
  const configuredMinutes = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES);
  if (Number.isFinite(configuredMinutes) && configuredMinutes > 0) {
    return configuredMinutes * 60 * 1000;
  }
  return DEFAULT_TIMEOUT_MINUTES * 60 * 1000;
};

const SessionTimeoutManager = () => {
  const { user, isLoading, logout } = useAuth();

  const handleTimeout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Auto signout failed:", error);
    }
  }, [logout]);

  useSessionTimeout({
    enabled: !!user && !isLoading,
    timeoutMs: getTimeoutMs(),
    onTimeout: handleTimeout,
  });

  return null;
};

export default SessionTimeoutManager;

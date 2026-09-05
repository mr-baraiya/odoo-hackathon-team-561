import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Sync active token with backend profile on mount
    const verifySession = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          setIsLoading(true);
          const profileRes = await authService.getMe();
          const userData = profileRes?.user || profileRes;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
          console.warn("Session verification failed, logging out:", err);
          logout();
        } finally {
          setIsLoading(false);
        }
      }
    };
    verifySession();
  }, []);

  const loginUser = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;

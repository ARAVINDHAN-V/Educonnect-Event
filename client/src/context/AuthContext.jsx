import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const storedToken = localStorage.getItem("userToken");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error parsing stored user data:", err);
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    if (!userData || !userData.token || !userData.user) {
      console.error("Invalid user data received during login.");
      return;
    }

    const { token: userToken, user: userDetails } = userData;

    const userObject = {
      id: userDetails._id,  // Ensure it matches backend response
      name: userDetails.name,
      email: userDetails.email,
      department: userDetails.department || "Not specified",
      role: userDetails.role || "User",
    };

    setUser(userObject);
    setToken(userToken);
    setIsAuthenticated(true);

    localStorage.setItem("userData", JSON.stringify(userObject));
    localStorage.setItem("userToken", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

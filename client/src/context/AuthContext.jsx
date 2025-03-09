import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const storedToken = localStorage.getItem("userToken"); // Changed from 'token'

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    console.log("Login Data:", userData);
    
    const userToken = userData.token;
    const userDetails = userData.user;
    
    if (!userToken) {
      console.error("No valid token found");
      return;
    }
  
    const userObject = {
      id: userDetails.id,
      name: userDetails.name,
      email: userDetails.email,
      department: userDetails.department,
      role: userDetails.role
    };
    
    setUser(userObject);
    setIsAuthenticated(true);
    setToken(userToken);
  
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
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout, 
      token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
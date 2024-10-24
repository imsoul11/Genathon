import React from 'react';
import ThemeToggle from './Themetoggle'; // Adjust the path as needed
import { Button } from "@/components/ui/button"; // Adjust the path as needed
import { useAuth } from "@/context/AuthContext"; // Assuming you have an Auth context
import { useNavigate } from "react-router-dom"; // For navigation

const Navbar = ({component}) => {
  const { logout } = useAuth(); // Get the logout function from the Auth context
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleLogout = async () => {
    try {
      await logout(); // Assuming logout is an async function
      navigate('/login'); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
      {component}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </nav>
  );
};

export default Navbar;

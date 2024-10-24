import React from 'react';
import ThemeToggle from './Themetoggle'; // Adjust the path as needed
import { Button } from "@/components/ui/button"; // Adjust the path as needed
import { useAuth } from "@/context/AuthContext"; // Assuming you have an Auth context
import { useNavigate } from "react-router-dom"; // For navigation

// Utility function to download CSV
const downloadCSV = (data, filename) => {
  const csvContent = data.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to generate random CSV data with your specific fields
const generateRandomCSVData = () => {
  const headers = [
    "Call ID",
    "Employee ID",
    "Customer Phone",
    "Department",
    "Region",
    "Status",
    "Timestamp",
    "Call Recording",
    "Duration"
  ];

  const departments = ["Sales", "Support", "IT", "HR"];
  const regions = ["North", "South", "East", "West"];
  const statuses = ["Completed", "In Progress", "Missed"];
  
  const rows = Array.from({ length: 10 }, (_, index) => [
    `CID${index + 1}`, // Call ID
    `EID${index + 100}`, // Employee ID
    `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Customer Phone (random 10-digit number)
    departments[Math.floor(Math.random() * departments.length)], // Department
    regions[Math.floor(Math.random() * regions.length)], // Region
    statuses[Math.floor(Math.random() * statuses.length)], // Status
    new Date(Date.now() - Math.random() * 10000000000).toISOString(), // Random Timestamp
    `https://example.com/call-recording/${index + 1}`, // Call Recording URL
    `${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` // Random Duration (in minutes:seconds format)
  ]);

  return [headers, ...rows];
};

const Navbar = ({ component, pageData }) => {
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

  const handleDownloadCSV = () => {
    const csvData = generateRandomCSVData(); // Generate specific CSV data
    const filename = `calls-data.csv`;
    downloadCSV(csvData, filename); // Trigger CSV download
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
      {component}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-4">
        <Button onClick={handleDownloadCSV}>Download CSV</Button> {/* Download CSV Button */}
      </div>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { fetchCallRecords } from "../firebaseapi.js"; // Import the function from firebaseapi.js
import {BarChartCom } from "@/components/barChart.jsx";

export function CallLogs() {
  const { isAuthenticated, loading, user } = useAuth(); // Now includes user with role and eid
 
  const [callLogs, setCallLogs] = useState([]); // State to store fetched call logs
  const [selectedEid, setSelectedEid] = useState("E");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [error, setError] = useState(null); // State to handle errors
  const [isLoading, setIsLoading] = useState(true); // State for loading indicator

  
  // Fetch call logs when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchCallRecords();
        if (data) {
          setCallLogs(data); // Set the data in state
        }
      } catch (error) {
        setError("Failed to fetch call logs. Please try again later.");
        console.error("Error fetching call records:", error);
      } finally {
        setIsLoading(false); // Turn off loading state
      }
    }
    fetchData();
  }, []);

  function formatDate(timestamp) {
    const date = new Date(timestamp); // Convert timestamp to Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed
    return `${year}-${month}-${day}`; // Return in YYYY/MM/DD format
  }

  // Filter the call logs based on user role, date, region, status, and department
  const filteredLogs = callLogs.filter((log) => {
    const logDate = formatDate(log.timestamp);
    const matchesDate = selectedDate ? logDate === selectedDate : true;
    const matchesRegion = selectedRegion === "All" ? true : log.region === selectedRegion;
    const matchesStatus = selectedStatus === "All" ? true : log.status === selectedStatus;
    const matchesDepartment = selectedDepartment === "All" ? true : log.department === selectedDepartment;

    // Employee can only see their own call logs, filtered by date, region, and status
    if (user.role === "employee") {
      return log.eid === user.eid && matchesDate && matchesRegion && matchesStatus;
    }

    // Manager or admin can see all logs, filtered by eid, date, region, status, and department
    const matchesEid = selectedEid === "E" ? true : log.eid === selectedEid;
    return matchesEid && matchesDate && matchesRegion && matchesStatus && matchesDepartment;
  });

  // Get unique EIDs, Regions, Statuses, and Departments for the dropdowns (only for manager or admin roles)
  const uniqueEids = [...new Set(callLogs.map((log) => log.eid))];
  const uniqueRegions = [...new Set(callLogs.map((log) => log.region))];
  const uniqueStatuses = [...new Set(callLogs.map((log) => log.status))];
  const uniqueDepartments = [...new Set(callLogs.map((log) => log.department))];

  
  if (isLoading) {
    return <div>Loading...</div>; // Loading indicator
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (error) {
    return <div>{error}</div>; // Display error message if any
  }

  return (
    <div>
      <div className="flex">
      {/* Filter Section (only visible to managers/admins) */}
      <div className="filter-section m-5 w-[500px] flex items-center justify-center flex-wrap gap-3">
        {/* Employee Picker - only visible to managers/admins */}
        {user.role !== "employee" && (
          <Select onValueChange={setSelectedEid} className=''>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Employee ID" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="E">All Employees</SelectItem>
              {uniqueEids.map((eid) => (
                <SelectItem key={eid} value={eid}>
                  {eid} {/* Display the unique employee ID */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date Picker - visible to both employee and manager/admin */}
        <Input
          type="date"
          className="w-[200px]"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="Select Date"
        />

        {/* Region Picker */}
        <Select onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Regions</SelectItem>
            {uniqueRegions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Picker */}
        <Select onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Department Picker - only for managers/admins */}
        {user.role !== "employee" && (
          <Select onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              {uniqueDepartments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="filter-section m-5 w-[500px] flex items-center justify-center flex-wrap gap-3">

        <BarChartCom chartData={filteredLogs}/>
      </div>
      </div>


      {/* Table Section */}
      <Table>
        <TableCaption>A list of recent call logs with audio recordings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px] text-center bg-gray-100">Call ID</TableHead>
            <TableHead className="w-[150px] text-center bg-gray-100">Employee ID</TableHead>
            <TableHead className="w-[150px] text-center bg-gray-100">Customer Phone</TableHead>
            <TableHead className="w-[150px] text-center bg-gray-100">Department</TableHead>
            <TableHead className="w-[150px] text-center bg-gray-100">Region</TableHead>
            <TableHead className="w-[150px] text-center bg-gray-100">Status</TableHead>
            <TableHead className="w-[150px] text-center bg-gray-100">Timestamp</TableHead>
            <TableHead className="text-center w-[150px] bg-gray-100">Call Recording</TableHead>
            <TableHead className="w-[150px] text-center bg-gray-100">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log, index) => (
            <TableRow key={index}>
              <TableCell className="text-center">{log.cid}</TableCell>
              <TableCell className="text-center">{log.eid}</TableCell>
              <TableCell className="font-medium text-center">{log.customer_phone}</TableCell>
              <TableCell className="font-medium text-center">{log.department}</TableCell>
              <TableCell className="font-medium text-center">{log.region}</TableCell>
              <TableCell className="text-center">{log.status}</TableCell>
              <TableCell className="text-center">{formatDate(log.timestamp)}</TableCell>
              <TableCell className="text-center">
                <audio controls className="text-center w-[250px]">
                  <source src={log.recording} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </TableCell>
              <TableCell className="text-center">{log.duration}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

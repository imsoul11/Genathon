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

export function CallLogs() {
  const { isAuthenticated, loading, user } = useAuth(); // Now includes user with role and eid
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const [callLogs, setCallLogs] = useState([]); // State to store fetched call logs
  const [selectedEid, setSelectedEid] = useState("E");
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState(null); // State to handle errors
  const [isLoading, setIsLoading] = useState(true); // State for loading indicator

  // Fetch call logs when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchCallRecords();
        if(data) {
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
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
    return `${year}-${month}-${day}`; // Return in YYYY/MM/DD format
  }

  // Filter the call logs based on user role
  const filteredLogs = callLogs.filter((log) => {
    const logDate = formatDate(log.timestamp);
    const matchesDate = selectedDate ? logDate === selectedDate : true;

    // Employee can only see their own call logs, and filtered by date
    if (user.role === 'employee') {
      return log.eid === user.eid && matchesDate;
    }

    // Manager or admin can see all logs, filtered by eid and date
    const matchesEid = selectedEid === 'E' ? true : log.eid === selectedEid;
    return matchesEid && matchesDate;
  });

  // Get unique EIDs for the dropdown (only for manager or admin roles)
  const uniqueEids = [...new Set(callLogs.map(log => log.eid))];

  if (isLoading) {
    return <div>Loading...</div>; // Loading indicator
  }

  if (error) {
    return <div>{error}</div>; // Display error message if any
  }

  return (
    <div>
      {/* Filter Section (only visible to managers/admins) */}
    
<div className="filter-section mb-8 flex gap-4">
  {/* Employee Picker - only visible to managers/admins */}
  {user.role !== 'employee' && (
    <Select onValueChange={setSelectedEid}>
      <SelectTrigger className="w-[200px] ml-5">
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
</div>


      {/* Table Section */}
      <Table>
        <TableCaption>A list of recent call logs with audio recordings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Call ID</TableHead>
            <TableHead className="text-center">Employee ID</TableHead>
            <TableHead className="w-[150px] text-center">Phone No.</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Timestamp</TableHead>
            <TableHead className="text-center w-[150px]">Call Recording</TableHead>
            <TableHead className="text-center">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log, index) => (
            <TableRow key={index}>
              <TableCell className="text-center">{log.cid}</TableCell>
              <TableCell className="text-center">{log.eid}</TableCell>
              <TableCell className="font-medium text-center">{log.phone}</TableCell>
              <TableCell className="text-center">{log.status}</TableCell>
              <TableCell className="text-center">{formatDate(log.timestamp)}</TableCell>
              <TableCell className="text-center">
                <audio controls className="text-center">
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

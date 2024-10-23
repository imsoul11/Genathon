import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "../components/ui/progress";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import BarChartComponent from "@/components/BarChartComponent"; // Placeholder for chart component
import { useAuth } from "../context/AuthContext"; // Import Auth context
import { Navigate } from "react-router-dom";
import { pushDummyData } from "@/firebaseapi";

// Dummy AI data for employees
const AIdata = [
  {
    eid: "EMP001",
    name: "John Doe",
    remarks: "Great job handling customer queries!",
    satisfaction_score: 85,
    sentiment_analysis: "positive",
    call_summary: "Handled the customer well, resolved the issue efficiently.",
    call_text: "The customer had a billing issue that was quickly resolved.",
    score_history: [80, 85, 90, 82, 88],
  },
  {
    eid: "EMP002",
    name: "Jane Smith",
    remarks: "Needs improvement in communication.",
    satisfaction_score: 60,
    sentiment_analysis: "neutral",
    call_summary: "The employee couldn't resolve the issue quickly.",
    call_text: "Customer waited long for a response, wasn't satisfied.",
    score_history: [60, 62, 65, 63, 60],
  },
  // Add more employee data here
];

const sentimentVariants = {
  positive: "secondary",
  negative: "destructive",
  neutral: "default",
};

const Dashboard = () => {
  const { user, logout, isAuthenticated, isLoading, loading } = useAuth(); // Use Auth context
  const [selectedEmployee, setSelectedEmployee] = useState(AIdata[0]);
  // useEffect(()=>{
  //   console.log('Hello i am begin called')
  //     pushDummyData()
  // },[])
  useEffect(() => {
    if (isLoading) {
      // Optionally handle loading state
      return <div>Loading...</div>;
    }
  }, [isLoading]);

  if (!isAuthenticated) {
    // Redirect to login or display message
    return <Navigate to="/login" replace />; // Use replace to prevent going back to this page
  }

  // Function to handle employee selection
  const handleEmployeeSelect = (eid) => {
    const employee = AIdata.find((emp) => emp.eid === eid);
    setSelectedEmployee(employee);
  };

  return (
    <div className="dashboard-container p-6">
      {/* User Profile Section */}
      <div className="user-profile flex items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold">{user.eid}</h2>
          <p className="text-sm text-gray-600">{user.role}</p>
          {user.role==='employee' && <p className="text-sm text-gray-600">{user.phone}</p>}
        </div>
        <Button onClick={logout} className="ml-auto">Log Out</Button>
      </div>

      {/* Employee Selection */}
      <div className="employee-section mb-8">
        <Select onValueChange={handleEmployeeSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an employee" />
          </SelectTrigger>
          <SelectContent>
            {AIdata.map((employee) => (
              <SelectItem key={employee.eid} value={employee.eid}>
                {employee.eid}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Performance Metrics */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>{selectedEmployee.name} (Employee ID: {selectedEmployee.eid})</CardTitle>
          <p>{selectedEmployee.remarks}</p>
        </CardHeader>
        <CardContent>
          {/* Satisfaction Score */}
          <div className="flex justify-between items-center mb-4">
            <p className="font-medium">Satisfaction Score:</p>
            <Progress value={selectedEmployee.satisfaction_score} className="w-3/4 ml-4" />
            <span>{selectedEmployee.satisfaction_score}%</span>
          </div>

          {/* Sentiment Badge */}
          <div className="mb-4">
            <p className="font-medium">Sentiment Analysis:</p>
            <Badge variant={sentimentVariants[selectedEmployee.sentiment_analysis]}>
              {selectedEmployee.sentiment_analysis}
            </Badge>
          </div>

          {/* Call Summary and Call Text */}
          <Accordion type="single" collapsible>
            <AccordionItem value="summary">
              <AccordionTrigger>Call Summary</AccordionTrigger>
              <AccordionContent>{selectedEmployee.call_summary}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="call_text">
              <AccordionTrigger>Call Text</AccordionTrigger>
              <AccordionContent>{selectedEmployee.call_text}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Satisfaction Score Chart */}
      <div className="chart-section">
        <BarChartComponent data={selectedEmployee.score_history} />
      </div>
    </div>
  );
};

export default Dashboard;
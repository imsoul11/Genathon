import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "../context/AuthContext"; // Import Auth context
import { Navigate } from "react-router-dom";
import { fetchUsers, updateUserRole, deleteUser, addUser } from "../firebaseapi"; // Import Firebase functions

const UserManagement = () => {
  const { user, logout, isAuthenticated } = useAuth(); // Use Auth context
  const [users, setUsers] = useState([]); // State to hold the users
  const [error, setError] = useState(null); // State for error handling
  const [newUserData, setNewUserData] = useState({ phone: "",email:"",   role: "employee" }); // New user form state
  const [successMessage, setSuccessMessage] = useState(null); // State to show success message

  useEffect(() => {
    // Fetch users from Firebase when component mounts
    async function fetchUserData() {
      try {
        const usersData = await fetchUsers(); // Fetch all users
        setUsers(usersData); // Store in state
      } catch (err) {
        setError("Error fetching users.");
        console.error(err);
      }
    }
    fetchUserData();
  }, []);

  // Function to handle role change
  const handleRoleChange = async (eid, newRole) => {
    try {
      await updateUserRole(eid, newRole); // Update the user role in Firebase
      setUsers(users.map(user => user.eid === eid ? { ...user, role: newRole } : user)); // Update UI state
    } catch (err) {
      setError("Failed to update role.");
      console.error(err);
    }
  };

  // Function to handle adding a new user
  const handleAddUser = async () => {
    try {
      const { eid, password } = await addUser(newUserData); // Call addUser from firebaseapi
      setUsers([...users, { eid, ...newUserData }]); // Update UI with the new user
      setSuccessMessage(`User added with EID: ${eid} and password: ${password}`); // Show success message
      setNewUserData({ phone: "", email:"", role: "employee" }); // Reset form
    } catch (err) {
      setError("Error adding user.");
      console.error(err);
    }
  };

  // Function to handle deleting a user
  const handleDeleteUser = async (eid) => {
    try {
      await deleteUser(eid); // Call deleteUser from firebaseapi
      setUsers(users.filter(user => user.eid !== eid)); // Update UI state
      setSuccessMessage(`User with EID: ${eid} has been deleted.`); // Show success message
    } catch (err) {
      setError("Error deleting user.");
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    // Redirect to login or display message
    return <Navigate to="/login" replace />; // Use replace to prevent going back to this page
  }

  return (
    <div className="UserManagement-container p-6">
      {/* User Profile Section */}
      <div className="user-profile flex items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold">{user.eid}</h2>
          <p className="text-sm text-gray-600">{user.role}</p>
        </div>
        <Button onClick={logout} className="ml-auto">Log Out</Button>
      </div>

      {/* Display users only for admin */}
      <div className="add-user-form mt-6">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
            <div className="form-fields flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Phone Number"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Email ID"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              />
              <Select
                onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
                defaultValue="employee"
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser} className="w-full mt-4">Add User</Button>
            </div>
          </div>
      {user.role === "admin" && (
        <div className="user-list">
          <h3 className="text-lg font-semibold mb-4">Manage Users</h3>
          {error && <p className="text-red-500">{error}</p>}
          {users.map((u) => (
            <Card key={u.eid} className="mb-4">
              <CardHeader>
                <CardTitle>{u.eid}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <p>Phone: {u.phone}</p>
                  <p>Role: {u.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Role change select */}
                  {u.eid !== user.eid ? (
                    <Select
                      onValueChange={(value) => handleRoleChange(u.eid, value)}
                      defaultValue={u.role}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Change Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-500">Cannot change your own role</p>
                  )}
                  {/* Delete button */}
                  {u.eid !== user.eid && (
                    <Button onClick={() => handleDeleteUser(u.eid)} className="text-red-500">
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Form to add a new user */}
          
        </div>
      )}
    </div>
  );
};

export default UserManagement;

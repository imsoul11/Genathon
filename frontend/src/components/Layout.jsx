// src/components/Layout.js
import { Outlet } from 'react-router-dom';
import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; // Adjust the path as needed
import { AppSidebar } from "@/components/app-sidebar"; // Adjust the path as needed
import ThemeToggle from './Themetoggle';


const Layout = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <ThemeToggle/>
        <SidebarTrigger />
        <Outlet/>
      </main>
    </SidebarProvider>
  );
};

export default Layout;

"use client";

import { useState } from "react";
import Header from "@/containers/header";
import Main from "@/containers/main";
import Footer from "@/containers/footer";
import Sidebar from "@/containers/sidebar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="grid grid-cols-5 h-screen">
      <div className={`relative flex flex-col h-screen transition-all duration-300 overflow-y-auto ${sidebarOpen ? "col-span-3" : "col-span-5"}`}>
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto px-4">
          <Main />
          <Footer />
        </div>
      </div>

      {/* サイドバー */}
      <div className={`col-span-2 transition-all duration-300 overflow-y-auto ${sidebarOpen ? "block" : "hidden"}`}>
        <Sidebar setSidebarOpen={setSidebarOpen} />
      </div>
    </div>
  );
}

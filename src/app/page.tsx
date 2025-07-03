"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
    <div className="grid md:grid-cols-5 h-screen">
      <div
        className={cn(
          "relative flex flex-col h-screen transition-all duration-300",
          sidebarOpen ? "hidden md:block md:col-span-3" : "md:col-span-5"
        )}
      >
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1">
          <Main />
          <Footer />
        </div>
      </div>

      {/* サイドバー */}
      <div
        className={cn(
          "transition-all duration-300 overflow-y-auto",
          sidebarOpen ? "block md:col-span-2" : "hidden"
        )}
      >
        <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      </div>
    </div>
  );
}

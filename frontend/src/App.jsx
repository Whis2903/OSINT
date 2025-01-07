import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import Homepage from "./pages/Home";
import NewsPaper from "./pages/Newspaper"; // Import the Newspaper page
import Dashboard from "./pages/Dashboard";

import { Settings } from "lucide-react";

import { sidebarItemList } from "./config";

function App() {
  const [expanded, setExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar expanded={expanded} setExpanded={setExpanded}>
          {sidebarItemList.map((item) => {
            return (
              <SidebarItem
                active={activeItem === item.text}
                clickHandler={() => {
                  console.log(`clicked on ${item.text}`);
                  setActiveItem(item.text);
                }}
                key={item.text}
                icon={item.icon}
                text={item.text}
              />
            );
          })}

          <hr className="my-3" />
          <SidebarItem icon={<Settings size={20} />} text="Settings" />
        </Sidebar>

        <div
          className={`flex-1 p-6 transition-all duration-300 ${
            expanded ? "ml-64" : "ml-20"
          }`}
        >
          {" "}
          {/* Adjust margin based on sidebar state */}
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/newspaper" element={<NewsPaper />} />
            {/* Add this line */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

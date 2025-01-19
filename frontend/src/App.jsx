import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathToItem = {
      "/home": "Home",
      "/newspaper": "Newspaper",
      "/dashboard": "Dashboard",
      "/settings": "Settings"
      // Add more mappings as needed
    };

    const currentItem = pathToItem[location.pathname] || "Home";
    setActiveItem(currentItem);
  }, [location.pathname]);

  return (
    <div className="flex h-screen">
      <Sidebar expanded={expanded} setExpanded={setExpanded}>
        {sidebarItemList.map((item) => {
          return (
            <SidebarItem
              active={activeItem === item.text}
              clickHandler={() => {
                console.log(`clicked on ${item.text}`);
                setActiveItem(item.text);
                navigate(`/${item.text.toLowerCase()}`);
              }}
              key={item.text}
              icon={item.icon}
              text={item.text}
            />
          );
        })}

        <hr className="my-3" />
        {/* <SidebarItem
          icon={<Settings size={20} />}
          text="Settings"
          active={activeItem === "Settings"}
          clickHandler={() => {
            setActiveItem("Settings");
            navigate("/settings");
          }}
        /> */}
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
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar, { SidebarItem } from './components/Sidebar';
import Homepage from './pages/Home';
import Newspaper from './pages/Newspaper'; // Import the Newspaper page
import { LayoutDashboard, Home, Settings } from "lucide-react";

function App() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar expanded={expanded} setExpanded={setExpanded}>
          <SidebarItem icon={<Home size={20} />} text="Home" active />
          <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" />
          <SidebarItem icon={<LayoutDashboard size={20} />} text="Newspaper" /> {/* Add this line */}
          <hr className="my-3" />
          <SidebarItem icon={<Settings size={20} />} text="Settings" />
        </Sidebar>

        <div className={`flex-1 p-6 transition-all duration-300 ${expanded ? 'ml-64' : 'ml-20'}`}> {/* Adjust margin based on sidebar state */}
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/newspaper" element={<Newspaper />} /> {/* Add this line */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
import { LayoutDashboard, Home, Settings } from "lucide-react";
import Sidebar, { SidebarItem } from "./components/Sidebar"
import Homepage from "./pages/Home";
function App() {

  return (
    <>
      <div className="flex">
  <Sidebar>
    <SidebarItem icon={<Home size={20} />} text="Home" active />
    <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" />
    <hr className="my-3" />
    <SidebarItem icon={<Settings size={20} />} text="Settings" />
  </Sidebar>

  <div className="flex-1 p-6">
    <Homepage />
  </div>
</div>
    </>
  )
}

export default App

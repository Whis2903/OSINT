import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { ChevronFirst, ChevronLast, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import profile from '../../assets/img_avatar.png'; 

export const SidebarContext = createContext({ expanded: false });

const Sidebar = ({ children, expanded, setExpanded }) => {
  return (
    <aside className={`fixed top-0 left-0 h-full transition-all duration-300 ${expanded ? 'w-64' : 'w-20'} bg-gray-900`}>
      <nav className="h-full flex flex-col bg-gray-900 border-r border-gray-700 shadow-lg">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img src={logo} className={`overflow-hidden transition-all ${expanded ? 'w-32' : 'w-0'}`} />
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700">
            {expanded ? <ChevronFirst className="text-white" /> : <ChevronLast className="text-white" />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 text-white">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t border-gray-700 flex p-3">
          <Link to="/profile">
            <img style={{ borderRadius: '50%' }} src={profile} className="w-10 h-10 rounded-md" />
          </Link>
          <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? 'w-52 ml-3' : 'w-0'}`}>
            <div className="leading-4">
              <h4 className="font-semibold text-white">user</h4>
              <span className="text-xs text-gray-400">example@gmail.com</span>
            </div>
            <MoreVertical size={20} className="text-gray-400" />
          </div>
        </div>
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
};

export default Sidebar;

export const SidebarItem = ({ icon, text, active, alert }) => {
  const { expanded } = useContext(SidebarContext);
  return (
    <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${active ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-indigo-100' : 'hover:bg-indigo-700 text-gray-300'}`}>
      <Link to={`/${text.toLowerCase()}`} className="flex items-center w-full">
        {icon}
        <span className={`overflow-hidden transition-all ${expanded ? 'w-52 ml-3' : 'w-0'}`}>{text}</span>
      </Link>
      {alert && <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? '' : 'top-2'}`}></div>}
      {!expanded && (
        <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-600 text-indigo-100 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
          {text}
        </div>
      )}
    </li>
  );
};

SidebarItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  active: PropTypes.bool,
  alert: PropTypes.bool,
};
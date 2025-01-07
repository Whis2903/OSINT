import React from 'react';
import { LayoutDashboard, Home, Settings, Newspaper} from "lucide-react";
import { FaRedditAlien, FaYoutube,FaGoogle, FaRegNewspaper  } from 'react-icons/fa6';


export const sidebarItemList = [
    {
        text : "Home",
        icon : React.createElement(Home)
    },
    {
        text : "Newspaper",
        icon : React.createElement(Newspaper)
    },
    {
        text : "Dashboard",
        icon : React.createElement(LayoutDashboard)
    }
]


export const buttonList = [

    {
        text : 'All'
    },
    {
        text : 'Reddit',
        icon : React.createElement(FaRedditAlien)
    },
    {
        text : 'Youtube',
        icon : React.createElement(FaYoutube)
    },
    {
        text : 'Google',
        icon : React.createElement(FaGoogle)
    },
    {
        text : 'News Articles',
        icon : React.createElement(FaRegNewspaper)
    },

]
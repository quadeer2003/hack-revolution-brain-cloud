"use client";
import { useAuth } from "../../context/AuthContext";
import { ModeToggle } from "./theme-toggle";
import { useState } from "react";
import { 
  BookOpen, 
  Search, 
  PenLine, 
  Share2, 
  FolderTree, 
  Palette,
  Brain,
  LogOut,
  User,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Navbar({ activeSection, setActiveSection }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const menuItems = [
    // { name: "Knowledge Base", icon: <BookOpen className="w-5 h-5" /> },
    // { name: "Smart Search", icon: <Search className="w-5 h-5" /> },
    // { name: "Add New Thought", icon: <PenLine className="w-5 h-5" /> },
    // { name: "Published Notes", icon: <Share2 className="w-5 h-5" /> },
    // { name: "PARA Space", icon: <FolderTree className="w-5 h-5" /> },
    // { name: "Canvas", icon: <Palette className="w-5 h-5" /> },
  // ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-zinc-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Section */}
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span className="font-bold text-lg">Brain Cloud</span>
            </div>

            {/* Desktop Menu - Middle Section */}
            <div className="hidden md:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-6">
                {/* {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setActiveSection(item.name.toLowerCase())}
                    className={`p-2 rounded-md
                      ${
                        activeSection === item.name.toLowerCase()
                          ? "bg-zinc-100 dark:bg-gray-900"
                          : "hover:bg-zinc-50 dark:hover:bg-gray-900/50"
                      }`}
                    title={item.name}
                  >
                    {item.icon}
                  </button>
                ))} */}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <button
                onClick={handleLogout}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-gray-900"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-zinc-200 dark:border-gray-800">
            {/* {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveSection(item.name.toLowerCase());
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                  ${
                    activeSection === item.name.toLowerCase()
                      ? "bg-zinc-100 dark:bg-gray-900"
                      : "hover:bg-zinc-50 dark:hover:bg-gray-900/50"
                  }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))} */}
          </div>
        </div>
      </nav>

      {/* Content Spacer */}
      <div className="h-16" />
    </>
  );
} 
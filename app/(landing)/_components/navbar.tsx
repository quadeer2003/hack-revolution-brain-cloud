"use client";
import { useState } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SignupFormDemo } from "@/app/(users)/signup/signup"; // Import SignupFormDemo from signup.tsx
import { useTheme } from "next-themes";

// Import the user icon from React Icons (Font Awesome set)
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignupVisible, setIsSignupVisible] = useState(false); // State to manage signup form visibility
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); // State to manage profile dropdown visibility

  const handleSignupClick = () => {
    console.log("sign up clicked");
    setIsSignupVisible(!isSignupVisible); // Toggle visibility of the signup form
  };

  const handleProfileClick = () => {
    setProfileMenuOpen(!profileMenuOpen); // Toggle profile menu visibility
  };

  const handleLogout = () => {
    // Implement your logout logic here, e.g., clearing cookies or tokens
    console.log("User logged out");
  };

  return (
    <header
      className={`z-50 px-4 lg:px-6 h-14 flex items-center fixed top-0 left-0 w-full ${
        theme === "light" ? "bg-white" : "bg-gray-900"
      }`}
    >
      {/* Logo */}
      <a className="flex items-center justify-center" href="#">
        <span className="sr-only">Collabrixo</span>
        <span className="ml-2 text-2xl font-bold text-primary">Brain Cloud</span>
      </a>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex ml-auto items-center gap-4 sm:gap-6">
        <button
          className="text-sm font-medium hover:underline underline-offset-4"
          onClick={handleSignupClick}
        >
          SignUp
        </button>

        {/* Profile Icon with Dropdown */}
        <button
          className="relative text-sm font-medium hover:underline underline-offset-4"
          onClick={handleProfileClick}
        >
          <FaUser className="h-6 w-6" />
          {/* Profile dropdown */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md border z-50">
              {/* Display user info */}
              <div className="p-4">
                <p className="font-medium">John Doe</p> {/* Replace with actual user data */}
                <p className="text-sm text-gray-500">johndoe@example.com</p> {/* Optional: Display email */}
              </div>
              <div className="border-t p-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-600 hover:bg-gray-100 p-2 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </button>

        <ModeToggle />
      </nav>

      {/* Mobile Menu Button */}
      <div className="ml-auto md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span className="sr-only">Open Menu</span>
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="absolute top-14 left-0 w-full md:hidden">
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              className="text-sm font-medium hover:underline underline-offset-4"
              onClick={handleSignupClick}
            >
              SignUp
            </button>
            <button
              className="text-sm font-medium hover:underline underline-offset-4"
              onClick={handleProfileClick}
            >
              <FaUser className="h-6 w-6" />
            </button>
            <ModeToggle />
          </div>
        </nav>
      )}

      {/* Conditional Rendering for Signup Form */}
      {isSignupVisible && (
        <div className="signup-modal fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="relative bg-white rounded-md">
            {/* Close icon at the top right */}
            <button
              onClick={() => setIsSignupVisible(false)} // Close the modal when clicked
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <SignupFormDemo /> {/* Display the signup form */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
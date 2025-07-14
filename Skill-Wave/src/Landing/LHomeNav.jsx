import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LHomeNav() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when navigating
    setMobileMenuOpen(false);
    // Set active link based on current path
    setActiveLink(window.location.pathname);
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
    setActiveLink(path);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md py-3 shadow-lg"
          : "bg-white/90 backdrop-blur-sm py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => handleNavigation("/home")}
            >
              Skillwave
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { path: "/home", name: "Home" },
              { path: "/home/about", name: "About" },
              { path: "/home/contact", name: "Contact" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeLink === item.path
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Login Button - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => handleNavigation("/login")}
              className="relative px-6 py-2 font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full group overflow-hidden transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg"
            >
              <span className="relative z-10">Log In</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none transition duration-150 ease-in-out"
              aria-label="Main menu"
            >
              {!mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {[
            { path: "/home", name: "Home" },
            { path: "/home/about", name: "About Us" },
            { path: "/home/contact", name: "Contact Us" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium transition-colors ${
                activeLink === item.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {item.name}
            </button>
          ))}
          <button
            onClick={() => handleNavigation("/login")}
            className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-md shadow hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
          >
            Log In
          </button>
        </div>
      </div>
    </header>
  );
}

export default LHomeNav;
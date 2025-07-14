import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeNav from "./LHomeNav";
import home from "../../public/Illustration.png";
import "../index.css";
import logo from "../../public/store-logo.png";

function LHome() {
  const navigate = useNavigate();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Fix for navbar overlap
  useEffect(() => {
    document.documentElement.style.scrollPaddingTop = "90px";
    return () => {
      document.documentElement.style.scrollPaddingTop = "";
    };
  }, []);

  const navItems = [
    { path: "/home", name: "Home" },
    { path: "/home/about", name: "About" },
    { path: "/home/contact", name: "Contact" }
  ];

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="font-sans antialiased text-gray-900 overflow-x-hidden">
      {/* Importing Navbar */}
      <HomeNav />

      {/* Hero Section with enhanced animations */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-24 pb-16 px-4 sm:px-8 overflow-hidden">
        {/* Enhanced decorative elements with more animation */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-3000"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          {/* Text Content with animation */}
          <div className="space-y-6 md:w-1/2 animate-fadeInUp">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Revolutionize Learning with{" "}
              <span className="relative inline-block">
                <span className="relative z-10 animate-pulse">SkillWave</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-400/70 -rotate-1 -z-0"></span>
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our platform combines interactive courses with personalized mentorship to accelerate your career growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                className="relative overflow-hidden group bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                onClick={handleGetStarted}
              >
                <span className="relative z-10">Explore Learning Materials</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>

          {/* Hero Image with enhanced animation */}
          <div className="md:w-1/2 relative animate-float">
            <img
              src={home}
              alt="SkillWave Illustration"
              className="w-full max-w-xl mx-auto transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-400/20 rounded-full -z-10 animate-pulse"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-400/20 rounded-full -z-10 animate-pulse animation-delay-2000"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Logo Cloud Section with bigger StoreTransform logo */}
      <div className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-lg font-semibold uppercase text-blue-600 tracking-widest mb-8">
            Trusted by Industry Leaders
          </p>
          <div className="mt-12 flex justify-center">
            <div className="relative group transform hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]"></div>
              <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl border-2 border-blue-200/50 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center justify-center gap-3">
                  <img
                    src={logo}
                    alt="StoreTransform"
                    className="h-24 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
                  />
                  <span className="text-2xl font-bold text-gray-800 mt-4">StoreTransform</span>
                  <p className="text-blue-600 font-medium">Our Premier Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with enhanced animations */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeIn">
            <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Master Skills <span className="text-blue-600">Efficiently</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our approach combines technology and education for optimal learning.
            </p>
          </div>

          {/* Supporting Features Grid with enhanced animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI Assistant */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group animate-fadeInUp animation-delay-100">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
                Smart Learning
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Adaptive technology for personalized education
              </p>
            </div>

            {/* Coding Playground */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group animate-fadeInUp animation-delay-200">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
                Hands-on Practice
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Real-world challenges to build skills
              </p>
            </div>

            {/* Live Events */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group animate-fadeInUp animation-delay-300">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
                Expert Guidance
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Learn from industry professionals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Replaced Stats with Testimonials Section */}
      {/* <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our <span className="text-blue-600">Learners Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from professionals who transformed their careers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-2xl mr-4">
                  JS
                </div>
                <div>
                  <h4 className="font-bold text-xl">John Smith</h4>
                  <p className="text-gray-500">Senior Developer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The hands-on projects gave me the confidence to apply for senior positions."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-2xl mr-4">
                  AM
                </div>
                <div>
                  <h4 className="font-bold text-xl">Alice Martin</h4>
                  <p className="text-gray-500">Product Manager</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The expert guidance helped me transition into product management seamlessly."
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Enhanced CTA Section with more animations */}
      <section className="relative py-24 px-4 sm:px-8 overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800/20 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-800/20 rounded-full mix-blend-overlay filter blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-purple-800/20 rounded-full mix-blend-overlay filter blur-3xl animate-pulse animation-delay-3000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Start learning with our community of ambitious professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="relative overflow-hidden group bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold py-5 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              onClick={handleGetStarted}
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer with navigation logic */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              SkillWave
            </h3>
            <p className="text-gray-400">
              Empowering your learning journey.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Navigation</h4>
            <ul className="space-y-2 text-gray-400">
              {navItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.path} 
                    className="hover:text-white transition hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  className="hover:text-white transition hover:underline"
                  onClick={() => setShowPrivacyModal(true)}
                >
                  Privacy
                </button>
              </li>
              <li>
                <button 
                  className="hover:text-white transition hover:underline"
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} SkillWave. All rights reserved.
        </div>
      </footer>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Privacy Policy</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPrivacyModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="prose text-gray-700">
              <h4 className="font-semibold text-lg mb-2">Information We Collect</h4>
              <p className="mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                participate in interactive features, fill out a form, or communicate with us.
              </p>
              
              <h4 className="font-semibold text-lg mb-2">How We Use Information</h4>
              <p className="mb-4">
                We use the information we collect to provide, maintain, and improve our services, 
                to develop new services, and to protect SkillWave and our users.
              </p>
              
              <h4 className="font-semibold text-lg mb-2">Sharing of Information</h4>
              <p>
                We do not share personal information with companies, organizations, or individuals 
                outside of SkillWave except in specific cases outlined in our full privacy policy.
              </p>
            </div>
            <div className="mt-6">
              <button 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setShowPrivacyModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Terms of Service</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowTermsModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="prose text-gray-700">
              <h4 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h4>
              <p className="mb-4">
                By accessing or using the SkillWave platform, you agree to be bound by these Terms of Service.
              </p>
              
              <h4 className="font-semibold text-lg mb-2">2. User Responsibilities</h4>
              <p className="mb-4">
                You are responsible for maintaining the confidentiality of your account and password and 
                for restricting access to your computer or device.
              </p>
              
              <h4 className="font-semibold text-lg mb-2">3. Content</h4>
              <p>
                All content provided on SkillWave is for educational purposes only. SkillWave reserves 
                the right to modify or discontinue any content at any time.
              </p>
            </div>
            <div className="mt-6">
              <button 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setShowTermsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LHome;
import React from "react";
import { motion } from "framer-motion";
import { FaLightbulb, FaCode, FaUsers, FaRocket } from "react-icons/fa";
import HomeNav from "./LHomeNav";
import about from "../../public/about.png"; 
import "../index.css";
import Sneha  from "../../public/Sneha.jpeg";
import Divyesh  from "../../public/Divyesh.jpeg";
import Harshil  from "../../public/Harshil.jpeg";
import { image } from "@tensorflow/tfjs";

const LAbout = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="font-sans bg-white">
         <HomeNav />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 z-10">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              We're <span className="text-yellow-400">Reimagining</span> Learning
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg md:text-xl opacity-90 mb-8 max-w-lg"
            >
              SkillWave combines cutting-edge technology with pedagogical excellence to create transformative learning experiences.
            </motion.p>
          </div>
          <div className="md:w-1/2 z-10">
            <motion.img
              src={about}
              alt="About SkillWave"
              className="w-full max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400 rounded-full opacity-10 blur-3xl"></div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span 
              variants={fadeIn}
              className="text-yellow-500 font-semibold tracking-wider"
            >
              OUR JOURNEY
            </motion.span>
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold text-blue-900 mt-4"
            >
              From Concept to <span className="text-yellow-500">Revolution</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-gray-600 mb-6 text-lg">
                Born in 2024 from the innovative minds at <span className="font-semibold text-blue-900">KS School of Business Management & Information Technology</span>, SkillWave emerged as a solution to the limitations of traditional corporate training.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                What began as an internal upskilling platform quickly evolved into a comprehensive learning ecosystem, blending AI-powered personalization with hands-on technical challenges.
              </p>
              <p className="text-gray-600 text-lg">
                Today, we serve hundreds of learners across multiple disciplines, continuously pushing the boundaries of what's possible in professional education.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-blue-50 p-8 rounded-2xl shadow-sm border border-blue-100"
            >
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                    <FaLightbulb className="text-yellow-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Innovation First</h3>
                    <p className="text-gray-600">We challenge conventional learning models with technology-driven solutions.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <FaCode className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Technical Excellence</h3>
                    <p className="text-gray-600">Our content is crafted by industry experts from Store Transform.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <FaUsers className="text-purple-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Community Focus</h3>
                    <p className="text-gray-600">Learning thrives in collaboration - we build networks, not just skills.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span 
              variants={fadeIn}
              className="text-yellow-500 font-semibold tracking-wider"
            >
              MEET THE TEAM
            </motion.span>
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold text-blue-900 mt-4"
            >
              The <span className="text-yellow-500">Minds</span> Behind SkillWave
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
             {
              name: "Divyesh Dandwani",
              role: "Firebase & Backend",  
              bio: "Handles database and auth setup.",
              image: Divyesh
            },
            {
              name: "Harshil Dodwani",  
              role: "Frontend & Integration",  
              bio: "Built the entire frontend with Integration Work", 
              image: Harshil
            },
            {
              name: "Sneha Sabnani",  
              role: "UI/UX Design",  
              bio: "Created designs, AI Integration and documentation.",
              image: Sneha 
            }
             
              
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-blue-900">{member.name}</h3>
                  <p className="text-yellow-500 mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6">
              Ready to <span className="text-yellow-500">Transform</span> Your Learning Experience?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Join SkillWave today and unlock a new dimension of professional growth.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LAbout;
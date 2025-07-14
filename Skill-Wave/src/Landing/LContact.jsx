import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";
import HomeNav from "./LHomeNav";
import { db } from "../Firebase"; // Import from your firebase config
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import "../index.css";

const LContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add document to Firestore
      const docRef = await addDoc(collection(db, "messages"), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        createdAt: serverTimestamp(),
      });

      // Update the same doc to include its ID
      await updateDoc(doc(db, "messages", docRef.id), {
        id: docRef.id,
      });

      alert("Thank you! Your message has been sent.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message: ", error);
      alert("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of your component remains exactly the same...
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="font-sans bg-white">
      <HomeNav />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
            className="text-center"
          >
            <motion.span
              variants={fadeIn}
              className="text-yellow-400 font-semibold tracking-wider block mb-4"
            >
              GET IN TOUCH
            </motion.span>
            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Let's Build{" "}
              <span className="text-yellow-400">Something Great</span>
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-xl opacity-90 max-w-2xl mx-auto"
            >
              Have questions about SkillWave? We're here to help and would love
              to hear from you.
            </motion.p>
          </motion.div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400 rounded-full opacity-10 blur-3xl"></div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                  required
                />
              </div>
              <div className="mb-8">
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white font-semibold ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } transition duration-300`}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-8">
              {/* Contact Card 1 */}
              <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition duration-300">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <FiMail className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      Email Us
                    </h3>
                    <p className="text-gray-600">divyeshdandwani6@gmail.com</p>
                    <p className="text-gray-600">dodwaniharshil@gmail.com</p>
                    <p className="text-gray-600">snehasabnani19@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Contact Card 2 */}
              <div className="bg-yellow-50 p-6 rounded-xl hover:shadow-md transition duration-300">
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                    <FiPhone className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      Call Us
                    </h3>
                    <p className="text-gray-600">+91 8320885179</p>
                    <p className="text-gray-600">Mon-Fri: 9am-6pm EST</p>
                  </div>
                </div>
              </div>

              {/* Contact Card 3 */}
              <div className="bg-purple-50 p-6 rounded-xl hover:shadow-md transition duration-300">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <FiMapPin className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      Visit Us
                    </h3>
                    <p className="text-gray-600">KSSBMIT, Gujarat University</p>
                    <p className="text-gray-600">Navrangpura, Ahmedabad</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
                <iframe
                  title="Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d917.9153341139385!2d72.54744532404182!3d23.03620375446283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84eb2ad9d19d%3A0xf2b4a864174675d9!2sK.%20S.%20School%20of%20Business%20Management%20%26%20Information%20Technology!5e0!3m2!1sen!2sin!4v1743672205538!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Check out our{" "}
            <span className="font-semibold text-yellow-400">FAQ section</span>{" "}
            or join our community forum.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300">
              Visit Help Center
            </button>
            <button className="border-2 border-white text-white hover:bg-blue-800 font-semibold py-3 px-8 rounded-lg transition duration-300">
              Join Community
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LContact;

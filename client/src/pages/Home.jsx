import React from "react";
import Contact from "../components/Contact";
import AboutUs from "../components/AboutUs";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import HomeCircles from "../components/HomeCircles";

/**
 * Home Component
 * 
 * This is the main landing page of the Doctor Appointment application.
 * It composes multiple components to create a complete page layout.
 * 
 * Component hierarchy:
 * - Navbar: Navigation header
 * - Hero: Main banner/introduction section
 * - AboutUs: Information about the service
 * - HomeCircles: Feature highlights or service categories
 * - Contact: Contact information or form
 * - Footer: Page footer with links and additional info
 */
const Home = () => {
  return (
    <>
      {/* Navigation bar component */}
      <Navbar />
      
      {/* Hero section with main call-to-action */}
      <Hero />
      
      {/* About Us section describing the service */}
      <AboutUs />
      
      {/* Service categories or feature highlights */}
      <HomeCircles />
      
      {/* Contact section for user inquiries */}
      <Contact />
      
      {/* Page footer with additional links and information */}
      <Footer />
    </>
  );
};

export default Home;
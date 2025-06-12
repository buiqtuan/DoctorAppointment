import React from "react";
import image from "../images/aboutimg.jpg";

/**
 * AboutUs Component
 * 
 * Displays information about the medical practice/organization with an image and
 * descriptive text. This component is used on the About Us page to provide
 * users with background information about the service.
 * 
 * @returns {JSX.Element} The rendered AboutUs component
 */
const AboutUs = () => {
  return (
    <section className="container">
      <h2 className="page-heading about-heading">About Us</h2>
      
      <div className="about">
        {/* Left side - Image container */}
        <div className="hero-img">
          <img
            src={image}
            alt="About our medical practice"
            loading="lazy" // Optimize image loading
          />
        </div>
        
        {/* Right side - Text content */}
        <div className="hero-content">
          <p>
            Đoạn text để giới thiệu.
            Bệnh Viện.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
import React from "react";
import image from "../images/heroimg.jpg";
import "../styles/hero.css";

/**
 * Hero - The main landing section displayed prominently at the top of the homepage
 * 
 * Features:
 * - Eye-catching headline with the main value proposition
 * - Supporting description text
 * - Visual hero image to enhance engagement
 * 
 * @returns {JSX.Element} - Rendered hero section component
 */
const Hero = () => {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-content">
        <h1 id="hero-heading">
          Your Health, <br />
          Our Responsibility
        </h1>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam
          tenetur doloremque molestias repellat minus asperiores in aperiam
          dolor, quaerat praesentium.
        </p>
      </div>
      <div className="hero-img">
        <img
          src={image}
          alt="Doctor caring for patient"
          loading="eager"
          width="100%"
          height="auto"
        />
      </div>
    </section>
  );
};

export default Hero;
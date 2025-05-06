import React from "react";
import CountUp from "react-countup";
import "../styles/homecircles.css";

/**
 * HomeCircles component displays animated counter circles for key statistics
 * Shows satisfaction metrics and doctor availability information
 */
const HomeCircles = () => {
  // Define statistics data to avoid repetitive code
  const statistics = [
    {
      id: 1,
      value: 1000,
      label: "Satisfied\nPatients"
    },
    {
      id: 2,
      value: 250,
      label: "Verified\nDoctors"
    },
    {
      id: 3,
      value: 75,
      label: "Specialist\nDoctors"
    }
  ];

  /**
   * Creates a counter circle with animation
   * @param {number} value - The target number to count up to
   * @param {string} label - The descriptive text below the counter
   * @param {number} key - React key for the component
   * @returns {JSX.Element} A circle with animated counter
   */
  const renderCircle = (value, label, key) => (
    <div className="circle" key={key}>
      <CountUp
        start={0}
        end={value}
        delay={0}
        enableScrollSpy={true}
        scrollSpyDelay={500}
      >
        {({ countUpRef }) => (
          <div className="counter">
            <span ref={countUpRef} />+
          </div>
        )}
      </CountUp>
      <span className="circle-name">
        {/* Split label by newline to create line breaks */}
        {label.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < label.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    </div>
  );

  return (
    <section className="container circles">
      {/* Map through statistics data to generate circles */}
      {statistics.map(stat => 
        renderCircle(stat.value, stat.label, stat.id)
      )}
    </section>
  );
};

export default HomeCircles;
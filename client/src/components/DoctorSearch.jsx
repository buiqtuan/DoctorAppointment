import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/doctorsearch.css";

const DoctorSearch = ({ onSearch, onReset }) => {
  const dropdownRef = useRef(null);
  
  const [searchFilters, setSearchFilters] = useState({
    specifications: [],
    minExperience: "",
    minFees: "",
    maxFees: "",
  });

  const [availableSpecifications, setAvailableSpecifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchSpecifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSpecifications = async () => {
    try {
      const response = await axios.get("/specification/getallspecifications");
      if (response.data && response.data.success && response.data.data) {
        setAvailableSpecifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching specifications:", error);
      toast.error("Failed to load specifications");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters({
      ...searchFilters,
      [name]: value,
    });
  };

  const toggleSpecification = (specId) => {
    const isSelected = searchFilters.specifications.includes(specId);

    if (isSelected) {
      setSearchFilters({
        ...searchFilters,
        specifications: searchFilters.specifications.filter(id => id !== specId),
      });
    } else {
      setSearchFilters({
        ...searchFilters,
        specifications: [...searchFilters.specifications, specId],
      });
    }
  };

  const removeSpecialization = (specId) => {
    setSearchFilters({
      ...searchFilters,
      specifications: searchFilters.specifications.filter(id => id !== specId),
    });
  };

  const getSelectedSpecNames = () => {
    return searchFilters.specifications
      .map((id) => {
        const spec = availableSpecifications.find((s) => s.id === id);
        return spec ? spec.name : "";
      })
      .filter(Boolean);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate fees range
    if (searchFilters.minFees && searchFilters.maxFees) {
      if (parseFloat(searchFilters.minFees) > parseFloat(searchFilters.maxFees)) {
        toast.error("Minimum fees cannot be greater than maximum fees");
        return;
      }
    }

    onSearch(searchFilters);
  };

  const handleReset = () => {
    setSearchFilters({
      specifications: [],
      minExperience: "",
      minFees: "",
      maxFees: "",
    });
    onReset();
  };

  const selectedSpecNames = getSelectedSpecNames();

  return (
    <div className="doctor-search-container">
      <form onSubmit={handleSearch} className="doctor-search-form">
        {/* Specifications Search */}
        <div className="search-group">
          <label>Search by Specialization</label>
          <div className="selected-specializations">
            {selectedSpecNames.length > 0 ? (
              selectedSpecNames.map((name, index) => {
                const specId = searchFilters.specifications[index];
                return (
                  <span key={specId} className="specialization-tag">
                    {name}
                    <button
                      type="button"
                      className="remove-spec-btn"
                      onClick={() => removeSpecialization(specId)}
                      aria-label={`Remove ${name}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="placeholder-text">Select specializations</span>
            )}
          </div>

          <div className="custom-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
            >
              Add Specialization
              <span className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {availableSpecifications.length === 0 ? (
                  <div className="dropdown-item" style={{ color: "#999", cursor: "default" }}>
                    Loading specifications...
                  </div>
                ) : (
                  availableSpecifications.map((spec) => {
                    const isSelected = searchFilters.specifications.includes(spec.id);
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        className={`dropdown-item ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleSpecification(spec.id)}
                        disabled={isSelected}
                      >
                        {spec.name}
                        {isSelected && <span className="checkmark">✓</span>}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Experience Search */}
        <div className="search-group">
          <label htmlFor="minExperience">Minimum Years of Experience</label>
          <input
            type="number"
            id="minExperience"
            name="minExperience"
            className="search-input"
            placeholder="e.g., 5"
            min="0"
            value={searchFilters.minExperience}
            onChange={handleInputChange}
          />
        </div>

        {/* Fees Range Search */}
        <div className="search-group fees-group">
          <label>Consultation Fees Range ($)</label>
          <div className="fees-inputs">
            <input
              type="number"
              name="minFees"
              className="search-input"
              placeholder="Min fees"
              min="0"
              step="0.01"
              value={searchFilters.minFees}
              onChange={handleInputChange}
            />
            <span className="fees-separator">to</span>
            <input
              type="number"
              name="maxFees"
              className="search-input"
              placeholder="Max fees"
              min="0"
              step="0.01"
              value={searchFilters.maxFees}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Search Buttons */}
        <div className="search-buttons">
          <button type="submit" className="btn search-btn">
            Search Doctors
          </button>
          <button type="button" className="btn reset-btn" onClick={handleReset}>
            Reset Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSearch;
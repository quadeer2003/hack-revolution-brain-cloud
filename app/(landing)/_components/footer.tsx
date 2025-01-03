"use client"
import React, { useState } from "react";
import { FaInstagram, FaTwitter, FaFacebookF, FaPaperPlane } from "react-icons/fa";

const Footer = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  const styles: Record<string, React.CSSProperties> = {
    footer: {
      backgroundColor: isDarkTheme ? "#1a1a1a" : "#f8f8f8",
      color: isDarkTheme ? "#fff" : "#000",
      padding: "2rem 3rem",
      borderRadius: "10px",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "2rem",
    },
    section: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "1rem",
      flex: "1 1 calc(25% - 2rem)",
    },
    socialIcons: {
      display: "flex",
      gap: "1.5rem",
    },
    icon: {
      backgroundColor: isDarkTheme ? "#a68eff" : "#6200ea",
      color: isDarkTheme ? "#1a1a1a" : "#fff",
      fontSize: "2rem", // Increased icon size
      borderRadius: "50%",
      padding: "0.7rem",
      cursor: "pointer",
      transition: "transform 0.3s ease, background-color 0.3s ease",
    },
    iconHover: {
      transform: "scale(1.1)", // Hover effect
      backgroundColor: isDarkTheme ? "#8e6cff" : "#3700b3",
    },
    links: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem",
    },
    link: {
      color: isDarkTheme ? "#ccc" : "#444",
      textDecoration: "none",
      fontSize: "0.9rem",
    },
    linkHover: {
      color: isDarkTheme ? "#fff" : "#000",
    },
    newsletter: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      backgroundColor: isDarkTheme ? "#333" : "#e0e0e0",
      borderRadius: "30px",
      padding: "0.5rem 1rem",
      transition: "box-shadow 0.3s ease",
    },
    input: {
      border: "none",
      background: "none",
      color: isDarkTheme ? "#fff" : "#000",
      outline: "none",
      flex: 1,
      fontSize: "0.9rem",
    },
    inputHover: {
      boxShadow: "0 0 10px #a68eff",
    },
    button: {
      backgroundColor: "#a68eff",
      border: "none",
      borderRadius: "50%",
      padding: "0.5rem",
      color: isDarkTheme ? "#1a1a1a" : "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      fontSize: "1.2rem",
      marginBottom: "0.5rem",
    },
    themeToggle: {
      alignSelf: "flex-end",
      cursor: "pointer",
      backgroundColor: isDarkTheme ? "#333" : "#e0e0e0",
      color: isDarkTheme ? "#fff" : "#000",
      border: "none",
      borderRadius: "20px",
      padding: "0.5rem 1rem",
      transition: "all 0.3s ease",
    },
  };

  return (
    <footer style={styles.footer}>
      {/* Left Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Brain Cloud</h3>
        <div style={styles.socialIcons}>
          <FaInstagram
            style={styles.icon}
            onMouseEnter={(e) => (e.currentTarget.style.transform = styles.iconHover.transform!)}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <FaTwitter
            style={styles.icon}
            onMouseEnter={(e) => (e.currentTarget.style.transform = styles.iconHover.transform!)}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <FaFacebookF
            style={styles.icon}
            onMouseEnter={(e) => (e.currentTarget.style.transform = styles.iconHover.transform!)}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>

      {/* Middle Section - Product Links */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Product</h4>
        <div style={styles.links}>
          <a href="#" style={styles.link}>
            Privacy & Cookie Policy
          </a>
          <a href="#" style={styles.link}>
            Security Policy
          </a>
          <a href="#" style={styles.link}>
            Terms & Conditions
          </a>
        </div>
      </div>

      {/* Middle Section - Info Links */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Info</h4>
        <div style={styles.links}>
          <a href="#" style={styles.link}>
            Terms of Service
          </a>
          <a href="#" style={styles.link}>
            Right of Withdrawal
          </a>
          <a href="#" style={styles.link}>
            Disclaimer
          </a>
        </div>
      </div>

      {/* Right Section - Newsletter */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Subscribe for Newsletter</h4>
        <div
          style={styles.newsletter}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = styles.inputHover.boxShadow!)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          <input
            type="email"
            placeholder="Enter Your Email Here"
            style={styles.input}
          />
          <button style={styles.button}>
            <FaPaperPlane size={16} title="Subscribe" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
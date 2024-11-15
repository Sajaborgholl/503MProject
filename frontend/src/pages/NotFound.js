// src/components/NotFound.js
import React from 'react';

const NotFound = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
    },
    code: {
      fontSize: '8rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emoji: {
      fontSize: '6rem',
      margin: '0 10px',
      display: 'inline-block',
    },
    message: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: '20px 0 10px',
      color: '#333',
    },
    description: {
      fontSize: '1rem',
      color: '#777',
      maxWidth: '400px',
      margin: '0 auto 20px',
    },
    button: {
      backgroundColor: '#ff9800',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      fontSize: '1rem',
      borderRadius: '5px',
      cursor: 'pointer',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.code}>
        4<span style={styles.emoji}>😭</span>4
      </div>
      <div style={styles.message}>OOPS! PAGE NOT BE FOUND</div>
      <div style={styles.description}>
        Sorry but the page you are looking for does not exist, has been removed,
        name changed or is temporarily unavailable.
      </div>
      <a href="/" style={styles.button}>
        Back to homepage
      </a>
    </div>
  );
};

export default NotFound;

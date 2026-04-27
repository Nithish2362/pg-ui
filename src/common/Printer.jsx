import React from 'react';
import B2BButton from './B2BButton';

const Printer = ({ content,close }) => {
  
    const testfetch = () => {
        const token = localStorage.getItem("token"); // Replace with your actual token
      
        fetch(`http://localhost:8080/api/print-label`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(content)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); // Parse JSON response
        })
        .then(data => {
          console.log(data); // Handle the data
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      };     
    return (
          <B2BButton name='Yes' onClick={()=>{testfetch();close()}} />
    );
};

export default Printer;
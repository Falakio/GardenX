import React from 'react';

const Plans = () => {
  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const planStyle = {
    border: '1px solid #ddd',
    padding: '20px',
    marginBottom: '20px',
    borderRadius: '5px'
  };

  const ulStyle = {
    listStyleType: 'none',
    padding: '0'
  };

  const liStyle = {
    margin: '5px 0'
  };

  return (
    <div style={containerStyle}>
      <h1>💰 Choose Your Plan</h1>
      <div style={planStyle}>
        <h2>🌱 Sapling Plan (299 AED/month)</h2>
        <p>The foundation for schools to manage and sell their produce.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>✔ Sales & order management</li>
          <li style={liStyle}>✔ Inventory tracking</li>
          <li style={liStyle}>✔ Analytics & reports</li>
          <li style={liStyle}>✔ Customer database</li>
        </ul>
      </div>
      <div style={planStyle}>
        <h2>🌿 Bloom Plan (399 AED/month)</h2>
        <p>For schools looking to scale and optimize their gardening operations.</p>
        <ul style={ulStyle}>
          <li style={liStyle}>✔ All Sapling features</li>
          <li style={liStyle}>✔ AI-powered recommendations</li>
          <li style={liStyle}>✔ Custom branding</li>
          <li style={liStyle}>✔ Marketing & promotions</li>
        </ul>
      </div>
    </div>
  );
};

export default Plans;
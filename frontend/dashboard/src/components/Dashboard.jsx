import React from 'react';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">sBTCPay Merchant Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
          <p className="text-2xl font-bold">$0.00</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
          <h2 className="text-xl font-semibold mb-2">New Customers</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Payment Success Rate</h2>
          <p className="text-2xl font-bold">0%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
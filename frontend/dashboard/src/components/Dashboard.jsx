import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Mock data for dashboard cards
  const kpiData = [
    {
      title: "Total Revenue",
      value: "$12,345.67",
      description: "+20.1% from last month",
      change: "+20.1%"
    },
    {
      title: "New Customers",
      value: "1,234",
      description: "+15.3% from last month",
      change: "+15.3%"
    },
    {
      title: "Payment Success Rate",
      value: "98.5%",
      description: "+2.1% from last month",
      change: "+2.1%"
    },
    {
      title: "Pending Transactions",
      value: "24",
      description: "3 requiring attention",
      change: "-1.2%"
    }
  ];

  // Mock data for charts
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  const transactionData = [
    { name: 'Mon', transactions: 45 },
    { name: 'Tue', transactions: 52 },
    { name: 'Wed', transactions: 48 },
    { name: 'Thu', transactions: 60 },
    { name: 'Fri', transactions: 55 },
    { name: 'Sat', transactions: 70 },
    { name: 'Sun', transactions: 65 },
  ];

  const paymentMethodData = [
    { name: 'Bitcoin', value: 45, color: '#f59e0b' },
    { name: 'Stacks', value: 25, color: '#10b981' },
    { name: 'Credit Card', value: 20, color: '#3b82f6' },
    { name: 'Bank Transfer', value: 10, color: '#8b5cf6' },
  ];

  const recentTransactions = [
    { id: '#TXN-001', customer: 'John Doe', amount: '$125.00', status: 'Completed', date: '2 hours ago' },
    { id: '#TXN-002', customer: 'Jane Smith', amount: '$89.50', status: 'Completed', date: '4 hours ago' },
    { id: '#TXN-003', customer: 'Robert Johnson', amount: '$245.75', status: 'Pending', date: '1 day ago' },
    { id: '#TXN-004', customer: 'Emily Davis', amount: '$56.25', status: 'Completed', date: '1 day ago' },
    { id: '#TXN-005', customer: 'Michael Wilson', amount: '$320.00', status: 'Failed', date: '2 days ago' },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening with your store today." />
      <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <Card key={index} className="hover:shadow-card-hover transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Payment Methods Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Breakdown of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payments processed through your store</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{transaction.id}</p>
                        <p className="text-xs text-muted-foreground">{transaction.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{transaction.amount}</p>
                        <div className="flex items-center justify-end">
                          <span className={`text-xs ${
                            transaction.status === 'Completed' ? 'text-green-600' :
                            transaction.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {transaction.status}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">{transaction.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Transaction Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Daily transaction volume for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
  );
};

export default Dashboard;
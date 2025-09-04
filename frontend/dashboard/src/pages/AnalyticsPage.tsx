
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Header from '@/components/Header';

const paymentVolumeData = [
  { date: 'Jan 1', payments: 4000, volume: 2400 },
  { date: 'Jan 2', payments: 3000, volume: 1398 },
  { date: 'Jan 3', payments: 2000, volume: 9800 },
  { date: 'Jan 4', payments: 2780, volume: 3908 },
  { date: 'Jan 5', payments: 1890, volume: 4800 },
];

const AnalyticsPage = () => {
  return (
    <>
      <Header title="Analytics" subtitle="Detailed insights into your payment performance." />
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="payment-volume" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payment-volume">Payment Volume</TabsTrigger>
            <TabsTrigger value="success-rate">Success Rate</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment-volume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Volume</CardTitle>
                <CardDescription>
                  Track your payment volume over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={paymentVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="payments" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="success-rate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Success Rate</CardTitle>
                <CardDescription>
                  Monitor your payment success rate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Success rate chart would go here */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Trends</CardTitle>
                <CardDescription>
                  Analyze payment trends over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Trends chart would go here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AnalyticsPage;

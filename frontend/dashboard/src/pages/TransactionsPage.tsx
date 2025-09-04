import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/Header';

const TransactionsPage = () => {
  // Mock data for transactions
  const transactions = [
    {
      id: '#TXN-001',
      customer: 'John Doe',
      date: '2023-06-15',
      amount: '$125.00',
      status: 'Completed',
      method: 'Bitcoin',
    },
    {
      id: '#TXN-002',
      customer: 'Jane Smith',
      date: '2023-06-14',
      amount: '$89.50',
      status: 'Completed',
      method: 'Stacks',
    },
    {
      id: '#TXN-003',
      customer: 'Robert Johnson',
      date: '2023-06-14',
      amount: '$245.75',
      status: 'Pending',
      method: 'Credit Card',
    },
    {
      id: '#TXN-004',
      customer: 'Emily Davis',
      date: '2023-06-13',
      amount: '$56.25',
      status: 'Completed',
      method: 'Bank Transfer',
    },
    {
      id: '#TXN-005',
      customer: 'Michael Wilson',
      date: '2023-06-12',
      amount: '$320.00',
      status: 'Failed',
      method: 'Bitcoin',
    },
    {
      id: '#TXN-006',
      customer: 'Sarah Brown',
      date: '2023-06-12',
      amount: '$178.90',
      status: 'Completed',
      method: 'Stacks',
    },
    {
      id: '#TXN-007',
      customer: 'David Miller',
      date: '2023-06-11',
      amount: '$92.40',
      status: 'Completed',
      method: 'Credit Card',
    },
  ];

  const statusOptions = ['All', 'Completed', 'Pending', 'Failed'];
  const methodOptions = ['All', 'Bitcoin', 'Stacks', 'Credit Card', 'Bank Transfer'];

  return (
    <main className="w-full">
      <Header title="Transactions" subtitle="View and manage all transactions" />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Transactions</CardTitle>
            <CardDescription>Search and filter your transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option.toLowerCase()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methodOptions.map((option) => (
                      <SelectItem key={option} value={option.toLowerCase().replace(' ', '-')}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>A list of all transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing 1 to 7 of 7 entries
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default TransactionsPage;
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function JournalEntries() {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: "2024-01-15",
      reference: "JE-001",
      description: "Monthly rent payment",
      debitAccount: "Rent Expense",
      creditAccount: "Cash",
      amount: "$2,000",
    },
    {
      id: 2,
      date: "2024-01-14",
      reference: "JE-002",
      description: "Customer payment received",
      debitAccount: "Cash",
      creditAccount: "Accounts Receivable",
      amount: "$5,000",
    },
    {
      id: 3,
      date: "2024-01-13",
      reference: "JE-003",
      description: "Office supplies purchase",
      debitAccount: "Office Supplies",
      creditAccount: "Accounts Payable",
      amount: "$350",
    },
  ]);

  const [newEntry, setNewEntry] = useState({
    date: "",
    reference: "",
    description: "",
    debitAccount: "",
    creditAccount: "",
    amount: "",
  });

  const handleAddEntry = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newEntry.date || !newEntry.description || !newEntry.debitAccount || !newEntry.creditAccount || !newEntry.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Add new entry
    const entry = {
      id: entries.length + 1,
      date: newEntry.date,
      reference: newEntry.reference || `JE-00${entries.length + 1}`,
      description: newEntry.description,
      debitAccount: newEntry.debitAccount,
      creditAccount: newEntry.creditAccount,
      amount: `$${parseFloat(newEntry.amount).toLocaleString()}`,
    };

    setEntries([entry, ...entries]);
    toast.success("Journal entry added successfully!");
    
    // Reset form
    setNewEntry({
      date: "",
      reference: "",
      description: "",
      debitAccount: "",
      creditAccount: "",
      amount: "",
    });
  };

  const handleDeleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
    toast.success("Journal entry deleted successfully!");
  };

  const handleClearForm = () => {
    setNewEntry({
      date: "",
      reference: "",
      description: "",
      debitAccount: "",
      creditAccount: "",
      amount: "",
    });
  };

  return (
    <div className="space-y-6 p-6 max-h-[calc(100vh-50px)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Journal Entries</h2>
          <p className="text-gray-600 mt-2">
            Record and manage your accounting transactions
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl">Add New Entry</CardTitle>
          <CardDescription className="text-gray-600">
            Create a new journal entry for your transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  required
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-sm font-medium text-gray-700">
                  Reference Number
                </Label>
                <Input
                  id="reference"
                  placeholder="JE-004"
                  value={newEntry.reference}
                  onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  required
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Enter transaction description..."
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                rows={2}
                required
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debitAccount" className="text-sm font-medium text-gray-700">
                  Debit Account *
                </Label>
                <Select
                  value={newEntry.debitAccount}
                  onValueChange={(value) => setNewEntry({ ...newEntry, debitAccount: value })}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg">
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Accounts Receivable">Accounts Receivable</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Rent Expense">Rent Expense</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditAccount" className="text-sm font-medium text-gray-700">
                  Credit Account *
                </Label>
                <Select
                  value={newEntry.creditAccount}
                  onValueChange={(value) => setNewEntry({ ...newEntry, creditAccount: value })}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg">
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Accounts Payable">Accounts Payable</SelectItem>
                    <SelectItem value="Accounts Receivable">Accounts Receivable</SelectItem>
                    <SelectItem value="Sales Revenue">Sales Revenue</SelectItem>
                    <SelectItem value="Owner's Equity">Owner's Equity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearForm}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl">Recent Entries</CardTitle>
          <CardDescription className="text-gray-600">
            View and edit your journal entries
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                  <TableHead className="font-semibold text-gray-700">Description</TableHead>
                  <TableHead className="font-semibold text-gray-700">Debit Account</TableHead>
                  <TableHead className="font-semibold text-gray-700">Credit Account</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{entry.date}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">{entry.reference}</TableCell>
                    <TableCell className="text-gray-900">{entry.description}</TableCell>
                    <TableCell className="text-gray-600">{entry.debitAccount}</TableCell>
                    <TableCell className="text-gray-600">{entry.creditAccount}</TableCell>
                    <TableCell className="text-right font-mono font-medium text-gray-900">
                      {entry.amount}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
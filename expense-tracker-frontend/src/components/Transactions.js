import { useState } from 'react';
import API from '../api';
import { CSVLink } from 'react-csv';
import ExportPDF from './ExportPDF';
import { toast } from 'react-toastify'; // Ensure toast is imported

export default function Transactions({ selectedCategory, transactions = [], fetchTransactions }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', date: '' });
  const [isLoading, setIsLoading] = useState(false);  // Optional: Loading state

  // Handle Deleting a Transaction
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    setIsLoading(true);  // Optional: Show loading state during deletion
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error('Failed to delete transaction.');
    } finally {
      setIsLoading(false);  // Optional: Hide loading state
    }
  };

  // Handle Editing a Transaction
  const handleEdit = (txn) => {
    setEditing(txn.id);
    setForm({ title: txn.title, amount: txn.amount, date: txn.date });
  };

  // Handle Saving the Updated Transaction
  const handleUpdate = async () => {
    if (isNaN(form.amount) || form.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);  // Optional: Show loading state during update
    try {
      await API.put(`/transactions/${editing}`, form);
      setEditing(null);
      setForm({ title: '', amount: '', date: '' });
      fetchTransactions();
    } catch (err) {
      console.error('Error updating transaction:', err);
      toast.error('Failed to update transaction.');
    } finally {
      setIsLoading(false);  // Optional: Hide loading state
    }
  };

  // Optional: Filter transactions based on selected category
  const filtered = selectedCategory
    ? transactions.filter((t) => t.category?.name === selectedCategory)
    : transactions;

  return (
    <div className="overflow-x-auto mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Transactions</h2>
        <div className="flex space-x-2">
          <CSVLink
            data={filtered}
            filename="transactions.csv"
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Export CSV
          </CSVLink>
          <ExportPDF data={filtered} />
        </div>
      </div>

      {/* Optional Loading Indicator */}
      {isLoading && <div className="text-center py-4">Loading...</div>}

      {/* Transaction Table */}
      <table className="min-w-full text-sm sm:text-base border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Date</th>
            <th className="p-2">Title</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Category</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-2">{new Date(t.date).toLocaleDateString()}</td> {/* Format date */}
              <td className="p-2">
                {editing === t.id ? (
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border p-1 rounded"
                  />
                ) : (
                  t.title
                )}
              </td>
              <td className="p-2">
                {editing === t.id ? (
                  <input
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="border p-1 rounded"
                    type="number"
                  />
                ) : (
                  `₹${t.amount.toFixed(2)}` 
                )}
              </td>
              <td className="p-2">{t.category?.name || 'Uncategorized'}</td>
              <td className="p-2">
                {editing === t.id ? (
                  <button className="text-green-600" onClick={handleUpdate}>Save</button>
                ) : (
                  <>
                    <button className="text-yellow-500 mr-2" onClick={() => handleEdit(t)}>Edit</button>
                    <button className="text-red-500" onClick={() => handleDelete(t.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-center py-4">No transactions to show.</p>
      )} 
    </div>
  );
}

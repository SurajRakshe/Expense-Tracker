import { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api';
import AddTransaction from '../components/AddTransaction';
import Transactions from '../components/Transactions';
import Charts from '../components/Charts';
import { checkBudgetLimit } from '../utils/budget';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetLimit] = useState(100000);

  const { logout } = useAuth();

  const fetchTransactions = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) return;

    try {
      const res = await API.get('/transactions');
      setTransactions(res?.data || []);
    } catch (err) {
      toast.error('Failed to load transactions.');
      console.error('Error:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) return;

    try {
      const res = await API.get('/categories');
      setCategories(res?.data || []);
    } catch (err) {
      toast.error('Failed to load categories.');
      console.error('Error:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [fetchCategories, fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return selectedCategory
      ? transactions.filter((t) => t.category?.name === selectedCategory)
      : transactions;
  }, [transactions, selectedCategory]);

  const totalSpent = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredTransactions]);

  const percentUsed = Math.min((totalSpent / budgetLimit) * 100, 100);

  const handleLogout = () => {
    logout();
    setSelectedCategory('');
    toast.success('Logged out successfully');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ToastContainer />

      {/* Logout */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Budget warning */}
      {checkBudgetLimit(filteredTransactions, budgetLimit) && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {checkBudgetLimit(filteredTransactions, budgetLimit)}
        </div>
      )}

      {/* Budget progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
          <span>Budget Used:</span>
          <span>
            ₹{totalSpent.toFixed(2)} / ₹{budgetLimit}
          </span>
        </div>
        <div className="w-full bg-gray-200 h-4 rounded">
          <div
            className={`h-4 rounded ${percentUsed >= 100 ? 'bg-red-600' : 'bg-green-500'}`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="font-semibold">Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="ml-2 p-1 border rounded"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction Form & Data */}
      <AddTransaction onAdd={fetchTransactions} />
      <Transactions
        selectedCategory={selectedCategory}
        transactions={filteredTransactions}
        fetchTransactions={fetchTransactions}
      />
      <Charts selectedCategory={selectedCategory} />
    </div>
  );
}

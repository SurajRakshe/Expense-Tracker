import { useState, useEffect } from 'react';
import API from '../api';
import { toast } from 'react-toastify';

export default function AddTransaction({ onAdd }) {
  const [form, setForm] = useState({ title: '', amount: '', date: '', categoryId: '' });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'EXPENSE' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState({ name: '', type: 'EXPENSE' });
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoadingCategories(true);
    API.get('/categories')
      .then((res) => {
        const validCategories = (res.data || []).filter(
          (c) => c && typeof c.name === 'string' && typeof c.type === 'string'
        );
        setCategories(validCategories);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories.');
      })
      .finally(() => setLoadingCategories(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date || !form.categoryId) {
      toast.error('Please fill out all fields.');
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Amount must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/transactions', { ...form, amount });
      toast.success('Transaction added successfully');
      setForm({ title: '', amount: '', date: '', categoryId: '' });
      onAdd();
    } catch (err) {
      console.error('Error adding transaction:', err);
      toast.error('Failed to add transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategory.name.trim();
    if (!trimmedName || !newCategory.type) {
      toast.error('Please provide a valid category name and type.');
      return;
    }

    const isDuplicate = categories.some(
      (c) =>
        c &&
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        c.type === newCategory.type
    );
    if (isDuplicate) {
      toast.warn('Category already exists.');
      return;
    }

    setIsAddingCategory(true);
    try {
      await API.post('/categories', { ...newCategory, name: trimmedName });
      toast.success(`Category "${trimmedName}" added`);
      setNewCategory({ name: '', type: 'EXPENSE' });
      fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      toast.error('Failed to add category.');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category.');
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setEditingCategory({ name: cat.name, type: cat.type });
  };

  const handleUpdateCategory = async () => {
    const trimmedName = editingCategory.name.trim();
    if (!trimmedName) {
      toast.error('Category name is required.');
      return;
    }

    try {
      await API.put(`/categories/${editingCategoryId}`, {
        ...editingCategory,
        name: trimmedName,
      });
      toast.success('Category updated');
      setEditingCategoryId(null);
      fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('Failed to update category.');
    }
  };

  const incomeCategories = categories.filter((c) => c?.type === 'INCOME').sort((a, b) => a.name.localeCompare(b.name));
  const expenseCategories = categories.filter((c) => c?.type === 'EXPENSE').sort((a, b) => a.name.localeCompare(b.name));

  const getCategoryStyle = (type) =>
    type === 'INCOME' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg p-6 rounded-xl max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">➕ Add Transaction</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {loadingCategories ? (
            <option disabled>Loading...</option>
          ) : (
            <>
              <optgroup label="Income Categories">
                {incomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    💰 {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Expense Categories">
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    🧾 {c.name}
                  </option>
                ))}
              </optgroup>
            </>
          )}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
      >
        {isSubmitting ? 'Adding...' : 'Add Transaction'}
      </button>

      <hr className="my-8" />

      <h3 className="text-xl font-bold mb-2">🗂️ Manage Categories</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="New Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          className="border rounded-lg p-3"
        />
        <select
          value={newCategory.type}
          onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
          className="border rounded-lg p-3"
        >
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      <button
        type="button"
        onClick={handleAddCategory}
        disabled={isAddingCategory}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
      >
        {isAddingCategory ? 'Adding...' : 'Add Category'}
      </button>

      <input
        type="text"
        placeholder="🔍 Search categories..."
        value={categorySearch}
        onChange={(e) => setCategorySearch(e.target.value)}
        className="mt-6 border rounded-lg p-3 w-full"
      />

      <ul className="mt-4 space-y-2">
        {filteredCategories.length === 0 && (
          <p className="text-gray-500">No categories match your search.</p>
        )}
        {filteredCategories.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            {editingCategoryId === c.id ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-grow">
                <input
                  className="border rounded-lg px-3 py-1"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                />
                <select
                  value={editingCategory.type}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, type: e.target.value })
                  }
                  className="border rounded-lg px-3 py-1"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
            ) : (
              <span className={`${getCategoryStyle(c.type)} flex-grow`}>
                {c.type === 'INCOME' ? '💰' : '🧾'} {c.name} ({c.type})
              </span>
            )}

            <div className="flex gap-2 ml-4">
              {editingCategoryId === c.id ? (
                <>
                  <button
                    onClick={handleUpdateCategory}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCategoryId(null)}
                    className="text-sm bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEditCategory(c)}
                    className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </form>
  );
}

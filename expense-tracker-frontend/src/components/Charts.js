import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EF5', '#FF6B6B'];

export default function Charts({ selectedCategory }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get('/transactions')
      .then((res) => {
        const grouped = {};

        res.data.forEach((t) => {
          if (t.category && t.category.name) {
            const cat = t.category.name;
            if (!grouped[cat]) grouped[cat] = 0;
            grouped[cat] += t.amount;
          }
        });

        const chartData = Object.keys(grouped).map((cat) => ({
          name: cat,
          value: grouped[cat],
        }));

        setData(chartData);
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
      });
  }, [selectedCategory]);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">Expense Breakdown</h2>
      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No data to display.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

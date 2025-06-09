import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useState } from 'react';

export default function ExportPDF({ data = [], chartRef = null }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterByDateRange = (transactions) => {
    if (!startDate && !endDate) return transactions;
    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      return (!start || txDate >= start) && (!end || txDate <= end);
    });
  };

  const formatAmount = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

  const exportToPDF = async () => {
    const doc = new jsPDF();
    const filteredData = filterByDateRange(data);

    const tableRows = filteredData.map((t) => [
      t.date,
      t.title,
      formatAmount(t.amount),
      t.category?.name || 'N/A',
      t.category?.type || 'N/A',
    ]);

    const totalIncome = filteredData
      .filter((t) => t.category?.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredData
      .filter((t) => t.category?.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    doc.text('Transaction Report', 14, 10);
    doc.autoTable({
      head: [['Date', 'Title', 'Amount', 'Category', 'Type']],
      body: tableRows,
      startY: 20,
    });

    doc.text(`Total Income: ${formatAmount(totalIncome)}`, 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Expense: ${formatAmount(totalExpense)}`, 14, doc.lastAutoTable.finalY + 20);

    if (chartRef?.current) {
      const chartCanvas = chartRef.current.querySelector('canvas');
      if (chartCanvas) {
        const chartImage = chartCanvas.toDataURL('image/png');
        doc.addPage();
        doc.text('Expense Chart', 14, 15);
        doc.addImage(chartImage, 'PNG', 15, 25, 180, 100);
      }
    }

    doc.save('transactions_report.pdf');
  };

  const exportToExcel = () => {
    const filteredData = filterByDateRange(data);
    const sheetData = [
      ['Date', 'Title', 'Amount', 'Category', 'Type'],
      ...filteredData.map((t) => [
        t.date,
        t.title,
        t.amount,
        t.category?.name || 'N/A',
        t.category?.type || 'N/A',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, 'transactions.xlsx');
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-1 rounded"
        />
        <span>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-1 rounded"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={exportToPDF}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}

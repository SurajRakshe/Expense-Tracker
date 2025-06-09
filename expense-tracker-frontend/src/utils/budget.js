export const checkBudgetLimit = (transactions, limit) => {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  return total > limit ? `⚠️ Budget exceeded by ₹${total - limit}` : null;
};
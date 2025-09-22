import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './NotificationSystem.css';

const NotificationSystem = ({ transactions, budgets }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      checkForNotifications();
    }
  }, [transactions, budgets]);

  const checkForNotifications = () => {
    const newNotifications = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Check for budget alerts
    if (budgets && Object.keys(budgets).length > 0) {
      Object.entries(budgets).forEach(([category, budgetAmount]) => {
        const spent = transactions
          .filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transaction.transactionType === 'expense' &&
                   transaction.category === category &&
                   transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
          })
          .reduce((total, transaction) => total + transaction.amount, 0);

        const percentage = (spent / budgetAmount) * 100;

        if (percentage >= 90) {
          newNotifications.push({
            id: `budget-${category}-${Date.now()}`,
            type: 'danger',
            title: '🚨 Budget Alert!',
            message: `You've spent ${Math.round(percentage)}% of your ${category} budget!`,
            timestamp: new Date(),
            category: 'budget'
          });
        } else if (percentage >= 75) {
          newNotifications.push({
            id: `budget-warning-${category}-${Date.now()}`,
            type: 'warning',
            title: '⚠️ Budget Warning',
            message: `You've spent ${Math.round(percentage)}% of your ${category} budget.`,
            timestamp: new Date(),
            category: 'budget'
          });
        }
      });
    }

    // Check for large transactions (above average)
    const expenseTransactions = transactions.filter(t => t.transactionType === 'expense');
    if (expenseTransactions.length > 0) {
      const avgExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length;
      const recentLargeTransactions = expenseTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        const daysDiff = (new Date() - transactionDate) / (1000 * 60 * 60 * 24);
        return t.amount > avgExpense * 2 && daysDiff <= 1; // Large transactions in last 24 hours
      });

      recentLargeTransactions.forEach(transaction => {
        newNotifications.push({
          id: `large-expense-${transaction._id}`,
          type: 'info',
          title: '💸 Large Expense Detected',
          message: `₹${transaction.amount.toLocaleString()} spent on ${transaction.category}`,
          timestamp: new Date(transaction.date),
          category: 'expense'
        });
      });
    }

    // Check for spending streaks
    const last7Days = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const daysDiff = (new Date() - transactionDate) / (1000 * 60 * 60 * 24);
      return t.transactionType === 'expense' && daysDiff <= 7;
    });

    if (last7Days.length >= 10) {
      newNotifications.push({
        id: `spending-streak-${Date.now()}`,
        type: 'warning',
        title: '📈 High Activity Alert',
        message: `You've made ${last7Days.length} transactions in the last 7 days!`,
        timestamp: new Date(),
        category: 'activity'
      });
    }

    // Motivational notifications for good spending habits
    const thisMonthExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.transactionType === 'expense' &&
             transactionDate.getMonth() === currentMonth &&
             transactionDate.getFullYear() === currentYear;
    });

    const lastMonthExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return t.transactionType === 'expense' &&
             transactionDate.getMonth() === lastMonth &&
             transactionDate.getFullYear() === lastMonthYear;
    });

    const thisMonthTotal = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

    if (lastMonthTotal > 0 && thisMonthTotal < lastMonthTotal * 0.8) {
      newNotifications.push({
        id: `good-spending-${Date.now()}`,
        type: 'success',
        title: '🎉 Great Job!',
        message: `You're spending 20% less than last month! Keep it up!`,
        timestamp: new Date(),
        category: 'achievement'
      });
    }

    setNotifications(newNotifications);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getToastVariant = (type) => {
    switch (type) {
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'info': return 'info';
      default: return 'primary';
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ToastContainer position="top-end" className="custom-toast-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          show={true}
          onClose={() => removeNotification(notification.id)}
          delay={8000}
          autohide
          className={`custom-toast toast-${notification.type}`}
        >
          <Toast.Header className={`toast-header-${notification.type}`}>
            <strong className="me-auto">{notification.title}</strong>
            <small>{formatTime(notification.timestamp)}</small>
          </Toast.Header>
          <Toast.Body className="toast-body">
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationSystem;

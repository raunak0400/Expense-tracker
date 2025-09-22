import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import './DashboardWidgets.css';

const DashboardWidgets = ({ transactions, user }) => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    topCategory: '',
    transactionCount: 0,
    avgTransaction: 0,
    thisMonthSpending: 0,
    lastMonthSpending: 0
  });

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      calculateStats();
    }
  }, [transactions]);

  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Calculate totals
    const income = transactions
      .filter(t => t.transactionType === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // This month spending
    const thisMonthSpending = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.transactionType === 'expense' &&
               date.getMonth() === currentMonth &&
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Last month spending
    const lastMonthSpending = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.transactionType === 'expense' &&
               date.getMonth() === lastMonth &&
               date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Top spending category
    const categoryTotals = {};
    transactions
      .filter(t => t.transactionType === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
      categoryTotals[a] > categoryTotals[b] ? a : b, '');

    // Average transaction
    const avgTransaction = expenses > 0 ? expenses / transactions.filter(t => t.transactionType === 'expense').length : 0;

    setStats({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      topCategory,
      transactionCount: transactions.length,
      avgTransaction,
      thisMonthSpending,
      lastMonthSpending
    });
  };

  const getSpendingTrend = () => {
    if (stats.lastMonthSpending === 0) return { trend: 'neutral', percentage: 0 };
    
    const change = ((stats.thisMonthSpending - stats.lastMonthSpending) / stats.lastMonthSpending) * 100;
    
    if (change > 0) return { trend: 'up', percentage: Math.abs(change) };
    if (change < 0) return { trend: 'down', percentage: Math.abs(change) };
    return { trend: 'neutral', percentage: 0 };
  };

  const spendingTrend = getSpendingTrend();

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.username || 'User';
    
    if (hour < 12) return `Good Morning, ${name}! ☀️`;
    if (hour < 17) return `Good Afternoon, ${name}! 🌤️`;
    return `Good Evening, ${name}! 🌙`;
  };

  return (
    <div className="dashboard-widgets">
      {/* Welcome Card */}
      <Card className="welcome-card mb-4">
        <Card.Body>
          <div className="welcome-content">
            <div>
              <h4 className="welcome-title">{getGreeting()}</h4>
              <p className="welcome-subtitle">Here's your financial overview</p>
            </div>
            <div className="balance-display">
              <h3 className={`balance-amount ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(stats.balance)}
              </h3>
              <small className="balance-label">Current Balance</small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Stats Grid */}
      <Row className="stats-grid">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card income-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">💰</div>
                <div className="stat-details">
                  <h5 className="stat-value">{formatCurrency(stats.totalIncome)}</h5>
                  <p className="stat-label">Total Income</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card expense-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">💸</div>
                <div className="stat-details">
                  <h5 className="stat-value">{formatCurrency(stats.totalExpenses)}</h5>
                  <p className="stat-label">Total Expenses</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card transaction-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">📊</div>
                <div className="stat-details">
                  <h5 className="stat-value">{stats.transactionCount}</h5>
                  <p className="stat-label">Transactions</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card average-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">📈</div>
                <div className="stat-details">
                  <h5 className="stat-value">{formatCurrency(stats.avgTransaction)}</h5>
                  <p className="stat-label">Avg. Expense</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Insights Row */}
      <Row className="insights-row">
        <Col md={6} className="mb-3">
          <Card className="insight-card">
            <Card.Body>
              <div className="insight-header">
                <h6 className="insight-title">📅 Monthly Spending</h6>
                <Badge 
                  className={`trend-badge ${spendingTrend.trend}`}
                >
                  {spendingTrend.trend === 'up' ? '📈' : spendingTrend.trend === 'down' ? '📉' : '➡️'}
                  {spendingTrend.percentage > 0 && ` ${spendingTrend.percentage.toFixed(1)}%`}
                </Badge>
              </div>
              <div className="spending-comparison">
                <div className="spending-item">
                  <span className="spending-label">This Month</span>
                  <span className="spending-value current">{formatCurrency(stats.thisMonthSpending)}</span>
                </div>
                <div className="spending-item">
                  <span className="spending-label">Last Month</span>
                  <span className="spending-value previous">{formatCurrency(stats.lastMonthSpending)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card className="insight-card">
            <Card.Body>
              <div className="insight-header">
                <h6 className="insight-title">🏆 Top Category</h6>
              </div>
              <div className="top-category">
                {stats.topCategory ? (
                  <>
                    <div className="category-display">
                      <span className="category-name">{stats.topCategory}</span>
                    </div>
                    <p className="category-description">Your highest spending category</p>
                  </>
                ) : (
                  <p className="no-data">No expense data available</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardWidgets;

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, ProgressBar, Modal } from 'react-bootstrap';
import './BudgetTracker.css';

const BudgetTracker = ({ transactions, user }) => {
  const [budgets, setBudgets] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });

  // Categories for budget tracking
  const categories = [
    '🛒 Groceries', '🏠 Rent', '💡 Utilities', '🍕 Food & Dining',
    '🏥 Healthcare', '🎬 Entertainment', '🚗 Transportation', '🎓 Education',
    '👕 Shopping', '✈️ Travel', '📱 Technology', '🎁 Gifts', '💼 Business'
  ];

  useEffect(() => {
    // Load budgets from localStorage
    const savedBudgets = localStorage.getItem(`budgets_${user?._id}`);
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, [user]);

  const saveBudgets = (newBudgets) => {
    setBudgets(newBudgets);
    localStorage.setItem(`budgets_${user?._id}`, JSON.stringify(newBudgets));
  };

  const handleAddBudget = () => {
    if (newBudget.category && newBudget.amount) {
      const updatedBudgets = {
        ...budgets,
        [newBudget.category]: parseFloat(newBudget.amount)
      };
      saveBudgets(updatedBudgets);
      setNewBudget({ category: '', amount: '' });
      setShowModal(false);
    }
  };

  const calculateSpent = (category) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.transactionType === 'expense' &&
               transaction.category === category &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getProgressVariant = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'danger';
  };

  const getTotalBudget = () => {
    return Object.values(budgets).reduce((total, amount) => total + amount, 0);
  };

  const getTotalSpent = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.transactionType === 'expense' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  return (
    <div className="budget-tracker">
      <Card className="budget-overview-card">
        <Card.Header className="budget-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="budget-title">📊 Monthly Budget Overview</h4>
            <Button 
              className="add-budget-btn" 
              onClick={() => setShowModal(true)}
            >
              ➕ Set Budget
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Overall Budget Summary */}
          <div className="overall-budget mb-4">
            <Row>
              <Col md={6}>
                <div className="budget-stat">
                  <h5>💰 Total Budget</h5>
                  <h3 className="budget-amount">₹{getTotalBudget().toLocaleString()}</h3>
                </div>
              </Col>
              <Col md={6}>
                <div className="budget-stat">
                  <h5>💸 Total Spent</h5>
                  <h3 className="spent-amount">₹{getTotalSpent().toLocaleString()}</h3>
                </div>
              </Col>
            </Row>
            <div className="overall-progress mt-3">
              <ProgressBar 
                variant={getProgressVariant(getTotalSpent(), getTotalBudget())}
                now={(getTotalSpent() / getTotalBudget()) * 100}
                label={`${Math.round((getTotalSpent() / getTotalBudget()) * 100)}%`}
                className="custom-progress-bar"
              />
            </div>
          </div>

          {/* Category-wise Budget Tracking */}
          <Row>
            {Object.entries(budgets).map(([category, budgetAmount]) => {
              const spent = calculateSpent(category);
              const percentage = (spent / budgetAmount) * 100;
              
              return (
                <Col md={6} lg={4} key={category} className="mb-3">
                  <Card className="budget-category-card">
                    <Card.Body>
                      <div className="category-header">
                        <h6 className="category-name">{category}</h6>
                        <small className="budget-limit">Budget: ₹{budgetAmount.toLocaleString()}</small>
                      </div>
                      <div className="spending-info">
                        <div className="spent-vs-budget">
                          <span className="spent">₹{spent.toLocaleString()}</span>
                          <span className="remaining">
                            {budgetAmount - spent >= 0 ? 
                              `₹${(budgetAmount - spent).toLocaleString()} left` : 
                              `₹${(spent - budgetAmount).toLocaleString()} over`
                            }
                          </span>
                        </div>
                        <ProgressBar 
                          variant={getProgressVariant(spent, budgetAmount)}
                          now={Math.min(percentage, 100)}
                          className="category-progress"
                        />
                        <small className="percentage-text">
                          {Math.round(percentage)}% used
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {Object.keys(budgets).length === 0 && (
            <div className="no-budgets">
              <div className="text-center">
                <h5>🎯 No budgets set yet</h5>
                <p>Start by setting budgets for your expense categories to track your spending!</p>
                <Button 
                  className="add-budget-btn" 
                  onClick={() => setShowModal(true)}
                >
                  Set Your First Budget
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Budget Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="budget-modal-header">
          <Modal.Title>🎯 Set Budget Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={newBudget.category}
                onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              >
                <option value="">Choose Category...</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Monthly Budget Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter budget amount"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button className="add-budget-btn" onClick={handleAddBudget}>
            Set Budget
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BudgetTracker;

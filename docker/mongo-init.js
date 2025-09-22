// MongoDB initialization script for FinanceFlow Pro
print('🚀 Initializing FinanceFlow Pro Database...');

// Switch to the application database
db = db.getSiblingDB('financeflow-pro');

// Create application user
db.createUser({
  user: 'financeflow-user',
  pwd: 'financeflow-password-change-in-production',
  roles: [
    {
      role: 'readWrite',
      db: 'financeflow-pro'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be at least 6 characters'
        },
        avatarImage: {
          bsonType: 'string',
          description: 'Avatar image URL'
        },
        isAvatarImageSet: {
          bsonType: 'bool',
          description: 'Avatar image set status'
        }
      }
    }
  }
});

db.createCollection('transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'amount', 'category', 'transactionType', 'userId', 'date'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Transaction title is required'
        },
        amount: {
          bsonType: 'number',
          minimum: 0,
          description: 'Amount must be a positive number'
        },
        category: {
          bsonType: 'string',
          description: 'Category is required'
        },
        transactionType: {
          bsonType: 'string',
          enum: ['credit', 'expense'],
          description: 'Transaction type must be credit or expense'
        },
        userId: {
          bsonType: 'objectId',
          description: 'User ID is required'
        },
        date: {
          bsonType: 'date',
          description: 'Date is required'
        },
        description: {
          bsonType: 'string',
          description: 'Optional transaction description'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.transactions.createIndex({ userId: 1 });
db.transactions.createIndex({ date: -1 });
db.transactions.createIndex({ category: 1 });
db.transactions.createIndex({ transactionType: 1 });

// Insert sample categories (optional)
db.categories.insertMany([
  { name: '🛒 Groceries', type: 'expense', color: '#4CAF50' },
  { name: '🏠 Rent', type: 'expense', color: '#FF9800' },
  { name: '💰 Salary', type: 'credit', color: '#2196F3' },
  { name: '💡 Utilities', type: 'expense', color: '#FFC107' },
  { name: '🍕 Food & Dining', type: 'expense', color: '#FF5722' },
  { name: '🏥 Healthcare', type: 'expense', color: '#E91E63' },
  { name: '🎬 Entertainment', type: 'expense', color: '#9C27B0' },
  { name: '🚗 Transportation', type: 'expense', color: '#607D8B' },
  { name: '🎓 Education', type: 'expense', color: '#3F51B5' },
  { name: '👕 Shopping', type: 'expense', color: '#E91E63' },
  { name: '✈️ Travel', type: 'expense', color: '#00BCD4' },
  { name: '📱 Technology', type: 'expense', color: '#795548' },
  { name: '🎁 Gifts', type: 'expense', color: '#FF4081' },
  { name: '💼 Business', type: 'expense', color: '#37474F' },
  { name: '🔧 Other', type: 'expense', color: '#9E9E9E' }
]);

print('✅ FinanceFlow Pro Database initialized successfully!');
print('📊 Collections created: users, transactions, categories');
print('🔐 Indexes created for optimal performance');
print('🎯 Ready for FinanceFlow Pro application!');

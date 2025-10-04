# 💰 Personal Expense Tracker

A full-stack expense tracking application with a modern React UI and Flask REST API backend. Track your expenses, categorize them, and generate insightful reports.

## ✨ Features

### Must-Have Features (Implemented)
- ✅ **Add Expense** - Add expenses with amount, date, and notes
- ✅ **View Expenses** - Display all expenses in a beautiful card-based grid
- ✅ **Update Expense** - Edit existing expenses
- ✅ **Delete Expense** - Remove expenses with confirmation
- ✅ **Data Persistence** - SQLite database for reliable storage
- ✅ **Validation & Error Handling** - Comprehensive validation on both frontend and backend

### Good-to-Have Features (Implemented)
- ✅ **Categories** - 7 default categories (food, travel, bills, entertainment, shopping, health, other)
- ✅ **Summary Reports** - View total spent, breakdown by category
- ✅ **Filters** - Filter expenses by date range and category
- ✅ **Modern UI** - Beautiful, responsive React interface with gradient backgrounds
- ✅ **Real-time Stats** - Dashboard showing total spent and expense count

## 🛠️ Tech Stack

**Backend:**
- Python 3.x
- Flask - Web framework
- SQLite - Database
- Flask-CORS - Cross-origin resource sharing

**Frontend:**
- React 18
- Lucide React - Modern icons
- date-fns - Date formatting
- CSS3 - Custom styling with gradients and animations

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

## 🚀 Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📡 API Endpoints

### Expenses

- `GET /api/expenses` - Get all expenses (supports filtering)
  - Query params: `category`, `start_date`, `end_date`
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id` - Get a specific expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Categories

- `GET /api/categories` - Get all categories

### Reports

- `GET /api/reports/summary` - Get expense summary
  - Query params: `group_by` (total, category, month), `start_date`, `end_date`

### Example Request

**Add Expense:**
```json
POST /api/expenses
{
  "amount": 45.99,
  "date": "2025-10-04",
  "note": "Lunch with colleagues",
  "category": "food"
}
```

## 🎨 UI Features

- **Dashboard** - Overview with total spent and expense count
- **Expense Cards** - Beautiful card-based layout with category colors
- **Add/Edit Modals** - User-friendly forms for managing expenses
- **Filter Panel** - Filter by category and date range
- **Reports Modal** - View spending breakdown by category
- **Responsive Design** - Works seamlessly on desktop and mobile

README.md               # This file


## 🔧 Configuration

### Backend Configuration
- **Port:** 5000 (default)
- **Database:** SQLite (`expenses.db`)
- **CORS:** Enabled for all origins (development only)

### Frontend Configuration
- **Port:** 3000 (default)
- **API URL:** `http://localhost:5000/api`

## ✅ Validation Rules

- **Amount:** Must be a positive number
- **Date:** Must be a valid ISO date format (YYYY-MM-DD)
- **Category:** Must be one of the predefined categories
- **Note:** Optional, any text

## 🎯 Default Categories

1. **Food** - 🔴 Red
2. **Travel** - 🔵 Blue
3. **Bills** - 🟠 Orange
4. **Entertainment** - 🟣 Purple
5. **Shopping** - 🩷 Pink
6. **Health** - 🟢 Green
7. **Other** - ⚫ Gray

## 🐛 Error Handling

- Comprehensive validation on both frontend and backend
- User-friendly error messages
- Confirmation dialogs for destructive actions
- Network error handling with retry capabilities

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔒 Security Notes

This is a development version. For production use, consider:
- Adding authentication and authorization
- Implementing rate limiting
- Using environment variables for configuration
- Enabling HTTPS
- Restricting CORS to specific origins
- Adding input sanitization
- Implementing database migrations

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📄 License

This project is open source and available under the MIT License.



**Happy Expense Tracking! 💰📊**

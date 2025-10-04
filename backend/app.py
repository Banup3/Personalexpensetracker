from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os
from contextlib import contextmanager

app = Flask(__name__)
CORS(app)

DATABASE = 'expenses.db'

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_db():
    """Initialize the database with required tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Create expenses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                date TEXT NOT NULL,
                note TEXT,
                category TEXT DEFAULT 'other',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create categories table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                color TEXT DEFAULT '#6b7280'
            )
        ''')
        
        # Insert default categories
        default_categories = [
            ('food', '#ef4444'),
            ('travel', '#3b82f6'),
            ('bills', '#f59e0b'),
            ('entertainment', '#8b5cf6'),
            ('shopping', '#ec4899'),
            ('health', '#10b981'),
            ('other', '#6b7280')
        ]
        
        cursor.executemany(
            'INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)',
            default_categories
        )

def validate_expense(data, is_update=False):
    """Validate expense data"""
    errors = []
    
    if not is_update or 'amount' in data:
        if 'amount' not in data:
            errors.append('Amount is required')
        else:
            try:
                amount = float(data['amount'])
                if amount <= 0:
                    errors.append('Amount must be greater than 0')
            except (ValueError, TypeError):
                errors.append('Amount must be a valid number')
    
    if not is_update or 'date' in data:
        if 'date' not in data:
            errors.append('Date is required')
        else:
            try:
                datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                errors.append('Invalid date format. Use ISO format (YYYY-MM-DD)')
    
    if 'category' in data and data['category']:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT name FROM categories WHERE name = ?', (data['category'],))
            if not cursor.fetchone():
                errors.append(f"Invalid category: {data['category']}")
    
    return errors

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    """Get all expenses with optional filters"""
    try:
        category = request.args.get('category')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = 'SELECT * FROM expenses WHERE 1=1'
        params = []
        
        if category:
            query += ' AND category = ?'
            params.append(category)
        
        if start_date:
            query += ' AND date >= ?'
            params.append(start_date)
        
        if end_date:
            query += ' AND date <= ?'
            params.append(end_date)
        
        query += ' ORDER BY date DESC, id DESC'
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            expenses = [dict(row) for row in cursor.fetchall()]
        
        return jsonify({
            'success': True,
            'data': expenses,
            'count': len(expenses)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    """Add a new expense"""
    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debug log
        
        # Validate input
        errors = validate_expense(data)
        if errors:
            print(f"Validation errors: {errors}")  # Debug log
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        amount = float(data['amount'])
        date = data['date']
        note = data.get('note', '')
        category = data.get('category', 'other')
        
        print(f"Inserting: amount={amount}, date={date}, category={category}")  # Debug log
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO expenses (amount, date, note, category) VALUES (?, ?, ?, ?)',
                (amount, date, note, category)
            )
            expense_id = cursor.lastrowid
            
            cursor.execute('SELECT * FROM expenses WHERE id = ?', (expense_id,))
            expense = dict(cursor.fetchone())
        
        print(f"Successfully added expense with id: {expense_id}")  # Debug log
        
        return jsonify({
            'success': True,
            'message': 'Expense added successfully',
            'data': expense
        }), 201
    
    except Exception as e:
        print(f"Error adding expense: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full traceback
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/expenses/<int:expense_id>', methods=['GET'])
def get_expense(expense_id):
    """Get a single expense by ID"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM expenses WHERE id = ?', (expense_id,))
            expense = cursor.fetchone()
        
        if not expense:
            return jsonify({
                'success': False,
                'error': 'Expense not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': dict(expense)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    """Update an existing expense"""
    try:
        data = request.get_json()
        
        # Check if expense exists
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM expenses WHERE id = ?', (expense_id,))
            expense = cursor.fetchone()
        
        if not expense:
            return jsonify({
                'success': False,
                'error': 'Expense not found'
            }), 404
        
        # Validate input
        errors = validate_expense(data, is_update=True)
        if errors:
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        # Build update query
        fields = []
        params = []
        
        if 'amount' in data:
            fields.append('amount = ?')
            params.append(float(data['amount']))
        
        if 'date' in data:
            fields.append('date = ?')
            params.append(data['date'])
        
        if 'note' in data:
            fields.append('note = ?')
            params.append(data['note'])
        
        if 'category' in data:
            fields.append('category = ?')
            params.append(data['category'])
        
        if not fields:
            return jsonify({
                'success': False,
                'error': 'No fields to update'
            }), 400
        
        params.append(expense_id)
        query = f"UPDATE expenses SET {', '.join(fields)} WHERE id = ?"
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            cursor.execute('SELECT * FROM expenses WHERE id = ?', (expense_id,))
            updated_expense = dict(cursor.fetchone())
        
        return jsonify({
            'success': True,
            'message': 'Expense updated successfully',
            'data': updated_expense
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Delete an expense"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM expenses WHERE id = ?', (expense_id,))
            expense = cursor.fetchone()
        
        if not expense:
            return jsonify({
                'success': False,
                'error': 'Expense not found'
            }), 404
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
        
        return jsonify({
            'success': True,
            'message': 'Expense deleted successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM categories ORDER BY name')
            categories = [dict(row) for row in cursor.fetchall()]
        
        return jsonify({
            'success': True,
            'data': categories
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reports/summary', methods=['GET'])
def get_summary():
    """Get expense summary with grouping options"""
    try:
        group_by = request.args.get('group_by', 'total')  # total, category, month
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        base_query = 'SELECT * FROM expenses WHERE 1=1'
        params = []
        
        if start_date:
            base_query += ' AND date >= ?'
            params.append(start_date)
        
        if end_date:
            base_query += ' AND date <= ?'
            params.append(end_date)
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(base_query, params)
            expenses = [dict(row) for row in cursor.fetchall()]
        
        result = {
            'total': sum(exp['amount'] for exp in expenses),
            'count': len(expenses)
        }
        
        if group_by == 'category':
            categories = {}
            for exp in expenses:
                cat = exp['category']
                if cat not in categories:
                    categories[cat] = {'total': 0, 'count': 0}
                categories[cat]['total'] += exp['amount']
                categories[cat]['count'] += 1
            result['by_category'] = categories
        
        elif group_by == 'month':
            months = {}
            for exp in expenses:
                month = exp['date'][:7]  # YYYY-MM
                if month not in months:
                    months[month] = {'total': 0, 'count': 0}
                months[month]['total'] += exp['amount']
                months[month]['count'] += 1
            result['by_month'] = dict(sorted(months.items()))
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Expense Tracker API is running'
    }), 200

if __name__ == '__main__':
    init_db()
    print('Database initialized successfully')
    print('Starting Expense Tracker API...')
    app.run(debug=True, port=5000)

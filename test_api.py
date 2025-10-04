"""
Quick test script to verify the backend API is working
Run this after starting the Flask server
"""
import requests
import json

API_URL = 'http://localhost:5000/api'

def test_api():
    print("Testing Expense Tracker API...\n")
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f'{API_URL}/health')
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}\n")
    except Exception as e:
        print(f"   Error: {e}\n")
        return
    
    # Test 2: Get categories
    print("2. Testing categories endpoint...")
    try:
        response = requests.get(f'{API_URL}/categories')
        data = response.json()
        print(f"   Status: {response.status_code}")
        print(f"   Categories found: {len(data['data'])}")
        for cat in data['data']:
            print(f"      - {cat['name']} ({cat['color']})")
        print()
    except Exception as e:
        print(f"   Error: {e}\n")
    
    # Test 3: Add expense
    print("3. Testing add expense...")
    try:
        expense_data = {
            "amount": 25.50,
            "date": "2025-10-04",
            "note": "Test expense",
            "category": "food"
        }
        response = requests.post(f'{API_URL}/expenses', json=expense_data)
        data = response.json()
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(data, indent=2)}\n")
    except Exception as e:
        print(f"   Error: {e}\n")
    
    # Test 4: Get all expenses
    print("4. Testing get expenses...")
    try:
        response = requests.get(f'{API_URL}/expenses')
        data = response.json()
        print(f"   Status: {response.status_code}")
        print(f"   Expenses found: {data['count']}\n")
    except Exception as e:
        print(f"   Error: {e}\n")
    
    print("API test completed!")

if __name__ == '__main__':
    test_api()

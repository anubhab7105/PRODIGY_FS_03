from flask import Flask, jsonify, request, send_from_directory
import json
import os
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRODUCTS_FILE = os.path.join(BASE_DIR, 'data', 'products.json')
ORDERS_FILE = os.path.join(BASE_DIR, 'data', 'orders.json')
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

def load_products():
    try:
        with open(PRODUCTS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Sample products if file doesn't exist
        return [
            {"id": 1, "name": "Fresh Apples", "description": "Crisp and juicy organic apples from local farms", "price": 120, "image": "apples.jpg", "category": "fruits"},
            {"id": 2, "name": "Organic Tomatoes", "description": "Fresh vine-ripened tomatoes", "price": 80, "image": "tomatoes.jpg", "category": "vegetables"},
            {"id": 3, "name": "Farm Fresh Milk", "description": "Pure milk from grass-fed cows", "price": 55, "image": "milk.jpg", "category": "dairy"},
            {"id": 4, "name": "Whole Wheat Bread", "description": "Freshly baked whole wheat bread", "price": 45, "image": "bread.jpg", "category": "bakery"},
            {"id": 5, "name": "Bananas", "description": "Naturally ripened bananas", "price": 60, "image": "bananas.jpg", "category": "fruits"},
            {"id": 6, "name": "Fresh Carrots", "description": "Sweet and crunchy carrots", "price": 40, "image": "carrots.jpg", "category": "vegetables"},
            {"id": 7, "name": "Organic Eggs", "description": "Farm fresh eggs from free-range chickens", "price": 90, "image": "eggs.jpg", "category": "dairy"},
            {"id": 8, "name": "Croissants", "description": "Buttery, flaky croissants", "price": 35, "image": "croissants.jpg", "category": "bakery"},
            {"id": 9, "name": "Strawberries", "description": "Sweet and juicy strawberries", "price": 150, "image": "strawberries.jpg", "category": "fruits"}
        ]

def save_products(products):
    with open(PRODUCTS_FILE, 'w') as f:
        json.dump(products, f, indent=2)

def load_orders():
    try:
        with open(ORDERS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_orders(orders):
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders, f, indent=2)

# API Endpoints
@app.route('/api/products', methods=['GET'])
def get_products():
    products = load_products()
    return jsonify(products)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    products = load_products()
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    products = load_products()
    categories = list(set(p['category'] for p in products))
    return jsonify(categories)

@app.route('/api/cart', methods=['POST'])
def process_cart():
    data = request.json
    cart = data.get('cart', [])
    user_info = data.get('user_info', {})
    
    # Calculate total
    products = load_products()
    total = 0
    for item in cart:
        product = next((p for p in products if p['id'] == item['id']), None)
        if product:
            total += product['price'] * item['quantity']
    
    # Create order
    orders = load_orders()
    order_id = len(orders) + 1
    order = {
        "id": order_id,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "Processing",
        "items": cart,
        "user_info": user_info,
        "total": total
    }
    orders.append(order)
    save_orders(orders)
    
    return jsonify({
        "message": "Order placed successfully!",
        "order_id": order_id,
        "total": total
    })

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    orders = load_orders()
    order = next((o for o in orders if o['id'] == order_id), None)
    if order:
        return jsonify(order)
    return jsonify({"error": "Order not found"}), 404

@app.route('/api/orders', methods=['GET'])
def get_all_orders():
    orders = load_orders()
    return jsonify(orders)

# Serve frontend files
@app.route('/')
def serve_frontend():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    data_dir = os.path.join(BASE_DIR, 'data')
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    # Initialize files if they don't exist
    if not os.path.exists(PRODUCTS_FILE):
        save_products(load_products())
    if not os.path.exists(ORDERS_FILE):
        save_orders([])
    
    app.run(debug=True, port=5000)
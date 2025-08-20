from flask import Flask, jsonify, request
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory storage (since Vercel has read-only filesystem)
products = [
    {"id": 1, "name": "Fresh Apples", "description": "Crisp and juicy organic apples from local farms. Perfect for snacks or baking.", "price": 120, "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", "category": "fruits"},
    {"id": 2, "name": "Organic Tomatoes", "description": "Fresh vine-ripened tomatoes, perfect for salads and sauces.", "price": 80, "image": "https://images.unsplash.com/photo-1561136594-7f68413baa99?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", "category": "vegetables"},
    {"id": 3, "name": "Farm Fresh Milk", "description": "Pure, unadulterated milk from grass-fed cows. Pasteurized for safety.", "price": 55, "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", "category": "dairy"},
    {"id": 4, "name": "Whole Wheat Bread", "description": "Freshly baked whole wheat bread with no preservatives. Great for sandwiches.", "price": 45, "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", "category": "bakery"},
    {"id": 5, "name": "Bananas", "description": "Naturally ripened bananas, rich in potassium and energy.", "price": 60, "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", "category": "fruits"},
    {"id": 6, "name": "Carrots", "description": "Sweet and crunchy carrots, packed with vitamins and antioxidants.", "price": 40, "image": "https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", "category": "vegetables"},
    {"id": 7, "name": "Eggs", "description": "10 Farm fresh eggs from free-range chickens. Rich in protein and nutrients.", "price": 90, "image": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", "category": "dairy"},
    {"id": 8, "name": "Cake", "description": "Buttery, baked fresh daily. Perfect for birthdays.", "price": 350, "image": "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", "category": "bakery"}
]

orders = []

# API Endpoints
@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = list(set(p['category'] for p in products))
    return jsonify(categories)

@app.route('/api/cart', methods=['POST'])
def process_cart():
    data = request.json
    cart = data.get('cart', [])
    user_info = data.get('user_info', {})
    
    # Calculate total
    total = 0
    for item in cart:
        product = next((p for p in products if p['id'] == item['id']), None)
        if product:
            total += product['price'] * item['quantity']
    
    # Create order
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
    
    return jsonify({
        "message": "Order placed successfully!",
        "order_id": order_id,
        "total": total
    })

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = next((o for o in orders if o['id'] == order_id), None)
    if order:
        return jsonify(order)
    return jsonify({"error": "Order not found"}), 404

@app.route('/api/orders', methods=['GET'])
def get_all_orders():
    return jsonify(orders)

# Vercel serverless function handler
def handler(request):
    # This function will be called by Vercel's serverless environment
    from flask import Request, Response
    import json
    
    # Convert Vercel request to Flask request
    with app.request_context(request):
        try:
            # Dispatch the request
            response = app.full_dispatch_request()
            return {
                'statusCode': response.status_code,
                'headers': dict(response.headers),
                'body': response.get_data(as_text=True)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)})
            }
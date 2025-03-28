from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import hashlib

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'  # Change this if you have a different MySQL user
app.config['MYSQL_PASSWORD'] = ''  # Enter your MySQL password if any
app.config['MYSQL_DB'] = 'manufacturer_db'

mysql = MySQL(app)

# Signup Route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    company_name = data['company_name']
    role = data['role']
    email = data['email']
    password = hashlib.sha256(data['password'].encode()).hexdigest()  # Hashing for security

    cursor = mysql.connection.cursor()
    try:
        cursor.execute("INSERT INTO manufacturers (company_name, role, email, password) VALUES (%s, %s, %s, %s)",
                       (company_name, role, email, password))
        mysql.connection.commit()
        return jsonify({'message': 'Account created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()

# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = hashlib.sha256(data['password'].encode()).hexdigest()  # Hashing

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM manufacturers WHERE email=%s AND password=%s", (email, password))
    user = cursor.fetchone()
    cursor.close()

    if user:
        return jsonify({'message': 'Login successful', 'company_name': user[1]}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, render_template, request, jsonify
import csv

app = Flask(__name__)

# Function to check if the user already exists in the CSV
def user_exists(name, email):
    try:
        with open("log.csv", mode="r") as file:
            reader = csv.reader(file)
            for row in reader:
                if row[0] == name and row[1] == email:  # Check name and email match
                    return True
        return False
    except Exception as e:
        print(f"Error reading the CSV file: {e}")
        return False

# Function to check user credentials (login)
def validate_user(email, password):
    try:
        with open("log.csv", mode="r") as file:
            reader = csv.reader(file)
            for row in reader:
                if row[1] == email and row[2] == password:  # Check email and password match
                    return True
        return False
    except Exception as e:
        print(f"Error reading the CSV file: {e}")
        return False

# Signup route (Handle form submission)
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()  # Get JSON data
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    
    if not name or not email or not password:
        return jsonify({"success": False, "message": "Please fill all fields."}), 400

    # Check if the user already exists
    if user_exists(name, email):
        return jsonify({"success": False, "message": "User already exists."}), 400

    # Add user to CSV
    try:
        with open("log.csv", mode="a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow([name, email, password])
        return jsonify({"success": True, "message": "Account registered successfully!"}), 200
    except Exception as e:
        print(f"Error details: {e}")
        return jsonify({"success": False, "message": f"There was an error during registration: {e}"}), 500

# Login route (Validate credentials)
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()  # Get JSON data
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"success": False, "message": "Please enter both email and password."}), 400
    
    # Validate user credentials
    if validate_user(email, password):
        return jsonify({"success": True, "message": "Login successful!"}), 200
    return jsonify({"success": False, "message": "Invalid credentials, please try again."}), 400

# Home route
@app.route("/")
def home():
    return render_template("index.html")  # Make sure this is the HTML file for signup/login

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# In-memory user database for demonstration purposes
users_db = {}
tasks_db = {}

@app.route('/')
def home():
    if 'email' in session:
        return redirect(url_for('todo_list'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = users_db.get(email)
        if user and check_password_hash(user['password'], password):
            session['email'] = email
            return redirect(url_for('todo_list'))
        else:
            return 'Invalid login credentials'
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if password != confirm_password:
            return 'Passwords do not match'

        if email in users_db:
            return 'User already exists'

        # Hash the password before saving it
        users_db[email] = {'password': generate_password_hash(password)}
        session['email'] = email
        tasks_db[email] = []  # Initialize an empty task list for the user
        return redirect(url_for('todo_list'))
    
    return render_template('signup.html')

@app.route('/todo', methods=['GET', 'POST'])
def todo_list():
    if 'email' not in session:
        return redirect(url_for('login'))

    email = session['email']

    if request.method == 'POST':
        task = request.form['task']
        due_date = request.form['due_date']
        if task:
            tasks_db[email].append({'task': task, 'due_date': due_date, 'completed': False})

    tasks = tasks_db[email]
    return render_template('todo.html', tasks=tasks)

@app.route('/complete_task/<int:task_id>', methods=['POST'])
def complete_task(task_id):
    email = session['email']
    if email in tasks_db and 0 <= task_id < len(tasks_db[email]):
        tasks_db[email][task_id]['completed'] = True
        return jsonify({"success": "Task marked as completed"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    email = session['email']
    if email in tasks_db and 0 <= task_id < len(tasks_db[email]):
        tasks_db[email].pop(task_id)
        return jsonify({"success": "Task deleted"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/logout')
def logout():
    session.pop('email', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)

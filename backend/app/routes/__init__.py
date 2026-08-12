@app.route('/')
def home():
    return {"message": "Farm2Market API is running successfully!"}, 200
from app import create_app


app = create_app()

@app.route('/')
def home():
    return {"message": "Farm2Market API is running successfully!"}, 200

if __name__ == '__main__':
    print("Starting Farm2Market Flask Server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
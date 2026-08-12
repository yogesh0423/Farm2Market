from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting Farm2Market Flask Server...")
    app.run(debug=True, port=5000)
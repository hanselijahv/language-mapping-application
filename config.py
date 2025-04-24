 SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key'  # Change this!
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///./car_language_map.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAP_CENTER = [16.5000, 121.0000]  # Approximate center of Luzon
    DEFAULT_ZOOM = 6

    
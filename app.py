import os
from flask import Flask, render_template, jsonify, request
from flask_migrate import Migrate
import pandas as pd
import folium
from .models import db, Province, Municipality, Language, Dialect, MunicipalityLanguage, Phrase, ProvinceLanguage  # Import db from models.py
class Config:
    """Configuration settings for the Flask application."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///./car_language_map.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAP_CENTER = [16.5000, 121.0000]
    DEFAULT_ZOOM = 6

    

# Initialize Flask
app = Flask(__name__)
app.config.from_object(Config)

# Initialize SQLAlchemy and Migrate
db.init_app(app)  # Initialize the database with the app
migrate = Migrate(app, db)



# Function to load data from CSV files
def load_data():
    """Loads data from CSV files into the database."""
    data_folder = os.path.join(app.root_path, 'data')

    try:
        # Load provinces
        print("Loading provinces...")
        provinces_df = pd.read_csv(os.path.join(data_folder, 'provinces.csv'))
        for _, row in provinces_df.iterrows():
            province = Province(
                id=row['province_id'],
                name=row['province_name'],
                information=row['information']
            )
            db.session.add(province)
        db.session.commit()

        # Load municipalities
        print("Loading municipalities...")
        municipalities_df = pd.read_csv(os.path.join(data_folder, 'municipalities.csv'))
        for _, row in municipalities_df.iterrows():
            municipality = Municipality(
                id=row['municipality_id'],
                name=row['municipality_name'],
                information=row['information'],
                province_id=row['province_id']
            )
            db.session.add(municipality)
        db.session.commit()

        # Load languages
        print("Loading languages...")
        languages_df = pd.read_csv(os.path.join(data_folder, 'languages.csv'))
        for _, row in languages_df.iterrows():
            language = Language(
                id=row['language_id'],
                name=row['language_name']
            )
            db.session.add(language)
        db.session.commit()

        # Load dialects
        print("Loading dialects...")
        dialects_df = pd.read_csv(os.path.join(data_folder, 'dialects.csv'))
        for _, row in dialects_df.iterrows():
            dialect = Dialect(
                id=row['dialect_id'],
                name=row['dialect_name'],
                language_id=row['language_id']
            )
            db.session.add(dialect)
        db.session.commit()

        # Load municipality_languages
        print("Loading municipality-language relationships...")
        municipality_languages_df = pd.read_csv(os.path.join(data_folder, 'municipality_languages.csv'))
        for _, row in municipality_languages_df.iterrows():
            municipality_language = MunicipalityLanguage(
                municipality_id=row['municipality_id'],
                language_id=row['language_id'],
                dialect_id=row['dialect_id'] if 'dialect_id' in row else None
            )
            db.session.add(municipality_language)
        db.session.commit()

        # Load phrases
        print("Loading phrases...")
        phrases_df = pd.read_csv(os.path.join(data_folder, 'phrases.csv'))
        for _, row in phrases_df.iterrows():
            phrase = Phrase(
                content=row['content'],
                language_id=row['language_id']
            )
            db.session.add(phrase)
        db.session.commit()
        
        # Load province_languages
        print("Loading province-language relationships...")
        province_languages_df = pd.read_csv(os.path.join(data_folder, 'province_languages.csv'))
        for _, row in province_languages_df.iterrows():
            province_language = ProvinceLanguage(
                province_id=row['province_id'],
                language_id=row['language_id'],
                dialect_id=row['dialect_id'] if 'dialect_id' in row else None,
                percentage=row['percentage'] if 'percentage' in row else None
            )
            db.session.add(province_language)
        db.session.commit()

        print("Data loading complete.")
    except Exception as e:
        print(f"Error loading data: {e}")
        db.session.rollback()



# Create database tables (moved inside app context)
with app.app_context():
    db.create_all()
    # Check if the database is empty before loading data
    if not Province.query.first():
        load_data()

# Routes
@app.route('/')
def index():
    """Renders the main page with the Luzon map."""
    luzon_map = folium.Map(location=Config.MAP_CENTER, zoom_start=Config.DEFAULT_ZOOM)

    # Get province boundaries (replace with your GeoJSON or shapefile loading)
    # Example:
    # import geojson
    # with open(os.path.join(app.root_path, 'data', 'luzon_provinces.geojson')) as f:
    #     province_geo = geojson.load(f)
    #
    #  We'll use a simplified representation for now, since I don't have the GeoJSON data.
    province_geo = {
        "type": "FeatureCollection",
        "features": [
            {"type": "Feature", "properties": {"province_id": "01", "province_name": "Ilocos Region"}, "geometry": {"type": "Polygon", "coordinates": []}},
            {"type": "Feature", "properties": {"province_id": "02", "province_name": "Cagayan Valley"}, "geometry": {"type": "Polygon", "coordinates": []}},
            {"type": "Feature", "properties": {"province_id": "03", "province_name": "Central Luzon"}, "geometry": {"type": "Polygon", "coordinates": []}},
            {"type": "Feature", "properties": {"province_id": "04", "province_name": "CALABARZON"}, "geometry": {"type": "Polygon", "coordinates": []}},
            {"type": "Feature", "properties": {"province_id": "05", "province_name": "Bicol Region"}, "geometry": {"type": "Polygon", "coordinates": []}},
            {"type": "Feature", "properties": {"province_id": "CAR", "province_name": "Cordillera Administrative Region"}, "geometry": {"type": "Polygon", "coordinates": []}},
        ]
    }

    # Add provinces to the map (simplified, without actual geometries)
    for feature in province_geo['features']:
        province_id = feature['properties']['province_id']
        province_name = feature['properties']['province_name']
        # Use a simple circle marker as a placeholder for the province, since we don't have the geometry.
        # You would replace this with a Polygon layer in your actual implementation.

        # Get the first municipality of the province to approximate the province center
        first_municipality = Municipality.query.filter_by(province_id=province_id).first()
        if first_municipality:
            #  Replace this with actual coordinates if you have them in your database or a geo file.
            #  For now, we'll use a placeholder.
            location = Config.MAP_CENTER #  Use the Luzon center, or you can calculate a rough center.
        else:
             location = Config.MAP_CENTER

        folium.CircleMarker(
            location=location,
            radius=10,
            popup=province_name,
            fill_color='blue',
            color='blue',
            fill_opacity=0.2,
            opacity=0.4
        ).add_to(luzon_map)



    map_html = luzon_map.get_root().render()
    return render_template('index.html', luzon_map=map_html)


@app.route('/province/<province_id>')
def province_detail(province_id):
    """Retrieves detailed information about a specific province."""
    province = Province.query.get_or_404(province_id)
    municipalities = Municipality.query.filter_by(province_id=province_id).all()
    # Get the languages spoken in this province.
    province_languages = ProvinceLanguage.query.filter_by(province_id=province_id).all()

    # Get language details and dialect for each ProvinceLanguage entry
    languages_data = []
    for pl in province_languages:
        language = Language.query.get(pl.language_id)
        dialect = Dialect.query.get(pl.dialect_id) if pl.dialect_id else None
        languages_data.append({
            'language': language.to_dict() if language else None,
            'dialect': dialect.to_dict() if dialect else None,
            'percentage': pl.percentage
        })
    
    # Get the top languages.
    top_languages = []

    # Get phrases for the languages in this province.
    phrases = []
    for pl in province_languages:
        language_phrases = Phrase.query.filter_by(language_id=pl.language_id).limit(5).all()
        if language_phrases:
          language_name = Language.query.get(pl.language_id).name
          phrases.append({
              'language_name': language_name,
              'phrases': [p.to_dict() for p in language_phrases]
          })
    
    province_data = province.to_dict()
    municipality_data = [m.to_dict() for m in municipalities]

    return jsonify(
        province=province_data,
        municipalities=municipality_data,
        languages=languages_data,
        phrases=phrases
    )



@app.route('/municipality/<municipality_id>')
def municipality_detail(municipality_id):
    """Retrieves detailed information about a specific municipality."""
    municipality = Municipality.query.get_or_404(municipality_id)
    # Get the languages spoken in this municipality.
    municipality_languages = MunicipalityLanguage.query.filter_by(municipality_id=municipality_id).all()

     # Get language details and dialect for each MunicipalityLanguage entry
    languages_data = []
    for ml in municipality_languages:
        language = Language.query.get(ml.language_id)
        dialect = Dialect.query.get(ml.dialect_id) if ml.dialect_id else None
        languages_data.append({
            'language': language.to_dict() if language else None,
            'dialect': dialect.to_dict() if dialect else None
        })

    # Get phrases for the languages spoken in this municipality.
    phrases = []
    for ml in municipality_languages:
        language_phrases = Phrase.query.filter_by(language_id=ml.language_id).limit(5).all()
        if language_phrases:
            language_name = Language.query.get(ml.language_id).name
            phrases.append({
                'language_name': language_name,
                'phrases': [p.to_dict() for p in language_phrases]
            })

    municipality_data = municipality.to_dict()
    return jsonify(
        municipality=municipality_data,
        languages=languages_data,
        phrases=phrases
    )

@app.route('/search')
def search():
    """Searches for provinces or municipalities."""
    query = request.args.get('query', '').strip()
    results = []
    if query:
        provinces = Province.query.filter(Province.name.ilike(f'%{query}%')).all()
        municipalities = Municipality.query.filter(Municipality.name.ilike(f'%{query}%')).all()
        results = [
            {'type': 'province', 'id': p.id, 'name': p.name} for p in provinces
        ] + [
            {'type': 'municipality', 'id': m.id, 'name': m.name} for m in municipalities
        ]
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
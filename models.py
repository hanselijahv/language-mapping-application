from flask_sqlalchemy import SQLAlchemy
from flask import Flask

# Initialize SQLAlchemy (moved outside of Config)
db = SQLAlchemy()

class Province(db.Model):
    """Represents a province in Luzon."""
    __tablename__ = 'provinces'
    id = db.Column(db.String(2), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    information = db.Column(db.Text)
    municipalities = db.relationship('Municipality', backref='province', lazy=True)
    province_languages = db.relationship('ProvinceLanguage', backref='province', lazy=True)

    def __repr__(self):
        return f'<Province {self.name}>'

    def to_dict(self):
        """Convert province data to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'information': self.information,
        }


class Municipality(db.Model):
    """Represents a municipality in Luzon."""
    __tablename__ = 'municipalities'
    id = db.Column(db.String(4), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    information = db.Column(db.Text)
    province_id = db.Column(db.String(2), db.ForeignKey('provinces.id'), nullable=False)
    municipality_languages = db.relationship('MunicipalityLanguage', backref='municipality', lazy=True)

    def __repr__(self):
        return f'<Municipality {self.name}>'

    def to_dict(self):
        """Convert municipality data to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'information': self.information,
        }


class Language(db.Model):
    """Represents a language spoken in Luzon."""
    __tablename__ = 'languages'
    id = db.Column(db.String(3), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    dialects = db.relationship('Dialect', backref='language', lazy=True)
    municipality_languages = db.relationship('MunicipalityLanguage', backref='language', lazy=True)
    phrases = db.relationship('Phrase', backref='language', lazy=True)
    province_languages = db.relationship('ProvinceLanguage', backref='language', lazy=True)

    def __repr__(self):
        return f'<Language {self.name}>'

    def to_dict(self):
        """Convert language data to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
        }


class Dialect(db.Model):
    """Represents a dialect of a language."""
    __tablename__ = 'dialects'
    id = db.Column(db.String(4), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    language_id = db.Column(db.String(3), db.ForeignKey('languages.id'), nullable=False)
    municipality_languages = db.relationship('MunicipalityLanguage', backref='dialect', lazy=True)
    province_languages = db.relationship('ProvinceLanguage', backref='dialect', lazy=True)


    def __repr__(self):
        return f'<Dialect {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }

class MunicipalityLanguage(db.Model):
    """Represents the relationship between municipalities, languages, and dialects."""
    __tablename__ = 'municipality_languages'
    municipality_id = db.Column(db.String(4), db.ForeignKey('municipalities.id'), primary_key=True)
    language_id = db.Column(db.String(3), db.ForeignKey('languages.id'), primary_key=True)
    dialect_id = db.Column(db.String(4), db.ForeignKey('dialects.id'), nullable=True)

    def __repr__(self):
        return f'<MunicipalityLanguage {self.municipality_id}-{self.language_id}>'
    
    def to_dict(self):
        return {
            'municipality_id': self.municipality_id,
            'language_id': self.language_id,
            'dialect_id': self.dialect_id
        }

class Phrase(db.Model):
    """Represents a phrase in a specific language."""
    __tablename__ = 'phrases'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    language_id = db.Column(db.String(3), db.ForeignKey('languages.id'), nullable=False)

    def __repr__(self):
        return f'<Phrase {self.content[:20]}>'

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'language_id': self.language_id
        }

class ProvinceLanguage(db.Model):
    """Represents the relationship between provinces, languages, and dialects."""
    __tablename__ = 'province_languages'
    province_id = db.Column(db.String(2), db.ForeignKey('provinces.id'), primary_key=True)
    language_id = db.Column(db.String(3), db.ForeignKey('languages.id'), primary_key=True)
    dialect_id = db.Column(db.String(4), db.ForeignKey('dialects.id'), nullable=True)
    percentage = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return f'<ProvinceLanguage {self.province_id}-{self.language_id}>'

    def to_dict(self):
        return {
            'province_id': self.province_id,
            'language_id': self.language_id,
            'dialect_id': self.dialect_id,
            'percentage': self.percentage
        }

def init_app(app):
    db.init_app(app)
    
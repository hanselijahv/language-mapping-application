-- Create the provinces table
CREATE TABLE provinces (
    province_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT
);

-- Create the languages table
CREATE TABLE languages (
    language_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- Create the province_languages table (junction table)
CREATE TABLE province_languages (
    province_id INTEGER NOT NULL,
    language_id INTEGER NOT NULL,
    percentage REAL NOT NULL,
    FOREIGN KEY (province_id) REFERENCES provinces (province_id),
    FOREIGN KEY (language_id) REFERENCES languages (language_id),
    PRIMARY KEY (province_id, language_id)
);
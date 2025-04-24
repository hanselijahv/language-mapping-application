To run the Luzon Language Mapping application, follow these steps:Prerequisites:Python: Ensure you have Python 3.6 or later installed. You can check your Python version by running python --version or python3 --version in your terminal.Virtual Environment (Recommended): It's highly recommended to use a virtual environment to manage the project's dependencies. This keeps your project isolated from other Python projects. If you don't have virtualenv installed, you can install it using:pip install virtualenv
VS Code: You'll need VS Code.Steps:Set up the Virtual Environment (Recommended):Open a terminal in VS Code (View > Terminal).Create a virtual environment:python -m venv venv # Creates a virtual environment named "venv"
Activate the virtual environment:On Windows:venv\Scripts\activate
On macOS and Linux:source venv/bin/activate
Windows PowerShell Error:If you encounter the error: "File venv\Scripts\Activate.ps1 cannot be loaded because running scripts is disabled on this system," it means your PowerShell execution policy is too restrictive.To fix this, you can try the following:Run as Administrator: Open PowerShell as an administrator. You can do this by right-clicking on "PowerShell" in the Start menu and selecting "Run as administrator."Set Execution Policy: In the administrator PowerShell, run the following command:Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
This command sets the execution policy to RemoteSigned for the current user. This policy allows local scripts to run, but requires remotely downloaded scripts to be signed by a trusted publisher.  Choose the policy that best suits your security needs.  You can use Get-ExecutionPolicy to view the current setting.Activate: After setting the execution policy, try activating the virtual environment again: venv\Scripts\activate
Your terminal prompt should now show the name of the virtual environment (e.g., (venv) $).Install Dependencies:Navigate to the directory containing app.py (if you're not already there) in the terminal.Install the required Python packages using pip:pip install Flask Flask-SQLAlchemy Flask-Migrate pandas folium
This will install Flask, SQLAlchemy (for database interaction), Flask-Migrate (for database migrations), pandas (for reading CSV files), and folium (for creating the map).Set the Flask Application:You need to tell Flask which application to run. In the terminal, run this command:export FLASK_APP=app.py
(For Windows, use set FLASK_APP=app.py)Run the Application:Run the Flask development server:flask run
This will start the Flask development server. You should see output in your terminal indicating that the server is running (usually at http://127.0.0.1:5000/).Open the Application in Your Browser:Open your web browser and go to the address shown in the terminal (e.g., http://127.0.0.1:5000/). You should now see the Luzon Language Map.Important Notes:Database Setup: The application uses a SQLite database by default (car_language_map.db). The database file will be created in the same directory as your app.py file when the application is run for the first time. The load_data() function in app.py will populate the database with data from the CSV files in the data/ directory.Database Migrations: If you make changes to the models.py file (e.g., add or modify database tables), you'll need to use Flask-Migrate to apply those changes to the database. Here's the basic process:Initialize the migration repository (only needs to be done once):flask db init
Create a migration script:flask db migrate -m "Description of changes"
Apply the migration to the database:flask db upgrade
Error: SECRET_KEY: Flask will warn you about not having a SECRET_KEY set. It's crucial to set a secret key for security, especially if you deploy the application. The Config class in config.py shows how to set it using an environment variable or a default value. For development, you can add this line to your app.py:  ```
  app.config['SECRET_KEY'] = 'your_secret_key' # Change 'your_secret_key'
  ```

  ...or, preferably, set an environment variable: \*nix

  ```
  export SECRET_KEY="your_secret_key"
  ```

  Windows

  ```
  set SECRET_KEY="your_secret_key"
  ```

  Hardcoding the key in `app.py` is not recommended for production.
Running in VS Code: VS Code has excellent support for Flask. You can create a launch configuration (a launch.json file) to run the application directly from VS Code's debugger, which can be very convenient. See the Flask documentation and VS Code documentation for details.
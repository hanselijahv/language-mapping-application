##  Technologies Used

* HTML5
* CSS3
* JavaScript
* D3.js (for potential map manipulation/scaling - currently used for SVG injection)
* Chart.js (for displaying language pie charts)

##  Setup and Installation

1.  **Clone the Repository:** (If you are using version control like Git)

    ```bash
    git clone [repository_url]
    cd [repository_directory]
    ```

2.  **Prepare Data:**

    * **SVG Map (`images/philippines.svg`):**
        * Ensure that each `<path>` element representing a province has a `title` attribute containing the exact name of the province (e.g., `<path title="Ilocos Sur" ...>`).
        * Add the class `map-region` to each of these `<path>` elements to allow for JavaScript selection (e.g., `<path title="Ilocos Sur" class="map-region" ...>`).
    * **Province Data (`data/provinces.json`):**
        * Create a JSON file named `provinces.json` in the `data/` directory.
        * Structure the JSON data as an array of objects, where each object represents a province:

            ```json
            [
                {
                    "province": "Ilocos Sur",
                    "description": "...",
                    "languages": ["Ilocano", "Tagalog"],
                    "image": "ilocos_sur.jpg"
                },
                {
                    "province": "La Union",
                    "description": "...",
                    "languages": ["Ilocano", "Tagalog", "English"],
                    "image": "la_union.jpg"
                },
                // ... more provinces
            ]
            ```

        * Ensure that the `province` names in the JSON *exactly* match the `title` attributes in the SVG.
        * Place the province image files (e.g., `ilocos_sur.jpg`) in the `images/` directory.
3.  **Open `index.html`:**
    * Simply open the `index.html` file in a web browser. The map and province information should be displayed.

##  Key Functionality

* **Map Display:** The `js/scripts.js` file fetches the SVG map and injects it into the `#map-container` element.
* **Province Highlighting:** CSS styles are used to highlight provinces on hover and click.
* **Province Details:**
    * Clicking a province retrieves data from `provinces.json` and displays the province's name, description, image, and languages spoken.
    * A pie chart (created with Chart.js) visualizes the language data.
* **Hover Tooltips:** Province names are displayed in tooltips when the user hovers the mouse over a province.

##  Customization

* **Map Styles:** Modify the CSS in `css/styles.css` to change the appearance of the map, details panel, tooltips, etc.
* **Province Data:** Update the information in `data/provinces.json` to reflect accurate province details.  Add more provinces as needed.  Ensure corresponding images are in the `images/` folder.
* **Chart Appearance:** Customize the Chart.js pie chart in the `js/scripts.js` file by adjusting the chart options.  Refer to the Chart.js documentation: [https://www.chartjs.org/docs/latest/](https://www.chartjs.org/docs/latest/)
* **SVG Map:** You can replace the `philippines.svg` file with a different SVG map, but you will likely need to adjust the JavaScript and CSS to work with the new map's structure.

##  Potential Improvements

* **Search Functionality:** Implement a search bar to allow users to quickly find specific provinces.
* **Zoom and Pan:** Add zoom and pan capabilities to the map using D3.js or a mapping library.
* **Data Filtering:** Allow users to filter provinces based on language or other criteria.
* **Responsive Design:** Enhance the CSS to make the application fully responsive to different screen sizes.

##  Author

[Your Name or Organization]

##  License

[License Type, if applicable]

# Luzon Language Map

This project displays language information for the regions of Luzon, Philippines.

## Files

* `index.html`:  Main HTML file.
* `css/styles.css`:  CSS styling.
* `js/scripts.js`:  JavaScript logic.
* `data/regions.json`:  JSON data for regions and languages.
* `images/`:  Folder for region images.

## Setup

1.  Clone or download the project.
2.  Open `index.html` in a web browser.

## Important Notes

* **Map:** The current map implementation uses an image map.  It is highly recommended to replace this with an SVG (Scalable Vector Graphic) for better interactivity and scalability.  Libraries like D3.js or Leaflet.js can help with this.
* **Data:** The `data/regions.json` file contains placeholder data.  You **must** replace this with accurate information for all Luzon regions.  Ensure image paths in the JSON and HTML are correct.
* **Images:** Place region images in the `images/` folder and update the paths in `regions.json`.
* **Chart.js:** The project uses Chart.js for the pie chart.  It's included via CDN in `index.html`.
* **Region IDs:** Ensure the `data-region-id` attributes in the HTML map elements match the region IDs in `regions.json`.
* **Customization:** Modify `css/styles.css` to adjust the visual appearance.

## To Do

* Replace the image map with an interactive SVG map (e.g., using D3.js or Leaflet.js).
* Gather and input accurate data for all Luzon regions in `data/regions.json`.
* Provide real images for each region.
* Implement search functionality (if required).
* Add error handling and validation.
* Optimize for different screen sizes (responsive design).
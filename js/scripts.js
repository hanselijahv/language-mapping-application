document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map-container');
    const luzonMapSVG = document.getElementById('luzon-map'); // Directly select the SVG
    const regionDetailsDiv = document.getElementById('region-details');
    const regionNameElement = document.getElementById('region-name');
    const regionImageElement = document.getElementById('region-image');
    const regionDescriptionElement = document.getElementById('region-description');
    const languageListElement = document.getElementById('language-list');
    const languageChartElement = document.getElementById('language-chart');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    let regions; // Declare regions variable outside the fetch

    // Function to show a specific tab and hide others
    function showTab(tabId) {
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(tabId).classList.remove('hidden');
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
    }

    // Load the SVG file
    fetch('images/Philippines_location_map_(Luzon).svg')
        .then(response => response.text())
        .then(svgData => {
            mapContainer.innerHTML = svgData;

            // Ensure the SVG has the correct ID (if needed - your HTML already has it)
            // const luzonMapSVG = mapContainer.querySelector('svg');
            // luzonMapSVG.setAttribute('id', 'luzon-map');

            regions = luzonMapSVG.querySelectorAll('.map-region'); // Now we can select regions

            regions.forEach(region => {
                region.addEventListener('click', () => {
                    const regionId = region.id;
                    console.log(`Clicked: ${regionId}`);

                    // Clear selection
                    regions.forEach(r => r.classList.remove('map-region-selected'));
                    // Select this region
                    region.classList.add('map-region-selected');

                    // Fetch and display region data
                    fetchRegionData(regionId)
                        .then(regionData => {
                            regionDetailsDiv.classList.remove('hidden'); // Show details
                            regionNameElement.textContent = regionData.name;
                            regionImageElement.src = regionData.image; // Assuming you have an image path
                            regionDescriptionElement.textContent = regionData.description;

                            // Update language tab (adapt to your data structure)
                            languageListElement.innerHTML = regionData.languages.map(lang => `<li>${lang}</li>`).join('');
                            // You'll need to adapt the chart update logic here (using Chart.js)
                            // to display language distribution in the chart.
                        })
                        .catch(error => {
                            infoBox.textContent = `Error fetching data for ${regionId}`;
                            console.error(error);
                        });
                });
            });
        })
        .catch(error => {
            console.error('Error loading SVG:', error);
            infoBox.textContent = 'Error loading the map.';
        });

    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            showTab(tabId);
        });
    });

    // Dummy function for fetching region data (REPLACE THIS!)
    async function fetchRegionData(regionId) {
        // Replace this with your actual data fetching logic
        const response = await fetch('data/regions.json');
        const data = await response.json();
        const regionData = data.find(item => item.id === regionId);

        if (regionData) {
            return regionData; // Return the entire region data object
        } else {
            return { name: 'No Data', description: 'No data available for this region.', languages: [] };
        }
    }
});
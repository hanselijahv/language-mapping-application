document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map-container');
    const regionDetailsDiv = document.getElementById('region-details');
    const regionNameElement = document.getElementById('region-name');
    const regionImageElement = document.getElementById('region-image');
    const regionDescriptionElement = document.getElementById('region-description');
    const languageListElement = document.getElementById('language-list');
    const languageChartElement = document.getElementById('language-chart');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    let regions;

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

    // Fetch and insert the SVG
    fetch('images/philippines.svg') // Change this to the correct path to your SVG file
        .then(response => response.text())
        .then(svgData => {
            mapContainer.innerHTML = svgData;

            // Now that the SVG is in the DOM, we can select the paths
            regions = mapContainer.querySelectorAll('.map-region'); // Assuming you add this class in the SVG (see below)

            // Attach event listeners to the regions
            regions.forEach(region => {
                region.addEventListener('click', () => {
                    const regionId = region.id;
                    console.log(`Clicked: ${regionId}`);

                    // Clear selection
                    regions.forEach(r => r.classList.remove('map-region-selected'));
                    // Select this region
                    region.classList.add('map-region-selected');

                    fetchRegionData(regionId)
                        .then(regionData => {
                            regionDetailsDiv.classList.remove('hidden');
                            regionNameElement.textContent = regionData.name;
                            regionImageElement.src = regionData.image;
                            regionDescriptionElement.textContent = regionData.description;

                            languageListElement.innerHTML = regionData.languages.map(lang => `<li>${lang}</li>`).join('');
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
            mapContainer.textContent = 'Error loading the map.';
        });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            showTab(tabId);
        });
    });

    async function fetchRegionData(regionId) {
        // Replace this with your actual data fetching logic
        const response = await fetch('data/regions.json');
        const data = await response.json();
        const regionData = data.find(item => item.id === regionId);

        if (regionData) {
            return regionData;
        } else {
            return { name: 'No Data', description: 'No data available for this region.', languages: [] };
        }
    }
});
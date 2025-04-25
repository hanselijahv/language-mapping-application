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
    const tooltip = document.createElement('div');  // Create a tooltip element
    tooltip.classList.add('region-tooltip');
    document.body.appendChild(tooltip);

    let regions;
    let languageChartInstance = null;

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
    fetch('images/philippines.svg')
        .then(response => response.text())
        .then(svgData => {
            mapContainer.innerHTML = svgData;

            // Now that the SVG is in the DOM, we can select the paths
            regions = mapContainer.querySelectorAll('.map-region');

            // Attach event listeners to the regions
            regions.forEach(region => {
                region.addEventListener('click', () => {
                    // Get province name from the clicked path
                    const provinceName = region.getAttribute('title'); // Or region.id if you use IDs
                    console.log(`Clicked: ${provinceName}`);

                    // Clear selection
                    regions.forEach(r => r.classList.remove('map-region-selected'));
                    // Select this region
                    region.classList.add('map-region-selected');

                    fetchProvinceData(provinceName)
                        .then(provinceData => {
                            regionDetailsDiv.classList.remove('hidden');
                            regionNameElement.textContent = provinceData.province; // Display province name
                            regionImageElement.src = `/images/${provinceData.image}`;  // Explicit path here!
                            regionDescriptionElement.textContent = provinceData.description;

                            updateLanguageChart(provinceData.languages);
                            languageListElement.innerHTML = provinceData.languages.map(lang => `<li>${lang}</li>`).join('');
                        })
                        .catch(error => {
                            infoBox.textContent = `Error fetching data for ${provinceName}`;
                            console.error(error);
                        });
                });

                // **NEW: Hover functionality**
                region.addEventListener('mousemove', (e) => {
                    const provinceName = region.getAttribute('title');
                    tooltip.textContent = provinceName;
                    tooltip.style.left = `${e.pageX + 10}px`;  // Offset the tooltip slightly
                    tooltip.style.top = `${e.pageY - 20}px`;
                    tooltip.style.visibility = 'visible';
                });

                region.addEventListener('mouseleave', () => {
                    tooltip.style.visibility = 'hidden';
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

    async function fetchProvinceData(provinceName) {
        // Replace this with your actual data fetching logic
        const response = await fetch('data/provinces.json');
        const data = await response.json();
        const provinceData = data.find(item => item.province === provinceName);

        if (provinceData) {
            return provinceData;
        } else {
            return { province: 'No Data', description: 'No data available for this province.', languages: [] };
        }
    }

    function updateLanguageChart(languages) {
        const chartElement = document.getElementById('language-chart').getContext('2d');

        // Destroy the previous chart if it exists
        if (languageChartInstance) {
            languageChartInstance.destroy();
        }

        if (languages && languages.length > 0) {
            const languageCounts = {};
            languages.forEach(lang => {
                languageCounts[lang] = (languageCounts[lang] || 0) + 1;
            });

            const chartData = {
                labels: Object.keys(languageCounts),
                datasets: [{
                    data: Object.values(languageCounts),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            };

            languageChartInstance = new Chart(chartElement, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Languages Spoken'
                        }
                    }
                }
            });
        } else {
            // If no language data, clear the chart area
            chartElement.innerHTML = '<p>No language data available.</p>';
        }
    }
});
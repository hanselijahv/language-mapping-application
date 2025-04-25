const mapContainer = document.getElementById('map-container');
const regionDetails = document.getElementById('region-details');
const regionName = document.getElementById('region-name');
const regionImage = document.getElementById('region-image');
const regionDescription = document.getElementById('region-description');
const languageChart = document.getElementById('language-chart');
const languageList = document.getElementById('language-list');
const searchInput = document.getElementById('search-input');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

const svg = d3.select('#luzon-map'); // Select the SVG element

// Data for Luzon regions (Replace with your actual data and IDs from the SVG)
const regions = {
    "region1": {
        name: "Ilocos Region",
        image: "images/ilocos_region.jpg",
        description: "The Ilocos Region...",
        languages: {
            "Ilocano": 66,
            "Tagalog": 20,
            "Other": 14
        }
    },
    "region2": {
        name: "Cagayan Valley",
        image: "images/cagayan_valley.jpg",
        description: "Cagayan Valley...",
        languages: {
            "Ilocano": 50,
            "Tagalog": 25,
            "Ibanag": 15,
            "Other": 10
        }
    },
    // Add data for other regions
};

// Function to display region details
function showRegionDetails(regionId) {
    if (regions[regionId]) {
        const region = regions[regionId];
        regionName.textContent = region.name;
        regionImage.src = region.image;
        regionDescription.textContent = region.description;
        regionDetails.classList.remove('hidden');
        showTab('region-info');
        renderLanguageChart(regionId);
        renderLanguageList(regionId);
    } else {
        alert("Region details not found.");
    }
}

// Tab functionality
tabButtons.forEach(button => {
    button.addEventListener('click', function () {
        const tabName = this.dataset.tab;
        showTab(tabName);
    });
});

function showTab(tabName) {
    tabButtons.forEach(button => button.classList.remove('active'));
    tabContents.forEach(content => content.classList.add('hidden'));

    const selectedButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(tabName);

    selectedButton.classList.add('active');
    selectedContent.classList.remove('hidden');
}

// Function to render the language pie chart
function renderLanguageChart(regionId) {
    const region = regions[regionId];
    if (!region) return;

    const languageNames = Object.keys(region.languages);
    const languagePercentages = Object.values(region.languages);

    new Chart(languageChart, {
        type: 'pie',
        data: {
            labels: languageNames,
            datasets: [{
                data: languagePercentages,
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#8e44ad', '#2ecc71'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Languages Spoken',
                    padding: 10
                }
            }
        }
    });
}

// Function to render the language list
function renderLanguageList(regionId) {
    const region = regions[regionId];
    if (!region) return;

    languageList.innerHTML = '';
    for (const language in region.languages) {
        const percentage = region.languages[language];
        const listItem = document.createElement('li');
        listItem.textContent = `${language}: ${percentage}%`;
        languageList.appendChild(listItem);
    }
}

// Search functionality (basic)
searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    // Implement your search logic here
    console.log("Search term:", searchTerm);
});

// --- D3.js MAP INTERACTION ---

// Function to load and display the SVG map
function loadMap() {
    fetch('images\Philippines_location_map_(Luzon).svg') // Replace with the actual path to your SVG
        .then(response => response.text())
        .then(svgData => {
            document.getElementById('luzon-map').innerHTML = svgData;
            initializeMapInteraction();
        })
        .catch(error => console.error('Error loading SVG:', error));
}

// Function to set up map interactivity
function initializeMapInteraction() {
    d3.selectAll('#luzon-map path') // Select all paths (regions) in the SVG
        .on('mouseover', function (event) {
            d3.select(this).style('fill', 'lightblue'); // Highlight on hover
        })
        .on('mouseout', function (event) {
            d3.select(this).style('fill', '#f0f0f0'); // Reset fill
        })
        .on('click', function (event) {
            const regionId = d3.select(this).attr('id'); // Get the id of the clicked path
            if (regions[regionId]) {
                showRegionDetails(regionId);
            }
        });
}


loadMap();
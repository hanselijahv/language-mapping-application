document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        mapContainer: document.getElementById('map-container'),
        regionDetails: document.getElementById('region-details'),
        regionName: document.getElementById('region-name'),
        regionImage: document.getElementById('region-image'),
        regionDescription: document.getElementById('region-description'),
        languageList: document.getElementById('language-list'),
        tabButtons: document.querySelectorAll('.tab-button'),
        tabContents: document.querySelectorAll('.tab-content'),
        searchInput: document.getElementById('search-input'),
        searchResults: document.getElementById('search-results'),
        languageChart: document.getElementById('language-chart')?.getContext('2d')
    };

    // State variables
    const state = {
        regions: null,
        languageChartInstance: null,
        allProvinces: [],
        svg: null,
        currentTranslate: { x: 0, y: 0 },
        currentScale: 1
    };

    // Initialize tooltip
    const tooltip = document.createElement('div');
    tooltip.classList.add('region-tooltip');
    document.body.appendChild(tooltip);

    // Main initialization
    function init() {
        loadSVGMap();
        setupEventListeners();
    }

    // Load and setup the SVG map
    function loadSVGMap() {
        fetch('assets/images/svg/philippines.svg')
            .then(response => response.text())
            .then(svgData => {
                elements.mapContainer.innerHTML = svgData;
                state.svg = elements.mapContainer.querySelector('svg');
                state.svg.setAttribute('id', 'interactive-map');

                // Wait for next animation frame to ensure layout is updated
                requestAnimationFrame(() => {
                    centerMap();
                });

                setupMapInteractions();
                initializeSearch();
            })
            .catch(error => {
                console.error('Error loading SVG:', error);
                elements.mapContainer.textContent = 'Error loading the map.';
            });
    }


    // Setup all event listeners
    function setupEventListeners() {
        // Tab switching
        elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                showTab(tabId);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#search-container')) {
                elements.searchResults.style.display = 'none';
            }

            const isInsideMap = e.target.closest('#map-container');
            const isInsideDetails = e.target.closest('#map-details-container');
            const isInsideSearch = e.target.closest('#search-container');

            if (!isInsideMap && !isInsideDetails && !isInsideSearch) {
                clearSelection();
            }
        });
    }

    // Setup map interactions (panning, zooming)
    function setupMapInteractions() {
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };

        state.svg.style.cursor = 'grab';
        state.svg.setAttribute('transform', `translate(0, 0) scale(1)`);

        // Mouse down event for panning
        state.svg.addEventListener('mousedown', (e) => {
            isPanning = true;
            startPoint = { x: e.clientX, y: e.clientY };
            state.svg.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent text selection during drag
        });

        // Mouse move event for panning - optimized for smooth dragging
        document.addEventListener('mousemove', (e) => {
            if (!isPanning) return;

            const dx = e.clientX - startPoint.x;
            const dy = e.clientY - startPoint.y;
            const translateX = state.currentTranslate.x + dx;
            const translateY = state.currentTranslate.y + dy;

            // DIRECT transform update during dragging for maximum performance
            const bounded = getBoundedTranslation(translateX, translateY);
            state.svg.setAttribute('transform', `translate(${bounded.x}, ${bounded.y}) scale(${state.currentScale})`);
        });

        // Mouse up event to end panning
        document.addEventListener('mouseup', (e) => {
            if (isPanning) {
                // Update our state after dragging completes
                const transform = state.svg.getAttribute('transform');
                const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                if (match) {
                    state.currentTranslate.x = parseFloat(match[1]);
                    state.currentTranslate.y = parseFloat(match[2]);
                }
                isPanning = false;
                state.svg.style.cursor = 'grab';
            }
        });

        // Wheel event for zooming
        state.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            handleZoom(e);
        });

        // Setup region interactions
        setupRegionInteractions();
    }

    // Setup interactions for map regions
    function setupRegionInteractions() {
        state.regions = elements.mapContainer.querySelectorAll('.map-region');

        state.regions.forEach(region => {
            region.addEventListener('click', () => {
                const provinceName = region.getAttribute('title');
                selectRegion(provinceName);
            });

            region.addEventListener('mousemove', (e) => {
                showTooltip(e, region.getAttribute('title'));
            });

            region.addEventListener('mouseleave', () => {
                hideTooltip();
            });
        });
    }

    // Initialize search functionality
    async function initializeSearch() {
        try {
            const response = await fetch('data/provinces.json');
            const data = await response.json();
            state.allProvinces = data.map(item => item.province).sort();

            const alphabeticalIndex = createAlphabeticalIndex(state.allProvinces);

            setupSearchInputEvents(alphabeticalIndex);
        } catch (error) {
            console.error('Error initializing search:', error);
        }
    }

    // Create alphabetical index for provinces
    function createAlphabeticalIndex(provinces) {
        const index = {};
        provinces.forEach(province => {
            const firstLetter = province.charAt(0).toUpperCase();
            if (!index[firstLetter]) {
                index[firstLetter] = [];
            }
            index[firstLetter].push(province);
        });
        return index;
    }

    // Setup search input event listeners
    function setupSearchInputEvents(alphabeticalIndex) {
        elements.searchInput.addEventListener('focus', () => {
            renderAlphabeticalDropdown(alphabeticalIndex);
        });

        elements.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length === 0) {
                renderAlphabeticalDropdown(alphabeticalIndex);
                return;
            }

            const filtered = state.allProvinces.filter(province =>
                province.toLowerCase().includes(query)
            ).slice(0, 10);

            renderSearchResults(filtered);
        });

        elements.searchInput.addEventListener('keydown', (e) => {
            handleSearchNavigation(e);
        });
    }

    // Handle keyboard navigation in search results
    function handleSearchNavigation(e) {
        const items = elements.searchResults.querySelectorAll('.search-result-item');
        let current = elements.searchResults.querySelector('.highlighted');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!current) {
                items[0]?.classList.add('highlighted');
            } else {
                current.classList.remove('highlighted');
                const next = current.nextElementSibling || items[0];
                next.classList.add('highlighted');
                next.scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!current) {
                items[items.length - 1]?.classList.add('highlighted');
            } else {
                current.classList.remove('highlighted');
                const prev = current.previousElementSibling || items[items.length - 1];
                prev.classList.add('highlighted');
                prev.scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter' && current) {
            e.preventDefault();
            selectRegion(current.textContent);
        }
    }

    // Render alphabetical dropdown
    function renderAlphabeticalDropdown(alphabeticalIndex) {
        elements.searchResults.innerHTML = '';

        for (const [letter, provinces] of Object.entries(alphabeticalIndex)) {
            const letterGroup = document.createElement('div');
            letterGroup.innerHTML = `<div class="letter-header">${letter}</div>`;

            provinces.slice(0, 10).forEach(province => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = province;
                item.addEventListener('click', () => selectRegion(province));
                letterGroup.appendChild(item);
            });

            elements.searchResults.appendChild(letterGroup);
        }

        elements.searchResults.style.display = 'block';
    }

    // Render search results
    function renderSearchResults(results) {
        elements.searchResults.innerHTML = '';

        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.textContent = 'No results found';
            elements.searchResults.appendChild(noResults);
        } else {
            results.forEach(province => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = province;
                item.addEventListener('click', () => selectRegion(province));
                elements.searchResults.appendChild(item);
            });
        }

        elements.searchResults.style.display = 'block';
    }

    // Select a region and display its details
    function selectRegion(provinceName) {
        elements.searchResults.style.display = 'none';
        elements.searchInput.value = '';

        const region = Array.from(state.regions).find(r => r.getAttribute('title') === provinceName);
        if (region) {
            highlightRegion(region);
            centerViewOnRegion(region);
            loadAndDisplayProvinceData(provinceName);
        }
    }

    // Highlight the selected region
    function highlightRegion(region) {
        state.regions.forEach(r => r.classList.remove('map-region-selected'));
        region.classList.add('map-region-selected');
    }

    // Center view on the selected region
    function centerViewOnRegion(region) {
        const bbox = region.getBBox();
        const centerX = bbox.x + bbox.width/2;
        const centerY = bbox.y + bbox.height/2;

        const containerRect = elements.mapContainer.getBoundingClientRect();

        const viewportRatio = Math.min(containerRect.width, containerRect.height);
        const regionSize = Math.max(bbox.width, bbox.height);
        const targetScale = Math.min(3, Math.max(0.65, viewportRatio/(regionSize * 1.5)));

        const targetX = containerRect.width/2 - centerX * targetScale;
        const targetY = containerRect.height/2 - centerY * targetScale;
        const bounded = getBoundedTranslation(targetX, targetY, targetScale);

        // Smooth zoom animation (preserved)
        const zoomSteps = 10;
        const scaleStep = (targetScale - state.currentScale) / zoomSteps;
        const xStep = (bounded.x - state.currentTranslate.x) / zoomSteps;
        const yStep = (bounded.y - state.currentTranslate.y) / zoomSteps;

        let stepsCompleted = 0;
        const zoomInterval = setInterval(() => {
            if (stepsCompleted >= zoomSteps) {
                clearInterval(zoomInterval);
                return;
            }

            const newScale = state.currentScale + scaleStep;
            const newX = state.currentTranslate.x + xStep;
            const newY = state.currentTranslate.y + yStep;

            applyTransform(newX, newY, newScale);
            stepsCompleted++;
        }, 20);
    }

    // Load and display province data
    async function loadAndDisplayProvinceData(provinceName) {
        try {
            const provinceData = await fetchProvinceData(provinceName);

            elements.regionImage.style.display = 'none';
            elements.regionImage.src = `assets/images/jpg/${provinceData.image}`;
            elements.regionImage.onload = function () {
                this.style.display = 'block';
            };
            elements.regionImage.onerror = function () {
                this.style.display = 'none';
            };

            elements.regionDetails.classList.remove('hidden');
            elements.regionName.textContent = provinceData.province;
            elements.regionDescription.textContent = provinceData.description;

            renderLanguageList(provinceData.language_percentages || {});
            updateLanguageChart(provinceData.language_percentages);
        } catch (error) {
            console.error('Error loading province data:', error);
        }
    }
    // Render language list
    function renderLanguageList(languages) {
        elements.languageList.innerHTML = '';

        for (const [lang, percent] of Object.entries(languages)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${lang} - ${percent}%`;
            elements.languageList.appendChild(listItem);
        }

        document.getElementById('languages-heading').classList.remove('hidden');
    }

    // Fetch province data from JSON
    async function fetchProvinceData(provinceName) {
        const response = await fetch('data/provinces.json');
        const data = await response.json();
        const provinceData = data.find(item => item.province === provinceName);

        return provinceData || {
            province: 'No Data',
            description: 'No data available for this province.',
            languages: []
        };
    }

    // Update language chart
    function updateLanguageChart(languagePercentages) {
        if (state.languageChartInstance) {
            state.languageChartInstance.destroy();
        }

        if (!languagePercentages || Object.keys(languagePercentages).length === 0) {
            elements.languageChart.canvas.innerHTML = '<p>No language data available.</p>';
            return;
        }

        const chartData = {
            labels: Object.keys(languagePercentages),
            datasets: [{
                data: Object.values(languagePercentages),
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

        state.languageChartInstance = new Chart(elements.languageChart, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        onClick: () => {}
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    }

    // Handle zoom functionality
    // Updated handleZoom function (minimum zoom now 0.65)
    function handleZoom(e) {
        e.preventDefault();

        const containerRect = elements.mapContainer.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;
        const svgX = (mouseX - state.currentTranslate.x) / state.currentScale;
        const svgY = (mouseY - state.currentTranslate.y) / state.currentScale;

        const wheelDelta = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = 1.1;
        let newScale = state.currentScale * Math.pow(zoomFactor, wheelDelta);

        // Set zoom limits (0.65 to 3)
        newScale = Math.min(Math.max(newScale, 0.65), 3);

        const newTranslateX = mouseX - svgX * newScale;
        const newTranslateY = mouseY - svgY * newScale;
        const bounded = getBoundedTranslation(newTranslateX, newTranslateY, newScale);

        applyTransform(bounded.x, bounded.y, newScale);
    }



    // Apply transform to SVG
    function applyTransform(x, y, scale) {
        state.svg.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
        state.currentTranslate.x = x;
        state.currentTranslate.y = y;
        state.currentScale = scale;
    }

    // Update current transform from SVG attribute
    function updateCurrentTransform() {
        const transform = state.svg.getAttribute('transform');
        const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (match) {
            state.currentTranslate.x = parseFloat(match[1]);
            state.currentTranslate.y = parseFloat(match[2]);
        }
    }

    // Get bounded translation to keep map within container
    function getBoundedTranslation(translateX, translateY, scale = state.currentScale) {
        const containerRect = elements.mapContainer.getBoundingClientRect();
        const svgBBox = state.svg.getBBox();
        const scaledWidth = svgBBox.width * scale;
        const scaledHeight = svgBBox.height * scale;

        // Calculate maximum allowed translation
        const maxX = 0;
        const minX = containerRect.width - scaledWidth;
        const maxY = 0;
        const minY = containerRect.height - scaledHeight;

        // Only enforce horizontal boundaries if map is wider than container
        const allowHorizontalDrag = scaledWidth > containerRect.width;

        return {
            x: allowHorizontalDrag ? Math.min(maxX, Math.max(minX, translateX)) : translateX,
            y: Math.min(maxY, Math.max(minY, translateY))
        };
    }

    // Show tooltip
    function showTooltip(e, text) {
        tooltip.textContent = text;
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY - 20}px`;
        tooltip.style.visibility = 'visible';
    }

    // Hide tooltip
    function hideTooltip() {
        tooltip.style.visibility = 'hidden';
    }

    // Clear selection
    function clearSelection() {
        state.regions.forEach(r => r.classList.remove('map-region-selected'));
        elements.regionDetails.classList.add('hidden');
        hideTooltip();
    }

    // Show tab
    function showTab(tabId) {
        elements.tabContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== tabId);
        });

        elements.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });
    }

    function centerMap() {
        const containerRect = elements.mapContainer.getBoundingClientRect();
        const svgBBox = state.svg.getBBox();

        // Set initial zoom scale
        const initialScale = 0.65;
        const scaledWidth = svgBBox.width * initialScale;
        const scaledHeight = svgBBox.height * initialScale;

        // Center calculation
        const centerX = (containerRect.width - scaledWidth) / 2;
        const centerY = (containerRect.height - scaledHeight) / 2;

        // Apply transform
        state.currentTranslate = { x: centerX, y: centerY };
        state.currentScale = initialScale;
        state.svg.setAttribute('transform', `translate(${centerX}, ${centerY}) scale(${initialScale})`);
    }


    // Initialize the application
    init();
});
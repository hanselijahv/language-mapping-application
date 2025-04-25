document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map-container');
    const regionDetailsDiv = document.getElementById('region-details');
    const regionNameElement = document.getElementById('region-name');
    const regionImageElement = document.getElementById('region-image');
    const regionDescriptionElement = document.getElementById('region-description');
    const languageListElement = document.getElementById('language-list');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const tooltip = document.createElement('div');
    tooltip.classList.add('region-tooltip');
    document.body.appendChild(tooltip);
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    let regions;
    let languageChartInstance = null;
    let allProvinces = [];
    let svg; // Make svg accessible to search functions
    let currentTranslate = { x: 0, y: 0 };
    let currentScale = 1;

    function showTab(tabId) {
        tabContents.forEach(content => content.classList.add('hidden'));
        tabButtons.forEach(button => button.classList.remove('active'));
        document.getElementById(tabId).classList.remove('hidden');
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
    }

    async function initializeSearch() {
        const response = await fetch('data/provinces.json');
        const data = await response.json();
        allProvinces = data.map(item => item.province).sort();

        const alphabeticalIndex = {};
        allProvinces.forEach(province => {
            const firstLetter = province.charAt(0).toUpperCase();
            if (!alphabeticalIndex[firstLetter]) {
                alphabeticalIndex[firstLetter] = [];
            }
            alphabeticalIndex[firstLetter].push(province);
        });

        searchInput.addEventListener('focus', () => {
            renderAlphabeticalDropdown(alphabeticalIndex);
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length === 0) {
                renderAlphabeticalDropdown(alphabeticalIndex);
                return;
            }

            const filtered = allProvinces.filter(province =>
                province.toLowerCase().includes(query)
            ).slice(0, 10);

            renderSearchResults(filtered);
        });

        searchInput.addEventListener('keydown', (e) => {
            const items = searchResults.querySelectorAll('.search-result-item');
            let current = searchResults.querySelector('.highlighted');

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
        });
    }

    function renderAlphabeticalDropdown(alphabeticalIndex) {
        searchResults.innerHTML = '';

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

            searchResults.appendChild(letterGroup);
        }

        searchResults.style.display = 'block';
    }

    function renderSearchResults(results) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.textContent = 'No results found';
            searchResults.appendChild(noResults);
        } else {
            results.forEach(province => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = province;
                item.addEventListener('click', () => selectRegion(province));
                searchResults.appendChild(item);
            });
        }

        searchResults.style.display = 'block';
    }

    function selectRegion(provinceName) {
        searchResults.style.display = 'none';
        searchInput.value = ''; // Clear the search input after selection

        const region = Array.from(regions).find(r => r.getAttribute('title') === provinceName);
        if (region) {
            // Remove highlight from all regions first
            regions.forEach(r => r.classList.remove('map-region-selected'));

            // Add highlight to the selected region
            region.classList.add('map-region-selected');

            // Center the view on the region
            const bbox = region.getBBox();
            const centerX = bbox.x + bbox.width/2;
            const centerY = bbox.y + bbox.height/2;

            const containerRect = mapContainer.getBoundingClientRect();
            const targetX = containerRect.width/2 - centerX * currentScale;
            const targetY = containerRect.height/2 - centerY * currentScale;

            const bounded = getBoundedTranslation(svg, targetX, targetY, currentScale);
            svg.setAttribute('transform', `translate(${bounded.x}, ${bounded.y}) scale(${currentScale})`);
            currentTranslate.x = bounded.x;
            currentTranslate.y = bounded.y;

            // Load the province data
            fetchProvinceData(provinceName)
                .then(provinceData => {
                    regionDetailsDiv.classList.remove('hidden');
                    regionNameElement.textContent = provinceData.province;
                    regionImageElement.src = `/images/${provinceData.image}`;
                    regionDescriptionElement.textContent = provinceData.description;

                    languageListElement.innerHTML = '';
                    const languages = provinceData.language_percentages || {};

                    for (const [lang, percent] of Object.entries(languages)) {
                        const listItem = document.createElement('li');
                        listItem.textContent = `${lang} - ${percent}%`;
                        languageListElement.appendChild(listItem);
                    }

                    updateLanguageChart(languages);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    function getBoundedTranslation(svg, translateX, translateY, scale) {
        const containerRect = mapContainer.getBoundingClientRect();
        const svgBBox = svg.getBBox();
        const scaledWidth = svgBBox.width * scale;
        const scaledHeight = svgBBox.height * scale;
        const minX = containerRect.width - scaledWidth;
        const minY = containerRect.height - scaledHeight;

        return {
            x: Math.min(0, Math.max(minX, translateX)),
            y: Math.min(0, Math.max(minY, translateY))
        };
    }

    fetch('images/philippines.svg')
        .then(response => response.text())
        .then(svgData => {
            mapContainer.innerHTML = svgData;
            svg = mapContainer.querySelector('svg');
            svg.setAttribute('id', 'interactive-map');

            let isPanning = false;
            let startPoint = { x: 0, y: 0 };
            currentTranslate = { x: 0, y: 0 };
            currentScale = 1;

            svg.style.cursor = 'grab';
            svg.setAttribute('transform', `translate(0, 0) scale(1)`);

            svg.addEventListener('mousedown', (e) => {
                isPanning = true;
                startPoint = { x: e.clientX, y: e.clientY };
                svg.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isPanning) return;
                const dx = e.clientX - startPoint.x;
                const dy = e.clientY - startPoint.y;
                const translateX = currentTranslate.x + dx;
                const translateY = currentTranslate.y + dy;

                const bounded = getBoundedTranslation(svg, translateX, translateY, currentScale);
                svg.setAttribute('transform', `translate(${bounded.x}, ${bounded.y}) scale(${currentScale})`);
            });

            document.addEventListener('mouseup', () => {
                if (isPanning) {
                    const transform = svg.getAttribute('transform');
                    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                    if (match) {
                        currentTranslate.x = parseFloat(match[1]);
                        currentTranslate.y = parseFloat(match[2]);
                    }
                    isPanning = false;
                    svg.style.cursor = 'grab';
                }
            });

            svg.addEventListener('wheel', (e) => {
                e.preventDefault();
                const containerRect = mapContainer.getBoundingClientRect();
                const mouseX = e.clientX - containerRect.left;
                const mouseY = e.clientY - containerRect.top;
                const svgX = (mouseX - currentTranslate.x) / currentScale;
                const svgY = (mouseY - currentTranslate.y) / currentScale;

                const wheelDelta = e.deltaY < 0 ? 1 : -1;
                const zoomFactor = 1.1;
                let newScale = currentScale * Math.pow(zoomFactor, wheelDelta);
                newScale = Math.min(Math.max(newScale, 1), 3);

                const newTranslateX = mouseX - svgX * newScale;
                const newTranslateY = mouseY - svgY * newScale;
                const bounded = getBoundedTranslation(svg, newTranslateX, newTranslateY, newScale);

                svg.setAttribute('transform', `translate(${bounded.x}, ${bounded.y}) scale(${newScale})`);
                currentTranslate.x = bounded.x;
                currentTranslate.y = bounded.y;
                currentScale = newScale;
            });

            regions = mapContainer.querySelectorAll('.map-region');

            regions.forEach(region => {
                region.addEventListener('click', () => {
                    const provinceName = region.getAttribute('title');
                    selectRegion(provinceName);
                });

                region.addEventListener('mousemove', (e) => {
                    const provinceName = region.getAttribute('title');
                    tooltip.textContent = provinceName;
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY - 20}px`;
                    tooltip.style.visibility = 'visible';
                });

                region.addEventListener('mouseleave', () => {
                    tooltip.style.visibility = 'hidden';
                });
            });

            document.addEventListener('click', (e) => {
                const isInsideMap = e.target.closest('#map-container');
                const isInsideDetails = e.target.closest('#map-details-container');
                const isInsideSearch = e.target.closest('#search-container');

                if (!isInsideMap && !isInsideDetails && !isInsideSearch) {
                    regions.forEach(r => r.classList.remove('map-region-selected'));
                    regionDetailsDiv.classList.add('hidden');
                    tooltip.style.visibility = 'hidden';
                }
            });

            // Initialize search after SVG is loaded
            initializeSearch();
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
        const response = await fetch('data/provinces.json');
        const data = await response.json();
        const provinceData = data.find(item => item.province === provinceName);

        if (provinceData) {
            return provinceData;
        } else {
            return { province: 'No Data', description: 'No data available for this province.', languages: [] };
        }
    }

    function updateLanguageChart(languagePercentages) {
        const chartElement = document.getElementById('language-chart').getContext('2d');

        if (languageChartInstance) {
            languageChartInstance.destroy();
        }

        if (languagePercentages && Object.keys(languagePercentages).length > 0) {
            const chartData = {
                labels: Object.keys(languagePercentages),
                datasets: [
                    {
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
                    }
                ]
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
                            onClick: () => {}
                        },
                        title: {
                            display: false
                        }
                    }
                }
            });
        } else {
            chartElement.innerHTML = '<p>No language data available.</p>';
        }
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-container')) {
            searchResults.style.display = 'none';
        }
    });
});
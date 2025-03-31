let bikes = [];
let selectedBike = JSON.parse(localStorage.getItem('selectedBike')) || null;

// Funcio que carrega les dades de les motos
async function loadBikeData() {
    try {
        const response = await fetch('data/motos.json');
        const data = await response.json();
        bikes = data.bikes;
        init();
    } catch (error) {
        console.error('Error carregant dades:', error);
    }
}

// Funcio que inicialitza el slider de preu
function initializePriceSlider() {
    const prices = bikes.map(bike => bike.minPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const priceFilter = document.getElementById('priceFilter');
    const priceValue = document.getElementById('priceValue');

    priceFilter.min = minPrice;
    priceFilter.max = maxPrice;
    priceFilter.value = maxPrice;
    priceValue.textContent = maxPrice;

    priceFilter.addEventListener('input', () => {
        priceValue.textContent = priceFilter.value;
        displayBikes();
    });
}

// Funcio que filtra les motos segons els filtres
function filterBikes() {
    const modelSearch = document.getElementById('modelSearch').value.toLowerCase();
    const colorFilter = document.getElementById('colorFilter').value;
    const maxPrice = document.getElementById('priceFilter').value;

    return bikes.filter(bike => {
        const matchesModel = bike.model.toLowerCase().includes(modelSearch);
        const matchesColor = !colorFilter || bike.colors.some(c => c.name === colorFilter);
        const matchesPrice = !maxPrice || bike.minPrice <= parseInt(maxPrice);

        return matchesModel && matchesColor && matchesPrice;
    });
}

// Funcio que mostra les motos
function displayBikes() {
    const bikeList = document.getElementById('bikeList');
    const filteredBikes = filterBikes();
    
    bikeList.innerHTML = filteredBikes.map(bike => `
        <div class="bike-card ${selectedBike?.model === bike.model ? 'selected' : ''}" 
             onclick="selectBike('${bike.model}')">
            <h3>${bike.model}</h3>
            <p>Preu base: ${bike.basePrice}€</p>
            <p>Disponible en ${bike.colors.length} colors</p>
        </div>
    `).join('');
}

// Funcio que selecciona una moto
function selectBike(model) {
    selectedBike = bikes.find(b => b.model === model);
    displayConfiguration();
    displayBikes();
    // Guardar configuracio de la moto seleccionada al localStorage
    localStorage.setItem('Bike' + model, JSON.stringify(selectedBike));

    // Fer scroll fins a la seccio de configuracio
    const configSection = document.getElementById('configuration');
    configSection.scrollIntoView({ behavior: 'smooth' });
}

// Funcio que mostra la configuracio de la moto seleccionada
function displayConfiguration() {
    const configSection = document.getElementById('configuration');
    const colorSelect = document.getElementById('colorSelect');
    
    if(!selectedBike) {
        configSection.style.display = 'none';
        return;
    }

    configSection.style.display = 'block';
    colorSelect.innerHTML = selectedBike.colors.map(color => `
        <option value="${color.name}">${color.name} (+${color.price}€)</option>
    `).join('');

    updateConfiguration();
}

// Funcio que actualitza la configuracio de la moto seleccionada
function updateConfiguration() {
    if(!selectedBike) return;
    
    const colorName = document.getElementById('colorSelect').value;
    const selectedColor = selectedBike.colors.find(c => c.name === colorName);
    
    document.getElementById('configuredImage').src = selectedColor.image;
    document.getElementById('finalPrice').textContent = 
        selectedBike.basePrice + selectedColor.price;
}

// Funcio que inicialitza la pagina
function init() {
    // Carregar colors unics al filtre
    const uniqueColors = [...new Set(bikes.flatMap(b => b.colors.map(c => c.name)))];
    const colorFilter = document.getElementById('colorFilter');
    uniqueColors.forEach(color => {
        colorFilter.innerHTML += `<option value="${color}">${color}</option>`;
    });

    // Inicialitzar el slider de preu
    initializePriceSlider();

    // Afegir event listeners
    document.querySelectorAll('.filters input, .filters select').forEach(element => {
        element.addEventListener('input', displayBikes);
    });

    document.getElementById('colorSelect').addEventListener('change', updateConfiguration);

    if (selectedBike) selectBike(selectedBike.model);
    displayBikes();
}

// Funcio per carregar pagines dinamicament
async function loadPage(page) {
    try {
        const response = await fetch(`./pages/${page}`);
        const content = await response.text();
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = content;

        // Executar scripts dins del contingut carregat
        const scripts = mainContent.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript).parentNode.removeChild(newScript);
        });

        // Si la pagina carregada es home.html, inicialitzar les dades de les motos
        if (page === 'home.html') {
            loadBikeData();
        }
    } catch (error) {
        console.error('Error carregant la pagina:', error);
        document.getElementById('mainContent').innerHTML = '<p>Error carregant el contingut.</p>';
    }
}

// Carregar la pagina inicial
document.addEventListener('DOMContentLoaded', () => loadPage('home.html'));
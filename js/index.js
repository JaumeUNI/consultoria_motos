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
        console.error('Error cargando datos:', error);
    }
}

// Funcio que genera les opcions del filtre de preu
function generatePriceFilterOptions() {
    const prices = bikes.map(bike => bike.minPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const step = 5000; // Defineix el rang de cada opció

    const priceFilter = document.getElementById('priceFilter');
    priceFilter.innerHTML = '<option value="">Tots els preus</option>';

    for (let i = minPrice; i < maxPrice; i += step) {
        const rangeStart = i;
        const rangeEnd = i + step - 1;
        priceFilter.innerHTML += `<option value="${rangeStart}-${rangeEnd}">${rangeStart}€ - ${rangeEnd}€</option>`;
    }

    priceFilter.innerHTML += `<option value=">${maxPrice}">Més de ${maxPrice}€</option>`;
}

// Funcio que filtra les motos segons els filtres
function filterBikes() {
    const modelSearch = document.getElementById('modelSearch').value.toLowerCase();
    const colorFilter = document.getElementById('colorFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;

    return bikes.filter(bike => {
        const matchesModel = bike.model.toLowerCase().includes(modelSearch);
        const matchesColor = !colorFilter || bike.colors.some(c => c.name === colorFilter);
        const matchesPrice = (() => {
            if (!priceFilter) return true;
            const [min, max] = priceFilter.includes('<') 
                ? [0, parseInt(priceFilter.slice(1))]
                : priceFilter.includes('>') 
                ? [parseInt(priceFilter.slice(1)), Infinity]
                : priceFilter.split('-').map(Number);
            return bike.minPrice >= min && bike.minPrice <= max;
        })();

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
// LocalStorage guardi info config de cada moto que es cliqui per separat (Bike(n))
    localStorage.setItem('Bike'+model, JSON.stringify(selectedBike));

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
    // Cargar colores únicos en el filtro
    const uniqueColors = [...new Set(bikes.flatMap(b => b.colors.map(c => c.name)))];
    const colorFilter = document.getElementById('colorFilter');
    uniqueColors.forEach(color => {
        colorFilter.innerHTML += `<option value="${color}">${color}</option>`;
    });

    // Generar opcions del filtre de preu
    generatePriceFilterOptions();

    // Event listeners
    document.querySelectorAll('.filters input, .filters select').forEach(element => {
        element.addEventListener('input', displayBikes);
    });

    document.getElementById('colorSelect').addEventListener('change', updateConfiguration);

    if(selectedBike) selectBike(selectedBike.model);
    displayBikes();
}

// Funció per carregar pàgines dinàmicament
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

        // Si la pàgina carregada és home.html, inicialitzar les dades de les motos
        if (page === 'home.html') {
            loadBikeData();
        }
    } catch (error) {
        console.error('Error carregant la pàgina:', error);
        document.getElementById('mainContent').innerHTML = '<p>Error carregant el contingut.</p>';
    }
}

// Carregar la pàgina inicial
document.addEventListener('DOMContentLoaded', () => loadPage('home.html'));
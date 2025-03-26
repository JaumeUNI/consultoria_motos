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

// Funcio que filtra les motos segons els filtres
function filterBikes() {
    const modelSearch = document.getElementById('modelSearch').value.toLowerCase();
    const colorFilter = document.getElementById('colorFilter').value;
    const maxPrice = document.getElementById('maxPrice').value;

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
// LocalStorage guardi info config de cada moto que es cliqui per separat (Bike(n))
    localStorage.setItem('Bike'+model, JSON.stringify(selectedBike));

// Todo    
// LocalStorage guardi el color seleccionat de la configuració de la moto seleccionada
    colorbike = document.getElementById('colorSelect').value;
    localStorage.setItem('colorbike', JSON.stringify(colorbike));

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

    // Event listeners
    document.querySelectorAll('.filters input, .filters select').forEach(element => {
        element.addEventListener('input', displayBikes);
    });

    document.getElementById('colorSelect').addEventListener('change', updateConfiguration);

    if(selectedBike) selectBike(selectedBike.model);
    displayBikes();
}

// Iniciar la carga de datos
loadBikeData();
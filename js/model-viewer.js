// Seleccionar el elemento <model-viewer>
const modelViewer = document.querySelector('model-viewer');

// Cambiar dinámicamente el modelo 3D
function changeModel(modelPath) {
    modelViewer.setAttribute('src', modelPath);
}

// Ejemplo: Cambiar el modelo al hacer clic en un botón
document.getElementById('changeModelButton')?.addEventListener('click', () => {
    const newModelPath = './models/another-bike-model.glb'; // Ruta del nuevo modelo
    changeModel(newModelPath);
});

// Mostrar un mensaje cuando el modelo esté completamente cargado
modelViewer.addEventListener('load', () => {
    console.log('El model 3D s\'ha carregat correctament.');
});

// Manejar errores de carga del modelo
modelViewer.addEventListener('error', (event) => {
    console.error('Error carregant el model 3D:', event);
});
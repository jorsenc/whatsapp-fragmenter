/**
 * WhatsApp Fragmenter - Frontend JavaScript
 */

let currentUploadId = null;
let currentFragments = [];

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const optionsSection = document.getElementById('optionsSection');
const processingSection = document.getElementById('processingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const fileInfo = document.getElementById('fileInfo');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const errorRetryBtn = document.getElementById('errorRetryBtn');

/**
 * Initialize event listeners
 */
function init() {
  // Drag and drop
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);
  uploadArea.addEventListener('click', () => fileInput.click());

  // File input
  fileInput.addEventListener('change', handleFileSelect);

  // Buttons
  downloadBtn.addEventListener('click', downloadFragments);
  resetBtn.addEventListener('click', resetForm);
  errorRetryBtn.addEventListener('click', resetForm);

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Modal close on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.add('active');
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove('active');
}

/**
 * Handle drop
 */
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove('active');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect({ target: fileInput });
  }
}

/**
 * Handle file selection
 */
async function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.txt')) {
    showError('Por favor sube un archivo .txt');
    return;
  }

  try {
    const content = await readFile(file);

    // Upload file
    await uploadFile(file.name, content);

  } catch (error) {
    showError(`Error al leer archivo: ${error.message}`);
  }
}

/**
 * Read file content
 */
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsText(file);
  });
}

/**
 * Upload file to server
 */
async function uploadFile(filename, content) {
  try {
    showSection('uploadSection');

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filename, content })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al subir archivo');
    }

    // Store upload ID
    currentUploadId = data.uploadId;

    // Display file info
    displayFileInfo({
      filename: data.filename,
      size: formatBytes(data.size),
      format: data.format,
      messageCount: data.messageCount.toLocaleString(),
      uniqueUsers: data.uniqueUsers
    });

    // Show options section
    showSection('optionsSection');

  } catch (error) {
    showError(`Error al subir: ${error.message}`);
  }
}

/**
 * Display file info
 */
function displayFileInfo(info) {
  document.getElementById('fileName').textContent = info.filename;
  document.getElementById('fileSize').textContent = info.size;
  document.getElementById('detectedFormat').textContent = info.format;
  document.getElementById('messageCount').textContent = info.messageCount;
  document.getElementById('uniqueUsers').textContent = info.uniqueUsers;
  fileInfo.style.display = 'block';
}

/**
 * Process uploaded file
 */
async function processFile() {
  if (!currentUploadId) {
    showError('No hay archivo cargado');
    return;
  }

  try {
    showSection('processingSection');

    const options = {
      skipSystem: document.getElementById('skipSystem').checked,
      skipMedia: document.getElementById('skipMedia').checked
    };

    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uploadId: currentUploadId, options })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al procesar');
    }

    // Store fragments
    currentFragments = data.files;

    // Show results
    displayResults(data);
    showSection('resultsSection');

  } catch (error) {
    showError(`Error al procesar: ${error.message}`);
  }
}

/**
 * Display results
 */
function displayResults(data) {
  const summary = document.getElementById('resultsSummary');
  summary.innerHTML = `
    <p>✅ Procesamiento completado exitosamente</p>
    <p><strong>${data.fragmentCount}</strong> fragmentos generados de <strong>${data.totalMessages.toLocaleString()}</strong> mensajes</p>
    <p>📁 Archivos guardados en: <code>${data.outputDir}</code></p>
  `;

  const fragmentsList = document.getElementById('fragmentsList');
  fragmentsList.innerHTML = '';

  data.files.forEach(file => {
    const item = document.createElement('div');
    item.className = 'fragment-item';
    item.innerHTML = `
      <div class="fragment-info">
        <div class="fragment-name">📄 ${file.name}</div>
        <div class="fragment-details">Mes: ${file.month}</div>
      </div>
      <div class="fragment-stats">
        <div class="fragment-stat">${file.lines.toLocaleString()} mensajes</div>
        <div class="fragment-stat">${file.size} KB</div>
      </div>
    `;
    fragmentsList.appendChild(item);
  });
}


/**
 * Download single file
 */
async function downloadFile(filename) {
  const url = `/api/download/${currentUploadId}/${filename}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error descargando ${filename}`);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(blobUrl);
  document.body.removeChild(a);
}

/**
 * Reset form
 */
function resetForm() {
  currentUploadId = null;
  currentFragments = [];
  fileInput.value = '';
  fileInfo.style.display = 'none';
  document.getElementById('skipSystem').checked = true;
  document.getElementById('skipMedia').checked = true;
  showSection('uploadSection');
  uploadArea.classList.remove('active');
}

/**
 * Show section
 */
function showSection(sectionId) {
  const sections = [
    'uploadSection',
    'optionsSection',
    'processingSection',
    'resultsSection',
    'errorSection'
  ];

  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      section.style.display = id === sectionId ? 'block' : 'none';
    }
  });

  // Add process button to options section
  if (sectionId === 'optionsSection') {
    const optionsCard = document.querySelector('.options-card');
    if (!document.getElementById('processBtn')) {
      const btn = document.createElement('button');
      btn.id = 'processBtn';
      btn.className = 'btn btn-primary';
      btn.textContent = '✨ Procesar Archivo';
      btn.onclick = processFile;
      optionsCard.parentElement.appendChild(btn);
    }
  }
}

/**
 * Show error
 */
function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  showSection('errorSection');
}

/**
 * Show help modal
 */
function showHelp() {
  document.getElementById('helpModal').classList.add('active');
}

/**
 * Show about modal
 */
function showAbout() {
  document.getElementById('aboutModal').classList.add('active');
}

/**
 * Close modal
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

/**
 * Close all modals
 */
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

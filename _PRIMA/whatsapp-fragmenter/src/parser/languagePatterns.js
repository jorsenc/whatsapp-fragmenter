/**
 * Language Patterns for WhatsApp Format Detection
 * Supports: Spanish, English, Portuguese, French, German, Italian
 */

export const LANGUAGE_PATTERNS = {
  // Spanish: [15/1/26, 14:32:45]
  'es-ES': {
    name: 'Español',
    dateFormat: 'DD/M/YY',
    timeFormat: 'HH:MM:SS',
    regex: /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
    detectionPattern: /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
    systemMessagePatterns: [
      /entró al grupo/i,
      /salió del grupo/i,
      /cambió el nombre/i,
      /cambió la foto/i,
      /cambió la descripción/i,
      /cambió la configuración/i,
      /cambió los datos del grupo/i,
      /llamada perdida/i,
      /creó el grupo/i,
      /agregó a/i,
      /eliminó a/i,
      /dejó el grupo/i,
      /fue agregado/i,
      /bloqueaste a/i,
      /desbloqueaste a/i,
      /los mensajes y las llamadas están cifrados/i,
      /mensajes cifrados/i,
      /solo las personas en este chat/i
    ]
  },

  // English: [1/15/26, 2:32:45 PM]
  'en-US': {
    name: 'English',
    dateFormat: 'M/DD/YY',
    timeFormat: 'H:MM:SS AM/PM',
    regex: /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2}\s(?:AM|PM))\]\s([^:]+):\s(.+)$/,
    detectionPattern: /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\s(?:AM|PM)\]/,
    systemMessagePatterns: [
      /has left/i,
      /created group/i,
      /added/i,
      /removed/i,
      /changed the/i,
      /joined using/i,
      /missed call/i,
      /left group/i,
      /changed group/i
    ]
  },

  // Portuguese: [15/1/26, 14:32:45]
  'pt-BR': {
    name: 'Português',
    dateFormat: 'DD/M/YY',
    timeFormat: 'HH:MM:SS',
    regex: /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
    detectionPattern: /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
    systemMessagePatterns: [
      /entrou no grupo/i,
      /saiu do grupo/i,
      /mudou o nome/i,
      /mudou a foto/i,
      /mudou a descrição/i,
      /chamada perdida/i,
      /criou o grupo/i,
      /adicionou/i,
      /removeu/i,
      /foi adicionado/i,
      /mudou a configuração/i
    ]
  },

  // French: [15/1/26 14:32:45]
  'fr-FR': {
    name: 'Français',
    dateFormat: 'DD/M/YY',
    timeFormat: 'HH:MM:SS',
    regex: /^\[(\d{1,2}\/\d{1,2}\/\d{2})\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
    detectionPattern: /\[\d{1,2}\/\d{1,2}\/\d{2}\s\d{1,2}:\d{2}:\d{2}\]/,
    systemMessagePatterns: [
      /a quitté le groupe/i,
      /a créé le groupe/i,
      /a ajouté/i,
      /a retiré/i,
      /a changé/i,
      /appel manqué/i,
      /a rejoint/i,
      /a modifié/i,
      /a été ajouté/i
    ]
  },

  // German: [15.1.26, 14:32:45]
  'de-DE': {
    name: 'Deutsch',
    dateFormat: 'DD.M.YY',
    timeFormat: 'HH:MM:SS',
    regex: /^\[(\d{1,2}\.\d{1,2}\.\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
    detectionPattern: /\[\d{1,2}\.\d{1,2}\.\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
    systemMessagePatterns: [
      /hat die Gruppe verlassen/i,
      /hat die Gruppe erstellt/i,
      /hat hinzugefügt/i,
      /hat entfernt/i,
      /hat geändert/i,
      /verpasster Anruf/i,
      /ist beigetreten/i,
      /wurde hinzugefügt/i,
      /Nachrichten und Anrufe sind verschlüsselt/i
    ]
  },

  // Italian: [15/1/26, 14:32:45]
  'it-IT': {
    name: 'Italiano',
    dateFormat: 'DD/M/YY',
    timeFormat: 'HH:MM:SS',
    regex: /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
    detectionPattern: /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
    systemMessagePatterns: [
      /ha lasciato il gruppo/i,
      /ha creato il gruppo/i,
      /ha aggiunto/i,
      /ha rimosso/i,
      /ha modificato/i,
      /chiamata persa/i,
      /ha aderito/i,
      /è stato aggiunto/i,
      /ha cambiato/i
    ]
  }
};

/**
 * Media patterns (universal for all languages)
 */
export const MEDIA_PATTERNS = [
  /^\[Imagen\]$/i,
  /^\[Imagem\]$/i,
  /^\[Image\]$/i,
  /^\[Image omitted\]$/i,
  /^\[Bild\]$/i,
  /^\[Immagine\]$/i,
  /^\[Video\]$/i,
  /^\[Vídeo\]$/i,
  /^\[Vidéo\]$/i,
  /^\[Video omitted\]$/i,
  /^\[Audio\]$/i,
  /^\[Áudio\]$/i,
  /^\[Documento\]$/i,
  /^\[Documento omitido\]$/i,
  /^\[Document\]$/i,
  /^\[Archivo\]$/i,
  /^\[Fichier\]$/i,
  /^\[Datei\]$/i,
  /^\[File\]$/i,
  /^\[GIF\]$/i,
  /^\[Sticker\]$/i,
  /^\[Adesivo\]$/i,
  /^\[Autocollant\]$/i,
  /^\[<Media omitted>\]$/i,
  /^<Media omitted>$/i,
  /imagen omitida/i,
  /video omitido/i,
  /audio omitido/i,
  /documento omitido/i,
  /archivo omitido/i,
  /fotos omitidas/i,
  /videos omitidos/i
];

/**
 * Get language info by code
 */
export function getLanguageInfo(code) {
  return LANGUAGE_PATTERNS[code] || null;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
  return Object.entries(LANGUAGE_PATTERNS).map(([code, pattern]) => ({
    code,
    name: pattern.name,
    dateFormat: pattern.dateFormat,
    timeFormat: pattern.timeFormat
  }));
}

/**
 * Detect language from content
 */
export function detectLanguage(content) {
  const sampleLines = content.split('\n').slice(0, 100).join('\n');

  for (const [code, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.detectionPattern.test(sampleLines)) {
      return code;
    }
  }

  return null;
}

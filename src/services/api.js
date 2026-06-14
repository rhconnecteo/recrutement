// API Service pour Google Apps Script - doGet ONLY (pas de POST, pas de CORS)
const API_URL = "https://script.google.com/macros/s/AKfycbzs8Z5bbTfRAAMU6Jz5R64RiTr6ZXibbSIwO-ZS-I0gihJ4xqihp7CxSoleNvYS9vNY/exec";



const REQUEST_CACHE_TTL_MS = 2 * 60 * 1000;
const DROPDOWN_CACHE_TTL_MS = 10 * 60 * 1000;

const requestCache = new Map();
let dropdownOptionsCache = null;

const isCacheFresh = (cacheEntry, ttlMs) => {
  if (!cacheEntry?.timestamp) return false;
  return Date.now() - cacheEntry.timestamp < ttlMs;
};


/**
 * Valider le login
 */
export const validateLogin = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}?action=validateLogin&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erreur validateLogin:", error);
    throw error;
  }
};

/**
 * Récupérer toutes les demandes de recrutement
 */
export const getAllRequests = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getAllRequests`);
    const result = await response.json();
    if (result.success) {
      return result.data || [];
    } else {
      throw new Error(result.error || "Erreur API");
    }
  } catch (error) {
    console.error("Erreur getAllRequests:", error);
    throw error;
  }
};

/**
 * Récupérer une demande spécifique
 */
export const getRequest = async (id) => {
  try {
    const cacheKey = String(id);
    const cachedRequest = requestCache.get(cacheKey);
    if (isCacheFresh(cachedRequest, REQUEST_CACHE_TTL_MS)) {
      return { success: true, data: cachedRequest.data };
    }

    const response = await fetch(`${API_URL}?action=getRequest&id=${id}`);
    const result = await response.json();
    if (result.success) {
      requestCache.set(cacheKey, { data: result.data, timestamp: Date.now() });
      return { success: true, data: result.data };
    } else {
      throw new Error(result.error || "Erreur API");
    }
  } catch (error) {
    console.error("Erreur getRequest:", error);
    throw error;
  }
};

/**
 * Créer une nouvelle demande (via GET avec paramètres URL)
 */
export const createRequest = async (formData) => {
  try {
    // Construire la query string avec tous les paramètres
    const params = new URLSearchParams();
    params.append('action', 'createRequest');
    Object.keys(formData).forEach(key => {
      params.append(key, formData[key] || '');
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const result = await response.json();
    
    if (result.success) {
      // Une création peut impacter les listes/agrégats.
      requestCache.clear();
      return result;
    } else {
      throw new Error(result.error || "Erreur API");
    }
  } catch (error) {
    console.error("Erreur createRequest:", error);
    throw error;
  }
};

/**
 * Mettre à jour une demande existante (via GET avec paramètres URL)
 */
export const updateRequest = async (id, formData) => {
  try {
    // Construire la query string avec tous les paramètres
    const params = new URLSearchParams();
    params.append('action', 'updateRequest');
    params.append('id', id);
    Object.keys(formData).forEach(key => {
      params.append(key, formData[key] || '');
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const result = await response.json();
    
    if (result.success) {
      const cacheKey = String(id);
      requestCache.delete(cacheKey);
      return result;
    } else {
      throw new Error(result.error || "Erreur API");
    }
  } catch (error) {
    console.error("Erreur updateRequest:", error);
    throw error;
  }
};

/**
 * Récupérer les options de dropdown (Fonction et Rattachement) depuis la feuille "Grande liste"
 */
export const getDropdownOptions = async () => {
  try {
    if (isCacheFresh(dropdownOptionsCache, DROPDOWN_CACHE_TTL_MS)) {
      return dropdownOptionsCache.data;
    }

    const response = await fetch(`${API_URL}?action=getDropdownOptions`);
    const result = await response.json();
    
    // Si la réponse a un wrapper success/data, on la retourne
    if (result.success) {
      dropdownOptionsCache = { data: result, timestamp: Date.now() };
      return result;
    }
    
    // Sinon si c'est directement { functionAttachmentMap: {...} }, on la wrapp
    if (result.functionAttachmentMap) {
      const normalizedResult = { success: true, data: result };
      dropdownOptionsCache = { data: normalizedResult, timestamp: Date.now() };
      return normalizedResult;
    }
    
    throw new Error("Format de réponse invalide");
  } catch (error) {
    console.error("Erreur getDropdownOptions:", error);
    throw error;
  }
};

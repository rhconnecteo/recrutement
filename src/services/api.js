// API Service pour Google Apps Script - doGet ONLY (pas de POST, pas de CORS)
const API_URL = "https://script.google.com/macros/s/AKfycbyGulq1dPJqu55FzJORNWMMDqaKrzPflZ-M44rmAUQeAE1etGUfASnWw3goZDJAJYLL/exec";



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
    const response = await fetch(`${API_URL}?action=getRequest&id=${id}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
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
    const response = await fetch(`${API_URL}?action=getDropdownOptions`);
    const result = await response.json();
    if (result.success) {
      return result.data || { functions: [], attachments: [] };
    } else {
      throw new Error(result.error || "Erreur API");
    }
  } catch (error) {
    console.error("Erreur getDropdownOptions:", error);
    throw error;
  }
};

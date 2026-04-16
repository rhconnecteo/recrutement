// ================= CONFIG =================
const SPREADSHEET_ID = "1JAloTdOH9G5rG6mVCtowSt_nzp3tYT9k9vaZYiZ8cTs";
const SHEET_NAME = "Reporting Recrutements";

const COLUMNS = {
  // Infos générales (A-L) = 0-11
  'submissionDate': 0,      // A
  'hrbp': 1,                // B
  'function': 2,            // C
  'attachment': 3,          // D
  'contract': 4,            // E
  'pole': 5,                // F
  'requestDate': 6,         // G
  'recruitmentCode': 7,     // H
  'numberToRecruit': 8,     // I
  'duration': 9,            // J
  'recruitmentType': 10,    // K
  'reasonForRecruitment': 11, // L
  
  // Facebook (M-P) = 12-15
  'facebook_label': 12,     // M (label)
  'facebook_candidatures': 13,           // N
  'facebook_entretiensPlanifies': 14,    // O
  'facebook_entretiensRealisés': 15,     // P
  
  // LinkedIn (Q-T) = 16-19
  'linkedin_label': 16,     // Q (label)
  'linkedin_candidatures': 17,           // R
  'linkedin_entretiensPlanifies': 18,    // S
  'linkedin_entretiensRealisés': 19,     // T
  
  // Success Corner (U-X) = 20-23
  'successCorner_label': 20,     // U (label)
  'successCorner_candidatures': 21,           // V
  'successCorner_entretiensPlanifies': 22,    // W
  'successCorner_entretiensRealisés': 23,     // X
  
  // Interne (Y-AB) = 24-27
  'interne_label': 24,      // Y (label)
  'interne_candidatures': 25,            // Z
  'interne_entretiensPlanifies': 26,     // AA
  'interne_entretiensRealisés': 27,      // AB
  
  // Speed Recruiting (AC-AF) = 28-31
  'speedRecruiting_label': 28,   // AC (label)
  'speedRecruiting_candidatures': 29,           // AD
  'speedRecruiting_entretiensPlanifies': 30,    // AE
  'speedRecruiting_entretiensRealisés': 31,     // AF
  
  // Finales (AG-AJ) = 32-35
  'totalCandidatures': 32,  // AG
  'phasing': 33,            // AH
  'closureDate': 34,        // AI
  'comments': 35            // AJ
};

// ================= UTILS =================
function toNumber(val) {
  const num = parseInt(val) || 0;
  return num < 0 ? 0 : num;  // Pas de négatifs
}

// ================= LOGIN CONFIG =================
const LOGIN_CONFIG = {
  "rh": {
    username: "rh",
    password: "password123",
    type: "RH_USER",
    permissions: "all",
    rattachements: []
  },
  "admin": {
    username: "admin",
    password: "admin123",
    type: "ADMIN_USER",
    permissions: "all",
    rattachements: []
  }
};

// ================= DO GET - UNIQUE ENTRY POINT =================
function doGet(e) {
  if (!e) {
    e = { parameter: {} };
  }
  
  const action = e.parameter.action;

  try {
    if (action === "validateLogin") {
      const username = e.parameter.username;
      const password = e.parameter.password;
      return output(validateLogin(username, password));
    }
    
    if (action === "getAllRequests") {
      return output({ success: true, data: getAllRequests() });
    }
    
    if (action === "getRequest") {
      const id = e.parameter.id;
      return output({ success: true, data: getRequest(id) });
    }
    
    if (action === "createRequest") {
      const data = {
        submissionDate: e.parameter.submissionDate || new Date().toISOString().split('T')[0],
        hrbp: e.parameter.hrbp || "",
        function: e.parameter.function || "",
        attachment: e.parameter.attachment || "",
        contract: e.parameter.contract || "",
        pole: e.parameter.pole || "",
        requestDate: e.parameter.requestDate || new Date().toISOString().split('T')[0],
        recruitmentCode: e.parameter.recruitmentCode || "",
        numberToRecruit: parseInt(e.parameter.numberToRecruit) || 1,
        duration: e.parameter.duration || "",
        recruitmentType: e.parameter.recruitmentType || "",
        reasonForRecruitment: e.parameter.reasonForRecruitment || "",
        // Facebook
        facebook_candidatures: parseInt(e.parameter.facebook_candidatures) || 0,
        facebook_entretiensPlanifies: parseInt(e.parameter.facebook_entretiensPlanifies) || 0,
        facebook_entretiensRealisés: parseInt(e.parameter.facebook_entretiensRealisés) || 0,
        // LinkedIn
        linkedin_candidatures: parseInt(e.parameter.linkedin_candidatures) || 0,
        linkedin_entretiensPlanifies: parseInt(e.parameter.linkedin_entretiensPlanifies) || 0,
        linkedin_entretiensRealisés: parseInt(e.parameter.linkedin_entretiensRealisés) || 0,
        // Success Corner
        successCorner_candidatures: parseInt(e.parameter.successCorner_candidatures) || 0,
        successCorner_entretiensPlanifies: parseInt(e.parameter.successCorner_entretiensPlanifies) || 0,
        successCorner_entretiensRealisés: parseInt(e.parameter.successCorner_entretiensRealisés) || 0,
        // Interne
        interne_candidatures: parseInt(e.parameter.interne_candidatures) || 0,
        interne_entretiensPlanifies: parseInt(e.parameter.interne_entretiensPlanifies) || 0,
        interne_entretiensRealisés: parseInt(e.parameter.interne_entretiensRealisés) || 0,
        // Speed Recruiting
        speedRecruiting_candidatures: parseInt(e.parameter.speedRecruiting_candidatures) || 0,
        speedRecruiting_entretiensPlanifies: parseInt(e.parameter.speedRecruiting_entretiensPlanifies) || 0,
        speedRecruiting_entretiensRealisés: parseInt(e.parameter.speedRecruiting_entretiensRealisés) || 0,
        // NEW: Total candidatures
        totalCandidatures: parseInt(e.parameter.totalCandidatures) || 0,
        phasing: e.parameter.phasing || "",
        closureDate: e.parameter.closureDate || "",
        comments: e.parameter.comments || ""
      };
      createRequest(data);
      return output({ success: true, message: "Demande créée avec succès" });
    }
    
    if (action === "updateRequest") {
      const id = e.parameter.id;
      const data = {
        submissionDate: e.parameter.submissionDate,
        hrbp: e.parameter.hrbp,
        function: e.parameter.function,
        attachment: e.parameter.attachment,
        contract: e.parameter.contract,
        pole: e.parameter.pole,
        requestDate: e.parameter.requestDate,
        recruitmentCode: e.parameter.recruitmentCode,
        numberToRecruit: parseInt(e.parameter.numberToRecruit),
        duration: e.parameter.duration,
        recruitmentType: e.parameter.recruitmentType,
        reasonForRecruitment: e.parameter.reasonForRecruitment,
        // Facebook
        facebook_candidatures: parseInt(e.parameter.facebook_candidatures),
        facebook_entretiensPlanifies: parseInt(e.parameter.facebook_entretiensPlanifies),
        facebook_entretiensRealisés: parseInt(e.parameter.facebook_entretiensRealisés),
        // LinkedIn
        linkedin_candidatures: parseInt(e.parameter.linkedin_candidatures),
        linkedin_entretiensPlanifies: parseInt(e.parameter.linkedin_entretiensPlanifies),
        linkedin_entretiensRealisés: parseInt(e.parameter.linkedin_entretiensRealisés),
        // Success Corner
        successCorner_candidatures: parseInt(e.parameter.successCorner_candidatures),
        successCorner_entretiensPlanifies: parseInt(e.parameter.successCorner_entretiensPlanifies),
        successCorner_entretiensRealisés: parseInt(e.parameter.successCorner_entretiensRealisés),
        // Interne
        interne_candidatures: parseInt(e.parameter.interne_candidatures),
        interne_entretiensPlanifies: parseInt(e.parameter.interne_entretiensPlanifies),
        interne_entretiensRealisés: parseInt(e.parameter.interne_entretiensRealisés),
        // Speed Recruiting
        speedRecruiting_candidatures: parseInt(e.parameter.speedRecruiting_candidatures),
        speedRecruiting_entretiensPlanifies: parseInt(e.parameter.speedRecruiting_entretiensPlanifies),
        speedRecruiting_entretiensRealisés: parseInt(e.parameter.speedRecruiting_entretiensRealisés),
        // NEW: Total candidatures
        totalCandidatures: parseInt(e.parameter.totalCandidatures),
        phasing: e.parameter.phasing,
        closureDate: e.parameter.closureDate,
        comments: e.parameter.comments
      };
      updateRequest(id, data);
      return output({ success: true, message: "Demande mise à jour avec succès" });
    }
    
    if (action === "getDropdownOptions") {
      return output({ success: true, data: getDropdownOptions() });
    }
    
    return output({ success: false, error: "Action inconnue" });
  } catch (err) {
    return output({ success: false, error: err.toString() });
  }
}

// ================= VALIDATE LOGIN =================
function validateLogin(username, password) {
  for (const key in LOGIN_CONFIG) {
    const config = LOGIN_CONFIG[key];
    if (config.username === username && config.password === password) {
      return {
        success: true,
        message: "Login réussi",
        type: config.type,
        permissions: config.permissions,
        rattachements: config.rattachements
      };
    }
  }
  return {
    success: false,
    message: "❌ Identifiant ou mot de passe incorrect"
  };
}

// ================= GET ALL REQUESTS =================
function getAllRequests() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) {
      Logger.log("❌ ERREUR: Spreadsheet ID invalide ou inaccessible");
      throw new Error("Spreadsheet introuvable");
    }
    
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      Logger.log("❌ ERREUR: Feuille '" + SHEET_NAME + "' introuvable");
      Logger.log("Feuilles disponibles: " + ss.getSheets().map(s => s.getName()).join(", "));
      throw new Error("Feuille '" + SHEET_NAME + "' introuvable");
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    // Ignorer la première ligne (headers)
    const requests = data.slice(1).map((row, index) => {
      return {
        id: index + 2,
        submissionDate: row[COLUMNS.submissionDate],
        hrbp: row[COLUMNS.hrbp],
        function: row[COLUMNS.function],
        attachment: row[COLUMNS.attachment],
        contract: row[COLUMNS.contract],
        pole: row[COLUMNS.pole],
        requestDate: row[COLUMNS.requestDate],
        recruitmentCode: row[COLUMNS.recruitmentCode],
        numberToRecruit: row[COLUMNS.numberToRecruit],
        duration: row[COLUMNS.duration],
        recruitmentType: row[COLUMNS.recruitmentType],
        reasonForRecruitment: row[COLUMNS.reasonForRecruitment],
        totalCandidatures: row[COLUMNS.totalCandidatures],
        phasing: row[COLUMNS.phasing],
        closureDate: row[COLUMNS.closureDate],
        comments: row[COLUMNS.comments],
        // Calculate total interviews conducted from all sources
        interviewsConducted: (row[COLUMNS.facebook_entretiensRealisés] || 0) +
                            (row[COLUMNS.linkedin_entretiensRealisés] || 0) +
                            (row[COLUMNS.successCorner_entretiensRealisés] || 0) +
                            (row[COLUMNS.interne_entretiensRealisés] || 0) +
                            (row[COLUMNS.speedRecruiting_entretiensRealisés] || 0),
        // Calculate total interviews to schedule from all sources
        interviewsToSchedule: (row[COLUMNS.facebook_entretiensPlanifies] || 0) +
                             (row[COLUMNS.linkedin_entretiensPlanifies] || 0) +
                             (row[COLUMNS.successCorner_entretiensPlanifies] || 0) +
                             (row[COLUMNS.interne_entretiensPlanifies] || 0) +
                             (row[COLUMNS.speedRecruiting_entretiensPlanifies] || 0),
        // Structured source data
        sourceData: {
          'Facebook': {
            candidatures: row[COLUMNS.facebook_candidatures] || 0,
            entretiensPlanifies: row[COLUMNS.facebook_entretiensPlanifies] || 0,
            entretiensRealisés: row[COLUMNS.facebook_entretiensRealisés] || 0
          },
          'LinkedIn': {
            candidatures: row[COLUMNS.linkedin_candidatures] || 0,
            entretiensPlanifies: row[COLUMNS.linkedin_entretiensPlanifies] || 0,
            entretiensRealisés: row[COLUMNS.linkedin_entretiensRealisés] || 0
          },
          'Success Corner': {
            candidatures: row[COLUMNS.successCorner_candidatures] || 0,
            entretiensPlanifies: row[COLUMNS.successCorner_entretiensPlanifies] || 0,
            entretiensRealisés: row[COLUMNS.successCorner_entretiensRealisés] || 0
          },
          'Interne': {
            candidatures: row[COLUMNS.interne_candidatures] || 0,
            entretiensPlanifies: row[COLUMNS.interne_entretiensPlanifies] || 0,
            entretiensRealisés: row[COLUMNS.interne_entretiensRealisés] || 0
          },
          'Speed Recruiting': {
            candidatures: row[COLUMNS.speedRecruiting_candidatures] || 0,
            entretiensPlanifies: row[COLUMNS.speedRecruiting_entretiensPlanifies] || 0,
            entretiensRealisés: row[COLUMNS.speedRecruiting_entretiensRealisés] || 0
          }
        },
        // Individual columns (for backward compatibility)
        facebook_candidatures: row[COLUMNS.facebook_candidatures],
        facebook_entretiensPlanifies: row[COLUMNS.facebook_entretiensPlanifies],
        facebook_entretiensRealisés: row[COLUMNS.facebook_entretiensRealisés],
        linkedin_candidatures: row[COLUMNS.linkedin_candidatures],
        linkedin_entretiensPlanifies: row[COLUMNS.linkedin_entretiensPlanifies],
        linkedin_entretiensRealisés: row[COLUMNS.linkedin_entretiensRealisés],
        successCorner_candidatures: row[COLUMNS.successCorner_candidatures],
        successCorner_entretiensPlanifies: row[COLUMNS.successCorner_entretiensPlanifies],
        successCorner_entretiensRealisés: row[COLUMNS.successCorner_entretiensRealisés],
        interne_candidatures: row[COLUMNS.interne_candidatures],
        interne_entretiensPlanifies: row[COLUMNS.interne_entretiensPlanifies],
        interne_entretiensRealisés: row[COLUMNS.interne_entretiensRealisés],
        speedRecruiting_candidatures: row[COLUMNS.speedRecruiting_candidatures],
        speedRecruiting_entretiensPlanifies: row[COLUMNS.speedRecruiting_entretiensPlanifies],
        speedRecruiting_entretiensRealisés: row[COLUMNS.speedRecruiting_entretiensRealisés]
      };
    });

    return requests;
  } catch (error) {
    Logger.log("❌ Erreur dans getAllRequests: " + error.toString());
    throw error;
  }
}

// ================= GET REQUEST BY ID =================
function getRequest(rowId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const row = sheet.getRange(rowId, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!row[0]) {
    return null;
  }

  return {
    id: rowId,
    submissionDate: row[COLUMNS.submissionDate],
    hrbp: row[COLUMNS.hrbp],
    function: row[COLUMNS.function],
    attachment: row[COLUMNS.attachment],
    contract: row[COLUMNS.contract],
    pole: row[COLUMNS.pole],
    requestDate: row[COLUMNS.requestDate],
    recruitmentCode: row[COLUMNS.recruitmentCode],
    numberToRecruit: row[COLUMNS.numberToRecruit],
    duration: row[COLUMNS.duration],
    recruitmentType: row[COLUMNS.recruitmentType],
    reasonForRecruitment: row[COLUMNS.reasonForRecruitment],
    totalCandidatures: row[COLUMNS.totalCandidatures],
    phasing: row[COLUMNS.phasing],
    closureDate: row[COLUMNS.closureDate],
    comments: row[COLUMNS.comments],
    // Calculate total interviews conducted from all sources
    interviewsConducted: (row[COLUMNS.facebook_entretiensRealisés] || 0) +
                        (row[COLUMNS.linkedin_entretiensRealisés] || 0) +
                        (row[COLUMNS.successCorner_entretiensRealisés] || 0) +
                        (row[COLUMNS.interne_entretiensRealisés] || 0) +
                        (row[COLUMNS.speedRecruiting_entretiensRealisés] || 0),
    // Calculate total interviews to schedule from all sources
    interviewsToSchedule: (row[COLUMNS.facebook_entretiensPlanifies] || 0) +
                         (row[COLUMNS.linkedin_entretiensPlanifies] || 0) +
                         (row[COLUMNS.successCorner_entretiensPlanifies] || 0) +
                         (row[COLUMNS.interne_entretiensPlanifies] || 0) +
                         (row[COLUMNS.speedRecruiting_entretiensPlanifies] || 0),
    // Structured source data
    sourceData: {
      'Facebook': {
        candidatures: row[COLUMNS.facebook_candidatures] || 0,
        entretiensPlanifies: row[COLUMNS.facebook_entretiensPlanifies] || 0,
        entretiensRealisés: row[COLUMNS.facebook_entretiensRealisés] || 0
      },
      'LinkedIn': {
        candidatures: row[COLUMNS.linkedin_candidatures] || 0,
        entretiensPlanifies: row[COLUMNS.linkedin_entretiensPlanifies] || 0,
        entretiensRealisés: row[COLUMNS.linkedin_entretiensRealisés] || 0
      },
      'Success Corner': {
        candidatures: row[COLUMNS.successCorner_candidatures] || 0,
        entretiensPlanifies: row[COLUMNS.successCorner_entretiensPlanifies] || 0,
        entretiensRealisés: row[COLUMNS.successCorner_entretiensRealisés] || 0
      },
      'Interne': {
        candidatures: row[COLUMNS.interne_candidatures] || 0,
        entretiensPlanifies: row[COLUMNS.interne_entretiensPlanifies] || 0,
        entretiensRealisés: row[COLUMNS.interne_entretiensRealisés] || 0
      },
      'Speed Recruiting': {
        candidatures: row[COLUMNS.speedRecruiting_candidatures] || 0,
        entretiensPlanifies: row[COLUMNS.speedRecruiting_entretiensPlanifies] || 0,
        entretiensRealisés: row[COLUMNS.speedRecruiting_entretiensRealisés] || 0
      }
    },
    // Individual columns (for backward compatibility)
    facebook_candidatures: row[COLUMNS.facebook_candidatures],
    facebook_entretiensPlanifies: row[COLUMNS.facebook_entretiensPlanifies],
    facebook_entretiensRealisés: row[COLUMNS.facebook_entretiensRealisés],
    linkedin_candidatures: row[COLUMNS.linkedin_candidatures],
    linkedin_entretiensPlanifies: row[COLUMNS.linkedin_entretiensPlanifies],
    linkedin_entretiensRealisés: row[COLUMNS.linkedin_entretiensRealisés],
    successCorner_candidatures: row[COLUMNS.successCorner_candidatures],
    successCorner_entretiensPlanifies: row[COLUMNS.successCorner_entretiensPlanifies],
    successCorner_entretiensRealisés: row[COLUMNS.successCorner_entretiensRealisés],
    interne_candidatures: row[COLUMNS.interne_candidatures],
    interne_entretiensPlanifies: row[COLUMNS.interne_entretiensPlanifies],
    interne_entretiensRealisés: row[COLUMNS.interne_entretiensRealisés],
    speedRecruiting_candidatures: row[COLUMNS.speedRecruiting_candidatures],
    speedRecruiting_entretiensPlanifies: row[COLUMNS.speedRecruiting_entretiensPlanifies],
    speedRecruiting_entretiensRealisés: row[COLUMNS.speedRecruiting_entretiensRealisés]
  };
}

// ================= CREATE REQUEST =================
function createRequest(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const newRow = [
    data.submissionDate || new Date(),
    data.hrbp || "",
    data.function || "",
    data.attachment || "",
    data.contract || "",
    data.pole || "",
    data.requestDate || new Date(),
    data.recruitmentCode || "",
    toNumber(data.numberToRecruit),
    data.duration || "",
    data.recruitmentType || "",
    data.reasonForRecruitment || "",
    // Facebook (M-P) 12-15
    "Facebook",  // col 12 - label
    toNumber(data.facebook_candidatures),
    toNumber(data.facebook_entretiensPlanifies),
    toNumber(data.facebook_entretiensRealisés),
    // LinkedIn (Q-T) 16-19
    "LinkedIn",  // col 16 - label
    toNumber(data.linkedin_candidatures),
    toNumber(data.linkedin_entretiensPlanifies),
    toNumber(data.linkedin_entretiensRealisés),
    // Success Corner (U-X) 20-23
    "Success Corner",  // col 20 - label
    toNumber(data.successCorner_candidatures),
    toNumber(data.successCorner_entretiensPlanifies),
    toNumber(data.successCorner_entretiensRealisés),
    // Interne (Y-AB) 24-27
    "Interne",  // col 24 - label
    toNumber(data.interne_candidatures),
    toNumber(data.interne_entretiensPlanifies),
    toNumber(data.interne_entretiensRealisés),
    // Speed Recruiting (AC-AF) 28-31
    "Speed Recruiting",  // col 28 - label
    toNumber(data.speedRecruiting_candidatures),
    toNumber(data.speedRecruiting_entretiensPlanifies),
    toNumber(data.speedRecruiting_entretiensRealisés),
    // Finales (AG-AJ) 32-35
    toNumber(data.totalCandidatures),
    data.phasing || "",
    data.closureDate || "",
    data.comments || ""
  ];

  sheet.appendRow(newRow);
}

// ================= UPDATE REQUEST =================
function updateRequest(rowId, data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const row = sheet.getRange(rowId, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!row[0]) {
    return;
  }

  // Mettre à jour les colonnes générales
  if (data.submissionDate !== undefined) sheet.getRange(rowId, COLUMNS.submissionDate + 1).setValue(data.submissionDate);
  if (data.hrbp !== undefined) sheet.getRange(rowId, COLUMNS.hrbp + 1).setValue(data.hrbp);
  if (data.function !== undefined) sheet.getRange(rowId, COLUMNS.function + 1).setValue(data.function);
  if (data.attachment !== undefined) sheet.getRange(rowId, COLUMNS.attachment + 1).setValue(data.attachment);
  if (data.contract !== undefined) sheet.getRange(rowId, COLUMNS.contract + 1).setValue(data.contract);
  if (data.pole !== undefined) sheet.getRange(rowId, COLUMNS.pole + 1).setValue(data.pole);
  if (data.requestDate !== undefined) sheet.getRange(rowId, COLUMNS.requestDate + 1).setValue(data.requestDate);
  if (data.recruitmentCode !== undefined) sheet.getRange(rowId, COLUMNS.recruitmentCode + 1).setValue(data.recruitmentCode);
  if (data.numberToRecruit !== undefined) sheet.getRange(rowId, COLUMNS.numberToRecruit + 1).setValue(toNumber(data.numberToRecruit));
  if (data.duration !== undefined) sheet.getRange(rowId, COLUMNS.duration + 1).setValue(data.duration);
  if (data.recruitmentType !== undefined) sheet.getRange(rowId, COLUMNS.recruitmentType + 1).setValue(data.recruitmentType);
  if (data.reasonForRecruitment !== undefined) sheet.getRange(rowId, COLUMNS.reasonForRecruitment + 1).setValue(data.reasonForRecruitment);
  
  // Mettre à jour TOUTES les colonnes sources avec des nombres garantis
  sheet.getRange(rowId, COLUMNS.facebook_candidatures + 1).setValue(toNumber(data.facebook_candidatures));
  sheet.getRange(rowId, COLUMNS.facebook_entretiensPlanifies + 1).setValue(toNumber(data.facebook_entretiensPlanifies));
  sheet.getRange(rowId, COLUMNS.facebook_entretiensRealisés + 1).setValue(toNumber(data.facebook_entretiensRealisés));
  sheet.getRange(rowId, COLUMNS.linkedin_candidatures + 1).setValue(toNumber(data.linkedin_candidatures));
  sheet.getRange(rowId, COLUMNS.linkedin_entretiensPlanifies + 1).setValue(toNumber(data.linkedin_entretiensPlanifies));
  sheet.getRange(rowId, COLUMNS.linkedin_entretiensRealisés + 1).setValue(toNumber(data.linkedin_entretiensRealisés));
  sheet.getRange(rowId, COLUMNS.successCorner_candidatures + 1).setValue(toNumber(data.successCorner_candidatures));
  sheet.getRange(rowId, COLUMNS.successCorner_entretiensPlanifies + 1).setValue(toNumber(data.successCorner_entretiensPlanifies));
  sheet.getRange(rowId, COLUMNS.successCorner_entretiensRealisés + 1).setValue(toNumber(data.successCorner_entretiensRealisés));
  sheet.getRange(rowId, COLUMNS.interne_candidatures + 1).setValue(toNumber(data.interne_candidatures));
  sheet.getRange(rowId, COLUMNS.interne_entretiensPlanifies + 1).setValue(toNumber(data.interne_entretiensPlanifies));
  sheet.getRange(rowId, COLUMNS.interne_entretiensRealisés + 1).setValue(toNumber(data.interne_entretiensRealisés));
  sheet.getRange(rowId, COLUMNS.speedRecruiting_candidatures + 1).setValue(toNumber(data.speedRecruiting_candidatures));
  sheet.getRange(rowId, COLUMNS.speedRecruiting_entretiensPlanifies + 1).setValue(toNumber(data.speedRecruiting_entretiensPlanifies));
  sheet.getRange(rowId, COLUMNS.speedRecruiting_entretiensRealisés + 1).setValue(toNumber(data.speedRecruiting_entretiensRealisés));
  
  // Mettre à jour les autres colonnes
  if (data.totalCandidatures !== undefined) sheet.getRange(rowId, COLUMNS.totalCandidatures + 1).setValue(toNumber(data.totalCandidatures));
  if (data.phasing !== undefined) sheet.getRange(rowId, COLUMNS.phasing + 1).setValue(data.phasing);
  if (data.closureDate !== undefined) sheet.getRange(rowId, COLUMNS.closureDate + 1).setValue(data.closureDate);
  if (data.comments !== undefined) sheet.getRange(rowId, COLUMNS.comments + 1).setValue(data.comments);
}

// ================= GET DROPDOWN OPTIONS =================
function getDropdownOptions() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("Grande liste");
    
    Logger.log("Feuille 'Grande liste' trouvée: " + (sheet ? "OUI" : "NON"));
    
    if (!sheet) {
      Logger.log("Erreur: Feuille 'Grande liste' introuvable");
      const availableSheets = ss.getSheets().map(s => s.getName());
      Logger.log("Feuilles disponibles: " + availableSheets.join(", "));
      return {
        functionAttachmentList: []
      };
    }
    
    const data = sheet.getDataRange().getValues();
    Logger.log("Nombre de lignes dans Grande liste: " + data.length);
    Logger.log("Données brutes (première ligne): " + JSON.stringify(data[0]));
    
    if (data.length <= 1) {
      Logger.log("La feuille est vide ou contient seulement l'en-tête");
      return {
        functionAttachmentList: []
      };
    }
    
    // Créer une liste de toutes les paires fonction->attachement (sans filtrer les doublons)
    const functionAttachmentList = [];
    const seenPairs = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const fn = data[i][0];
      const attachment = data[i][1];
      
      Logger.log("Ligne " + i + ": fonction='" + fn + "', rattachement='" + attachment + "'");
      
      // Créer une clé unique pour chaque paire (fonction, attachement)
      const pairKey = fn + "|" + (attachment || '');
      
      // Ajouter le mapping s'il n'a pas déjà été ajouté
      if (fn && !seenPairs.has(pairKey)) {
        functionAttachmentList.push({
          function: fn,
          attachment: attachment || ''
        });
        seenPairs.add(pairKey);
      }
    }
    
    Logger.log("Fonctions extraites: " + JSON.stringify(functionAttachmentList));
    Logger.log("Total de paires fonction-attachement: " + functionAttachmentList.length);
    
    return {
      functionAttachmentList: functionAttachmentList
    };
  } catch (error) {
    Logger.log("Erreur dans getDropdownOptions: " + error.toString());
    return {
      functionAttachmentList: []
    };
  }
}

// ================= JSON OUTPUT =================
function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================= EMAIL NOTIFICATION =================
// Liste des destinataires pour les emails quotidiens
const EMAIL_RECIPIENTS = [
  "miary95080@gmail.com",
  "herizo.ramboamiarison@connecteo.mg"
];

/**
 * Envoyer un email quotidien à 11h avec le rapport des recrutements
 */
function sendDailyRecruitmentReport() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log("Erreur: Feuille '" + SHEET_NAME + "' introuvable");
      return;
    }
    
    let allRequests = [];
    try {
      allRequests = getAllRequests();
    } catch (err) {
      Logger.log("Erreur lors de la récupération des demandes: " + err.toString());
      allRequests = [];
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Filtrer les demandes créées aujourd'hui
    const todayRequests = allRequests.filter(req => {
      const createdDate = typeof req.submissionDate === 'string' 
        ? req.submissionDate.split('T')[0]
        : new Date(req.submissionDate).toISOString().split('T')[0];
      return createdDate === today;
    });
    
    // Calculer les stats
    const totalRequests = allRequests.length;
    const todayCount = todayRequests.length;
    const polesCount = {};
    const sourcesCount = {};
    
    allRequests.forEach(req => {
      // Compter par pole
      if (req.pole) {
        polesCount[req.pole] = (polesCount[req.pole] || 0) + 1;
      }
      
      // Compter par source (Facebook, LinkedIn, etc.)
      if (req.sourceData) {
        Object.keys(req.sourceData).forEach(source => {
          sourcesCount[source] = (sourcesCount[source] || 0) + 1;
        });
      }
    });
    
    // Construire le contenu de l'email
    const emailBody = buildReportEmail(totalRequests, todayCount, todayRequests, polesCount, sourcesCount);
    const subject = `[Recrutement RH] Rapport Quotidien - ${new Date().toLocaleDateString('fr-FR')}`;
    
    // Envoyer l'email à tous les destinataires
    EMAIL_RECIPIENTS.forEach(recipient => {
      try {
        MailApp.sendEmail(
          recipient,
          subject,
          emailBody,
          { htmlBody: emailBody }
        );
        Logger.log("✅ Email envoyé à: " + recipient);
      } catch (err) {
        Logger.log("❌ Erreur envoi email à " + recipient + ": " + err.toString());
      }
    });
    
  } catch (error) {
    Logger.log("Erreur dans sendDailyRecruitmentReport: " + error.toString());
  }
}

/**
 * Construire le contenu HTML détaillé de l'email de récapitulatif
 */
function buildReportEmail(totalRequests, todayCount, todayRequests, polesCount, sourcesCount) {
  // Validation et valeurs par défaut
  totalRequests = totalRequests || 0;
  todayCount = todayCount || 0;
  todayRequests = todayRequests || [];
  polesCount = polesCount || {};
  sourcesCount = sourcesCount || {};
  
  // Calculer les statistiques détaillées
  let totalCandidatures = 0;
  let totalEntretiensPlanifies = 0;
  let totalEntretiensRealisés = 0;
  let sourceStats = {};
  
  // Initialiser les sources
  ['Facebook', 'LinkedIn', 'Success Corner', 'Interne', 'Speed Recruiting'].forEach(source => {
    sourceStats[source] = { candidatures: 0, planifies: 0, realises: 0 };
  });
  
  // Récupérer les données complètes
  try {
    const allRequests = getAllRequests();
    allRequests.forEach(req => {
      if (req.sourceData) {
        Object.keys(req.sourceData).forEach(source => {
          const data = req.sourceData[source];
          sourceStats[source].candidatures += data.candidatures || 0;
          sourceStats[source].planifies += data.entretiensPlanifies || 0;
          sourceStats[source].realises += data.entretiensRealisés || 0;
        });
      }
      totalCandidatures += req.totalCandidatures || 0;
      totalEntretiensPlanifies += req.interviewsToSchedule || 0;
      totalEntretiensRealisés += req.interviewsConducted || 0;
    });
  } catch(e) {
    Logger.log("Erreur calcul stats détaillées: " + e.toString());
  }
  
  const tauxConversion = totalCandidatures > 0 ? Math.round((totalEntretiensRealisés / totalCandidatures) * 100) : 0;
  const dateReport = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  let html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; color: #333;">
      
      <!-- HEADER PROFESSIONNEL -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; color: white; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">📊 Rapport Hebdomadaire de Recrutement</h1>
        <p style="margin: 12px 0 0 0; font-size: 16px; opacity: 0.95;">${dateReport}</p>
        <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.85;">Connecteo RH - Gestion des Recrutements</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
        
        <!-- STATISTIQUES PRINCIPALES (Grid 2x3) -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="color: #333; font-size: 18px; margin: 0 0 20px 0; border-bottom: 3px solid #667eea; padding-bottom: 12px;">📈 Vue d'Ensemble</h2>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <!-- Demandes totales -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #5568d3 100%); padding: 20px; border-radius: 6px; color: white; text-align: center;">
              <div style="font-size: 36px; font-weight: bold;">${totalRequests}</div>
              <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Demandes Totales</div>
            </div>
            
            <!-- Candidatures -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 6px; color: white; text-align: center;">
              <div style="font-size: 36px; font-weight: bold;">${totalCandidatures}</div>
              <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Candidatures Reçues</div>
            </div>
            
            <!-- Entretiens réalisés -->
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 6px; color: white; text-align: center;">
              <div style="font-size: 36px; font-weight: bold;">${totalEntretiensRealisés}</div>
              <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Entretiens Réalisés</div>
            </div>
            
            <!-- Entretiens planifiés -->
            <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 6px; color: white; text-align: center;">
              <div style="font-size: 36px; font-weight: bold;">${totalEntretiensPlanifies}</div>
              <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Entretiens Planifiés</div>
            </div>
            
            <!-- Taux conversion -->
            <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 20px; border-radius: 6px; color: white; text-align: center;">
              <div style="font-size: 36px; font-weight: bold;">${tauxConversion}%</div>
              <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Taux Conversion</div>
            </div>
            
            <!-- Demandes cette semaine -->
            <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; border-radius: 6px; color: white; text-align: center;">
              <div style="font-size: 36px; font-weight: bold;">${todayCount}</div>
              <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Cette Semaine</div>
            </div>
          </div>
        </div>
        
        <!-- PERFORMANCE PAR SOURCE -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 3px solid #667eea; padding-bottom: 12px;">🎯 Performance par Source de Recrutement</h2>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f0f3ff; border-bottom: 2px solid #667eea;">
                <th style="padding: 12px; text-align: left; font-weight: bold; color: #333;">Source</th>
                <th style="padding: 12px; text-align: center; font-weight: bold; color: #333;">Candidatures</th>
                <th style="padding: 12px; text-align: center; font-weight: bold; color: #333;">Entretiens Planifiés</th>
                <th style="padding: 12px; text-align: center; font-weight: bold; color: #333;">Entretiens Réalisés</th>
                <th style="padding: 12px; text-align: center; font-weight: bold; color: #333;">Efficacité</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(sourceStats).map(([source, stats]) => {
                const efficacite = stats.candidatures > 0 ? Math.round((stats.realises / stats.candidatures) * 100) : 0;
                let efficaciteColor = '#999';
                if (efficacite >= 50) efficaciteColor = '#00b894';
                else if (efficacite >= 30) efficaciteColor = '#fdcb6e';
                else if (efficacite > 0) efficaciteColor = '#e74c3c';
                
                return `
                  <tr style="border-bottom: 1px solid #eee; background: ${source === 'Interne' ? '#f9f9ff' : 'white'};">
                    <td style="padding: 12px; font-weight: 500;">${source}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold;">${stats.candidatures}</td>
                    <td style="padding: 12px; text-align: center;">${stats.planifies}</td>
                    <td style="padding: 12px; text-align: center;">${stats.realises}</td>
                    <td style="padding: 12px; text-align: center;"><span style="background: ${efficaciteColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${efficacite}%</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- DISTRIBUTION PAR PÔLE -->
        ${Object.keys(polesCount).length > 0 ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 3px solid #667eea; padding-bottom: 12px;">🏢 Distribution par Pôle</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
              ${Object.entries(polesCount).map(([pole, count]) => {
                const pourcentage = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
                return `
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 6px; color: white;">
                    <div style="font-weight: bold; font-size: 16px;">${pole}</div>
                    <div style="margin-top: 8px; font-size: 24px; font-weight: bold;">${count}</div>
                    <div style="margin-top: 5px; font-size: 12px; opacity: 0.9;">${pourcentage}% des demandes</div>
                    <div style="margin-top: 8px; background: rgba(255,255,255,0.2); height: 4px; border-radius: 2px; overflow: hidden;">
                      <div style="background: rgba(255,255,255,0.8); height: 100%; width: ${pourcentage}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- DEMANDES RÉCENTES -->
        ${todayRequests.length > 0 ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 3px solid #667eea; padding-bottom: 12px;">📋 Demandes Récentes (${todayRequests.length})</h2>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f0f3ff; border-bottom: 2px solid #667eea;">
                  <th style="padding: 10px; text-align: left; font-weight: bold; color: #333;">Code</th>
                  <th style="padding: 10px; text-align: left; font-weight: bold; color: #333;">Fonction</th>
                  <th style="padding: 10px; text-align: left; font-weight: bold; color: #333;">Pôle</th>
                  <th style="padding: 10px; text-align: center; font-weight: bold; color: #333;">Nombre</th>
                  <th style="padding: 10px; text-align: left; font-weight: bold; color: #333;">Contrat</th>
                  <th style="padding: 10px; text-align: left; font-weight: bold; color: #333;">Durée</th>
                </tr>
              </thead>
              <tbody>
                ${todayRequests.slice(0, 15).map(req => `
                  <tr style="border-bottom: 1px solid #eee; background: ${req.contract === 'CDI' ? '#f0fff4' : 'white'};">
                    <td style="padding: 10px; font-weight: bold; color: #667eea;">${req.recruitmentCode || 'N/A'}</td>
                    <td style="padding: 10px;">${req.function || 'N/A'}</td>
                    <td style="padding: 10px;"><span style="background: #e8e8ff; padding: 3px 8px; border-radius: 3px;">${req.pole || 'N/A'}</span></td>
                    <td style="padding: 10px; text-align: center; font-weight: bold;">${req.numberToRecruit || '1'}</td>
                    <td style="padding: 10px;"><span style="background: ${req.contract === 'CDI' ? '#d4edda' : '#fff3cd'}; padding: 3px 8px; border-radius: 3px; font-size: 11px;">${req.contract || 'N/A'}</span></td>
                    <td style="padding: 10px;">${req.duration || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            ${todayRequests.length > 15 ? `
              <div style="margin-top: 12px; padding: 10px; background: #f5f5f5; border-radius: 4px; text-align: center; color: #666; font-size: 12px;">
                ... et ${todayRequests.length - 15} demandes supplémentaires
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <!-- ACTIONS RECOMMANDÉES -->
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
          <div style="color: #856404; font-weight: bold; margin-bottom: 8px;">⚠️ Points d'Attention</div>
          <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 12px;">
            <li>Nombres de demandes en attente: ${todayRequests.filter(r => !r.closureDate).length}</li>
            <li>Entretiens à planifier: ${totalEntretiensPlanifies}</li>
            <li>Taux de conversion moyen: ${tauxConversion}%</li>
          </ul>
        </div>
        
        <!-- PIED DE PAGE -->
        <div style="text-align: center; color: #999; font-size: 11px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="margin: 5px 0;">📧 Rapport généré automatiquement - Vendredi 10h00</p>
          <p style="margin: 5px 0;">Connecteo RH - Système de Gestion des Recrutements</p>
          <p style="margin: 5px 0; opacity: 0.7;">Ne répondez pas à cet email. Pour plus d'informations, connectez-vous au tableau de bord.</p>
        </div>
        
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Créer le trigger pour l'email quotidien à 11h
 * INSTRUCTIONS: À exécuter depuis l'interface Google Apps Script uniquement
 * 
 * 1. Allez dans Google Apps Script (script.google.com)
 * 2. Cliquez sur l'horloge (⏱️) "Déclencheurs" à gauche
 * 3. Cliquez sur "+ Créer un déclencheur"
 * 4. Configurez:
 *    - Fonction: sendDailyRecruitmentReport
 *    - Type de déploiement: Déploiement de la tête (Head)
 *    - Type d'événement: Déclencheur du calendrier
 *    - Type de calendrier: Semaine
 *    - Jour: Vendredi
 *    - Heure: 10h du matin (10:00 - 11:00)
 * 5. Cliquez sur "Enregistrer"
 * 
 * ✅ Les emails seront envoyés automatiquement chaque vendredi à 10h!
 */
function setupScheduledEmail() {
  Logger.log("Configuration - Déclencher chaque VENDREDI à 10h:");
  Logger.log("1. Allez sur: https://script.google.com");
  Logger.log("2. Cliquez sur 'Déclencheurs' (horloge) à gauche");
  Logger.log("3. Cliquez sur '+ Créer un déclencheur'");
  Logger.log("4. Sélectionnez:");
  Logger.log("   - Fonction: sendDailyRecruitmentReport");
  Logger.log("   - Type de déploiement: Déploiement de la tête (Head)");
  Logger.log("   - Type d'événement: Déclencheur du calendrier");
  Logger.log("   - Type de calendrier: Semaine");
  Logger.log("   - Jour: Vendredi");
  Logger.log("   - Heure: 10h du matin (10:00 - 11:00)");
  Logger.log("5. Cliquez sur 'Enregistrer'");
  Logger.log("");
  Logger.log("✅ Configuration: Récap de recrutement chaque vendredi à 10h");
  Logger.log("📧 Email de test - vérification que tout fonctionne:");
  sendDailyRecruitmentReport();
}

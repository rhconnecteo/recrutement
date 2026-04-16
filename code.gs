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

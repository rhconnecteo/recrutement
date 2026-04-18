// ================= CONFIG =================
const SPREADSHEET_ID = "1JAloTdOH9G5rG6mVCtowSt_nzp3tYT9k9vaZYiZ8cTs";
const SHEET_NAME = "Reporting Recrutements";

const COLUMNS = {
  // Infos générales (A-M) = 0-12
  'submissionDate': 0,      // A
  'hrbp': 1,                // B
  'function': 2,            // C
  'attachment': 3,          // D
  'cdo': 4,                 // E
  'contract': 5,            // F
  'pole': 6,                // G
  'requestDate': 7,         // H
  'recruitmentCode': 8,     // I
  'numberToRecruit': 9,     // J
  'duration': 10,           // K
  'recruitmentType': 11,    // L
  'reasonForRecruitment': 12, // M
  
  // Facebook (N-Q) = 13-16
  'facebook_label': 13,     // N (label)
  'facebook_candidatures': 14,           // O
  'facebook_entretiensPlanifiés': 15,    // P
  'facebook_entretiensRéalisés': 16,     // Q
  
  // LinkedIn (R-U) = 17-20
  'linkedin_label': 17,     // R (label)
  'linkedin_candidatures': 18,           // S
  'linkedin_entretiensPlanifiés': 19,    // T
  'linkedin_entretiensRéalisés': 20,     // U
  
  // Success Corner (V-Y) = 21-24
  'successCorner_label': 21,     // V (label)
  'successCorner_candidatures': 22,           // W
  'successCorner_entretiensPlanifiés': 23,    // X
  'successCorner_entretiensRéalisés': 24,     // Y
  
  // Interne (Z-AC) = 25-28
  'interne_label': 25,      // Z (label)
  'interne_candidatures': 26,            // AA
  'interne_entretiensPlanifiés': 27,     // AB
  'interne_entretiensRéalisés': 28,      // AC
  
  // Speed Recruiting (AD-AG) = 29-32
  'speedRecruiting_label': 29,   // AD (label)
  'speedRecruiting_candidatures': 30,           // AE
  'speedRecruiting_entretiensPlanifiés': 31,    // AF
  'speedRecruiting_entretiensRéalisés': 32,     // AG
  
  // Finales (AH-AK) = 33-36
  'totalCandidatures': 33,  // AH
  'phasing': 34,            // AI
  'closureDate': 35,        // AJ
  'comments': 36            // AK
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
        cdo: e.parameter.cdo || "",
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
        facebook_entretiensPlanifiés: parseInt(e.parameter.facebook_entretiensPlanifiés) || 0,
        facebook_entretiensRéalisés: parseInt(e.parameter.facebook_entretiensRéalisés) || 0,
        // LinkedIn
        linkedin_candidatures: parseInt(e.parameter.linkedin_candidatures) || 0,
        linkedin_entretiensPlanifiés: parseInt(e.parameter.linkedin_entretiensPlanifiés) || 0,
        linkedin_entretiensRéalisés: parseInt(e.parameter.linkedin_entretiensRéalisés) || 0,
        // Success Corner
        successCorner_candidatures: parseInt(e.parameter.successCorner_candidatures) || 0,
        successCorner_entretiensPlanifiés: parseInt(e.parameter.successCorner_entretiensPlanifiés) || 0,
        successCorner_entretiensRéalisés: parseInt(e.parameter.successCorner_entretiensRéalisés) || 0,
        // Interne
        interne_candidatures: parseInt(e.parameter.interne_candidatures) || 0,
        interne_entretiensPlanifiés: parseInt(e.parameter.interne_entretiensPlanifiés) || 0,
        interne_entretiensRéalisés: parseInt(e.parameter.interne_entretiensRéalisés) || 0,
        // Speed Recruiting
        speedRecruiting_candidatures: parseInt(e.parameter.speedRecruiting_candidatures) || 0,
        speedRecruiting_entretiensPlanifiés: parseInt(e.parameter.speedRecruiting_entretiensPlanifiés) || 0,
        speedRecruiting_entretiensRéalisés: parseInt(e.parameter.speedRecruiting_entretiensRéalisés) || 0,
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
        cdo: e.parameter.cdo,
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
        facebook_entretiensPlanifiés: parseInt(e.parameter.facebook_entretiensPlanifiés),
        facebook_entretiensRéalisés: parseInt(e.parameter.facebook_entretiensRéalisés),
        // LinkedIn
        linkedin_candidatures: parseInt(e.parameter.linkedin_candidatures),
        linkedin_entretiensPlanifiés: parseInt(e.parameter.linkedin_entretiensPlanifiés),
        linkedin_entretiensRéalisés: parseInt(e.parameter.linkedin_entretiensRéalisés),
        // Success Corner
        successCorner_candidatures: parseInt(e.parameter.successCorner_candidatures),
        successCorner_entretiensPlanifiés: parseInt(e.parameter.successCorner_entretiensPlanifiés),
        successCorner_entretiensRéalisés: parseInt(e.parameter.successCorner_entretiensRéalisés),
        // Interne
        interne_candidatures: parseInt(e.parameter.interne_candidatures),
        interne_entretiensPlanifiés: parseInt(e.parameter.interne_entretiensPlanifiés),
        interne_entretiensRéalisés: parseInt(e.parameter.interne_entretiensRéalisés),
        // Speed Recruiting
        speedRecruiting_candidatures: parseInt(e.parameter.speedRecruiting_candidatures),
        speedRecruiting_entretiensPlanifiés: parseInt(e.parameter.speedRecruiting_entretiensPlanifiés),
        speedRecruiting_entretiensRéalisés: parseInt(e.parameter.speedRecruiting_entretiensRéalisés),
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
        cdo: row[COLUMNS.cdo],
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
        interviewsConducted: (row[COLUMNS.facebook_entretiensRéalisés] || 0) +
                            (row[COLUMNS.linkedin_entretiensRéalisés] || 0) +
                            (row[COLUMNS.successCorner_entretiensRéalisés] || 0) +
                            (row[COLUMNS.interne_entretiensRéalisés] || 0) +
                            (row[COLUMNS.speedRecruiting_entretiensRéalisés] || 0),
        // Calculate total interviews to schedule from all sources
        interviewsToSchedule: (row[COLUMNS.facebook_entretiensPlanifiés] || 0) +
                             (row[COLUMNS.linkedin_entretiensPlanifiés] || 0) +
                             (row[COLUMNS.successCorner_entretiensPlanifiés] || 0) +
                             (row[COLUMNS.interne_entretiensPlanifiés] || 0) +
                             (row[COLUMNS.speedRecruiting_entretiensPlanifiés] || 0),
        // Structured source data
        sourceData: {
          'Facebook': {
            candidatures: row[COLUMNS.facebook_candidatures] || 0,
            entretiensPlanifiés: row[COLUMNS.facebook_entretiensPlanifiés] || 0,
            entretiensRéalisés: row[COLUMNS.facebook_entretiensRéalisés] || 0
          },
          'LinkedIn': {
            candidatures: row[COLUMNS.linkedin_candidatures] || 0,
            entretiensPlanifiés: row[COLUMNS.linkedin_entretiensPlanifiés] || 0,
            entretiensRéalisés: row[COLUMNS.linkedin_entretiensRéalisés] || 0
          },
          'Success Corner': {
            candidatures: row[COLUMNS.successCorner_candidatures] || 0,
            entretiensPlanifiés: row[COLUMNS.successCorner_entretiensPlanifiés] || 0,
            entretiensRéalisés: row[COLUMNS.successCorner_entretiensRéalisés] || 0
          },
          'Interne': {
            candidatures: row[COLUMNS.interne_candidatures] || 0,
            entretiensPlanifiés: row[COLUMNS.interne_entretiensPlanifiés] || 0,
            entretiensRéalisés: row[COLUMNS.interne_entretiensRéalisés] || 0
          },
          'Speed Recruiting': {
            candidatures: row[COLUMNS.speedRecruiting_candidatures] || 0,
            entretiensPlanifiés: row[COLUMNS.speedRecruiting_entretiensPlanifiés] || 0,
            entretiensRéalisés: row[COLUMNS.speedRecruiting_entretiensRéalisés] || 0
          }
        },
        // Individual columns (for backward compatibility)
        facebook_candidatures: row[COLUMNS.facebook_candidatures],
        facebook_entretiensPlanifiés: row[COLUMNS.facebook_entretiensPlanifiés],
        facebook_entretiensRéalisés: row[COLUMNS.facebook_entretiensRéalisés],
        linkedin_candidatures: row[COLUMNS.linkedin_candidatures],
        linkedin_entretiensPlanifiés: row[COLUMNS.linkedin_entretiensPlanifiés],
        linkedin_entretiensRéalisés: row[COLUMNS.linkedin_entretiensRéalisés],
        successCorner_candidatures: row[COLUMNS.successCorner_candidatures],
        successCorner_entretiensPlanifiés: row[COLUMNS.successCorner_entretiensPlanifiés],
        successCorner_entretiensRéalisés: row[COLUMNS.successCorner_entretiensRéalisés],
        interne_candidatures: row[COLUMNS.interne_candidatures],
        interne_entretiensPlanifiés: row[COLUMNS.interne_entretiensPlanifiés],
        interne_entretiensRéalisés: row[COLUMNS.interne_entretiensRéalisés],
        speedRecruiting_candidatures: row[COLUMNS.speedRecruiting_candidatures],
        speedRecruiting_entretiensPlanifiés: row[COLUMNS.speedRecruiting_entretiensPlanifiés],
        speedRecruiting_entretiensRéalisés: row[COLUMNS.speedRecruiting_entretiensRéalisés]
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
    cdo: row[COLUMNS.cdo],
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
    interviewsConducted: (row[COLUMNS.facebook_entretiensRéalisés] || 0) +
                        (row[COLUMNS.linkedin_entretiensRéalisés] || 0) +
                        (row[COLUMNS.successCorner_entretiensRéalisés] || 0) +
                        (row[COLUMNS.interne_entretiensRéalisés] || 0) +
                        (row[COLUMNS.speedRecruiting_entretiensRéalisés] || 0),
    // Calculate total interviews to schedule from all sources
    interviewsToSchedule: (row[COLUMNS.facebook_entretiensPlanifiés] || 0) +
                         (row[COLUMNS.linkedin_entretiensPlanifiés] || 0) +
                         (row[COLUMNS.successCorner_entretiensPlanifiés] || 0) +
                         (row[COLUMNS.interne_entretiensPlanifiés] || 0) +
                         (row[COLUMNS.speedRecruiting_entretiensPlanifiés] || 0),
    // Structured source data
    sourceData: {
      'Facebook': {
        candidatures: row[COLUMNS.facebook_candidatures] || 0,
        entretiensPlanifiés: row[COLUMNS.facebook_entretiensPlanifiés] || 0,
        entretiensRéalisés: row[COLUMNS.facebook_entretiensRéalisés] || 0
      },
      'LinkedIn': {
        candidatures: row[COLUMNS.linkedin_candidatures] || 0,
        entretiensPlanifiés: row[COLUMNS.linkedin_entretiensPlanifiés] || 0,
        entretiensRéalisés: row[COLUMNS.linkedin_entretiensRéalisés] || 0
      },
      'Success Corner': {
        candidatures: row[COLUMNS.successCorner_candidatures] || 0,
        entretiensPlanifiés: row[COLUMNS.successCorner_entretiensPlanifiés] || 0,
        entretiensRéalisés: row[COLUMNS.successCorner_entretiensRéalisés] || 0
      },
      'Interne': {
        candidatures: row[COLUMNS.interne_candidatures] || 0,
        entretiensPlanifiés: row[COLUMNS.interne_entretiensPlanifiés] || 0,
        entretiensRéalisés: row[COLUMNS.interne_entretiensRéalisés] || 0
      },
      'Speed Recruiting': {
        candidatures: row[COLUMNS.speedRecruiting_candidatures] || 0,
        entretiensPlanifiés: row[COLUMNS.speedRecruiting_entretiensPlanifiés] || 0,
        entretiensRéalisés: row[COLUMNS.speedRecruiting_entretiensRéalisés] || 0
      }
    },
    // Individual columns (for backward compatibility)
    facebook_candidatures: row[COLUMNS.facebook_candidatures],
    facebook_entretiensPlanifiés: row[COLUMNS.facebook_entretiensPlanifiés],
    facebook_entretiensRéalisés: row[COLUMNS.facebook_entretiensRéalisés],
    linkedin_candidatures: row[COLUMNS.linkedin_candidatures],
    linkedin_entretiensPlanifiés: row[COLUMNS.linkedin_entretiensPlanifiés],
    linkedin_entretiensRéalisés: row[COLUMNS.linkedin_entretiensRéalisés],
    successCorner_candidatures: row[COLUMNS.successCorner_candidatures],
    successCorner_entretiensPlanifiés: row[COLUMNS.successCorner_entretiensPlanifiés],
    successCorner_entretiensRéalisés: row[COLUMNS.successCorner_entretiensRéalisés],
    interne_candidatures: row[COLUMNS.interne_candidatures],
    interne_entretiensPlanifiés: row[COLUMNS.interne_entretiensPlanifiés],
    interne_entretiensRéalisés: row[COLUMNS.interne_entretiensRéalisés],
    speedRecruiting_candidatures: row[COLUMNS.speedRecruiting_candidatures],
    speedRecruiting_entretiensPlanifiés: row[COLUMNS.speedRecruiting_entretiensPlanifiés],
    speedRecruiting_entretiensRéalisés: row[COLUMNS.speedRecruiting_entretiensRéalisés]
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
    data.cdo || "",
    data.contract || "",
    data.pole || "",
    data.requestDate || new Date(),
    data.recruitmentCode || "",
    toNumber(data.numberToRecruit),
    data.duration || "",
    data.recruitmentType || "",
    data.reasonForRecruitment || "",
    // Facebook (N-Q) 13-16
    "Facebook",  // col 13 - label
    toNumber(data.facebook_candidatures),
    toNumber(data.facebook_entretiensPlanifiés),
    toNumber(data.facebook_entretiensRéalisés),
    // LinkedIn (R-U) 17-20
    "LinkedIn",  // col 17 - label
    toNumber(data.linkedin_candidatures),
    toNumber(data.linkedin_entretiensPlanifiés),
    toNumber(data.linkedin_entretiensRéalisés),
    // Success Corner (V-Y) 21-24
    "Success Corner",  // col 21 - label
    toNumber(data.successCorner_candidatures),
    toNumber(data.successCorner_entretiensPlanifiés),
    toNumber(data.successCorner_entretiensRéalisés),
    // Interne (Z-AC) 25-28
    "Interne",  // col 25 - label
    toNumber(data.interne_candidatures),
    toNumber(data.interne_entretiensPlanifiés),
    toNumber(data.interne_entretiensRéalisés),
    // Speed Recruiting (AD-AG) 29-32
    "Speed Recruiting",  // col 29 - label
    toNumber(data.speedRecruiting_candidatures),
    toNumber(data.speedRecruiting_entretiensPlanifiés),
    toNumber(data.speedRecruiting_entretiensRéalisés),
    // Finales (AH-AK) 33-36
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
  if (data.cdo !== undefined) sheet.getRange(rowId, COLUMNS.cdo + 1).setValue(data.cdo);
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
  sheet.getRange(rowId, COLUMNS.facebook_entretiensPlanifiés + 1).setValue(toNumber(data.facebook_entretiensPlanifiés));
  sheet.getRange(rowId, COLUMNS.facebook_entretiensRéalisés + 1).setValue(toNumber(data.facebook_entretiensRéalisés));
  sheet.getRange(rowId, COLUMNS.linkedin_candidatures + 1).setValue(toNumber(data.linkedin_candidatures));
  sheet.getRange(rowId, COLUMNS.linkedin_entretiensPlanifiés + 1).setValue(toNumber(data.linkedin_entretiensPlanifiés));
  sheet.getRange(rowId, COLUMNS.linkedin_entretiensRéalisés + 1).setValue(toNumber(data.linkedin_entretiensRéalisés));
  sheet.getRange(rowId, COLUMNS.successCorner_candidatures + 1).setValue(toNumber(data.successCorner_candidatures));
  sheet.getRange(rowId, COLUMNS.successCorner_entretiensPlanifiés + 1).setValue(toNumber(data.successCorner_entretiensPlanifiés));
  sheet.getRange(rowId, COLUMNS.successCorner_entretiensRéalisés + 1).setValue(toNumber(data.successCorner_entretiensRéalisés));
  sheet.getRange(rowId, COLUMNS.interne_candidatures + 1).setValue(toNumber(data.interne_candidatures));
  sheet.getRange(rowId, COLUMNS.interne_entretiensPlanifiés + 1).setValue(toNumber(data.interne_entretiensPlanifiés));
  sheet.getRange(rowId, COLUMNS.interne_entretiensRéalisés + 1).setValue(toNumber(data.interne_entretiensRéalisés));
  sheet.getRange(rowId, COLUMNS.speedRecruiting_candidatures + 1).setValue(toNumber(data.speedRecruiting_candidatures));
  sheet.getRange(rowId, COLUMNS.speedRecruiting_entretiensPlanifiés + 1).setValue(toNumber(data.speedRecruiting_entretiensPlanifiés));
  sheet.getRange(rowId, COLUMNS.speedRecruiting_entretiensRéalisés + 1).setValue(toNumber(data.speedRecruiting_entretiensRéalisés));
  
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
    
    // Créer une liste de toutes les paires fonction->attachement->cdo (sans filtrer les doublons)
    const functionAttachmentList = [];
    const seenPairs = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const fn = data[i][0];
      const attachment = data[i][1];
      const cdo = data[i][2];
      
      Logger.log("Ligne " + i + ": fonction='" + fn + "', rattachement='" + attachment + "', cdo='" + cdo + "'");
      
      // Créer une clé unique pour chaque paire (fonction, attachement, cdo)
      const pairKey = fn + "|" + (attachment || '') + "|" + (cdo || '');
      
      // Ajouter le mapping s'il n'a pas déjà été ajouté
      if (fn && !seenPairs.has(pairKey)) {
        functionAttachmentList.push({
          function: fn,
          attachment: attachment || '',
          cdo: cdo || ''
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
 * Construire le contenu HTML simplifié et compatible avec tous les clients email
 */
function buildReportEmail(totalRequests, todayCount, todayRequests, polesCount, sourcesCount) {
  try {
    const allRequests = getAllRequests();
    
    // Filtrer les demandes non clôturées (pas de closureDate ou vide)
    const openRequests = allRequests.filter(req => !req.closureDate || req.closureDate === '');
    
    const dateReport = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">
        
        <!-- HEADER SIMPLE -->
        <div style="background-color: #667eea; padding: 30px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📋 Suivi des Recrutements</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">${dateReport}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
          
          <!-- MESSAGE PRINCIPAL -->
          <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333;">
              Bonjour,<br><br>
              Veuillez vérifier et mettre à jour les informations des recrutements énumérés ci-dessous, 
              en particulier ceux non encore clôturés. Assurez-vous que toutes les données sont complètes et à jour, 
              y compris les candidatures, entretiens planifiés, entretiens réalisés et commentaires.
            </p>
          </div>
          
          <!-- STATISTIQUES RAPIDES - Utiliser un tableau au lieu de grid -->
          <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 25px;">
            <tr>
              <td style="width: 50%; padding: 12px; text-align: center; background-color: #f8f9fa; border: 1px solid #e0e0e0;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${openRequests.length}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">Recrutements en Cours</div>
              </td>
              <td style="width: 50%; padding: 12px; text-align: center; background-color: #f8f9fa; border: 1px solid #e0e0e0;">
                <div style="font-size: 24px; font-weight: bold; color: #f5576c;">${totalRequests - openRequests.length}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">Clôturés</div>
              </td>
            </tr>
          </table>
          
          <!-- LISTE DES RECRUTEMENTS NON CLÔTURÉS -->
          ${openRequests.length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h2 style="margin: 0 0 15px 0; padding-bottom: 10px; color: #333; font-size: 16px; font-weight: bold; border-bottom: 2px solid #667eea;">🎯 Campagnes et Postes Non Clôturés (${openRequests.length})</h2>
              
              <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f0f3ff; border-bottom: 2px solid #667eea;">
                    <th style="padding: 10px; text-align: left; font-weight: bold; color: #333; border: 1px solid #e0e0e0;">Fonction</th>
                    <th style="padding: 10px; text-align: left; font-weight: bold; color: #333; border: 1px solid #e0e0e0;">Entité (CDO)</th>
                    <th style="padding: 10px; text-align: center; font-weight: bold; color: #333; border: 1px solid #e0e0e0;">À Recruter</th>
                    <th style="padding: 10px; text-align: center; font-weight: bold; color: #333; border: 1px solid #e0e0e0;">Candidatures</th>
                  </tr>
                </thead>
                <tbody>
                  ${openRequests.slice(0, 20).map((req, idx) => `
                    <tr style="background-color: ${idx % 2 === 0 ? '#fafbfc' : 'white'};">
                      <td style="padding: 10px; font-weight: 500; border: 1px solid #eee;">${req.function || 'N/A'}</td>
                      <td style="padding: 10px; border: 1px solid #eee;"><span style="background-color: #e8eaff; padding: 3px 8px; font-size: 11px;">${req.cdo || 'N/A'}</span></td>
                      <td style="padding: 10px; text-align: center; font-weight: bold; border: 1px solid #eee;">${req.numberToRecruit || '-'}</td>
                      <td style="padding: 10px; text-align: center; border: 1px solid #eee;">${req.totalCandidatures || '0'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              ${openRequests.length > 20 ? `
                <div style="margin-top: 12px; padding: 10px; background-color: #f5f5f5; text-align: center; color: #666; font-size: 11px;">
                  ... et ${openRequests.length - 20} autres campagnes/postes à mettre à jour
                </div>
              ` : ''}
            </div>
          ` : `
            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 25px;">
              <p style="margin: 0; color: #155724; font-size: 13px; font-weight: 500;">✅ Excellent ! Tous les recrutements sont clôturés.</p>
            </div>
          `}
          
          <!-- APPEL À L'ACTION -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #856404; font-size: 12px; line-height: 1.6;">
              <strong>⚠️ Actions Requises :</strong><br>
              • Mettez à jour les candidatures et entretiens pour chaque poste<br>
              • Complétez les commentaires et le phasing<br>
              • Clôturez les recrutements terminés<br>
              • Accédez au <strong>tableau de bord</strong> pour plus de détails
            </p>
          </div>
          
          <!-- PIED DE PAGE -->
          <div style="text-align: center; color: #999; font-size: 11px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 5px 0;">Connecteo RH - Système de Gestion des Recrutements</p>
            <p style="margin: 5px 0; opacity: 0.7;">Ne répondez pas à cet email. Accédez au tableau de bord pour mettre à jour vos recrutements.</p>
          </div>
          
        </div>
      </div>
    `;
    
    return html;
  } catch (e) {
    Logger.log("Erreur dans buildReportEmail: " + e.toString());
    return "<p>Erreur lors de la génération du rapport</p>";
  }
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

// ================= CONFIG =================
const SPREADSHEET_ID = "1JAloTdOH9G5rG6mVCtowSt_nzp3tYT9k9vaZYiZ8cTs";
const SHEET_NAME = "Reporting Recrutements";

const COLUMNS = {
  'submissionDate': 0,
  'hrbp': 1,
  'function': 2,
  'attachment': 3,
  'contract': 4,
  'requestDate': 5,
  'recruitmentCode': 6,
  'numberToRecruit': 7,
  'duration': 8,
  'recruitmentType': 9,
  'reasonForRecruitment': 10,
  'col11': 11,  // Unknown/Reserved column
  'col12': 12,  // Unknown/Reserved column
  'col13': 13,  // Unknown/Reserved column
  'col14': 14,  // Unknown/Reserved column
  // Facebook
  'facebook_label': 15,
  'facebook_candidatures': 16,
  'facebook_entretiensPlanifies': 17,
  'facebook_entretiensRealisés': 18,
  // LinkedIn
  'linkedin_label': 19,
  'linkedin_candidatures': 20,
  'linkedin_entretiensPlanifies': 21,
  'linkedin_entretiensRealisés': 22,
  // Success Corner
  'successCorner_label': 23,
  'successCorner_candidatures': 24,
  'successCorner_entretiensPlanifies': 25,
  'successCorner_entretiensRealisés': 26,
  // Interne
  'interne_label': 27,
  'interne_candidatures': 28,
  'interne_entretiensPlanifies': 29,
  'interne_entretiensRealisés': 30,
  // Speed Recruiting
  'speedRecruiting_label': 31,
  'speedRecruiting_candidatures': 32,
  'speedRecruiting_entretiensPlanifies': 33,
  'speedRecruiting_entretiensRealisés': 34,
  // Autres
  'phasing': 35,
  'closureDate': 36,
  'comments': 37
};

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
        requestDate: row[COLUMNS.requestDate],
        recruitmentCode: row[COLUMNS.recruitmentCode],
        numberToRecruit: row[COLUMNS.numberToRecruit],
        duration: row[COLUMNS.duration],
        recruitmentType: row[COLUMNS.recruitmentType],
        reasonForRecruitment: row[COLUMNS.reasonForRecruitment],
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
        speedRecruiting_entretiensRealisés: row[COLUMNS.speedRecruiting_entretiensRealisés],
        phasing: row[COLUMNS.phasing],
        closureDate: row[COLUMNS.closureDate],
        comments: row[COLUMNS.comments]
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
    requestDate: row[COLUMNS.requestDate],
    recruitmentCode: row[COLUMNS.recruitmentCode],
    numberToRecruit: row[COLUMNS.numberToRecruit],
    duration: row[COLUMNS.duration],
    recruitmentType: row[COLUMNS.recruitmentType],
    reasonForRecruitment: row[COLUMNS.reasonForRecruitment],
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
    speedRecruiting_entretiensRealisés: row[COLUMNS.speedRecruiting_entretiensRealisés],
    phasing: row[COLUMNS.phasing],
    closureDate: row[COLUMNS.closureDate],
    comments: row[COLUMNS.comments]
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
    data.requestDate || new Date(),
    data.recruitmentCode || "",
    data.numberToRecruit || 0,
    data.duration || "",
    data.recruitmentType || "",
    data.reasonForRecruitment || "",
    "",  // col11
    "",  // col12
    "",  // col13
    "",  // col14
    "Facebook",
    data.facebook_candidatures || 0,
    data.facebook_entretiensPlanifies || 0,
    data.facebook_entretiensRealisés || 0,
    "LinkedIn",
    data.linkedin_candidatures || 0,
    data.linkedin_entretiensPlanifies || 0,
    data.linkedin_entretiensRealisés || 0,
    "Success Corner",
    data.successCorner_candidatures || 0,
    data.successCorner_entretiensPlanifies || 0,
    data.successCorner_entretiensRealisés || 0,
    "Interne",
    data.interne_candidatures || 0,
    data.interne_entretiensPlanifies || 0,
    data.interne_entretiensRealisés || 0,
    "Speed Recruiting",
    data.speedRecruiting_candidatures || 0,
    data.speedRecruiting_entretiensPlanifies || 0,
    data.speedRecruiting_entretiensRealisés || 0,
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
  if (data.requestDate !== undefined) sheet.getRange(rowId, COLUMNS.requestDate + 1).setValue(data.requestDate);
  if (data.recruitmentCode !== undefined) sheet.getRange(rowId, COLUMNS.recruitmentCode + 1).setValue(data.recruitmentCode);
  if (data.numberToRecruit !== undefined) sheet.getRange(rowId, COLUMNS.numberToRecruit + 1).setValue(data.numberToRecruit);
  if (data.duration !== undefined) sheet.getRange(rowId, COLUMNS.duration + 1).setValue(data.duration);
  if (data.recruitmentType !== undefined) sheet.getRange(rowId, COLUMNS.recruitmentType + 1).setValue(data.recruitmentType);
  if (data.reasonForRecruitment !== undefined) sheet.getRange(rowId, COLUMNS.reasonForRecruitment + 1).setValue(data.reasonForRecruitment);
  
  // Mettre à jour les colonnes Facebook
  sheet.getRange(rowId, COLUMNS.facebook_label + 1).setValue('Facebook');
  if (data.facebook_candidatures !== undefined) sheet.getRange(rowId, COLUMNS.facebook_candidatures + 1).setValue(data.facebook_candidatures);
  if (data.facebook_entretiensPlanifies !== undefined) sheet.getRange(rowId, COLUMNS.facebook_entretiensPlanifies + 1).setValue(data.facebook_entretiensPlanifies);
  if (data.facebook_entretiensRealisés !== undefined) sheet.getRange(rowId, COLUMNS.facebook_entretiensRealisés + 1).setValue(data.facebook_entretiensRealisés);
  
  // Mettre à jour les colonnes LinkedIn
  sheet.getRange(rowId, COLUMNS.linkedin_label + 1).setValue('LinkedIn');
  if (data.linkedin_candidatures !== undefined) sheet.getRange(rowId, COLUMNS.linkedin_candidatures + 1).setValue(data.linkedin_candidatures);
  if (data.linkedin_entretiensPlanifies !== undefined) sheet.getRange(rowId, COLUMNS.linkedin_entretiensPlanifies + 1).setValue(data.linkedin_entretiensPlanifies);
  if (data.linkedin_entretiensRealisés !== undefined) sheet.getRange(rowId, COLUMNS.linkedin_entretiensRealisés + 1).setValue(data.linkedin_entretiensRealisés);
  
  // Mettre à jour les colonnes Success Corner
  sheet.getRange(rowId, COLUMNS.successCorner_label + 1).setValue('Success Corner');
  if (data.successCorner_candidatures !== undefined) sheet.getRange(rowId, COLUMNS.successCorner_candidatures + 1).setValue(data.successCorner_candidatures);
  if (data.successCorner_entretiensPlanifies !== undefined) sheet.getRange(rowId, COLUMNS.successCorner_entretiensPlanifies + 1).setValue(data.successCorner_entretiensPlanifies);
  if (data.successCorner_entretiensRealisés !== undefined) sheet.getRange(rowId, COLUMNS.successCorner_entretiensRealisés + 1).setValue(data.successCorner_entretiensRealisés);
  
  // Mettre à jour les colonnes Interne
  sheet.getRange(rowId, COLUMNS.interne_label + 1).setValue('Interne');
  if (data.interne_candidatures !== undefined) sheet.getRange(rowId, COLUMNS.interne_candidatures + 1).setValue(data.interne_candidatures);
  if (data.interne_entretiensPlanifies !== undefined) sheet.getRange(rowId, COLUMNS.interne_entretiensPlanifies + 1).setValue(data.interne_entretiensPlanifies);
  if (data.interne_entretiensRealisés !== undefined) sheet.getRange(rowId, COLUMNS.interne_entretiensRealisés + 1).setValue(data.interne_entretiensRealisés);
  
  // Mettre à jour les colonnes Speed Recruiting
  sheet.getRange(rowId, COLUMNS.speedRecruiting_label + 1).setValue('Speed Recruiting');
  if (data.speedRecruiting_candidatures !== undefined) sheet.getRange(rowId, COLUMNS.speedRecruiting_candidatures + 1).setValue(data.speedRecruiting_candidatures);
  if (data.speedRecruiting_entretiensPlanifies !== undefined) sheet.getRange(rowId, COLUMNS.speedRecruiting_entretiensPlanifies + 1).setValue(data.speedRecruiting_entretiensPlanifies);
  if (data.speedRecruiting_entretiensRealisés !== undefined) sheet.getRange(rowId, COLUMNS.speedRecruiting_entretiensRealisés + 1).setValue(data.speedRecruiting_entretiensRealisés);
  
  // Mettre à jour les autres colonnes
  if (data.phasing !== undefined) sheet.getRange(rowId, COLUMNS.phasing + 1).setValue(data.phasing);
  if (data.closureDate !== undefined) sheet.getRange(rowId, COLUMNS.closureDate + 1).setValue(data.closureDate);
  if (data.comments !== undefined) sheet.getRange(rowId, COLUMNS.comments + 1).setValue(data.comments);
}

// ================= GET DROPDOWN OPTIONS =================
function getDropdownOptions() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("Grande liste");
    
    if (!sheet) {
      Logger.log("Erreur: Feuille 'Grande liste' introuvable");
      return {
        functionAttachmentMap: {}
      };
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return {
        functionAttachmentMap: {}
      };
    }
    
    // Créer un mapping Fonction -> Rattachement en préservant la correspondance
    const functionAttachmentMap = {};
    const seenFunctions = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const fn = data[i][0];
      const attachment = data[i][1];
      
      // Ajouter le mapping si la fonction n'a pas encore été traitée
      if (fn && !seenFunctions.has(fn)) {
        functionAttachmentMap[fn] = attachment || '';
        seenFunctions.add(fn);
      }
    }
    
    return {
      functionAttachmentMap: functionAttachmentMap
    };
  } catch (error) {
    Logger.log("Erreur dans getDropdownOptions: " + error.toString());
    return {
      functionAttachmentMap: {}
    };
  }
}

// ================= JSON OUTPUT =================
function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

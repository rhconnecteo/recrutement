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
  'receivedApplications': 11,
  'interviewsToSchedule': 12,
  'interviewsConducted': 13,
  'phasing': 14,
  'closureDate': 15,
  'comments': 16
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
        receivedApplications: parseInt(e.parameter.receivedApplications) || 0,
        interviewsToSchedule: parseInt(e.parameter.interviewsToSchedule) || 0,
        interviewsConducted: parseInt(e.parameter.interviewsConducted) || 0,
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
        receivedApplications: parseInt(e.parameter.receivedApplications),
        interviewsToSchedule: parseInt(e.parameter.interviewsToSchedule),
        interviewsConducted: parseInt(e.parameter.interviewsConducted),
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
        receivedApplications: row[COLUMNS.receivedApplications],
        interviewsToSchedule: row[COLUMNS.interviewsToSchedule],
        interviewsConducted: row[COLUMNS.interviewsConducted],
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
    receivedApplications: row[COLUMNS.receivedApplications],
    interviewsToSchedule: row[COLUMNS.interviewsToSchedule],
    interviewsConducted: row[COLUMNS.interviewsConducted],
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
    data.receivedApplications || 0,
    data.interviewsToSchedule || 0,
    data.interviewsConducted || 0,
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

  // Mettre à jour les colonnes
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
  if (data.receivedApplications !== undefined) sheet.getRange(rowId, COLUMNS.receivedApplications + 1).setValue(data.receivedApplications);
  if (data.interviewsToSchedule !== undefined) sheet.getRange(rowId, COLUMNS.interviewsToSchedule + 1).setValue(data.interviewsToSchedule);
  if (data.interviewsConducted !== undefined) sheet.getRange(rowId, COLUMNS.interviewsConducted + 1).setValue(data.interviewsConducted);
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

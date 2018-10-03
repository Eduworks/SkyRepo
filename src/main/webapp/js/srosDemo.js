//**************************************************************************************************
// Main logic script Sky Repo Demo
//**************************************************************************************************

//**************************************************************************************************
// Constants

const DEBUG_CONSOLE = true;
const DEBUG_ALERT = false;

const UI_HIGH_LVL_WARNING = ".srosUiHighLevelWarning";

const UI_MAIN_ERROR_CTR = "#srosUiMainErrorContainer";
const UI_MAIN_ERROR_TXT = "#srosUiMainErrorText";

const UI_MAIN_BUSY_CTR = "#srosUiMainBusyContainer";
const UI_MAIN_BUSY_TXT = "#srosUiMainBusyText";

const PAGE_MAIN_CONTENTS_CTR = "#srosMainPageContents";

const NO_OBJECTS_WARNING_CTR = "#noRepositoryObjectsWarning";

const UI_ACTION_MENU = "#srosActionMenu";

const REPO_ITEM_LIST = "#repoObjectDisplayList";

const SROS_FILE_TYPE = "file";
const SROS_URL_TYPE = "url";

const RL_SORT_NAME_FLD = "NM";
const RL_SORT_TYPE_FLD = "TP";
const RL_SORT_DTCRT_FLD = "DTCRT";
const RL_SORT_DTMOD_FLD = "DTMOD";
const RL_SORT_DIR_ASC = "ASC";
const RL_SORT_DIR_DES = "DES";

const SROS_MODAL_INPUT = ".srosModalInput";
const SROS_MODAL_BTN = ".srosModalButton";
const SROS_MODAL_BUSY_CTR = ".srosModalBusyCtr";
const SROS_MODAL_BUSY_TXT = ".srosModalBusyText";
const SROS_MODAL_ERROR_CTR = ".srosModalErrorCtr";
const SROS_MODAL_ERROR_TXT = ".srosModalErrorText";

const ADD_OBJECT_MODAL = "#modal-add-object";
const AO_MOD_FILE_TYPE_CTR = "#maoFileTypeContainer";
const AO_MOD_URL_TYPE_CTR = "#maoUrlTypeContainer";
const AO_MOD_OBJ_TYPE = "#maoObjType";
const AO_MOD_OBJ_FILE = "#maoObjFile";
const AO_MOD_OBJ_NAME = "#maoObjName";
const AO_MOD_OBJ_URL = "#maoObjUrl";
const AO_MOD_OBJ_INIT_VERS = "#maoObjInitVers";
const AO_MOD_OBJ_DESC = "#maoObjDesc";

const DELETE_OBJECT_MODAL = "#modal-delete-object";
const DO_MOD_OBJ_NAME = "#mdoObjectName";
const DO_MOD_OBJ_ID = "#mdoObjectId";

const EDIT_OBJECT_MODAL = "#modal-edit-object";
const EO_MOD_OBJ_ID = "#meoObjectId";
const EO_MOD_OBJ_TYPE = "#meoObjectType";
const EO_MOD_OBJ_NAME = "#meoObjName";
const EO_MOD_OBJ_LRT = "#meoObjResType";
const EO_MOD_OBJ_CLASSIF = "#meoObjCls";
const EO_MOD_OBJ_DESC = "#meoObjDesc";
const EO_MOD_OBJ_KEYWORDS = "#meoObjKeywords";
const EO_MOD_OBJ_LANG = "#meoObjLang";
const EO_MOD_OBJ_IAT = "#meoObjIntactType";
const EO_MOD_OBJ_EDUSE = "#meoObjEdUse";
const EO_MOD_OBJ_AUD = "#meoObjAud";
const EO_MOD_OBJ_AUTH = "#meoObjAuth";
const EO_MOD_OBJ_DUR_MINS = "#meoObjDurMins";
const EO_MOD_OBJ_VER_LIST = "#meoObjVersionList";
const EO_MOD_INFO_TAB_HDR = "#meoObjInfoTabHdr";
const EO_MOD_INFO_TAB = "#meoObjInfoTab";

const ADD_OBJECT_VER_MODAL = "#modal-add-object-version";
const AV_MOD_OBJ_ID = "#mavObjId";
const AV_MOD_OBJ_TYPE = "#mavObjType";
const AV_MOD_VER_NAME = "#mavVerName";
const AV_MOD_VER_FILE_CTR = "#mavFileTypeContainer";
const AV_MOD_VER_FILE = "#mavVerFile";
const AV_MOD_VER_URL_CTR = "#mavUrlTypeContainer";
const AV_MOD_VER_URL = "#mavVerUrl";

const DELETE_OBJECT_VER_MODAL = "#modal-delete-version";
const DV_MOD_OBJ_NAME = "#mdvObjectName";
const DV_MOD_VER_NAME_DISP = "#mdvVersionNameDisp";
const DV_MOD_OBJ_ID = "#mdvObjectId";
const DV_MOD_VER_NAME = "#mdvVersionName";

const EDIT_OBJECT_VER_MODAL = "#modal-edit-object-version";
const EV_MOD_OBJ_ID = "#mevObjId";
const EV_MOD_OBJ_TYPE = "#mevObjType";
const EV_MOD_VER_NAME = "#mevVerName";
const EV_MOD_VER_FILE_CTR = "#mevFileTypeContainer";
const EV_MOD_VER_FILE = "#mevVerFile";
const EV_MOD_VER_URL_CTR = "#mevUrlTypeContainer";
const EV_MOD_VER_URL = "#mevVerUrl";

//**************************************************************************************************
// Variables

var repositoryItemList;
var repositoryItemMap;

var currentRepoListSortField = RL_SORT_DTCRT_FLD;
var currentRepoListSortDirection = RL_SORT_DIR_DES;
var currentEditMetadataId;

//**************************************************************************************************
// Utility
//**************************************************************************************************

function debugMessage(msg) {
    if (DEBUG_CONSOLE) console.log(msg);
    if (DEBUG_ALERT) alert(msg);
}

function showPageAsBusy(text) {
    $(UI_MAIN_ERROR_CTR).hide();
    $(UI_HIGH_LVL_WARNING).hide();
    hidePageMainContentsContainer();
    $(UI_MAIN_BUSY_TXT).html(text);
    $(UI_MAIN_BUSY_CTR).show();
}

function showPageError(text) {
    $(UI_MAIN_BUSY_CTR).hide();
    $(UI_HIGH_LVL_WARNING).hide();
    hidePageMainContentsContainer();
    $(UI_MAIN_ERROR_TXT).html(text);
    $(UI_MAIN_ERROR_CTR).show();
}

function showPageMainContentsContainer() {
    if (!$(PAGE_MAIN_CONTENTS_CTR).is(":visible")) {
        $(UI_HIGH_LVL_WARNING).hide();
        $(UI_MAIN_BUSY_CTR).hide();
        $(UI_MAIN_ERROR_CTR).hide();
        $(PAGE_MAIN_CONTENTS_CTR).show();
    }
}

function hidePageMainContentsContainer() {
    $(PAGE_MAIN_CONTENTS_CTR).hide();
}

function showNoRepositoryObjectsWarning() {
    $(UI_MAIN_BUSY_CTR).hide();
    $(UI_MAIN_ERROR_CTR).hide();
    $(UI_HIGH_LVL_WARNING).hide();
    hidePageMainContentsContainer();
    $(NO_OBJECTS_WARNING_CTR).show();
}

function hideActionMenu() {
    $(UI_ACTION_MENU).hide();
}

function showActionMenu() {
    $(UI_ACTION_MENU).show();
}

function isValidVersionName(versionName) {
    if (!versionName || versionName.trim().length == 0) return false;
    else {
        versionName = versionName.trim();
        if (versionName.indexOf("<") != - 1) return false;
        else if (versionName.indexOf(">") != - 1) return false;
        else if (versionName.indexOf(":") != - 1) return false;
        else if (versionName.indexOf("\"") != - 1) return false;
        else if (versionName.indexOf("\\") != - 1) return false;
        else if (versionName.indexOf("|") != - 1) return false;
        else if (versionName.indexOf("?") != - 1) return false;
        else if (versionName.indexOf("*") != - 1) return false;
        else if (versionName.toUpperCase() == "CON") return false;
        else if (versionName.toUpperCase() == "PRN") return false;
        else if (versionName.toUpperCase() == "AUX") return false;
        else if (versionName.toUpperCase() == "NUL") return false;
        else if (versionName.toUpperCase() == "COM1") return false;
        else if (versionName.toUpperCase() == "COM2") return false;
        else if (versionName.toUpperCase() == "COM3") return false;
        else if (versionName.toUpperCase() == "COM4") return false;
        else if (versionName.toUpperCase() == "COM5") return false;
        else if (versionName.toUpperCase() == "COM6") return false;
        else if (versionName.toUpperCase() == "COM7") return false;
        else if (versionName.toUpperCase() == "COM8") return false;
        else if (versionName.toUpperCase() == "COM9") return false;
        else if (versionName.toUpperCase() == "LPT1") return false;
        else if (versionName.toUpperCase() == "LPT2") return false;
        else if (versionName.toUpperCase() == "LPT3") return false;
        else if (versionName.toUpperCase() == "LPT4") return false;
        else if (versionName.toUpperCase() == "LPT5") return false;
        else if (versionName.toUpperCase() == "LPT6") return false;
        else if (versionName.toUpperCase() == "LPT7") return false;
        else if (versionName.toUpperCase() == "LPT8") return false;
        else if (versionName.toUpperCase() == "LPT9") return false;
        else if (versionName.endsWith(".")) return false;
    }
    return true;
}

function isValidUrl(urlInput) {
    var regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(urlInput)) return true;
    else return false;
}

// function isValidUrl(urlInput) {
//     var regexQuery = "^(?:(?:(?:https?|ftp):)?\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\\.(?:[a-z\u00a1-\uffff]{2,})))(?::\\d{2,5})?(?:[/?#]\\S*)?$";
//     var url = new RegExp(regexQuery,"i");
//     return url.test(urlInput);
// }

function sortRepositoryItemList() {
    if (currentRepoListSortField == RL_SORT_NAME_FLD) {
        if (currentRepoListSortDirection == RL_SORT_DIR_ASC) {
            repositoryItemList.sort(function (a, b) {return a.name.localeCompare(b.name);});
        }
        else {
            repositoryItemList.sort(function (a, b) {return b.name.localeCompare(a.name);});
        }
    }
    else if (currentRepoListSortField == RL_SORT_TYPE_FLD) {
        if (currentRepoListSortDirection == RL_SORT_DIR_ASC) {
            repositoryItemList.sort(function (a, b) {return a.additionalType.localeCompare(b.additionalType);});
        }
        else {
            repositoryItemList.sort(function (a, b) {return b.additionalType.localeCompare(a.additionalType);});
        }
    }
    else if (currentRepoListSortField == RL_SORT_DTMOD_FLD) {
        if (currentRepoListSortDirection == RL_SORT_DIR_ASC) {
            repositoryItemList.sort(function (a, b) {return Date.parse(a.dateCreated) - Date.parse(b.dateCreated);});
        }
        else {
            repositoryItemList.sort(function (a, b) {return Date.parse(b.dateCreated) - Date.parse(a.dateCreated);});
        }
    }
    else { //RL_SORT_DTCRT_FLD
        if (currentRepoListSortDirection == RL_SORT_DIR_ASC) {
            repositoryItemList.sort(function (a, b) {return Date.parse(a.dateModified) - Date.parse(b.dateModified);});
        }
        else {
            repositoryItemList.sort(function (a, b) {return Date.parse(b.dateModified) - Date.parse(a.dateModified);});
        }
    }
    popuplateRepositoryItemDisplayList();
}

function disableModalInputsAndButtons() {
    $(SROS_MODAL_INPUT).attr("disabled", "true");
    $(SROS_MODAL_BTN).attr("disabled", "true");
}

function enableModalInputsAndButtons() {
    $(SROS_MODAL_INPUT).removeAttr("disabled");
    $(SROS_MODAL_BTN).removeAttr("disabled");
}

function showModalBusy(modalId,busyHtml) {
    hideModalError(modalId);
    disableModalInputsAndButtons();
    $(modalId + ' ' + SROS_MODAL_BUSY_TXT).html(busyHtml);
    $(modalId + ' ' + SROS_MODAL_BUSY_CTR).show();
}

function hideModalBusy(modalId) {
    $(modalId + ' ' + SROS_MODAL_BUSY_CTR).hide();
}

function showModalError(modalId,errorHtml) {
    hideModalBusy(modalId);
    enableModalInputsAndButtons();
    $(modalId + ' ' + SROS_MODAL_ERROR_TXT).html(errorHtml);
    $(modalId + ' ' + SROS_MODAL_ERROR_CTR).show();
}

function hideModalError(modalId) {
    $(modalId + ' ' + SROS_MODAL_ERROR_CTR).hide();
    $(SROS_MODAL_INPUT).removeClass("invalid");
}

function showModalInputAsInvalid(fieldId) {
    $(fieldId).addClass("invalid");
}

function buildUlHtmlFromStringArray(sa) {
    if (!sa || sa.length == 0) return "";
    var ulHtml = "<ul class=\"fa-ul\">";
    for (var i=0;i<sa.length;i++) {
        ulHtml += "<li>";
        ulHtml += sa[i];
        ulHtml += "</li>";
    }
    ulHtml += "</ul>";
    return ulHtml;
}

function isoDurationToMinutes(duration) {
    var dur = moment.duration(duration, moment.ISO_8601);
    return dur.asMinutes();
}

function minutesToIsoDuration(minutes) {
    var dur = moment.duration(minutes,'minutes');
    return dur.toISOString();
}

function escapeSingleQuote(str) {
    return str.replace(/'/g, "\\'");
}

//TODO fix version return in levr
//Search seems to return versions as an object map instead of array....
function generateVersionArray(vers) {
    if (vers instanceof Array) return vers;
    //
    var retVers = [];
    for (var property in vers) {
        if (vers.hasOwnProperty(property)) {
            retVers.push(vers[property]);
        }
    }
    return retVers;
}
//
// function generateNewVersionNameGuess(repObj) {
//     try {
//         var mrvn = getMostRecentRepositoryItemVersion(repObj);
//         var lastNumberGuess = mrvn.replace(/\D/g,'') * 1;
//         var versionPrefixGuess = mrvn.replace(/[0-9]/g, '');
//         if (lastNumberGuess >= 0) {
//             if (mrvn.endsWith(lastNumberGuess))
//         }
//         else return "";
//     }
//     catch (e) {
//         return "";
//     }
//
//
//     //myString = myString.replace(/\D/g,''); //REMOVE ALL NON NUMBERS
//     //questionText.replace(/[0-9]/g, ''); //REMOVE ALL NUMBERS
// }

function replaceRepositoryItem(metadataId,newRepObj) {
    var newRepItemList = [];
    newRepItemList.push(newRepObj);
    for (var i=0;i<repositoryItemList.length;i++) {
        if (repositoryItemList[i].identifier != metadataId) newRepItemList.push(repositoryItemList[i]);
    }
    repositoryItemList = newRepItemList;
    buildRepositoryItemMap();
}

//**************************************************************************************************
// Modal Functions
//**************************************************************************************************
function populateEditRepositoryObjectModalUsageFields(metadataId) {
    //TODO handle object paradata
}

function cancelEditRepositoryObjectVersion() {
    openEditRepositoryObjectModal(currentEditMetadataId,false);
}

function getEditRepositoryObjectVersionModalInputs() {
    var evInput = {};
    evInput.objId = $(EV_MOD_OBJ_ID).val();
    evInput.objType = $(EV_MOD_OBJ_TYPE).val();
    evInput.verName = $(EV_MOD_VER_NAME).val();
    if ($(EV_MOD_VER_FILE).prop('files') && $(EV_MOD_VER_FILE).prop('files').length >= 1) {
        evInput.verFile = $(EV_MOD_VER_FILE).prop('files')[0];
    }
    evInput.verUrl = $(EV_MOD_VER_URL).val();
    return evInput;
}

function validateEditRepositoryObjectVersionModalInputs(evInput) {
    var vo = {};
    vo.isValid = true;
    vo.invalidMessages = [];
    if (!evInput.verName || evInput.verName.trim().length == 0) {
        vo.isValid = false;
        vo.invalidMessages.push("Version Name is required");
        showModalInputAsInvalid(EV_MOD_VER_NAME);
    }
    else if (!isValidVersionName(evInput.verName)) {
        vo.isValid = false;
        vo.invalidMessages.push("Invalid version name");
        showModalInputAsInvalid(EV_MOD_VER_NAME);
    }
    if (evInput.objType == SROS_FILE_TYPE) {
        if (!evInput.verFile) {
            vo.isValid = false;
            vo.invalidMessages.push("No file selected");
        }
    }
    else {
        if (!evInput.verUrl || evInput.verUrl.trim().length == 0) {
            vo.isValid = false;
            vo.invalidMessages.push("URL is required");
            showModalInputAsInvalid(EV_MOD_VER_URL);
        }
        else if (!isValidUrl(evInput.verUrl)) {
            vo.isValid = false;
            vo.invalidMessages.push("Invalid URL");
            showModalInputAsInvalid(EV_MOD_VER_URL);
        }
    }
    return vo;
}

function saveEditRepositoryObjectVersion() {
    hideModalError(EDIT_OBJECT_VER_MODAL);
    var evInput = getEditRepositoryObjectVersionModalInputs();
    var vo = validateEditRepositoryObjectVersionModalInputs(evInput);
    if (!vo.isValid) showModalError(EDIT_OBJECT_VER_MODAL,buildUlHtmlFromStringArray(vo.invalidMessages));
    else {
        showModalBusy(EDIT_OBJECT_VER_MODAL,"Editing version...");
        if (evInput.objType == SROS_FILE_TYPE) {
            updateRepositoryObjectFileVersion(evInput.verFile,evInput.verName,evInput.objId,
                handleUpdateRepositoryObjectVersionResponseSuccess,handleUpdateRepositoryObjectVersionResponseFailure);
        }
        else {
            updateRepositoryObjectUrlVersion(evInput.verUrl,evInput.verName,evInput.objId,
                handleUpdateRepositoryObjectVersionResponseSuccess,handleUpdateRepositoryObjectVersionResponseFailure);
        }
    }
}

function clearEditRepositoryObjectVersionModalInputs() {
    $(EV_MOD_VER_FILE).val("");
    $(EV_MOD_VER_NAME).val("");
    $(EV_MOD_VER_URL).val("");
}

function editRepositoryItemVersion(metadataId,versionName) {
    clearEditRepositoryObjectVersionModalInputs();
    enableModalInputsAndButtons();
    hideModalBusy(EDIT_OBJECT_VER_MODAL);
    hideModalError(EDIT_OBJECT_VER_MODAL);
    var repObj = repositoryItemMap[metadataId];
    $(EV_MOD_OBJ_ID).val(metadataId);
    $(EV_MOD_OBJ_TYPE).val(repObj.additionalType);
    $(EV_MOD_VER_NAME).val(versionName);
    if (repObj.additionalType == SROS_FILE_TYPE) {
        $(EV_MOD_VER_URL_CTR).hide();
        $(EV_MOD_VER_FILE_CTR).show();
    }
    else {
        $(EV_MOD_VER_FILE_CTR).hide();
        $(EV_MOD_VER_URL_CTR).show();
    }
    $(EDIT_OBJECT_VER_MODAL).foundation('open');
}

function cancelDeleteRepositoryObjectVersion() {
    openEditRepositoryObjectModal(currentEditMetadataId,false);
}

function handleDeleteRepositoryObjectVersionSuccess(resObj) {
    var metadataId = resObj.identifier;
    replaceRepositoryItem(metadataId,resObj);
    populateEditRepositoryObjectModalVersionFields(metadataId);
    retrieveAndBuildRepositoryItemList();
    hideModalBusy(DELETE_OBJECT_VER_MODAL);
    enableModalInputsAndButtons();
    openEditRepositoryObjectModal(metadataId,false);
}

function handleDeleteRepositoryObjectVersionFailure(errMsg) {
    showModalError(DELETE_OBJECT_VER_MODAL,errMsg);
}

function confirmDeleteRepositoryObjectVersion() {
    var metadataId = $(DV_MOD_OBJ_ID).val();
    var versionName = $(DV_MOD_VER_NAME).val();
    var repObj = repositoryItemMap[metadataId];
    var va = generateVersionArray(repObj.version);
    if (va.length > 1) {
        showModalBusy(DELETE_OBJECT_VER_MODAL,"Deleting version...");
        deleteRepositoryObjectVersion(metadataId,versionName,handleDeleteRepositoryObjectVersionSuccess,handleDeleteRepositoryObjectVersionFailure);
    }
    else {
        showModalError(DELETE_OBJECT_VER_MODAL,"Cannot delete last object version");
    }
}

function deleteRepositoryItemVersion(metadataId,versionName) {
    var repObj = repositoryItemMap[metadataId];
    $(DV_MOD_OBJ_NAME).html(repObj.name);
    $(DV_MOD_VER_NAME_DISP).html(versionName);
    $(DV_MOD_OBJ_ID).val(metadataId);
    $(DV_MOD_VER_NAME).val(versionName);
    $(DELETE_OBJECT_VER_MODAL).foundation('open');
}

function getAddRepositoryObjectVersionModalInputs() {
    var avInput = {};
    avInput.objId = $(AV_MOD_OBJ_ID).val();
    avInput.objType = $(AV_MOD_OBJ_TYPE).val();
    avInput.verName = $(AV_MOD_VER_NAME).val();
    if ($(AV_MOD_VER_FILE).prop('files') && $(AV_MOD_VER_FILE).prop('files').length >= 1) {
        avInput.verFile = $(AV_MOD_VER_FILE).prop('files')[0];
    }
    avInput.verUrl = $(AV_MOD_VER_URL).val();
    return avInput;
}

function validateAddRepositoryObjectVersionModalInputs(avInput) {
    var vo = {};
    vo.isValid = true;
    vo.invalidMessages = [];
    if (!avInput.verName || avInput.verName.trim().length == 0) {
        vo.isValid = false;
        vo.invalidMessages.push("Version Name is required");
        showModalInputAsInvalid(AV_MOD_VER_NAME);
    }
    else if (!isValidVersionName(avInput.verName)) {
        vo.isValid = false;
        vo.invalidMessages.push("Invalid version name");
        showModalInputAsInvalid(AV_MOD_VER_NAME);
    }
    if (avInput.objType == SROS_FILE_TYPE) {
        if (!avInput.verFile) {
            vo.isValid = false;
            vo.invalidMessages.push("No file selected");
        }
    }
    else {
        if (!avInput.verUrl || avInput.verUrl.trim().length == 0) {
            vo.isValid = false;
            vo.invalidMessages.push("URL is required");
            showModalInputAsInvalid(AV_MOD_VER_URL);
        }
        else if (!isValidUrl(avInput.verUrl)) {
            vo.isValid = false;
            vo.invalidMessages.push("Invalid URL");
            showModalInputAsInvalid(AV_MOD_VER_URL);
        }
    }
    return vo;
}

function cancelNewRepositoryObjectVersion() {
    openEditRepositoryObjectModal(currentEditMetadataId,false);
}

function handleUpdateRepositoryObjectVersionResponseSuccess(resObj) {
    var metadataId = resObj.identifier;
    replaceRepositoryItem(metadataId,resObj);
    populateEditRepositoryObjectModalVersionFields(metadataId);
    retrieveAndBuildRepositoryItemList();
    hideModalBusy(ADD_OBJECT_VER_MODAL);
    enableModalInputsAndButtons();
    openEditRepositoryObjectModal(metadataId,false);
}

function handleUpdateRepositoryObjectVersionResponseFailure(errMsg) {
    showModalError(ADD_OBJECT_VER_MODAL,errMsg);
}

function saveNewRepositoryObjectVersion() {
    hideModalError(ADD_OBJECT_VER_MODAL);
    var avInput = getAddRepositoryObjectVersionModalInputs();
    var vo = validateAddRepositoryObjectVersionModalInputs(avInput);
    if (!vo.isValid) showModalError(ADD_OBJECT_VER_MODAL,buildUlHtmlFromStringArray(vo.invalidMessages));
    else {
        showModalBusy(ADD_OBJECT_VER_MODAL,"Creating new version...");
        if (avInput.objType == SROS_FILE_TYPE) {
            updateRepositoryObjectFileVersion(avInput.verFile,avInput.verName,avInput.objId,
                handleUpdateRepositoryObjectVersionResponseSuccess,handleUpdateRepositoryObjectVersionResponseFailure);
        }
        else {
            updateRepositoryObjectUrlVersion(avInput.verUrl,avInput.verName,avInput.objId,
                handleUpdateRepositoryObjectVersionResponseSuccess,handleUpdateRepositoryObjectVersionResponseFailure);
        }
    }
}

function clearAddNewRepositoryObjectVersionModalInputs() {
    $(AV_MOD_VER_FILE).val("");
    $(AV_MOD_VER_NAME).val("");
    $(AV_MOD_VER_URL).val("");
}

function openAddNewRepositoryItemVersionModal() {
    clearAddNewRepositoryObjectVersionModalInputs();
    enableModalInputsAndButtons();
    hideModalBusy(ADD_OBJECT_VER_MODAL);
    hideModalError(ADD_OBJECT_VER_MODAL);
    var repObj = repositoryItemMap[currentEditMetadataId];
    $(AV_MOD_OBJ_ID).val(currentEditMetadataId);
    $(AV_MOD_OBJ_TYPE).val(repObj.additionalType);
    var mrvn = getMostRecentRepositoryItemVersion(repObj);
    if (mrvn) $(AV_MOD_VER_NAME).attr("placeholder","last version: " + mrvn);
    if (repObj.additionalType == SROS_FILE_TYPE) {
        $(AV_MOD_VER_URL_CTR).hide();
        $(AV_MOD_VER_FILE_CTR).show();
    }
    else {
        $(AV_MOD_VER_FILE_CTR).hide();
        $(AV_MOD_VER_URL_CTR).show();
    }
    $(ADD_OBJECT_VER_MODAL).foundation('open');
}

function populateEditRepositoryObjectModalInfoFields(metadataId) {
    var repObj = repositoryItemMap[metadataId];
    if (!repObj) return;
    $(EO_MOD_OBJ_ID).val(metadataId);
    $(EO_MOD_OBJ_TYPE).val(repObj.additionalType);
    $(EO_MOD_OBJ_NAME).val(repObj.name);
    $(EO_MOD_OBJ_LRT).val(repObj.learningResourceType);
    $(EO_MOD_OBJ_CLASSIF).val(repObj.genre);
    $(EO_MOD_OBJ_DESC).val(repObj.description);
    $(EO_MOD_OBJ_KEYWORDS).val(repObj.keywords);
    $(EO_MOD_OBJ_LANG).val(repObj.inLanguage);
    $(EO_MOD_OBJ_IAT).val(repObj.interactivityType);
    $(EO_MOD_OBJ_EDUSE).val(repObj.educationalUse);
    if (repObj.audience && repObj.audience.name) $(EO_MOD_OBJ_AUD).val(repObj.audience.name);
    else $(EO_MOD_OBJ_AUD).val("");
    if (repObj.author && repObj.author.name) $(EO_MOD_OBJ_AUTH).val(repObj.author.name);
    else $(EO_MOD_OBJ_AUTH).val("");
    if (repObj.timeRequired && isoDurationToMinutes(repObj.timeRequired) != 0) $(EO_MOD_OBJ_DUR_MINS).val(isoDurationToMinutes(repObj.timeRequired));
    else $(EO_MOD_OBJ_DUR_MINS).val("");
}

function getDownloadOrGotoRepItemVersionListToolLink(repObj,vi) {
    var linkHtml = "";
    if (repObj.additionalType == SROS_FILE_TYPE) {
        linkHtml += "&nbsp;&nbsp;<a class=\"downloadItem\" title=\"Download Item Version:'" + vi.versionName + "'\" " +
            "href=\"" + buildSrosDownloadLink(repObj.identifier,vi.versionName) + "\"><i class=\"fa fa-cloud-download\"></i></a>";
    }
    else {
        linkHtml += "&nbsp;&nbsp;<a class=\"gotoItem\" title=\"Open Item ('" + vi.versionUrl + "')\" " +
                "href=\"" + vi.versionUrl + "\" target=\"" + repObj.name + "\"><i class=\"fa fa-sitemap\"></i></a>";
    }
    return linkHtml;
}

function addRepItemVersionListLiTools(repObj,viLiDiv,vi,showDeleteTool) {
    var viLiToolsDiv = $("<div/>");
    viLiToolsDiv.addClass("cell small-1");
    var viLiToolsDivHtml = "<a class=\"editItem\" title=\"Edit Version\" "+
        "onclick=\"editRepositoryItemVersion('" + repObj.identifier + "','" + escapeSingleQuote(vi.versionName) + "')\">" +
        "<i class=\"fa fa-book\"></i></a>";
    if (showDeleteTool) {
        viLiToolsDivHtml += "&nbsp;&nbsp;<a class=\"deleteItem\" title=\"Delete Version\" " +
            "onclick=\"deleteRepositoryItemVersion('" + repObj.identifier + "','" + escapeSingleQuote(vi.versionName) + "')\">" +
            "<i class=\"fa fa-trash\"></i></a>";
    }
    else {
        viLiToolsDivHtml += "&nbsp;&nbsp;<span class=\"cantDeleteItem\" title=\"Cannot Delete Version\">" +
            "<i class=\"fa fa-trash\"></i></span>";
    }
    viLiToolsDivHtml += getDownloadOrGotoRepItemVersionListToolLink(repObj,vi);
    viLiToolsDiv.html(viLiToolsDivHtml);
    viLiDiv.append(viLiToolsDiv);
}

function addRepItemVersionListLiDetails(viLiDiv,vi,showUrl) {
    var viLiNameDiv = $("<div/>");
    viLiNameDiv.addClass("cell small-3 versItemPadding");
    var viLiNameDivHtml = "<span class=\"repListItemName\">" + vi.versionName + "</span>";
    viLiNameDiv.html(viLiNameDivHtml);
    viLiDiv.append(viLiNameDiv);
    var viLiCreateDateDiv = $("<div/>");
    viLiCreateDateDiv.addClass("cell small-4 versItemPadding");
    var viLiCreateDateDivHtml = "<span class=\"repListItemDate\">" + vi.dateCreated + "</span>";
    viLiCreateDateDiv.html(viLiCreateDateDivHtml);
    viLiDiv.append(viLiCreateDateDiv);
    var viLiModDateDiv = $("<div/>");
    viLiModDateDiv.addClass("cell small-4 versItemPadding");
    var viLiModDateDivHtml = "<span class=\"repListItemDate\">" + vi.dateModified + "</span>";
    viLiModDateDiv.html(viLiModDateDivHtml);
    viLiDiv.append(viLiModDateDiv);
    if (showUrl) {
        var viLiUrlPaddingDiv = $("<div/>");
        viLiUrlPaddingDiv.addClass("cell small-1 versItemPadding");
        viLiDiv.append(viLiUrlPaddingDiv);
        var viLiUrlDiv = $("<div/>");
        viLiUrlDiv.addClass("cell small-11 versItemPadding");
        var viLiUrlDivHtml = "<a href=\"" + vi.versionUrl + "\" target=\"" + vi.versionName + "\"><span class=\"repListItemUrl\">" + vi.versionUrl + "</span></a>";
        viLiUrlDiv.html(viLiUrlDivHtml);
        viLiDiv.append(viLiUrlDiv);
    }
}

function generateRepItemVersionDisplayListLi(repObj,vi,showDeleteTool) {
    var viLi = $("<li/>");
    var viLiDiv = $("<div/>");
    viLiDiv.addClass("grid-x");
    addRepItemVersionListLiTools(repObj,viLiDiv,vi,showDeleteTool);
    var showUrl = false;
    if ((repObj.additionalType == SROS_URL_TYPE)) showUrl = true;
    addRepItemVersionListLiDetails(viLiDiv,vi,showUrl);
    viLi.append(viLiDiv);
    return viLi;
}

function populateEditRepositoryObjectModalVersionFields(metadataId) {
    $(EO_MOD_OBJ_VER_LIST).empty();
    var repObj = repositoryItemMap[metadataId];
    //var versionList = repObj.version;
    var versionList = generateVersionArray(repObj.version);
    //TODO default sort version list
    var showDeleteTool = true;
    if (versionList.length <= 1) showDeleteTool = false;
    for (var i=0;i<versionList.length;i++) {
        $(EO_MOD_OBJ_VER_LIST).append(generateRepItemVersionDisplayListLi(repObj, versionList[i],showDeleteTool));
    }
}

function populateEditRepositoryObjectModalFields(metadataId) {
    populateEditRepositoryObjectModalInfoFields(metadataId);
    populateEditRepositoryObjectModalVersionFields(metadataId);
    populateEditRepositoryObjectModalUsageFields(metadataId);
}

function getEditRepositoryObjectModalInputs() {
    var eoInput = {};
    eoInput.objId = $(EO_MOD_OBJ_ID).val();
    eoInput.objName = $(EO_MOD_OBJ_NAME).val();
    eoInput.objLrt = $(EO_MOD_OBJ_LRT).val();
    eoInput.objClassif = $(EO_MOD_OBJ_CLASSIF).val();
    eoInput.objDesc = $(EO_MOD_OBJ_DESC).val();
    eoInput.objKeywords = $(EO_MOD_OBJ_KEYWORDS).val();
    eoInput.objLang = $(EO_MOD_OBJ_LANG).val();
    eoInput.objIat = $(EO_MOD_OBJ_IAT).val();
    eoInput.objEdUse = $(EO_MOD_OBJ_EDUSE).val();
    eoInput.objAud = $(EO_MOD_OBJ_AUD).val();
    eoInput.objAuth = $(EO_MOD_OBJ_AUTH).val();
    eoInput.objDurMins = $(EO_MOD_OBJ_DUR_MINS).val();
    return eoInput;
}

function validateEditRepositoryObjectModalInputs(eoInput) {
    var vo = {};
    vo.isValid = true;
    vo.invalidMessages = [];
    if (!eoInput.objName || eoInput.objName.trim().length == 0) {
        vo.isValid = false;
        vo.invalidMessages.push("Name is required");
        showModalInputAsInvalid(EO_MOD_OBJ_NAME);
    }
    if (eoInput.objDurMins && eoInput.objDurMins.trim() != "" && isNaN(eoInput.objDurMins.trim())) {
        vo.isValid = false;
        vo.invalidMessages.push("Duration must be a number");
        showModalInputAsInvalid(EO_MOD_OBJ_DUR_MINS);
    }
    return vo;
}

function handleSaveRepositoryItemSuccess(repoItemListResponse) {
    retrieveAndBuildRepositoryItemList();
    hideModalBusy(EDIT_OBJECT_MODAL);
    enableModalInputsAndButtons();
    verifyDisabledEditRepositoryObjectFields();
    $(EDIT_OBJECT_MODAL).foundation('close');
}

function handleSaveRepositoryItemFailure(errMsg) {
    showModalError(EDIT_OBJECT_MODAL,errMsg);
    verifyDisabledEditRepositoryObjectFields();
}

function saveRepositoryObjectMetadata() {
    hideModalError(EDIT_OBJECT_MODAL);
    var eoInput = getEditRepositoryObjectModalInputs();
    var vo = validateEditRepositoryObjectModalInputs(eoInput);
    if (!vo.isValid) {
        showModalError(EDIT_OBJECT_MODAL,buildUlHtmlFromStringArray(vo.invalidMessages));
        verifyDisabledEditRepositoryObjectFields();
    }
    else {
        showModalBusy(EDIT_OBJECT_MODAL,"Saving repository object...");
        //console.log(eoInput);
        var isoDur = "";
        if (eoInput.objDurMins && eoInput.objDurMins.trim() != "" && !isNaN(eoInput.objDurMins.trim())) {
            isoDur = minutesToIsoDuration(eoInput.objDurMins * 1);
        }
        updateRepositoryObjectMetadata(eoInput.objId,eoInput.objName,eoInput.objDesc,eoInput.objLrt,
            eoInput.objClassif,eoInput.objKeywords,eoInput.objIat,eoInput.objLang,
            isoDur,eoInput.objAud,eoInput.objEdUse,eoInput.objAuth,
            handleSaveRepositoryItemSuccess,handleSaveRepositoryItemFailure);
    }
}

function verifyDisabledEditRepositoryObjectFields() {
    $(EO_MOD_OBJ_TYPE).attr("disabled", "true");
    var repObj = repositoryItemMap[currentEditMetadataId];
    if (repObj) {
        if (repObj.additionalType == SROS_FILE_TYPE) $(EO_MOD_OBJ_NAME).attr("disabled", "true");
        else $(EO_MOD_OBJ_NAME).removeAttr("disabled");
    }
}

function setEditRepObjModalTabToInfo() {
    $(EDIT_OBJECT_MODAL + " .tabs-title").removeClass("is-active");
    $(EDIT_OBJECT_MODAL + " .tabs-panel").removeClass("is-active");
    $(EDIT_OBJECT_MODAL + " .tabs-title a").attr("aria-selected","false");
    $(EO_MOD_INFO_TAB_HDR).addClass("is-active");
    $(EO_MOD_INFO_TAB_HDR + " a").attr("aria-selected","true");
    $(EO_MOD_INFO_TAB).addClass("is-active");
}

function openEditRepositoryObjectModal(metadataId,refreshData) {
    enableModalInputsAndButtons();
    currentEditMetadataId = metadataId;
    hideModalBusy(EDIT_OBJECT_MODAL);
    hideModalError(EDIT_OBJECT_MODAL);
    var repObj = repositoryItemMap[metadataId];
    if (refreshData) {
        populateEditRepositoryObjectModalFields(metadataId);
        setEditRepObjModalTabToInfo();
    }
    verifyDisabledEditRepositoryObjectFields();
    $(EDIT_OBJECT_MODAL).foundation('open');
}

function handleDeleteEntireRepositoryObjectResponseSuccess() {
    retrieveAndBuildRepositoryItemList();
    hideModalBusy(DELETE_OBJECT_MODAL);
    enableModalInputsAndButtons();
    $(DELETE_OBJECT_MODAL).foundation('close');
}

function handleDeleteEntireRepositoryObjectResponseFailure(errMsg) {
    showModalError(DELETE_OBJECT_MODAL,errMsg);
}

function confirmDeleteRepositoryObject() {
    var metadataId = $(DO_MOD_OBJ_ID).val();
    showModalBusy(DELETE_OBJECT_MODAL,"Deleting repository object...");
    deleteEntireRepositoryObject(metadataId,handleDeleteEntireRepositoryObjectResponseSuccess,handleDeleteEntireRepositoryObjectResponseFailure);
}

function openDeleteRepositoryObjectConfirmModal(metadataId) {
    enableModalInputsAndButtons();
    hideModalBusy(DELETE_OBJECT_MODAL);
    hideModalError(DELETE_OBJECT_MODAL);
    var repObj = repositoryItemMap[metadataId];
    $(DO_MOD_OBJ_NAME).html(repObj.name);
    $(DO_MOD_OBJ_ID).val(metadataId);
    $(DELETE_OBJECT_MODAL).foundation('open');
}

function clearAddRepositoryObjectModalInputs() {
    $(AO_MOD_OBJ_TYPE).val(SROS_FILE_TYPE);
    $(AO_MOD_URL_TYPE_CTR).hide();
    $(AO_MOD_FILE_TYPE_CTR).show();
    $(AO_MOD_OBJ_FILE).val("");
    $(AO_MOD_OBJ_URL).val("");
    $(AO_MOD_OBJ_INIT_VERS).val("");
    $(AO_MOD_OBJ_DESC).val("");
}

function openAddRepositoryObjectModal() {
    clearAddRepositoryObjectModalInputs();
    enableModalInputsAndButtons();
    hideModalBusy(ADD_OBJECT_MODAL);
    hideModalError(ADD_OBJECT_MODAL);
    $(ADD_OBJECT_MODAL).foundation('open');
}

function getAddRepositoryObjectModalInputs() {
    var aoInput = {};
    aoInput.objType = $(AO_MOD_OBJ_TYPE).val();
    aoInput.objFile = null;
    if ($(AO_MOD_OBJ_FILE).prop('files') && $(AO_MOD_OBJ_FILE).prop('files').length >= 1) {
        aoInput.objFile = $(AO_MOD_OBJ_FILE).prop('files')[0];
    }
    aoInput.objName = $(AO_MOD_OBJ_NAME).val();
    aoInput.objUrl = $(AO_MOD_OBJ_URL).val();
    aoInput.objInitVer = $(AO_MOD_OBJ_INIT_VERS).val();
    aoInput.objDesc = $(AO_MOD_OBJ_DESC).val();
    return aoInput;
}

function validateAddRepositoryObjectModalInputs(aoInput) {
    var vo = {};
    vo.isValid = true;
    vo.invalidMessages = [];
    if (!aoInput.objInitVer || aoInput.objInitVer.trim().length == 0) {
        vo.isValid = false;
        vo.invalidMessages.push("Version is required");
        showModalInputAsInvalid(AO_MOD_OBJ_INIT_VERS);
    }
    else if (!isValidVersionName(aoInput.objInitVer)) {
        vo.isValid = false;
        vo.invalidMessages.push("Invalid version name");
        showModalInputAsInvalid(AO_MOD_OBJ_INIT_VERS);
    }
    if (aoInput.objType == SROS_FILE_TYPE) {
        if (!aoInput.objFile) {
            vo.isValid = false;
            vo.invalidMessages.push("No file selected");
        }
    }
    else {
        if (!aoInput.objName || aoInput.objName.trim().length == 0) {
            vo.isValid = false;
            vo.invalidMessages.push("Name is required for URL type objects");
            showModalInputAsInvalid(AO_MOD_OBJ_NAME);
        }
        if (!aoInput.objUrl || aoInput.objUrl.trim().length == 0) {
            vo.isValid = false;
            vo.invalidMessages.push("URL is required for URL type objects");
            showModalInputAsInvalid(AO_MOD_OBJ_URL);
        }
        else if (!isValidUrl(aoInput.objUrl)) {
            vo.isValid = false;
            vo.invalidMessages.push("Invalid URL");
            showModalInputAsInvalid(AO_MOD_OBJ_URL);
        }
    }
    return vo;
}

function handleCreateRepositoryItemSuccess(repoItemListResponse) {
    retrieveAndBuildRepositoryItemList();
    hideModalBusy(ADD_OBJECT_MODAL);
    enableModalInputsAndButtons();
    $(ADD_OBJECT_MODAL).foundation('close');
}

function handleCreateRepositoryItemFailure(errMsg) {
    showModalError(ADD_OBJECT_MODAL,errMsg);
}

function addNewRepositoryObject() {
    hideModalError(ADD_OBJECT_MODAL);
    var aoInput = getAddRepositoryObjectModalInputs();
    var vo = validateAddRepositoryObjectModalInputs(aoInput);
    if (!vo.isValid) showModalError(ADD_OBJECT_MODAL,buildUlHtmlFromStringArray(vo.invalidMessages));
    else {
        showModalBusy(ADD_OBJECT_MODAL,"Creating repository object...");
        if (aoInput.objType == SROS_FILE_TYPE) {
            createRepositoryObjectFile(aoInput.objFile,aoInput.objInitVer,aoInput.objDesc,"",
                handleCreateRepositoryItemSuccess,handleCreateRepositoryItemFailure);
        }
        else {
            createRepositoryObjectUrl(aoInput.objUrl,aoInput.objInitVer,aoInput.objName,aoInput.objDesc,"",
                handleCreateRepositoryItemSuccess,handleCreateRepositoryItemFailure);
        }
    }
}

function changeAddRepositoryObjectType() {
    var ot =$(AO_MOD_OBJ_TYPE).val();
    if (ot == SROS_FILE_TYPE) {
        $(AO_MOD_URL_TYPE_CTR).hide();
        $(AO_MOD_FILE_TYPE_CTR).show();
    }
    else {
        $(AO_MOD_FILE_TYPE_CTR).hide();
        $(AO_MOD_URL_TYPE_CTR).show();
    }
}

//**************************************************************************************************
// Misc. Click Handlers
//**************************************************************************************************

function handleSortRepositoryItemVersionListClick(sortField) {
    //TODO implement
    alert("TODO handleSortRepositoryItemVersionListClick");
}

function handleSortRepositoryItemListClick(sortField) {
    if (sortField == currentRepoListSortField) {
        if (currentRepoListSortDirection == RL_SORT_DIR_ASC) currentRepoListSortDirection = RL_SORT_DIR_DES;
        else currentRepoListSortDirection = RL_SORT_DIR_ASC;
    }
    else {
        currentRepoListSortField = sortField;
        currentRepoListSortDirection = RL_SORT_DIR_ASC;
    }
    sortRepositoryItemList();
}

function handleAddRepositoryItemClick() {
    openAddRepositoryObjectModal();
}

//**************************************************************************************************
// Main Functions
//**************************************************************************************************

function getMostRecentRepositoryItemVersion(ri) {
    var versions = generateVersionArray(ri.version);
    if (!versions) return "";
    else if (versions.length == 1) return versions[0].versionName;
    else {
        var mrv = versions[0];
        for (var i=1;i<versions.length;i++) {
            if (Date.parse(versions[i].dateCreated) > Date.parse(mrv.dateCreated)) {
                mrv = versions[i];
            }
        }
        return mrv.versionName;
    }
}

function getMostRecentRepositoryItemVersionUrl(ri) {
    var versions = generateVersionArray(ri.version);
    if (!versions) return "";
    else if (versions.length == 1) return versions[0].versionName;
    else {
        var mrv = versions[0];
        for (var i=1;i<versions.length;i++) {
            if (Date.parse(versions[i].dateCreated) > Date.parse(mrv.dateCreated)) {
                mrv = versions[i];
            }
        }
        return mrv.versionUrl;
    }
}

function deleteEntireRepositoryItem(metadataId) {
    openDeleteRepositoryObjectConfirmModal(metadataId);
}

function editRepositoryItem(metadataId) {
    openEditRepositoryObjectModal(metadataId,true);
}

function getDownloadOrGotoRepItemListToolLink(ri) {
    var linkHtml = "";
    var mostRecentlyCreatedVersion = getMostRecentRepositoryItemVersion(ri);
    if (ri.additionalType == SROS_FILE_TYPE && mostRecentlyCreatedVersion != "") {
        linkHtml += "&nbsp;&nbsp;<a class=\"downloadItem\" title=\"Download Item Version:'" + mostRecentlyCreatedVersion + "'\" " +
            "href=\"" + buildSrosDownloadLink(ri.identifier,mostRecentlyCreatedVersion) + "\"><i class=\"fa fa-cloud-download\"></i></a>";
    }
    else {
        var mostRecentlyCreatedUrl = getMostRecentRepositoryItemVersionUrl(ri);
        if (mostRecentlyCreatedUrl != "") {
            linkHtml += "&nbsp;&nbsp;<a class=\"gotoItem\" title=\"Open Item ('" + mostRecentlyCreatedUrl + "')\" " +
                "href=\"" + mostRecentlyCreatedUrl + "\" target=\"" + ri.name + "\"><i class=\"fa fa-sitemap\"></i></a>";
        }
    }
    return linkHtml;
}

function addRepositoryItemDisplayListLiTools(riLiDiv,ri) {
    var riLiToolsDiv = $("<div/>");
    riLiToolsDiv.addClass("cell small-1");
    var riLiToolsDivHtml = "<a class=\"editItem\" title=\"Edit Item\" onclick=\"editRepositoryItem('" + ri.identifier + "')\">" +
        "<i class=\"fa fa-book\"></i></a>";
    riLiToolsDivHtml += "&nbsp;&nbsp;<a class=\"deleteItem\" title=\"Delete Item\" onclick=\"deleteEntireRepositoryItem('" + ri.identifier + "')\">" +
        "<i class=\"fa fa-trash\"></i></a>";
    riLiToolsDivHtml += getDownloadOrGotoRepItemListToolLink(ri);
    riLiToolsDiv.html(riLiToolsDivHtml);
    riLiDiv.append(riLiToolsDiv);
}

function addRepositoryItemDisplayListLiDetails(riLiDiv,ri) {
    var riLiNameDiv = $("<div/>");
    riLiNameDiv.addClass("cell small-4");
    var riLiNameDivHtml = "<span class=\"repListItemName\">" + ri.name + "</span>";
    riLiNameDiv.html(riLiNameDivHtml);
    riLiDiv.append(riLiNameDiv);
    var riLiTypeDiv = $("<div/>");
    riLiTypeDiv.addClass("cell small-1");
    var riLiTypeDivHtml = "<span>" + ri.additionalType + "</span>";
    riLiTypeDiv.html(riLiTypeDivHtml);
    riLiDiv.append(riLiTypeDiv);
    var riLiCreateDateDiv = $("<div/>");
    riLiCreateDateDiv.addClass("cell small-3");
    var riLiCreateDateDivHtml = "<span class=\"repListItemDate\">" + ri.dateCreated + "</span>";
    riLiCreateDateDiv.html(riLiCreateDateDivHtml);
    riLiDiv.append(riLiCreateDateDiv);
    var riLiModDateDiv = $("<div/>");
    riLiModDateDiv.addClass("cell small-3");
    var riLiModDateDivHtml = "<span class=\"repListItemDate\">" + ri.dateModified + "</span>";
    riLiModDateDiv.html(riLiModDateDivHtml);
    riLiDiv.append(riLiModDateDiv);

}

function generateRepositoryItemDisplayListLi(ri) {
    var riLi = $("<li/>");
    var riLiDiv = $("<div/>");
    riLiDiv.addClass("grid-x");
    addRepositoryItemDisplayListLiTools(riLiDiv,ri);
    addRepositoryItemDisplayListLiDetails(riLiDiv,ri);
    riLi.append(riLiDiv);
    return riLi;
}

function popuplateRepositoryItemDisplayList() {
    $(REPO_ITEM_LIST).empty();
    for (var i=0;i<repositoryItemList.length;i++) {
        $(REPO_ITEM_LIST).append(generateRepositoryItemDisplayListLi(repositoryItemList[i]));
    }
}

function buildRepositoryItemDisplay() {
    showPageAsBusy("Building object display...");
    sortRepositoryItemList();
    popuplateRepositoryItemDisplayList();
    showActionMenu();
    showPageMainContentsContainer();
}

function buildRepositoryItemMap() {
    repositoryItemMap = {};
    for (var i=0;i<repositoryItemList.length;i++) {
        repositoryItemMap[repositoryItemList[i].identifier] = repositoryItemList[i];
    }
}

function setAndDisplayRepositoryItemList(repoItemArray) {
    repositoryItemList = repoItemArray;
    buildRepositoryItemMap();
    if (!repositoryItemList || repositoryItemList.length == 0) {
        showActionMenu();
        showNoRepositoryObjectsWarning();
    }
    else buildRepositoryItemDisplay();
}

function handleGetAllRepositoryObjectsSuccess(returnedRepositoryItems) {
    setAndDisplayRepositoryItemList(returnedRepositoryItems);
}

function handleGetAllRepositoryObjectsFailure(msg) {
    showPageError("Object repository search failed: " + msg);
}

function retrieveAndBuildRepositoryItemList() {
    hideActionMenu();
    showPageAsBusy("Searching object repository...");
    debugMessage("Retrieving object repository items from " + SROS_SERVICE_PREFIX);
    getAllRepositoryObjects(handleGetAllRepositoryObjectsSuccess,handleGetAllRepositoryObjectsFailure);
}

function init() {
    retrieveAndBuildRepositoryItemList();
}

$(document).ready(function () {
    init();
});

//**************************************************************************************************
// Foundation
//**************************************************************************************************

$(document).foundation();
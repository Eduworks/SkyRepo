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

const RL_SORT_NAME_FLD = "NM";
const RL_SORT_TYPE_FLD = "TP";
const RL_SORT_DTCRT_FLD = "DTCRT";
const RL_SORT_DTMOD_FLD = "DTMOD";
const RL_SORT_DIR_ASC = "ASC";
const RL_SORT_DIR_DES = "DES";

//**************************************************************************************************
// Variables

var repositoryItemList;
var repositoryItemMap;

var currentRepoListSortField = RL_SORT_DTCRT_FLD;
var currentRepoListSortDirection = RL_SORT_DIR_DES;

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
    var regexQuery = "^(?:(?:(?:https?|ftp):)?\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\\.(?:[a-z\u00a1-\uffff]{2,})))(?::\\d{2,5})?(?:[/?#]\\S*)?$";
    var url = new RegExp(regexQuery,"i");
    return url.test(urlInput);
}

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

//**************************************************************************************************
// Modal Functions
//**************************************************************************************************

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
            vo.invalidMessages.push("Invalid URL (make sure to include protocol 'http, ftp, etc.')");
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
    var versions = ri.version;
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
    var versions = ri.version;
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

function editEntireRepositoryItem(metadataId) {
    alert("TODO editEntireRepositoryItem: " + metadataId);
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
    var riLiToolsDivHtml = "<a class=\"editItem\" title=\"Edit Item\" onclick=\"editEntireRepositoryItem('" + ri.identifier + "')\">" +
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
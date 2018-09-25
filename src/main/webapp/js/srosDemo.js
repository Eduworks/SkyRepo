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

const ADD_OBJECT_MODAL = "#modal-add-object";
const AO_MOD_FILE_TYPE_CTR = "#maoFileTypeContainer";
const AO_MOD_URL_TYPE_CTR = "#maoUrlTypeContainer";
const AO_MOD_OBJ_TYPE = "#maoObjType";
const AO_MOD_OBJ_FILE = "#maoObjFile";

//**************************************************************************************************
// Variables

var repositoryItemList;
var repositoryItemMap;

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

//**************************************************************************************************
// Modal Functions
//**************************************************************************************************

function openAddRepositoryObjectModal() {
    $(ADD_OBJECT_MODAL).foundation('open');
}

// const ADD_OBJECT_MODAL = "#modal-add-object";
// const AO_MOD_FILE_TYPE_CTR = "#maoFileTypeContainer";
// const AO_MOD_URL_TYPE_CTR = "#maoUrlTypeContainer";
// const AO_MOD_OBJ_TYPE = "#maoObjType";
// const AO_MOD_OBJ_FILE = "#maoObjFile";



function changeAddRepositoryObjectType() {
    var ot =$(AO_MOD_OBJ_TYPE).val();
    if (ot == "file") {
        $(AO_MOD_URL_TYPE_CTR).hide();
        $(AO_MOD_FILE_TYPE_CTR).show();
    }
    else {
        $(AO_MOD_FILE_TYPE_CTR).hide();
        $(AO_MOD_URL_TYPE_CTR).show();
    }
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

function deleteEntireRepositoryItem(metadataId) {
    alert("TODO deleteEntireRepositoryItem: " + metadataId);
}

function editEntireRepositoryItem(metadataId) {
    alert("TODO editEntireRepositoryItem: " + metadataId);
}

function addRepositoryItemDisplayListLiTools(riLiDiv,ri) {
    var riLiToolsDiv = $("<div/>");
    riLiToolsDiv.addClass("cell small-1");
    var riLiToolsDivHtml = "<a title=\"Edit Item\" onclick=\"editEntireRepositoryItem('" + ri.identifier + "')\">" +
        "<i class=\"fa fa-book\"></i></a>";
    riLiToolsDivHtml += "&nbsp;&nbsp;<a title=\"Delete Item\" onclick=\"deleteEntireRepositoryItem('" + ri.identifier + "')\">" +
        "<i class=\"fa fa-trash\"></i></a>";

    var mostRecentlyCreatedVersion = getMostRecentRepositoryItemVersion(ri);
    if (ri.additionalType == SROS_FILE_TYPE && mostRecentlyCreatedVersion != "") {
        riLiToolsDivHtml += "&nbsp;&nbsp;<a title=\"Download Item ('" + mostRecentlyCreatedVersion + "')\" " +
            "href=\"" + buildSrosDownloadLink(ri.identifier,mostRecentlyCreatedVersion) + "\"><i class=\"fa fa-cloud-download\"></i></a>";
    }
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

function handleGetAllRepositoryObjectsSuccess(returnedRepositoryItems) {
    repositoryItemList = returnedRepositoryItems;
    buildRepositoryItemMap();
    if (!repositoryItemList || repositoryItemList.length == 0) {
        showActionMenu();
        showNoRepositoryObjectsWarning();
    }
    else buildRepositoryItemDisplay();
}

function handleGetAllRepositoryObjectsFailure(msg) {
    showPageError("Object repository search failed: " + msg);
}

function init() {
    hideActionMenu();
    showPageAsBusy("Searching object repository...");
    debugMessage("Retrieving object repository items from " + SROS_SERVICE_PREFIX);
    getAllRepositoryObjects(handleGetAllRepositoryObjectsSuccess,handleGetAllRepositoryObjectsFailure);
}

$(document).ready(function () {
    init();
});

//**************************************************************************************************
// Foundation
//**************************************************************************************************

$(document).foundation();
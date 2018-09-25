//**************************************************************************************************
// Sky Repo Object Store Services Interface
//**************************************************************************************************

//**************************************************************************************************
// Constants

const SROS_SERVICE_PREFIX = "http://localhost:8080/api/custom";

const SROS_GET_ALL_OBJECTS_SERVICE = "/skyRepo/os/get/all";
const SROS_CREATE_FILE_ITEM_SERVICE = "/skyRepo/os/file/create";
const SROS_CREATE_URL_ITEM_SERVICE = "/skyRepo/os/url/create";
const SROS_UPDATE_FILE_ITEM_VERSION_SERVICE = "/skyRepo/os/file/update/version";
const SROS_UPDATE_URL_ITEM_VERSION_SERVICE = "/skyRepo/os/url/update/version";
const SROS_UPDATE_ITEM_METADATA_SERVICE = "/skyRepo/os/update/metadata";
const SROS_DELETE_ENTIRE_ITEM_SERVICE = "/skyRepo/os/delete/entire";
const SROS_DELETE_ITEM_VERSION_SERVICE = "/skyRepo/os/delete/version";
const SROS_DOWNLOAD_ITEM_SERVICE = "/skyRepo/os/file/get";

const SROS_FORM_DATA_NAME = "srosData";

function buildSrosDownloadLink(objectMetadataId,versionName) {
    return SROS_SERVICE_PREFIX + SROS_DOWNLOAD_ITEM_SERVICE + "?requestedVersion=" + versionName + "&metadataId=" + objectMetadataId;
}

function executeSrosService(service,formData,mainCompletionCallback,subSuccessCallback,subFailureCallback) {
    if (!formData) formData = new FormData();
    var request = new XMLHttpRequest();
    request.open("POST", SROS_SERVICE_PREFIX + service);
    request.onreadystatechange = function () {
        if (request.readyState==4) {
            var responseJson = null;
            try {
                responseJson = JSON.parse(request.responseText);
            }
            catch (e) {
                debugMessage("WARNING: request.responseText could not be parsed into JSON: " + request.responseText);
            }
            debugMessage("Calling service mainCompletionCallback");
            mainCompletionCallback(responseJson,subSuccessCallback,subFailureCallback);
        }
    }
    debugMessage("Executing service: " + service);
    request.send(formData);
}

function isGoodSrosServiceResponse(responseJson) {
    if (!responseJson.status) return false;
    else {
        if (responseJson.status == "true") return true;
        else return false;
    }
}

function getSrosServiceResponseError(responseJson) {
    var errMsg = "Could not find service response error message!";
    if (!responseJson.error) {
        errMsg = responseJson.error;
    }
    return errMsg;
}

function handleGetAllRepositoryObjectsResponse(responseJson,success,failure) {
    debugMessage("Entering handleGetAllRepositoryObjectsResponse...");
    if (isGoodSrosServiceResponse(responseJson)) {
        success(responseJson.objectList);
    }
    else failure(getSrosServiceResponseError(responseJson));
}

function getAllRepositoryObjects(success,failure) {
    executeSrosService(SROS_GET_ALL_OBJECTS_SERVICE,null,handleGetAllRepositoryObjectsResponse,success,failure);
}

function handleCreateRepositoryObjectFileResponse(responseJson,success,failure) {
    debugMessage("Entering handleCreateRepositoryObjectFileResponse...");
    if (isGoodSrosServiceResponse(responseJson)) {
        success(JSON.parse(responseJson.objectMetdata));
    }
    else failure(getSrosServiceResponseError(responseJson));
}

function createRepositoryObjectFile(file,initialVersion,description,objectOwner,success,failure) {
    var formData = new FormData();
    formData.append(file.name,file);
    formData.append(SROS_FORM_DATA_NAME, JSON.stringify({
        initialVersion: initialVersion,
        description: description,
        objectOwner: objectOwner
    }));
    executeSrosService(SROS_CREATE_FILE_ITEM_SERVICE,formData,handleCreateRepositoryObjectFileResponse,success,failure);
}

function handleCreateRepositoryObjectUrlResponse(responseJson,success,failure) {
    debugMessage("Entering handleCreateRepositoryObjectUrlResponse...");
    if (isGoodSrosServiceResponse(responseJson)) {
        success(JSON.parse(responseJson.objectMetdata));
    }
    else failure(getSrosServiceResponseError(responseJson));
}

function createRepositoryObjectUrl(itemUrl,initialVersion,itemName,description,objectOwner,success,failure) {
    var formData = new FormData();
    formData.append(SROS_FORM_DATA_NAME, JSON.stringify({
        initialVersion: initialVersion,
        itemUrl: itemUrl,
        itemName: itemName,
        description: description,
        objectOwner: objectOwner
    }));
    executeSrosService(SROS_CREATE_URL_ITEM_SERVICE,formData,handleCreateRepositoryObjectUrlResponse,success,failure);
}

function handleUpdateRepositoryObjectFileVersionResponse(responseJson,success,failure) {
    debugMessage("Entering handleUpdateRepositoryObjectFileVersionResponse...");
    if (isGoodSrosServiceResponse(responseJson)) {
        success(JSON.parse(responseJson.objectMetdata));
    }
    else failure(getSrosServiceResponseError(responseJson));
}

function updateRepositoryObjectFileVersion(file,udpateVersion,metadataId,success,failure) {
    var formData = new FormData();
    formData.append(file.name,file);
    formData.append(SROS_FORM_DATA_NAME, JSON.stringify({
        udpateVersion: udpateVersion,
        metadataId: metadataId
    }));
    executeSrosService(SROS_UPDATE_FILE_ITEM_VERSION_SERVICE,formData,handleUpdateRepositoryObjectFileVersionResponse,success,failure);
}

function handleUpdateRepositoryObjectUrlVersionResponse(responseJson,success,failure) {
    debugMessage("Entering handleUpdateRepositoryObjectUrlVersionResponse...");
    if (isGoodSrosServiceResponse(responseJson)) {
        success(JSON.parse(responseJson.objectMetdata));
    }
    else failure(getSrosServiceResponseError(responseJson));
}

function updateRepositoryObjectUrlVersion(versionUrl,udpateVersion,metadataId,success,failure) {
    var formData = new FormData();
    formData.append(SROS_FORM_DATA_NAME, JSON.stringify({
        versionUrl: versionUrl,
        udpateVersion: udpateVersion,
        metadataId: metadataId
    }));
    executeSrosService(SROS_UPDATE_URL_ITEM_VERSION_SERVICE,formData,handleUpdateRepositoryObjectUrlVersionResponse,success,failure);
}

function handleUpdateRepositoryObjectMetadataResponse(responseJson,success,failure) {
    debugMessage("Entering handleUpdateRepositoryObjectMetadataResponse...");
    if (isGoodSrosServiceResponse(responseJson)) {
        success(JSON.parse(responseJson.objectMetdata));
    }
    else failure(getSrosServiceResponseError(responseJson));
}

function updateRepositoryObjectMetadata(metadataId,name,description,learningResourceType,
                                        classification,keywords,interactivityType,language,
                                        duration,audience,educationalUse,author,success,failure) {
    var formData = new FormData();
    formData.append(SROS_FORM_DATA_NAME, JSON.stringify({
        name: name,
        description: description,
        learningResourceType: learningResourceType,
        classification: classification,
        keywords: keywords,
        interactivityType: interactivityType,
        language: language,
        duration: duration,
        audience: audience,
        educationalUse: educationalUse,
        author: author,
        metadataId: metadataId
    }));
    executeSrosService(SROS_UPDATE_ITEM_METADATA_SERVICE,formData,handleUpdateRepositoryObjectMetadataResponse,success,failure);
}

function handleDeleteEntireRepositoryObjectResponse(responseJson,success,failure) {
    debugMessage("Entering handleDeleteEntireRepositoryObjectResponse...");
    if (isGoodSrosServiceResponse(responseJson)) {
        success();
    }
    else failure(getSrosServiceResponseError(responseJson));
}

function deleteEntireRepositoryObject(metadataId,success,failure) {
    var formData = new FormData();
    formData.append(SROS_FORM_DATA_NAME, JSON.stringify({
        metadataId: metadataId
    }));
    executeSrosService(SROS_DELETE_ENTIRE_ITEM_SERVICE,formData,handleDeleteEntireRepositoryObjectResponse,success,failure);
}

function handleDeleteRepositoryObjectVersionResponse(responseJson,success,failure) {
    debugMessage("Entering handleDeleteRepositoryObjectVersionResponse...");
    if (isGoodSrosServiceResponse(responseJson)) {
        success(JSON.parse(responseJson.objectMetdata));
    }
    else failure(getSrosServiceResponseError(responseJson));
}

function deleteRepositoryObjectVersion(metadataId,deleteVersion,success,failure) {
    var formData = new FormData();
    formData.append(SROS_FORM_DATA_NAME, JSON.stringify({
        deleteVersion: deleteVersion,
        metadataId: metadataId
    }));
    executeSrosService(SROS_DELETE_ITEM_VERSION_SERVICE,formData,handleDeleteRepositoryObjectVersionResponse,success,failure);
}
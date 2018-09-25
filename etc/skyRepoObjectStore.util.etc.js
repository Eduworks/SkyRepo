//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SkyRepo Object Store Utility Functions
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function getSroPostDataObject(thisCtx) {
    var spdoMpp = getFileFromPost.call(thisCtx,srosPostDataName());
    if (spdoMpp) {
        var spdoMppContent = fileToString.call(thisCtx, spdoMpp);
        if (spdoMppContent) {
            var spdMppObject = JSON.parse(spdoMppContent);
            return spdMppObject;
        }
        else return null;
    }
    else return null;
}

function getParameter(thisCtx,paramName) {
    var p = null;
    p = thisCtx.params[paramName];
    if (!p || p == null) {
        var pdo = getSroPostDataObject(thisCtx);
        if (pdo) {
            p = pdo[paramName];
        }
    }
    return p;
}

function generateRegistryGuid() {
    return generateUUID();
}

// function getFileObjectMetdata(thisCtx,metadataId) {
//     if (!metadataId || metadataId.trim().length == 0) return null;
//     var httpGetRet = httpGet.call(thisCtx,metadataId);
//     if (httpGetRet == "Object not found or you did not supply sufficient permissions to access the object") return null;
//     var fmd = null;
//     try {
//         fmd = toObject.call(this,httpGetRet);
//     }
//     catch (e) {
//         fmd = null;
//     }
//     return fmd;
// }

function buildFileObjectMetadataSearchResult(ecwa) {
    if (!ecwa || ecwa.length < 1) return null;
    return ecwa[0];
}

function getFileObjectMetdata(metadataId) {
    if (!metadataId || metadataId.trim().length == 0) return null;
    var result = null;
    EcCreativeWork.search(repo,"@id:\"" + metadataId + "\"",
        function(ecwa) {
            result = buildFileObjectMetadataSearchResult(ecwa);
        },
        function(msg) {
            result = null;
        });
    return result;
}

function generateObjectFilePath(objectRoot,version,fileName) {
    var path = srosObjectStoreLocation();
    if (!path.endsWith("/") && !path.endsWith("\\")) path = path + "/";
    if (!version || version.trim() == "") {
        path = path + objectRoot;
    }
    else if (!fileName || fileName.trim() == "") {
        path = path + objectRoot + "/" + version;
    }
    else {
        path = path + objectRoot + "/" + version + "/" + fileName;
    }
    return path;
}

function getObjectFileFromPost(thisCtx) {
    var objectFileList = getFileFromPost.call(thisCtx);
    if (objectFileList) {
        var objectFile = getIndex.call(thisCtx,objectFileList,0);
        return objectFile;
    }
    else return null;
}

function touchRepositoryObjectModifiedDate(fileMetadata) {
    var cd = new Date();
    var modDate = cd.toISOString();
    fileMetadata.dateModified = modDate;
}

function objectVersionExists(versionInfo,versionToCheck) {
    if (!versionInfo || !versionToCheck || versionToCheck.trim().length == 0) return false;
    var versionExists = false;
    for (var i=0;i<versionInfo.length;i++) {
        if (versionInfo[i].versionName == versionToCheck) {
            versionExists = true;
            break;
        }
    }
    return versionExists;
}

function generateObjectVersionInfo(versionName,versionUrl) {
    var nvo = {};
    nvo.versionName = versionName;
    var d = new Date();
    nvo.dateCreated = d.toISOString();
    nvo.dateModified = d.toISOString();
    if (versionUrl && versionUrl.trim().length > 0) {
        nvo.versionUrl = versionUrl;
    }
    return nvo;
}

function updateObjectVersionInfo(fileMetadata,versionName,versionUrl) {
    var versionExists = false;
    if (!(fileMetadata.version && fileMetadata.version instanceof Array)) fileMetadata.version = [];
    for (var i=0;i<fileMetadata.version.length;i++) {
        if (fileMetadata.version[i].versionName == versionName) {
            versionExists = true;
            var d = new Date();
            fileMetadata.version[i].dateModified = d.toISOString();
            if (versionUrl && versionUrl.trim().length > 0) {
                fileMetadata.version[i].versionUrl = versionUrl;
            }
            break;
        }
    }
    if (!versionExists) {
        var nvo = generateObjectVersionInfo(versionName,versionUrl);
        fileMetadata.version.push(nvo);
    }
}

function removeObjectVersionInfo(fileMetadata,versionName) {
    var newVersionInfo = [];
    for (var i=0;i<fileMetadata.version.length;i++) {
        if (fileMetadata.version[i].versionName != versionName) {
            newVersionInfo.push(fileMetadata.version[i]);
        }
    }
    fileMetadata.version = newVersionInfo;
}

function removeObjectVersion(fileMetadata,versionName) {
    if (fileMetadata.additionalType == srosFileTypeObject()) {
        var pathToRemove = generateObjectFilePath(fileMetadata.alternateName,versionName,fileMetadata.getName());
        fileDelete.call(this,pathToRemove,false);
        pathToRemove = generateObjectFilePath(fileMetadata.alternateName,versionName,null);
        fileDelete.call(this,pathToRemove,false);
    }
    removeObjectVersionInfo(fileMetadata,versionName);
}

function removeAllObjectVersions(fileMetadata) {
    var versionNames = [];
    for (var i=0;i<fileMetadata.version.length;i++) {
        versionNames.push(fileMetadata.version[i].versionName);
    }
    for (var j=0;j<versionNames.length;j++) {
        removeObjectVersion(fileMetadata,versionNames[j]);
    }
}

function isValidVersionName(newVersionName) {
    if (!newVersionName || newVersionName.trim().length == 0) return false;
    else {
        newVersionName = newVersionName.trim();
        if (newVersionName.indexOf("<") != - 1) return false;
        else if (newVersionName.indexOf(">") != - 1) return false;
        else if (newVersionName.indexOf(":") != - 1) return false;
        else if (newVersionName.indexOf("\"") != - 1) return false;
        else if (newVersionName.indexOf("\\") != - 1) return false;
        else if (newVersionName.indexOf("|") != - 1) return false;
        else if (newVersionName.indexOf("?") != - 1) return false;
        else if (newVersionName.indexOf("*") != - 1) return false;
        else if (newVersionName.toUpperCase() == "CON") return false;
        else if (newVersionName.toUpperCase() == "PRN") return false;
        else if (newVersionName.toUpperCase() == "AUX") return false;
        else if (newVersionName.toUpperCase() == "NUL") return false;
        else if (newVersionName.toUpperCase() == "COM1") return false;
        else if (newVersionName.toUpperCase() == "COM2") return false;
        else if (newVersionName.toUpperCase() == "COM3") return false;
        else if (newVersionName.toUpperCase() == "COM4") return false;
        else if (newVersionName.toUpperCase() == "COM5") return false;
        else if (newVersionName.toUpperCase() == "COM6") return false;
        else if (newVersionName.toUpperCase() == "COM7") return false;
        else if (newVersionName.toUpperCase() == "COM8") return false;
        else if (newVersionName.toUpperCase() == "COM9") return false;
        else if (newVersionName.toUpperCase() == "LPT1") return false;
        else if (newVersionName.toUpperCase() == "LPT2") return false;
        else if (newVersionName.toUpperCase() == "LPT3") return false;
        else if (newVersionName.toUpperCase() == "LPT4") return false;
        else if (newVersionName.toUpperCase() == "LPT5") return false;
        else if (newVersionName.toUpperCase() == "LPT6") return false;
        else if (newVersionName.toUpperCase() == "LPT7") return false;
        else if (newVersionName.toUpperCase() == "LPT8") return false;
        else if (newVersionName.toUpperCase() == "LPT9") return false;
        else if (newVersionName.endsWith(".")) return false;
    }
    return true;
}

function updateObjectMetdatadata(fileMetadata,name,description,learningResourceType,
                                 classification,keywords,interactivityType,language,
                                 duration,audience,educationalUse,author) {
    if (fileMetadata.additionalType == srosUrlTypeObject()) fileMetadata.setName(name);
    fileMetadata.setDescription(description)
    fileMetadata.learningResourceType = learningResourceType;
    fileMetadata.genre = classification;
    fileMetadata.keywords = keywords;
    fileMetadata.interactivityType = interactivityType;
    fileMetadata.inLanguage = language;
    fileMetadata.timeRequired = duration; //TODO make sure this is in ISO 8601 duration format
    var a = new Audience();
    a.name = audience;
    fileMetadata.audience = a;
    fileMetadata.educationalUse = educationalUse;
    var p = new Person();
    p.name = author;
    fileMetadata.author = p;
}
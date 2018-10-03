//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SkyRepo Object Store Services
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//============================================================================
// Object download functions
//============================================================================

function validateDownloadRepositoryFileObjectInput(vo,requestedVersion,fmd) {
    if (!fmd) {
        vo.isValid = false;
        vo.error = "Could not locate object metadata";
    }
    else if (!requestedVersion || !objectVersionExists(fmd.version,requestedVersion)) {
        vo.isValid = false;
        vo.error = "Requested object version does not exist";
    }
}

function downloadRepositryFileObject() {
    var metadataId = getParameter(this,"metadataId");
    var requestedVersion = getParameter(this,"requestedVersion");
    var fmd = getFileObjectMetdata(metadataId);
    var vo = {};
    vo.isValid = true;
    validateDownloadRepositoryFileObjectInput(vo,requestedVersion,fmd);
    if (vo.isValid) {
        var filePath = generateObjectFilePath(fmd.alternateName,requestedVersion,fmd.getName());
        return fileLoad.call(this,filePath,false);
    }
    else {
        return displayJson.call(this, {
            status: "false",
            error: vo.error
        });
    }
}

bindWebService("/skyRepo/os/file/get", downloadRepositryFileObject);

//============================================================================
// Object delete functions
//============================================================================

function validateDeleteRepositoryItemVersionInput(vo,deleteVersion,fmd) {
    if (!fmd) {
        vo.isValid = false;
        vo.error = "Could not locate object metadata";
    }
    else if (!deleteVersion || !objectVersionExists(fmd.version,deleteVersion)) {
        vo.isValid = false;
        vo.error = "Invalid version name";
    }
    else if (fmd.version.length <= 1) {
        vo.isValid = false;
        vo.error = "Cannot delete only object version";
    }
}

function deleteRepositoryItemVersion() {
    var vo = {};
    vo.isValid = true;
    var deleteVersion = getParameter(this,"deleteVersion");
    var metadataId = getParameter(this,"metadataId");
    var fmd = getFileObjectMetdata(metadataId);
    validateDeleteRepositoryItemVersionInput(vo,deleteVersion,fmd);
    if (vo.isValid) {
        var result = null;
        removeObjectVersion(fmd,deleteVersion);
        touchRepositoryObjectModifiedDate(fmd);
        result = saveFileObjectMetadata(this,fmd);
        return result;
    }
    else {
        return displayJson.call(this, {
            status: "false",
            error: vo.error
        });
    }
}

bindWebService("/skyRepo/os/delete/version", deleteRepositoryItemVersion);

function validateDeleteRepositoryItemEntireInput(vo,fmd) {
    if (!fmd) {
        vo.isValid = false;
        vo.error = "Could not locate object metadata";
    }
}

function deleteFileObjectMetadata(thisCtx,metadataId) {
    var erld = EcRepository.getBlocking(metadataId);
    var result = null;
    EcRepository._delete(erld,
        function(msg) {
            result = displayJson.call(thisCtx, {
                status: "true"
            });
        },
        function(msg) {
            result = displayJson.call(thisCtx, {
                status: "false",
                error: "Metadata failed to delete"
            });
        });
    return result;
}

function deleteRepositoryItemEntire() {
    var vo = {};
    vo.isValid = true;
    var metadataId = getParameter(this,"metadataId");
    var fmd = getFileObjectMetdata(metadataId);
    validateDeleteRepositoryItemEntireInput(vo,fmd);
    if (vo.isValid) {
        var result = null;
        removeAllObjectVersions(fmd);
        var pathToRemove = generateObjectFilePath(fmd.alternateName,null,null);
        fileDelete.call(this,pathToRemove,false);
        result = deleteFileObjectMetadata(this,metadataId);
        return result;
    }
    else {
        return displayJson.call(this, {
            status: "false",
            error: vo.error
        });
    }
}

bindWebService("/skyRepo/os/delete/entire", deleteRepositoryItemEntire);

//============================================================================
// Object update functions
//============================================================================

//TODO handle object paradata

function validateUpdateRepositoryItemMetadataInput(vo,name,fmd) {
    if (!fmd) {
        vo.isValid = false;
        vo.error = "Could not locate object metadata";
    }
    else if ((fmd.additionalType == srosUrlTypeObject()) && (!name || name.trim().length == 0)) {
        vo.isValid = false;
        vo.error = "Name is required for URL type objects";
    }
}

function updateRepositoryItemMetadata() {
    var name = getParameter(this,"name");
    var description = getParameter(this,"description");
    var learningResourceType = getParameter(this,"learningResourceType");
    var classification = getParameter(this,"classification");
    var keywords = getParameter(this,"keywords");
    var interactivityType = getParameter(this,"interactivityType");
    var language = getParameter(this,"language");
    var duration = getParameter(this,"duration");
    var audience = getParameter(this,"audience");
    var educationalUse = getParameter(this,"educationalUse");
    var author = getParameter(this,"author");
    var vo = {};
    vo.isValid = true;
    var metadataId = getParameter(this,"metadataId");
    var fmd = getFileObjectMetdata(metadataId);
    validateUpdateRepositoryItemMetadataInput(vo,name,fmd)
    if (vo.isValid) {
        var result = null;
        updateObjectMetdatadata(fmd,name,description,learningResourceType,
            classification,keywords,interactivityType,language,
            duration,audience,educationalUse,author);
        touchRepositoryObjectModifiedDate(fmd);
        result = saveFileObjectMetadata(this,fmd);
        return result;
    }
    else {
        return displayJson.call(this, {
            status: "false",
            error: vo.error
        });
    }
}

bindWebService("/skyRepo/os/update/metadata", updateRepositoryItemMetadata);

function validateUpdateRepositoryUrlObjectVersionInput(vo,inVersion,versionUrl,fmd) {
    if (!fmd) {
        vo.isValid = false;
        vo.error = "Could not locate object metadata";
    }
    else if (!inVersion || !isValidVersionName(inVersion)) {
        vo.isValid = false;
        vo.error = "Invalid version name";
    }
    else if (!versionUrl || versionUrl.trim().length == 0) {
        vo.isValid = false;
        vo.error = "Version URL is required";
    }
}

function updateRepositoryUrlObjectVersion() {
    var vo = {};
    vo.isValid = true;
    var versionUrl = getParameter(this,"versionUrl");
    var updateVersion = getParameter(this,"updateVersion");
    var metadataId = getParameter(this,"metadataId");
    var fmd = getFileObjectMetdata(metadataId);
    validateUpdateRepositoryUrlObjectVersionInput(vo,updateVersion,versionUrl,fmd);
    if (vo.isValid) {
        var result = null;
        updateObjectVersionInfo(fmd,updateVersion,versionUrl);
        touchRepositoryObjectModifiedDate(fmd);
        result = saveFileObjectMetadata(this,fmd);
        return result;
    }
    else {
        return displayJson.call(this, {
            status: "false",
            error: vo.error
        });
    }
}

bindWebService("/skyRepo/os/url/update/version", updateRepositoryUrlObjectVersion);

function validateUpdateRepositoryFileObjectVersionInput(vo,inVersion,objectFile,fmd) {
    if (!fmd) {
        vo.isValid = false;
        vo.error = "Could not locate object metadata";
    }
    else if (!inVersion || !isValidVersionName(inVersion)) {
        vo.isValid = false;
        vo.error = "Invalid version name";
    }
    else if (!objectFile) {
        vo.isValid = false;
        vo.error = "Could not find file object";
    }
}

function updateRepositoryFileObjectVersion() {
    var vo = {};
    vo.isValid = true;
    var objectFile = getObjectFileFromPost(this);
    var updateVersion = getParameter(this,"updateVersion");
    var metadataId = getParameter(this,"metadataId");
    var fmd = getFileObjectMetdata(metadataId);
    validateUpdateRepositoryFileObjectVersionInput(vo,updateVersion,objectFile,fmd);
    if (vo.isValid) {
        var result = null;
        updateObjectVersionInfo(fmd,updateVersion,null);
        touchRepositoryObjectModifiedDate(fmd);
        var savePath = generateObjectFilePath(fmd.alternateName,updateVersion,fmd.getName());
        fileSave.call(this,objectFile,savePath,true,false);
        result = saveFileObjectMetadata(this,fmd);
        return result;
    }
    else {
        return displayJson.call(this, {
            status: "false",
            error: vo.error
        });
    }
}

bindWebService("/skyRepo/os/file/update/version", updateRepositoryFileObjectVersion);

//============================================================================
// Object creation functions
//============================================================================

function generateRepositoryFileMetadataObject(thisCtx,objectFile) {
    var fmd = new CreativeWork();
    fmd.generateId(repo.selectedServer);
    fmd.identifier = fmd.shortId ();
    fmd.setName(filename.call(thisCtx,objectFile));
    fmd.additionalType = srosFileTypeObject();
    var mt = mimeType.call(thisCtx,objectFile);
    fmd.fileFormat = mt;
    var enc = new MediaObject();
    enc.contentSize = fileSize.call(thisCtx,objectFile).toString();
    enc.fileFormat = mt;
    fmd.encoding = enc;
    return fmd;
}

function assignRepositoryObjectOwner(fileMetadata,owner) {
    if (owner) {
        var org = new Organization();
        org.name = owner;
        fileMetadata.provider = org;
    }
}

function assignRepositoryObjectUploadDate(fileMetadata) {
    var cd = new Date();
    var uploadDate = cd.toISOString();
    fileMetadata.dateCreated = uploadDate;
}

function validateCreateRepositoryFileObjectInput(vo,inVersion,objectFile) {
    if (!inVersion || !isValidVersionName(inVersion)) {
        vo.isValid = false;
        vo.error = "Invalid version name";
    }
    else if (!objectFile) {
        vo.isValid = false;
        vo.error = "Could not find file object";
    }
}

function saveFileObjectMetadata(thisCtx,fileMetadata) {
    var result = null;
    EcRepository.save(fileMetadata,
        function(msg) {
            result = displayJson.call(thisCtx, {
                status: "true",
                objectMetdata: JSON.stringify(fileMetadata)
            });
        },
        function(msg) {
            result = displayJson.call(thisCtx, {
                status: "false",
                error: "Metadata failed to save"
            });
        });
    return result;
}

// function addVersionToFileTypeObject(fileMetadata,newVersion) {
//     var versionInfo = fileMetadata.version;
//     if (!(versionInfo && versionInfo instanceof Array)) versionInfo = [];
//     if (!objectVersionExists(versionInfo,newVersion)) {
//         var nvo = generateObjectVersionInfo(newVersion,null);
//         versionInfo.push(nvo);
//         fileMetadata.version = versionInfo;
//     }
// }

function createRepositoryFileObject() {
    var vo = {};
    vo.isValid = true;
    var initialVersion = getParameter(this,"initialVersion");
    var objectFile = getObjectFileFromPost(this);
    validateCreateRepositoryFileObjectInput(vo,initialVersion,objectFile);
    if (vo.isValid) {
        var result = null;
        var fmd = generateRepositoryFileMetadataObject(this,objectFile);
        fmd.setDescription(getParameter(this,"description"));
        assignRepositoryObjectOwner(fmd,getParameter(this,"objectOwner"));
        assignRepositoryObjectUploadDate(fmd);
        touchRepositoryObjectModifiedDate(fmd);
        updateObjectVersionInfo(fmd,initialVersion,null);
        var registryId = generateRegistryGuid();
        fmd.alternateName = registryId;
        var savePath = generateObjectFilePath(registryId,initialVersion,fmd.getName());
        fileSave.call(this,objectFile,savePath,true,false);
        result = saveFileObjectMetadata(this,fmd);
        return result;
    }
    else {
        return displayJson.call(this, {
            status: "false",
            error: vo.error
        });
    }
}

bindWebService("/skyRepo/os/file/create", createRepositoryFileObject);

function generateRepositoryUrlMetadataObject(itemName) {
    var fmd = new CreativeWork();
    fmd.generateId(repo.selectedServer);
    fmd.identifier = fmd.shortId();
    fmd.setName(itemName);
    fmd.additionalType = srosUrlTypeObject();
    return fmd;
}

function validateCreateRepositoryUrlObjectInput(vo,inVersion,itemUrl,itemName) {
    if (!inVersion || !isValidVersionName(inVersion)) {
        vo.isValid = false;
        vo.error = "Invalid version name";
    }
    else if (!itemUrl || !itemUrl.trim().length) {
        vo.isValid = false;
        vo.error = "Item URL is required";
    }
    else if (!itemName || !itemName.trim().length) {
        vo.isValid = false;
        vo.error = "Item Name is required";
    }
}

// function addVersionToUrlTypeObject(fileMetadata,newVersion,versionUrl) {
//     var versionInfo = fileMetadata.version;
//     if (!(versionInfo && versionInfo instanceof Array)) versionInfo = [];
//     if (!objectVersionExists(versionInfo,newVersion)) {
//         var nvo = generateObjectVersionInfo(newVersion,versionUrl);
//         versionInfo.push(nvo);
//         fileMetadata.version = versionInfo;
//     }
// }

function createRepositoryUrlObject() {
    var vo = {};
    vo.isValid = true;
    var initialVersion = getParameter(this,"initialVersion");
    var itemUrl = getParameter(this,"itemUrl");
    var itemName = getParameter(this,"itemName");
    validateCreateRepositoryUrlObjectInput(vo,initialVersion,itemUrl,itemName);
    if (vo.isValid) {
        var result = null;
        var fmd = generateRepositoryUrlMetadataObject(itemName);
        fmd.setDescription(getParameter(this,"description"));
        assignRepositoryObjectOwner(fmd,getParameter(this,"objectOwner"));
        assignRepositoryObjectUploadDate(fmd);
        touchRepositoryObjectModifiedDate(fmd);
        updateObjectVersionInfo(fmd,initialVersion,itemUrl);
        result = saveFileObjectMetadata(this,fmd);
        return result;
    }
    else {
        return displayJson.call(this, {
            status: "false",
            error: vo.error
        });
    }
}

bindWebService("/skyRepo/os/url/create", createRepositoryUrlObject);

//============================================================================
// Object retrieve functions
//============================================================================

function getAllRegisteredObjects() {
    var result = null;
    EcCreativeWork.search(repo,"",
        function(ecwa) {
            result = displayJson.call(this,{
                status: "true",
                objectList: ecwa
            });
        },
        function(msg) {
            result = displayJson.call(this, {
                status: "false",
                error: msg
            });
        });
    return result;
}

bindWebService("/skyRepo/os/get/all", getAllRegisteredObjects);

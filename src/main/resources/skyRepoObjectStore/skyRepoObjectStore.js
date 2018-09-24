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

function updateRepositoryItemMetaParaData() {
    //TODO update file metadata/paradata
    return displayJson.call(this, {
        status: "TODO"
    });
}

bindWebService("/skyRepo/os/update/mpdata", updateRepositoryItemMetaParaData);

function updateRepositoryUrlObjectVersion() {
    //TODO update url type version
    return displayJson.call(this, {
        status: "TODO"
    });
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
        //fmd.version = [];
        updateObjectVersionInfo(fmd,initialVersion,null);
        //addVersionToFileTypeObject(fmd,initialVersion);
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
        //fmd.version = [];
        updateObjectVersionInfo(fmd,initialVersion,itemUrl);
        //addVersionToUrlTypeObject(fmd,initialVersion,itemUrl);
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
// Testing functions
//============================================================================

function fileTest() {
    var testFileList = getFileFromPost.call(this);
    var testFile = getIndex.call(this,testFileList,0);
    if (testFile == undefined) return "TEST FILE IS UNDEFINED";
    else {
        var testFileName = filename.call(this,testFile); //doesn't like "fileName"....
        var testFileSize = fileSize.call(this,testFile);
        var testFileContents = fileToString.call(this,testFile);
        var testFileMimeType = mimeType.call(this,testFile);
        return displayJson.call(this, {
            syncMessage:"TEST FILE IS DEFINED",
            testFileListSize:testFileList.size().toString(),
            testFileName:testFileName,
            testFileSize:testFileSize,
            testFileMimeType: testFileMimeType
        });
    }
}

bindWebService("/skyRepo/test/fileTest", fileTest);

function fileTest2() {
    var testFileList = getFileFromPost.call(this);
    var testFile = getIndex.call(this,testFileList,0);
    if (testFile == undefined) return "TEST FILE IS UNDEFINED";
    else {
        var testFileName = filename.call(this,testFile);
        var newPath = generateObjectFilePath("testRoot","1",testFileName);
        fileSave.call(this, testFile, newPath, true, false);
        return displayJson.call(this, {
            msg:"FILE SAVED",
            newPath: newPath
        });
    }
}

bindWebService("/skyRepo/test/fileTest2", fileTest2);

function deleteCreateWork() {
    var idToDelete = this.params.idToDelete;
    var erld = EcRepository.getBlocking(idToDelete);
    var result = null;
    EcRepository._delete(erld,function(msg) {
            result = displayJson.call(this, {SUCCESS:"Delete was successful"});
        },
        function(msg) {
            result = displayJson.call(this, {FAILURE:"Delete was NOT successful"});
        });
    return result;
}

bindWebService("/skyRepo/test/delete/creativeWork", deleteCreateWork);


function skyRepoJsTestCreateSaveSuccess(msg) {
    this.result = displayJson.call(this, {SUCCESS:"Save was successful"});
}

function skyRepoJsTestCreateSaveFailure(msg) {
    this.result = displayJson.call(this, {FAILURE:"Save was not successful"});
}

function skyRepoJsTestCreate(){
    var name = this.params.name;
    var result = null;
    if (name == undefined) return displayJson.call(this, {error:"name is undefined."});
    else {
        var cw = new CreativeWork();
        cw.generateId(repo.selectedServer);
        cw.setName(name);
        cw.setDescription("Description for: " + name);
        EcRepository.save(cw,function(msg) {
                result = displayJson.call(this, {SUCCESS:"Save was successful"});
            },
            function(msg) {
                result = displayJson.call(this, {FAILURE:"Save was not successful"});
            });
        return result;
    }
}

bindWebService("/skyRepo/test/create/creativeWork", skyRepoJsTestCreate);

function buildCreativeWorkSearchResult(ecwa) {
    var ida = [];
    for (var i=0;i<ecwa.length;i++) {
        ida.push("'" + ecwa[i].getName() + "' - " + ecwa[i].shortId());
    }
    return displayJson.call(this,
        {
            SUCCESS:"Number of items returned:" + ecwa.length,
            ITEMS:ida
        }
    );
}

function creativeWorkSearch() {
    var result = null;
    EcCreativeWork.search(repo,"",function(ecwa) {
            result = buildCreativeWorkSearchResult(ecwa);
        },
        function(msg) {
            result = displayJson.call(this, {FAILURE:"Search was not successful:" + msg});
        });
    return result;
}

bindWebService("/skyRepo/test/search/creativeWork", creativeWorkSearch);

function creativeWorkSearch2() {
    var result = null;
    EcCreativeWork.search(repo,"@id:\"http://localhost:8080/api/data/schema.org.CreativeWork/bdc64a94-7495-4d4c-8c8a-ac11845c365a\"",
        function(ecwa) {
            result = buildCreativeWorkSearchResult(ecwa);
        },
        function(msg) {
            result = displayJson.call(this, {FAILURE:"Search was not successful:" + msg});
        });
    return result;
}

bindWebService("/skyRepo/test/search/creativeWork2", creativeWorkSearch2);
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SkyRepo JS Service Testing
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//============================================================================
// Testing functions
//============================================================================

function skyRepoJsTest(){
    return displayJson.call(this, {
        repoSelectedServer:repo.selectedServer,
        srElasticEndpoint:elasticEndpoint
    });
}

bindWebService("/skyRepo/test/js", skyRepoJsTest);


function skyRepoTestJsConfig() {
    return displayJson.call(this, {
        rootSkyRepoObjectStoreLocation: srosObjectStoreLocation(),
        GUID: generateUUID()
    });
}

bindWebService("/skyRepo/test/js/config", skyRepoTestJsConfig);

function skyRepoTestJsMessage() {
    var retMsg = "Hi, your BRAND NEW UTILIZING THE getSroPostDataObject message was: ";
    var pdo = getSroPostDataObject(this);
    var sentMsg = pdo.testMsg;
    retMsg = retMsg + sentMsg;
    return displayJson.call(this, {
        testMessage: retMsg
    });
}

bindWebService("/skyRepo/test/js/message", skyRepoTestJsMessage);


function skyRepoTestJsParam() {
    var testParam = getParameter(this,"testParam");
    return displayJson.call(this, {
        testParam: testParam
    });
}

bindWebService("/skyRepo/test/js/param", skyRepoTestJsParam);



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
    //var idToDelete = this.params.idToDelete;
    var idToDelete = "http://localhost:8080/api/data/schema.org.CreativeWork/07e94381-9232-462a-81be-1873978c4aa8";
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
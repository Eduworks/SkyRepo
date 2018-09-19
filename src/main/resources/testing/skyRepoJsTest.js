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
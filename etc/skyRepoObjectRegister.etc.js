//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SkyRepo Object Register Services
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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

function buildCreativeWorkSearchResult(ecwa) {
    var ida = [];
    for (var i=0;i<ecwa.length;i++) {
        ida.push(ecwa[i].getName() + "-" + ecwa[i].shortId());
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

bindWebService("/skyRepo/test/creativeWorkSearch", creativeWorkSearch);
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SkyRepo JS Service Testing
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function skyRepoJsTest(){
    return displayJson.call(this, {
        repoSelectedServer:repo.selectedServer,
        srElasticEndpoint:elasticEndpoint
    });
}

bindWebService("/skyRepo/test/js", skyRepoJsTest);

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

bindWebService("/skyRepo/test/js/create", skyRepoJsTestCreate);
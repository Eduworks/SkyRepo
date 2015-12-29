var skyrepo = {};

if (localStorage["skyrepo.servers"] === undefined)
    localStorage["skyrepo.servers"] = JSON.stringify({});
skyrepo.servers = JSON.parse(localStorage["skyrepo.servers"]);

skyrepo.selectedServer = "";

skyrepo.version = 0.1;

skyrepo.const = {};
skyrepo.const.ebac = {};
skyrepo.const.ebac.context = "http://schema.eduworks.com/ebac/0.1/";
skyrepo.const.ebac.encryptedValue = "http://schema.eduworks.com/ebac/0.1/encryptedValue";

skyrepo.update = function(object,successCallback,errorCallback)
{
    if (isString(object))
        object = JSON.parse(object);
    var formData = new FormData();
    formData.append("data",JSON.stringify(object));
    $.ajax({
        type: "POST",
        url: object["@id"],
        mimeType: "multipart/form-data",
        data: formData,
        contentType: false,
        cache: false,
        processData: false
    }).success(function(obj){
        if (successCallback != undefined)
            successCallback(obj);
    }).error(function(obj){
        if (errorCallback != undefined)
            errorCallback(obj);
    });
}

skyrepo.get = function(id,successCallback,errorCallback)
{
    var formData = new FormData();
    formData.append("signatureSheet",skycrypto.createSignatureSheet(10000));
    $.ajax({
        type: "POST",
        url: id,
        mimeType: "multipart/form-data",
        data: formData,
        contentType: false,
        cache: false,
        processData: false
    }).success(function(obj){
        if (successCallback != undefined)
            successCallback(JSON.parse(obj));
    }).error(function(obj){
        if (errorCallback != undefined)
            errorCallback(obj);
    });
}

skyrepo.search = function(query,successCallback,errorCallback)
{
    var formData = new FormData();
    formData.append("data",query);
    formData.append("signatureSheet",skycrypto.createSignatureSheet(10000));
    $.ajax({
        type: "POST",
        url: skyrepo.selectedServer+"sky/repo/search",
        mimeType: "multipart/form-data",
        data: formData,
        contentType: false,
        cache: false,
        processData: false
    }).success(function(obj){
        if (successCallback != undefined)
            successCallback(JSON.parse(obj));
    }).error(function(obj){
        if (errorCallback != undefined)
            errorCallback(obj);
    });
}

skycrypto.contactsModified = function(){
     localStorage["skycrypto.contacts"] = JSON.stringify(skycrypto.contacts);
}

skyrepo.serversModified = function(){
     localStorage["skyrepo.servers"] = JSON.stringify(skyrepo.servers);
}

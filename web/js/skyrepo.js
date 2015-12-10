var skyrepo = {};

skyrepo.ppks = {};
skyrepo.selectedPpk = "";
if (localStorage["skyrepo.servers"] === undefined)
    localStorage["skyrepo.servers"] = JSON.stringify({});
skyrepo.servers = JSON.parse(localStorage["skyrepo.servers"]);
if (localStorage["skyrepo.contacts"] === undefined)
    localStorage["skyrepo.contacts"] = JSON.stringify({});
skyrepo.contacts = JSON.parse(localStorage["skyrepo.contacts"]);

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
        if (successCallback != undefined)
            errorCallback(obj);
    });
}

skyrepo.search = function(query,successCallback,errorCallback)
{
    var formData = new FormData();
    formData.append("data",query);
    formData.append("signatureSheet",skyrepo.createSignatureSheet(10000));
    $.ajax({
        type: "POST",
        url: skyrepo.serviceUrl+"sky/repo/search",
        mimeType: "multipart/form-data",
        data: formData,
        contentType: false,
        cache: false,
        processData: false
    }).success(function(obj){
        if (successCallback != undefined)
            successCallback(JSON.parse(obj));
    }).error(function(obj){
        if (successCallback != undefined)
            errorCallback(obj);
    });
}

skyrepo.generateKey = function(callback)
{
    var keypair = forge.pki.rsa.generateKeyPair(
        {workers: -1}, 
        function(err, keypair) {
            callback(
                forge.pki.publicKeyToPem(keypair.publicKey),
                forge.pki.privateKeyToPem(keypair.privateKey)
            );
        }
    );    
}

skyrepo.ppk=function(ppkText)
{
    var ppk;
    if (ppkText === undefined)
        ppk = forge.pki.privateKeyFromPem(skyrepo.selectedPpk);
    else
    {
        ppkText = skyrepo.inflatePrivateKey(ppkText);
        ppk = forge.pki.privateKeyFromPem(ppkText);
    }
    return ppk;
}

skyrepo.pk=function(ppk)
{
    if (ppk === undefined) 
        ppk = skyrepo.ppk();
    return forge.pki.rsa.setPublicKey(ppk.n, ppk.e)
}

skyrepo.trimKey = function(k)
{
    return k.replace(/\r?\n/g,"").replace(/-----BEGIN PUBLIC KEY-----/g,"").replace(/-----END PUBLIC KEY-----/g,"").replace(/-----BEGIN PRIVATE KEY-----/g,"").replace(/-----END PRIVATE KEY-----/g,"");
}

skyrepo.inflatePublicKey = function(k)
{
    return "-----BEGIN PUBLIC KEY-----"+skyrepo.trimKey(k)+"-----END PUBLIC KEY-----";
}

skyrepo.inflatePrivateKey = function(k)
{
    return "-----BEGIN PRIVATE KEY-----"+skyrepo.trimKey(k)+"-----END PRIVATE KEY-----";
}

skyrepo.pkText=function(ppk)
{
    var ppk = skyrepo.ppk(ppk);
    return skyrepo.trimKey(forge.pki.publicKeyToPem(forge.pki.rsa.setPublicKey(ppk.n, ppk.e)));
}

skyrepo.activateKey = function(ppk,callback,ppkName)
{
    if (is(ppk,"FileList"))
    {
        for (var i in ppk)
        {
            var file = ppk[i];
            var fr=new FileReader();
            fr.onload=(function(file,fr){
                return function(event){
                    skyrepo.addKey(fr.result,file.name,callback);
                }
            })(file,fr);
            if (is(file,"File"))
                fr.readAsText(file); 
        }
    }
    else
    {
        skyrepo.addKey(ppk,ppkName,callback);
    }
}

skyrepo.addKey = function(ppk,name,callback)
{
    ppk = skyrepo.trimKey(ppk);
    skyrepo.ppks[ppk] = name;
    if (skyrepo.contacts[skyrepo.pkText(ppk)] === undefined)
        skyrepo.contacts[skyrepo.pkText(ppk)] = {};
    if (skyrepo.contacts[skyrepo.pkText(ppk)].name === undefined)
        skyrepo.contacts[skyrepo.pkText(ppk)].name = name;
    skyrepo.contactsModified();
    if (callback != undefined)
        callback();
    skyrepo.contactsModified();
}

skyrepo.contactsModified = function(){
     localStorage["skyrepo.contacts"] = JSON.stringify(skyrepo.contacts);
}
skyrepo.serversModified = function(){
     localStorage["skyrepo.servers"] = JSON.stringify(skyrepo.servers);
}

skyrepo.encryptAsymmetric = function(text,pk)
{
    return forge.util.encode64(skyrepo.pk(pk).encrypt(text,'RSAES-PKCS1-V1_5'));
}

skyrepo.signAsymmetric = function(text,ppk)
{
    var md = forge.md.sha1.create();
    md.update(text, 'utf8');
    return forge.util.encode64(skyrepo.ppk(ppk).sign(md));
}

skyrepo.decryptAsymmetric = function(text,ppk)
{
    return skyrepo.ppk(ppk).decrypt(forge.util.decode64(text),'RSAES-PKCS1-V1_5');
}

skyrepo.verifyAsymmetric = function(text,signature,pk)
{
    pk = skyrepo.inflatePublicKey(pk);
    var md = forge.md.sha1.create();
    md.update(text, 'utf8');
    return forge.pki.publicKeyFromPem(pk).verify(md.digest().bytes(),forge.util.decode64(signature));
}

skyrepo.newSymmetricKey = function()
{
    return forge.random.getBytesSync(32);
}

skyrepo.encryptSymmetric = function(secret,iv,text)
{
    var cipher = forge.cipher.createCipher('AES-CTR', secret);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(text));
    cipher.finish();
    var encrypted = cipher.output;
    return forge.util.encode64(encrypted.bytes());
}

skyrepo.decryptSymmetric = function(secret,iv,text)
{
    var cipher = forge.cipher.createDecipher('AES-CTR', secret);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(forge.util.decode64(text)));
    cipher.finish();
    var decrypted = cipher.output;
    return decrypted.data;
}

skyrepo.createSignatureSheet = function(duration){
    var ary = [];
    for (var ppk in skyrepo.ppks)
    {
        var signatureObj = {
            
        };
        signatureObj["@owner"]=skyrepo.inflatePublicKey(skyrepo.pkText(ppk));
        signatureObj["@type"]="http://schema.eduworks.com/ebac/0.1/timeLimitedSignature";
        signatureObj["expiry"] = new Date().getTime()+duration;
        var objectToHash=stringifyJSON(signatureObj).trim();
        signatureObj["@signature"]=skyrepo.signAsymmetric(objectToHash,ppk);
        ary.push(signatureObj);
    }
    return JSON.stringify(ary);
}

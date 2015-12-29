var skyid = {};

skyid.selectedServer = "";

skyid.usernameSalt = "This is a salt. It is a good salt. We like our salt salty, because it ensures that nobody gets our credentialz.";
skyid.pbkdf2UsernameIterations = 1000;
skyid.pbkdf2UsernameWidth = 64;

skyid.passwordSalt = "This is another salt. I would like to see salt elevated to the most magnanimous of minerals.";
skyid.pbkdf2PasswordIterations = 2000;
skyid.pbkdf2PasswordWidth = 64;

skyid.secretSalt = "This is the most secret of salts. Its saltiness is unmatched by the most widespread of oceans.";
skyid.pbkdf2SecretIterations = 3000;
skyid.pbkdf2SecretWidth = 32;

skyid.usernameWithSalt = null;
skyid.passwordWithSalt = null;
skyid.secretWithSalt = null;
skyid.pad = null;
skyid.token = null;

skyid.const = {};
skyid.const.ebac = {};
skyid.const.ebac.context = "http://schema.eduworks.com/ebac/0.1/";
skyid.const.ebac.encryptedValue = "http://schema.eduworks.com/ebac/0.1/encryptedValue";
skyid.const.ebac.credentialRequest = "http://schema.eduworks.com/ebac/0.1/credentialRequest";
skyid.const.ebac.credentials = "http://schema.eduworks.com/ebac/0.1/credentials";
skyid.const.ebac.credential = "http://schema.eduworks.com/ebac/0.1/credential";
skyid.const.ebac.credentialCommit = "http://schema.eduworks.com/ebac/0.1/credentialCommit";

skyid.login = function(username,passwords)
{
    if (username != null && passwords != null)
    {
        if (isString(passwords))
            passwords = [passwords];

        skyid.usernameWithSalt = forge.util.encode64(forge.pkcs5.pbkdf2(
            username, 
            skyid.usernameSalt, 
            skyid.pbkdf2UsernameIterations, 
            skyid.pbkdf2UsernameWidth
        ));

        skyid.passwordWithSalt = forge.util.encode64(forge.pkcs5.pbkdf2(
            skyid.splicePasswords(passwords), 
            skyid.passwordSalt, 
            skyid.pbkdf2PasswordIterations, 
            skyid.pbkdf2PasswordWidth
        )); 

        var secrets = passwords.slice(0);
        secrets.push(username);
        skyid.secretWithSalt = forge.pkcs5.pbkdf2(
            skyid.splicePasswords(secrets),
            skyid.secretSalt,
            skyid.pbkdf2SecretIterations,
            skyid.pbkdf2SecretWidth        
        );
    }
}

skyid.fetchCredentials = function(successCallback,errorCallback,keyAddCallback)
{
    var requestObject = {
        username:skyid.usernameWithSalt,
        password:skyid.passwordWithSalt
    };
    requestObject["@type"]=skyid.const.ebac.credentialRequest;
    requestObject["@schema"]=skyid.const.ebac.context;
    
    var formData = new FormData();
    formData.append("credentialRequest",stringifyJSON(requestObject));
    $.ajax({
        type: "POST",
        url: skyid.selectedServer+"sky/id/login",
        mimeType: "multipart/form-data",
        data: formData,
        contentType: false,
        cache: false,
        processData: false
    }).success(function(obj){
        obj = JSON.parse(obj);
        if (obj["@type"] != skyid.const.ebac.credentials)
        {
            errorCallback(obj);
            return;
        }
        skyid.pad = obj.pad;
        skyid.token = obj.token;
        for (var credentialIndex in obj.credentials)
        {
            var iv = obj.credentials[credentialIndex].iv;
            var ppk = obj.credentials[credentialIndex].ppk;
            var name = obj.credentials[credentialIndex].name;
            if (name === undefined)
                name = "Key #"+credentialIndex;
            var cipher = forge.cipher.createDecipher('AES-CTR', skyid.secretWithSalt);
            cipher.start({iv: forge.util.decode64(iv)});
            cipher.update(forge.util.createBuffer(forge.util.decode64(ppk)));
            cipher.finish();
            var decrypted = cipher.output;
            ppk = skycrypto.ppkText(decrypted.data);
            
            var skip = false;
            for (var repoPk in skycrypto.ppks)
                if (repoPk == ppk)
                    skip = true;
            if (skip) continue;
            
            skycrypto.addKey(ppk,name,keyAddCallback);
        }
        if (successCallback != undefined)
            successCallback(obj);
    }).error(function(obj){
        if (errorCallback != undefined)
            errorCallback(obj.responseText);
    });
}

skyid.generatePad = function(callback)
{
    
}

skyid.create = function(successCallback,errorCallback,padGenerationCallback)
{
    if (skyid.usernameWithSalt == null || skyid.passwordWithSalt == null || skyid.secretWithSalt == null)
    {
        errorCallback("You have not logged in to any system.");
        return;
    }
    var commit = {};
    commit["@type"] = skyid.const.ebac.credentials;
    commit["@schema"] = skyid.const.ebac.context;
    
    if (skyid.pad == null)
        skyid.generatePad(padGenerationCallback);    
    commit.pad = skyid.pad;
    
    commit.credentials = [];
    
    for (var ppk in skycrypto.ppks)
    {
        var credential = {};
        credential["@type"] = skyid.const.ebac.credential;
        credential.iv = skycrypto.newIv();
        
        var cipher = forge.cipher.createCipher('AES-CTR', skyid.secretWithSalt);
        cipher.start({iv: credential.iv});
        cipher.update(forge.util.createBuffer(skycrypto.inflatePrivateKey(ppk)));
        cipher.finish();
        var encrypted = cipher.output;
        credential.ppk = forge.util.encode64(encrypted.bytes());
        credential.iv = forge.util.encode64(credential.iv);
        
        commit.credentials.push(credential);
    }
    
    var requestObject = {
        username:skyid.usernameWithSalt,
        password:skyid.passwordWithSalt,
        token:skyid.token,
        credentials:commit
    };
    if (requestObject.token == null)
        delete requestObject.token;
    requestObject["@type"]=skyid.const.ebac.credentialCommit;
    requestObject["@schema"]=skyid.const.ebac.context;
    
    var formData = new FormData();
    formData.append("credentialCommit",stringifyJSON(requestObject));
    $.ajax({
        type: "POST",
        url: skyid.selectedServer+"sky/id/create",
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
            errorCallback(obj.responseText);
    });
}

skyid.commitCredentials = function(successCallback,errorCallback,padGenerationCallback)
{
    if (skyid.usernameWithSalt == null || skyid.passwordWithSalt == null || skyid.secretWithSalt == null)
    {
        errorCallback("You have not logged in to any system.");
        return;
    }
    var commit = {};
    commit["@type"] = skyid.const.ebac.credentials;
    commit["@schema"] = skyid.const.ebac.context;
    
    if (skyid.pad == null)
        skyid.generatePad(padGenerationCallback);    
    commit.pad = skyid.pad;
    
    commit.credentials = [];
    
    for (var ppk in skycrypto.ppks)
    {
        var credential = {};
        credential["@type"] = skyid.const.ebac.credential;
        credential.iv = skycrypto.newIv();
        
        var cipher = forge.cipher.createCipher('AES-CTR', skyid.secretWithSalt);
        cipher.start({iv: credential.iv});
        cipher.update(forge.util.createBuffer(skycrypto.inflatePrivateKey(ppk)));
        cipher.finish();
        var encrypted = cipher.output;
        credential.ppk = forge.util.encode64(encrypted.bytes());
        credential.iv = forge.util.encode64(credential.iv);
        
        commit.credentials.push(credential);
    }
    
    var requestObject = {
        username:skyid.usernameWithSalt,
        password:skyid.passwordWithSalt,
        token:skyid.token,
        credentials:commit
    };
    if (requestObject.token == null)
        delete requestObject.token;
    requestObject["@type"]=skyid.const.ebac.credentialCommit;
    requestObject["@schema"]=skyid.const.ebac.context;
    
    var formData = new FormData();
    formData.append("credentialCommit",stringifyJSON(requestObject));
    $.ajax({
        type: "POST",
        url: skyid.selectedServer+"sky/id/commit",
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
            errorCallback(obj.responseText);
    });
}

skyid.splicePasswords = function(passwords)
{
    var passwordSplice = "";
    for (var charIndex = 0;;charIndex++)
    {
        var foundAny = false;
        for (var passwordIndex = 0;passwordIndex < passwords.length;passwordIndex++)
        {
            if (charIndex >= passwords[passwordIndex].length)
                continue;
            passwordSplice += passwords[passwordIndex][charIndex];
            foundAny = true;
        }
        if (!foundAny)
            break;
    }
    return passwordSplice;
}
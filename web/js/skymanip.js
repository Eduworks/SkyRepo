var skymanip = {};

skymanip.selectedObject = null;
skymanip.namespace = "file";

skymanip.const = {};
skymanip.const.general = {};
skymanip.const.general.schema = "http://schema.eduworks.com/general/0.1";
skymanip.const.general.file = "http://schema.eduworks.com/general/0.1/file";


skymanip.create = function(typeUrl)
{
    skymanip.selectedObject = {};
    if (typeUrl !== undefined)
        skymanip.setType(typeUrl);
    skymanip.generateId();
}

skymanip.setType = function(typeUrl)
{
    var context = typeUrl.split("/");
    context.pop();
    context = context.join("/");
    var type = typeUrl.split("/")[typeUrl.split("/").length-1];
    
    skymanip.selectedObject["@context"] = context;
    skymanip.selectedObject["@type"] = type;    
}

skymanip.getTypeUrl = function()
{
    if (skymanip.selectedObject["@type"].indexOf("http://") != -1)
        return skymanip.selectedObject["@type"];
    return trim(skymanip.selectedObject["@context"],"/") + "/" + trim(skymanip.selectedObject["@type"],"/");
}

skymanip.generateId = function()
{
    var id = guid();
    skymanip.selectedObject["@id"] = skyrepo.selectedServer+"/data/"+skymanip.namespace+"/"+id+"/"+new Date().getTime();
}

skymanip.getSimpleId = function()
{
    return skymanip.selectedObject["@id"].split("/")[skymanip.selectedObject["@id"].split("/").length-2];
}

skymanip.encrypt = function(hintAtType)
{
    if (skycrypto.selectedPpk == "")
    {
        alert("No encryption key has been selected.");
        return;
    }
    
    var preObj = skymanip.selectedObject;
    
    log("Generating Secret",
        "Generating Symmetric Key for AES-256-CTR.");
    var cryptoKey = skycrypto.newSymmetricKey();
    var iv = skycrypto.newIv();
    
    log("Encoding Secret",
        "Encoding Tamper-proof secret using field and ID.");
    var cryptoWrapper = JSON.stringify({
        id:skymanip.getSimpleId(),
        key:cryptoKey,
        iv:iv
    });
    
    log("Encrypting Secret",
        "Encoding Secret\nThis will allow only those with the appropriate PPK access to the Secret.");
    var encryptedKey = skycrypto.encryptAsymmetric(cryptoWrapper);
    
    log("Encrypting Data",
        "Encoding Field using AES-256-CTR.");
    var encryptedText = skycrypto.encryptSymmetric(
        cryptoKey,
        stringifyJSON({iv:iv,id:skymanip.getSimpleId()}),
        stringifyJSON(skymanip.selectedObject)
    );

    skymanip.create(skyrepo.const.ebac.encryptedValue);
    skymanip.selectedObject["@id"]=preObj["@id"];
    skymanip.selectedObject["@owner"]=skycrypto.pkText();
    if (hintAtType == true)
        skymanip.selectedObject["@encryptedType"]=preObj["@type"];
    skymanip.selectedObject.name = preObj.name;
    skymanip.selectedObject.secret = [encryptedKey];
    skymanip.selectedObject.payload = encryptedText;
}

skymanip.decrypt = function(){
    var secrets = skymanip.selectedObject.secret;
    if (isString(secrets)) 
        secrets = [secrets];
    var prevPpk = skycrypto.selectedPpk;
    log("Searching for Secret","Attempting to decrypt each secret using all available keys.");
    var ppkIndex = 0;
    for (var ppk in skycrypto.ppks)
    {
        skycrypto.selectedPpk = ppk;
        for (var secretIndex = 0;secretIndex < secrets.length;secretIndex++)
        {
            log("PPK " + ppkIndex++ + " vs Secret "+secretIndex,"Trying a PPK/Secret pair.");
            var secret = secrets[secretIndex];
            try
            {
                var decryptedString = skycrypto.decryptAsymmetric(secret);
                var cryptoWrapper = JSON.parse(decryptedString);
                if (skymanip.selectedObject["@id"].indexOf(cryptoWrapper.id) != -1)
                {
                    log("Found!","We found the tamper proof variables and they match!");
                    var cryptoKey = cryptoWrapper.key;
                    var encryptedValue = skymanip.selectedObject.payload;
                    var iv = stringifyJSON({iv:cryptoWrapper.iv,id:cryptoWrapper.id});
                    log("Decrypting Payload","Decrypting the payload using AES-256-CTR.");
                    var result = skycrypto.decryptSymmetric(cryptoKey,iv,encryptedValue);

                    skymanip.selectedObject = JSON.parse(result);
                }
            }
            catch(ex)
            {
                log("Failed.","Failed to decrypt: "+ex);
            }
        }
    }
    skycrypto.selectedPpk = prevPpk;
}
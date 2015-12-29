var skycrypto={};

skycrypto.ppks = {};
skycrypto.selectedPpk = "";

if (localStorage["skycrypto.contacts"] === undefined)
    localStorage["skycrypto.contacts"] = JSON.stringify({});
skycrypto.contacts = JSON.parse(localStorage["skycrypto.contacts"]);

skycrypto.generateKey = function(callback)
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

skycrypto.ppk=function(ppkText)
{
    var ppk;
    if (ppkText === undefined)
        ppk = forge.pki.privateKeyFromPem(skycrypto.selectedPpk);
    else
    {
        ppkText = skycrypto.inflatePrivateKey(ppkText);
        ppk = forge.pki.privateKeyFromPem(ppkText);
    }
    return ppk;
}

skycrypto.pk=function(ppk)
{
    if (ppk === undefined) 
        ppk = skycrypto.ppk();
    return forge.pki.rsa.setPublicKey(ppk.n, ppk.e)
}

skycrypto.trimKey = function(k)
{
    return k.replace(/\r?\n/g,"").replace(/-----BEGIN PUBLIC KEY-----/g,"").replace(/-----END PUBLIC KEY-----/g,"").replace(/-----BEGIN PRIVATE KEY-----/g,"").replace(/-----END PRIVATE KEY-----/g,"");
}

skycrypto.inflatePublicKey = function(k)
{
    return "-----BEGIN PUBLIC KEY-----"+skycrypto.trimKey(k)+"-----END PUBLIC KEY-----";
}

skycrypto.inflatePrivateKey = function(k)
{
    return "-----BEGIN PRIVATE KEY-----"+skycrypto.trimKey(k)+"-----END PRIVATE KEY-----";
}

skycrypto.pkText=function(ppk)
{
    var ppk = skycrypto.ppk(ppk);
    return skycrypto.trimKey(forge.pki.publicKeyToPem(forge.pki.rsa.setPublicKey(ppk.n, ppk.e)));
}

skycrypto.ppkText=function(ppk)
{
    var ppk = skycrypto.ppk(ppk);
    return skycrypto.trimKey(forge.pki.privateKeyToPem(ppk));
}

skycrypto.activateKey = function(ppk,callback,ppkName)
{
    if (is(ppk,"FileList"))
    {
        for (var i in ppk)
        {
            var file = ppk[i];
            var fr=new FileReader();
            fr.onload=(function(file,fr){
                return function(event){
                    skycrypto.addKey(fr.result,file.name,callback);
                }
            })(file,fr);
            if (is(file,"File"))
                fr.readAsText(file); 
        }
    }
    else
    {
        skycrypto.addKey(ppk,ppkName,callback);
    }
}

skycrypto.addKey = function(ppk,name,callback)
{
    ppk = skycrypto.trimKey(ppk);
    skycrypto.ppks[ppk] = name;
    if (skycrypto.contacts[skycrypto.pkText(ppk)] === undefined)
        skycrypto.contacts[skycrypto.pkText(ppk)] = {};
    if (skycrypto.contacts[skycrypto.pkText(ppk)].name === undefined)
        skycrypto.contacts[skycrypto.pkText(ppk)].name = name;
    skycrypto.contactsModified();
    if (callback != undefined)
        callback();
    skycrypto.contactsModified();
}

skycrypto.encryptAsymmetric = function(text,pk)
{
    return forge.util.encode64(skycrypto.pk(pk).encrypt(text,'RSA-OAEP'));
}

skycrypto.signAsymmetric = function(text,ppk)
{
    var md = forge.md.sha1.create();
    md.update(text, 'utf8');
    return forge.util.encode64(skycrypto.ppk(ppk).sign(md));
}

skycrypto.decryptAsymmetric = function(text,ppk)
{
    return skycrypto.ppk(ppk).decrypt(forge.util.decode64(text),'RSA-OAEP');
}

skycrypto.verifyAsymmetric = function(text,signature,pk)
{
    pk = skycrypto.inflatePublicKey(pk);
    var md = forge.md.sha1.create();
    md.update(text, 'utf8');
    return forge.pki.publicKeyFromPem(pk).verify(md.digest().bytes(),forge.util.decode64(signature));
}

skycrypto.newSymmetricKey = function()
{
    return forge.random.getBytesSync(32);
}

skycrypto.newIv = function()
{
    return forge.random.getBytesSync(32);
}

skycrypto.encryptSymmetric = function(secret,iv,text)
{
    var cipher = forge.cipher.createCipher('AES-CTR', secret);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(text));
    cipher.finish();
    var encrypted = cipher.output;
    return forge.util.encode64(encrypted.bytes());
}

skycrypto.decryptSymmetric = function(secret,iv,text)
{
    var cipher = forge.cipher.createDecipher('AES-CTR', secret);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(forge.util.decode64(text)));
    cipher.finish();
    var decrypted = cipher.output;
    return decrypted.data;
}

skycrypto.createSignatureSheet = function(duration,server){
    var ary = [];
    for (var ppk in skycrypto.ppks)
    {
        var signatureObj = {};
        signatureObj["@owner"]=skycrypto.inflatePublicKey(skycrypto.pkText(ppk));
        signatureObj["@type"]="http://schema.eduworks.com/ebac/0.1/timeLimitedSignature";
        signatureObj["expiry"] = new Date().getTime()+duration;
        if (server != undefined && server != null)
            signatureObj["server"] = server;
        var objectToHash=stringifyJSON(signatureObj).trim();
        signatureObj["@signature"]=skycrypto.signAsymmetric(objectToHash,ppk);
        ary.push(signatureObj);
    }
    return JSON.stringify(ary);
}

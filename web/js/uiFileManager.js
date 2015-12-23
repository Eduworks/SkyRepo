function fileManagerSearch()
{
    var tile = '<div class="tile" tabindex="0" style="display:block"><div class="cube app document"><div class="front"><p class="title"></p></div><div class="back"><p class="status"></p><div class="actions"></div></div></div><a class="hotspot finger" title=""></a></div>';
    var query = $("#privateDataSearchText").val();
    if (query == null || query == "")
        query = '(@type:*file OR @encryptedType:*file)';
    else
        query = "("+query+') AND (@type:*file OR @encryptedType:*file)'        
    skyrepo.search(
        query,
        function(obj){
            $("#fileManagerResults").html("");
            for (var index in obj)
            {
                $("#fileManagerResults").append(tile);
                var t = $("#fileManagerResults").children(".tile").last();
                var name = obj[index]["name"];
                t.find(".title").text(name);
                t.attr("id",obj[index]["@id"]);
            }
        },
        function(obj){
            
        }
    );
}
$( ".fileManager" ).on( "keyup", "#fileManagerSearchText",function(obj){
    fileManagerSearch();
});

$( "#fileManagerResults" ).on( "click", ".tile",function(){
    skyrepo.get($(this).attr("id"),function(obj){
        if (obj["@type"] == skyrepo.const.ebac.encryptedValue)
        {
            var id = obj["@id"];
            var secrets = obj.secret;
            if (isString(secrets)) secrets = [secrets];
            var selectedPpk = skycrypto.selectedPpk;
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
                        var idx = cryptoWrapper.id;
                        if (id == "" || id.indexOf(idx) != -1)
                        {
                            log("Found!","We found the tamper proof variables and they match!");
                            var cryptoKey = cryptoWrapper.key;
                            var encryptedValue = obj.payload;
                            var iv = JSON.stringify({id:idx});
                            log("Decrypting Payload","Decrypting the payload using AES-256-CTR.");
                            var result = skycrypto.decryptSymmetric(cryptoKey,iv,encryptedValue);

                            obj = JSON.parse(result);
                        }
                    }
                    catch(ex)
                    {
                        log("Failed.","Failed to decrypt: "+ex);
                    }
                }
            }
            skycrypto.selectedPpk = selectedPpk;
        }
            
        downloadBase64(obj.name,obj.data);
    });    
});

var fileManagerEncrypted = true;
var fileManagerSearchesPublic = true;

$("#fileManagerEncrypted").change(function(){
    fileManagerEncrypted = this.checked;
})
$("#fileManagerPublic").change(function(){
    fileManagerSearchesPublic = this.checked;
})

var brdr = '2px dotted #0B85A1';
var obj = $("#dragTarget");
obj.on('dragenter', function (e) 
{
    e.stopPropagation();
    e.preventDefault();
    brdr = '2px solid #0B85A1';
});
obj.on('dragover', function (e) 
{
    e.stopPropagation();
    e.preventDefault();
    brdr = '2px solid #0B85A1';
    $("#dragTarget").css('border', brdr);
});
var timeout;
$("body").on('dragover', function (e) 
{
     clearTimeout( timeout );
     timeout = setTimeout( function(){         
        $("#dragTarget").css('border', '');
     }, 200 );
    $("#dragTarget").css('border', brdr);
});
obj.on('dragleave', function (e) 
{
     e.stopPropagation();
     e.preventDefault();
    brdr = '2px dotted #0B85A1';
});
var files;
obj.on('drop', function (e) 
{
    $(this).css('border', '');
    e.preventDefault();
    var fileContainer = e.originalEvent.dataTransfer.files;

    if (fileManagerEncrypted && skycrypto.selectedPpk == "")
    {
        alert("No encryption key has been selected.");
        return;
    }
    files = [];
    for (var index = 0;index < fileContainer.length;index++)
        files.push(fileContainer[index]);
    $("#fileManagerResults").html("");
    startFileUpload();
});

function startFileUpload()
{
    var tile = '<div class="tile" tabindex="0" style="display:block"><div class="cube app document"><div class="front"><p class="title">Initializing...</p></div><div class="back"><p class="status"></p><div class="actions"></div></div></div><a class="hotspot finger" title=""></a></div>';
    $("#fileManagerResults").append(tile);
    if (fileManagerEncrypted && files.length > 0)
        setTimeout(function(){startFileUploadEncrypted();},100);
    else
        setTimeout(function(){startFileUploadUnencrypted();},100);
}

function startFileUploadEncrypted()
{
    var t = $("#fileManagerResults").children(".tile").last();
    t.find(".title").text("Encrypting...");
    setTimeout(function(){startFileUploadEncrypt();},100);
}
function startFileUploadEncrypt()
{
    var reader = new FileReader();
    reader.onload = function(event) {
        var obj = {};
        obj["@context"] = "http://schema.eduworks.com/general/0.1";
        obj["@type"] = "file";
        obj["@id"] = skyrepo.selectedServer+"/data/file/"+id+"/"+new Date().getTime();
        var id = guid();
        obj.name = files[0].name;
        obj.data = event.target.result.split(",")[1];
        obj.mimeType = event.target.result.split(";")[0].split(":")[1];
        
        log("Generating Secret","Generating Symmetric Key for AES-256-CTR.");
        var cryptoKey = skycrypto.newSymmetricKey();
        log("Encoding Secret","Encoding Tamper-proof secret using field and ID.");
        var cryptoWrapper = JSON.stringify({id:id,key:cryptoKey});
        log("Encrypting Secret","Encoding Secret using " + $("#data .activeKeys").find(".success").text()+"\nThis will allow only those with the appropriate PPK access to the Secret.");
        var encryptedKey = skycrypto.encryptAsymmetric(cryptoWrapper);
        log("Generating IV","Generating Initialization Vector using field and ID.");
        var iv = JSON.stringify({id:id});
        log("Encrypting Data","Encoding Field using AES-256-CTR.");
        var encryptedText = skycrypto.encryptSymmetric(cryptoKey,iv,stringifyJSON(obj));

        var encryptedObj = {        
            secret:encryptedKey,
            payload:encryptedText
        };
        encryptedObj["@context"]=skyrepo.const.ebac.context;
        encryptedObj["@type"]=skyrepo.const.ebac.encryptedValue;
        encryptedObj["@id"]=skyrepo.selectedServer+"/data/file/"+id+"/"+new Date().getTime();
        encryptedObj["@encryptedType"]="http://schema.eduworks.com/general/0.1/file";
        encryptedObj["@owner"]=skycrypto.pkText();
        encryptedObj.name = files[0].name;
        var t = $("#fileManagerResults").children(".tile").last();
        t.find(".title").text("Uploading...");
        skyrepo.update(
            encryptedObj,
            function(){
                t.find(".title").text(files[0].name);
                files.shift();
                if (files.length != 0)
                    startFileUpload();
            },
            function(){
                t.remove();
                files.shift();
                if (files.length != 0)
                    startFileUpload();
            }
        )
    };
    reader.readAsDataURL(files[0]);    
}
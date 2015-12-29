function fileManagerSearch()
{
    var tile = '<div class="tile" tabindex="0" style="display:block"><div class="cube app document"><div class="front"><p class="title"></p></div><div class="back"><p class="status"></p><div class="actions"></div></div></div><a class="hotspot finger" title=""></a></div>';
    var query = $("#fileManagerSearchText").val();
    
    var queryAdd = "";
    if (fileManagerSearchesPublic)
        queryAdd = "(@type:*file OR @encryptedType:*file)";
    else
        queryAdd = "(@encryptedType:*file)"
    
    if (query == null || query == "")
        query = queryAdd;
    else
        query = "("+query+') AND ' + queryAdd;
    
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
$( "#fileManager" ).on( "keyup", "#fileManagerSearchText",function(obj){
    fileManagerSearch();
});

$( "#fileManagerResults" ).on( "click", ".tile",function(){
    skyrepo.get($(this).attr("id"),function(obj){
        skymanip.selectedObject = obj;
        if (skymanip.getTypeUrl() == skyrepo.const.ebac.encryptedValue)
            skymanip.decrypt();
            
        downloadBase64(skymanip.selectedObject.name,skymanip.selectedObject.data);
    });    
});

var fileManagerEncrypted = true;
var fileManagerSearchesPublic = true;

$("#fileManagerEncrypted").change(function(){
    fileManagerEncrypted = this.checked;
    fileManagerSearch();
})
$("#fileManagerPublic").change(function(){
    fileManagerSearchesPublic = this.checked;
    fileManagerSearch();
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
    if (files.length > 0)
        if (fileManagerEncrypted)
            setTimeout(function(){startFileUpload2(true);},100);
        else
            setTimeout(function(){startFileUpload2(false);},100);
}

function startFileUpload2(encrypt)
{
    var t = $("#fileManagerResults").children(".tile").last();
    t.find(".title").text("Encrypting...");
    setTimeout(function(){startFileUpload3(encrypt);},100);
}

function startFileUpload3(encrypt)
{
    var reader = new FileReader();
    reader.onload = function(event) {
        
        if (skycrypto.selectedPpk == "")
        {
            alert("No encryption key has been selected.");
            return;
        }
        
        skymanip.create(skymanip.const.general.file);
        
        skymanip.selectedObject.name = files[0].name;
        skymanip.selectedObject.data = event.target.result.split(",")[1];
        skymanip.selectedObject.mimeType = event.target.result.split(";")[0].split(":")[1];
        
        if (encrypt)
            skymanip.encrypt(true);
        
        var t = $("#fileManagerResults").children(".tile").last();
        t.find(".title").text("Uploading...");
        skyrepo.update(
            skymanip.selectedObject,
            function(){
                t.find(".title").text(files[0].name);
                t.attr("id",skymanip.selectedObject["@id"]);
                
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
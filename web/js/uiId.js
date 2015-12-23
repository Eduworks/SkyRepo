$("#loginLogin").click(function(e){
    skyid.login(
        $("#skyIdLoginModalUsername").val(),
        $("#skyIdLoginModalPassword").val()
    );
    
    skyid.fetchCredentials(
        function(obj){
            $("#skyIdLogin").hide();
            $("#skyIdLogout").show();
            $("#skyIdSave").show();
            $("#skyIdCreate").hide();
            $('#skyIdLoginModal').foundation('reveal', 'close');
        },
        function(obj){
            $("#skyIdLogin").show();
            $("#skyIdLogout").hide();
            $("#skyIdSave").hide();
            $("#skyIdCreate").show();
        },
        addKeyCallback
    );
});

$("#createCreate").click(function(e){
    
    skyid.login(
        $("#skyIdLoginModalUsername").val(),
        $("#skyIdLoginModalPassword").val()
    );
    
    skyid.create(
        function(obj){
            $("#skyIdLogin").hide();
            $("#skyIdLogout").show();
            $("#skyIdSave").show();
            $("#skyIdCreate").hide();
            $('#skyIdCreateModal').foundation('reveal', 'close');
        },
        function(obj){
            $("#skyIdLogin").show();
            $("#skyIdLogout").hide();
            $("#skyIdSave").hide();
            $("#skyIdCreate").show();
        },        
        function(obj){
            alert("Pad Callback! "+obj);
        }
    )
});

function saveCredentials()
{
    skyid.commitCredentials(
        function(obj){
        },
        function(obj){
            $("#skyIdLogin").show();
            $("#skyIdLogout").hide();
            $("#skyIdSave").hide();
            $("#skyIdCreate").show();
        },        
        function(obj){
            alert("Pad Callback! "+obj);
        }
    )
}
function logout()
{
    skyid.usernameWithSalt = null;
    skyid.passwordWithSalt = null;
    skyid.pad = null;
    skyid.token = null;
    skyid.secretWithSalt = null;
    skycrypto.ppks=[];
    addKeyCallback();
    $("#skyIdLogin").show();
    $("#skyIdLogout").hide();
    $("#skyIdSave").hide();
    $("#skyIdCreate").show();
}
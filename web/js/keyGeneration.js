function generateKeyCallback(pk,ppk)
{
    download('skyrepo.pem',ppk);
    skyrepo.activateKey(ppk,addKeyCallback,"New Alias");
    $("#pkModal").text(pk);
    $("#ppkModal").text(ppk);
    $("#keyModal").foundation('reveal', 'open');     
}

function addKeyCallback()
{
    $(".activeKeys").html("");
    $("#addKeyIv").val("");
    for (var ppk in skyrepo.ppks)
    {
        var name = skyrepo.ppks[ppk];
        if (skyrepo.contacts[skyrepo.pkText(ppk)].name != undefined)
            name = skyrepo.contacts[skyrepo.pkText(ppk)].name;
        $("#key .activeKeys").append("<span title='"+ppk+"' onclick='copyTextToClipboard(\""+ppk+"\");'>"+name+"</span><br>");
        $("#data .activeKeys").append("<span class='label alert' title='"+ppk+"' onclick='selectKey(\""+ppk+"\");'>"+name+"</span><br>");
    }
    clearContacts();
    for (var contact in skyrepo.contacts)
    {
        createContact(contact,skyrepo.contacts[contact]);
    }
}
$( document ).ready( function(){addKeyCallback();} )
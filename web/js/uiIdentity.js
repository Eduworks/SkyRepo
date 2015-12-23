function generateKeyCallback(pk,ppk)
{
    download('skyrepo.pem',ppk);
    skycrypto.activateKey(ppk,addKeyCallback,"New Alias");
    $("#pkModal").text(pk);
    $("#ppkModal").text(ppk);
    if (skyid.token != undefined)
        $('#skyIdSaveModal').foundation('reveal', 'open');
}

function addKeyCallback()
{
    $(".activeKeys").html("");
    $("#addKeyIv").val("");
    for (var ppk in skycrypto.ppks)
    {
        var name = skycrypto.ppks[ppk];
        if (skycrypto.contacts[skycrypto.pkText(ppk)].name != undefined)
            name = skycrypto.contacts[skycrypto.pkText(ppk)].name;
        $("#key .activeKeys").append("<span title='"+ppk+"' onclick='copyTextToClipboard(\""+ppk+"\");'>"+name+"</span><br>");
        $("#data .activeKeys").append("<span class='label alert' title='"+ppk+"' onclick='selectKey(\""+ppk+"\");'>"+name+"</span><br>");
        $("#fileManager .activeKeys").append("<span class='label alert' title='"+ppk+"' onclick='selectKey(\""+ppk+"\");'>"+name+"</span><br>");
    }
    clearContacts();
    for (var contact in skycrypto.contacts)
    {
        createContact(contact,skycrypto.contacts[contact]);
    }
}

$( document ).ready( function(){addKeyCallback();} )
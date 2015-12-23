function defaultObject()
{
    var defaultObject={
        name:"New Object"        
    };
    defaultObject["@context"]="http://schema.org";
    defaultObject["@type"]="Thing";
    defaultObject["@id"]="http://skyrepo.service.eduworks.com/data/Thing/"+guid()+"/0";
    return stringifyJSON(defaultObject);
}

function selectKey(ppk)
{
    $("#data .activeKeys").children("span").removeClass("success").addClass("alert");
    $("#data .activeKeys").find("[title='"+ppk+"']").removeClass("alert").addClass("success");
    $("#fileManager .activeKeys").children("span").removeClass("success").addClass("alert");
    $("#fileManager .activeKeys").find("[title='"+ppk+"']").removeClass("alert").addClass("success");
    skycrypto.selectedPpk = ppk;
}

function clearContacts()
{
    $(".contactsList").html("");
}

//TODO: Prevent XSS exploits.
function createContact(pk)
{
    $(".contactsList").append('<hr>');
    $(".contactsList").append('<a class="button right tiny" style="margin-left:5px">Lookup</a>');
    $(".contactsList").append('<a class="button right tiny" style="margin-left:5px">Forget</a>');
    $(".contactsList").append('<h5>');
    if (skycrypto.contacts[pk].image === undefined)
        skycrypto.contacts[pk].image = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/48px-User_icon_2.svg.png";
    $(".contactsList").append('<img src="'+skycrypto.contacts[pk].image+'">');
    $(".contactsList").append('<span class="contactText" title="'+pk+'" contenteditable="true">'+skycrypto.contacts[pk].name+'</span>');
    $(".contactsList").append('<br>');
    if (skycrypto.contacts[pk].home != undefined)
        $(".contactsList").append('<small>Home: '+skycrypto.contacts[pk].home+'</small>');
    $(".contactsList").append('</h5>');
}

function createContactSmall(pk)
{
    pk = skycrypto.trimKey(pk);
    if (skycrypto.contacts[pk] == undefined)
        skycrypto.contacts[pk] = {};
    if (skycrypto.contacts[pk].name === undefined)
        skycrypto.contacts[pk].name = "Unknown Agent.";
    if (skycrypto.contacts[pk].image === undefined)
        skycrypto.contacts[pk].image = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/48px-User_icon_2.svg.png";
    return '<div><img src="'+skycrypto.contacts[pk].image+'">'
    + '<span class="contactText" title="'+pk+'" contenteditable="true">'+skycrypto.contacts[pk].name+'</span></div><span style="display:none;">'+pk+'</span>';
}

$('body').on('focus', '.contactText', function() {
    var $this = $(this);
    $this.data('before', $this.html());
    return $this;
}).on('blur paste', '.contactText', function() {
    var $this = $(this);
    if ($this.data('before') !== $this.html()) {
        $this.data('before', $this.html());
        var pk = $(this).attr("title");
        skycrypto.contacts[pk].name = $this.text();
        skycrypto.contactsModified();
        addKeyCallback();
    }
    return $this;
});
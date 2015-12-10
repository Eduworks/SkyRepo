
function selectKey(ppk)
{
    $("#data .activeKeys").children("span").removeClass("success").addClass("alert");
    $("#data .activeKeys").find("[title='"+ppk+"']").removeClass("alert").addClass("success");
    skyrepo.selectedPpk = ppk;
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
    if (skyrepo.contacts[pk].image === undefined)
        skyrepo.contacts[pk].image = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/48px-User_icon_2.svg.png";
    $(".contactsList").append('<img src="'+skyrepo.contacts[pk].image+'">');
    $(".contactsList").append('<span class="contactText" title="'+pk+'" contenteditable="true">'+skyrepo.contacts[pk].name+'</span>');
    $(".contactsList").append('<br>');
    if (skyrepo.contacts[pk].home === undefined)
        skyrepo.contacts[pk].home = "unknown";
    $(".contactsList").append('<small>Home: '+skyrepo.contacts[pk].home+'</small>');
    $(".contactsList").append('</h5>');
}

function createContactSmall(pk)
{
    pk = skyrepo.trimKey(pk);
    if (skyrepo.contacts[pk] == undefined)
        skyrepo.contacts[pk] = {};
    if (skyrepo.contacts[pk].name === undefined)
        skyrepo.contacts[pk].name = "Unknown Agent.";
    if (skyrepo.contacts[pk].image === undefined)
        skyrepo.contacts[pk].image = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/48px-User_icon_2.svg.png";
    return '<div><img src="'+skyrepo.contacts[pk].image+'">'
    + '<span class="contactText" title="'+pk+'" contenteditable="true">'+skyrepo.contacts[pk].name+'</span></div><span style="display:none;">'+pk+'</span>';
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
        skyrepo.contacts[pk].name = $this.text();
        skyrepo.contactsModified();
        addKeyCallback();
    }
    return $this;
});
function privateDataSearch()
{
    var tile = '<div class="tile" tabindex="0" style="display:block"><div class="cube app data"><div class="front"><p class="title"></p></div><div class="back"><p class="status"></p><div class="actions"></div></div></div><a class="hotspot finger" title=""></a></div>';
    var query = $("#privateDataSearchText").val();
    if (query == null || query == "")
        query = "*";
    skyrepo.search(
        query,
        function(obj){
            $("#searchResultsPrivate").html("");
            for (var index in obj)
            {
                $("#searchResultsPrivate").append(tile);
                var t = $("#searchResultsPrivate").children(".tile").last();
                t.find(".title").text(obj[index]["@type"]);
                t.attr("data",JSON.stringify(obj[index]));
            }
        },
        function(obj){
            
        }
    );
}
$( ".myData" ).on( "keyup", "#privateDataSearchText",function(obj){
        privateDataSearch();
});

$( "#searchResultsPrivate" ).on( "click", ".tile",function(){
    $('#datum').remove();
    if ($('#datum').length == 0)
        $(".dataRecepticle").append("<div id='datum'></div>");
    replaceField($('#datum'),JSON.parse($(this).attr("data")));
    $('#datum').children("div").css("overflow-x","inherit");
    $('.dataMenu').hide();
    $('.newData').show();
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SkyRepo Object Store Utility Functions
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function getSroPostDataObject(thisCtx) {
    var spdoMpp = getFileFromPost.call(thisCtx,srosPostDataName());
    var spdoMppContent = fileToString.call(thisCtx, spdoMpp).trim();
    var spdMppObject = JSON.parse(spdoMppContent);
    return spdMppObject;
}
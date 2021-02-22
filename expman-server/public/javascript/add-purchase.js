$(function addPurchaseBtn() {
  $("#addPurchaseBtn").click(function(){
    $('#addPurchase').toggleClass("d-none");
  });
});


$(function addPurchase() {
  var port = window.location.port;
  var host = window.location.hostname;
  $("#savePurchaseBtn").click(function(){
    var purchase = {
      'name': document.getElementById("inputPurchaseName").value,
      'type': document.getElementById("inputPurchaseType").value,
      'is_mandatory': document.getElementById("selectIsMandatory").value == "true",
      'is_single_time': document.getElementById("selectIsSingleTime").value == "true"
    };
    makePostRequest(host, port, '/api/purchase', purchase, function() {
      window.location.href = "/purchases";
    });
  });
});

$(function addPurchase() {
  var port = window.location.port;
  var host = window.location.hostname;
  $("#savePurchaseBtn").click(function(){
    var purchase = {
      'name': document.getElementById("inputPurchaseName").value,
      'type': document.getElementById("inputPurchaseType").value,
      'is_mandatory': document.getElementById("selectIsMandatory").value,
      'is_single_time': document.getElementById("selectIsSingleTime").value
    };
    $.ajax({
      url: '//' + host + ':' + port + '/api/purchase',
      type: 'POST',
      data: purchase,
      crossDomain: false,
      success: function(data) {
        alert('Success!\n' + data);
        return data;
      },
      error: errorMessage
    });
  });
});

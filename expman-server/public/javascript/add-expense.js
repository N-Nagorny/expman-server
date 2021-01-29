$(function addExpense() {
  var port = window.location.port;
  var host = window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const purchaseId = urlParams.get('purchaseId');
  $("#saveExpenseBtn").click(function(){
    var expense = {
      'name': document.getElementById("inputExpenseName").value,
      'type': document.getElementById("inputExpenseType").value,
      'is_mandatory': document.getElementById("selectIsMandatory").value,
      'commentary': document.getElementById("inputCommentary").value,
      'is_single_time': document.getElementById("selectIsSingleTime").value,
      'cost': document.getElementById("inputCost").value
    };
    if (purchaseId)
      expense['id'] = purchaseId;
    var page = purchaseId ? '/api/purchase-to-expense' : '/api/expense';
    var quantity = purchaseId ? 1 : document.getElementById("inputQuantity").value;
    for (var i = 0; i < quantity - 1; ++i) {
      makePostRequest(host, port, page, expense, function() {});
    }
    makePostRequest(host, port, page, expense, function() {
      window.location.href = "/expenses";
    });
  });
});


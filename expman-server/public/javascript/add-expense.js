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
    $.ajax({
      url: '//' + host + ':' + port + page,
      type: 'POST',
      data: expense,
      crossDomain: false,
      success: function(data) {
        alert('Success!\n' + data);
        return data;
      },
      error: errorMessage
    });
  });
});


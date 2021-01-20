$(function addExpense() {
  var port = window.location.port;
  var host = window.location.hostname;
  $("#saveExpenseBtn").click(function(){
    var expense = {
      'name': document.getElementById("inputExpenseName").value,
      'type': document.getElementById("inputExpenseType").value,
      'is_mandatory': document.getElementById("selectIsMandatory").value,
      'commentary': document.getElementById("inputCommentary").value,
      'is_single_time': document.getElementById("selectIsSingleTime").value,
      'cost': document.getElementById("inputCost").value
    };
    $.ajax({
      url: '//' + host + ':' + port + '/api/expense',
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


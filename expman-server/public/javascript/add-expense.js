$(function addExpenseBtn() {
  if (!($("#addExpenseBtn").length > 0)) {
    $('#addExpenseForm').toggleClass("d-none");
  }
  $("#addExpenseBtn").click(function(){
    $('#addExpenseForm').toggleClass("d-none");
  });
});

$(function addExpense() {
  var port = window.location.port;
  var host = window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const expenseId = urlParams.get('expenseId');
  const purchaseIds = urlParams.getAll('purchaseId');
  var purchaseId = null;
  if (purchaseIds.length) {
    purchaseId = purchaseIds[0];
    purchaseIds.shift();
  }
  $("#saveExpenseBtn").click(() => {
    $("#addExpenseForm").validate({
      submitHandler: () => {
        $('#saveExpenseBtn').html('<div class="fa fa-spinner fa-spin"></div>');
        var expense = {
          'name': document.getElementById("inputExpenseName").value,
          'type': document.getElementById("inputExpenseType").value,
          'is_mandatory': document.getElementById("selectIsMandatory").value == "true",
          'commentary': document.getElementById("inputCommentary").value,
          'is_single_time': document.getElementById("selectIsSingleTime").value == "true",
          'cost': Number(document.getElementById("inputCost").value)
        };
        var quantity = purchaseId != null || expenseId ? 1 : document.getElementById("inputQuantity").value;
        for (var i = 0; i < quantity - 1; ++i) {
          makePostRequest(host, port, '/api/expenses', expense, function() {});
        }
        if (!expenseId) {
          makePostRequest(host, port, '/api/expenses', expense, function() {
            if (purchaseId != null) {
              let params = null;
              if (purchaseIds.length) {
                params = new URLSearchParams();
                purchaseIds.forEach((value, index, array) => {
                  params.append('purchaseId', value);
                })
              }
              makeDeleteRequest(host, port, '/api/purchases', purchaseId, () => {
                let page = '/purchases';
                if (params != null)
                  page = '/add-expense' + '?' + params.toString();
                window.location.href = page;
              });
            } else {
              window.location.href = "/expenses";
            }
          });
        } else {
          makePutRequest(host, port, '/api/expenses', expenseId, expense, function() {
            window.location.href = "/expenses";
          });
        }
      }
    });
  });
});

function errorMessage (XMLHttpRequest, textStatus, errorThrown) {
  console.log(XMLHttpRequest.status + " " + XMLHttpRequest.responseText);
  alert('Error: ' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
  return false;
}

function makePostRequest(host, port, page, body, successCallback) {
  $.ajax({
    url: '//' + host + ':' + port + page,
    type: 'POST',
    contentType: "application/json; charset=utf-8",
    dataType: 'json',
    data: JSON.stringify(body),
    crossDomain: false,
    success: successCallback,
    error: errorMessage
  });
}

function makeDeleteRequest(host, port, page, id, successCallback) {
  $.ajax({
    url: '//' + host + ':' + port + page + '/' + id,
    type: 'DELETE',
    crossDomain: false,
    success: successCallback,
    error: errorMessage
  });
}

function detailFormatter(index, row) {
  var html = []
  $.each(row, function (key, value) {
    html.push('<p><b>' + key + ':</b> ' + value + '</p>')
  })
  return html.join('')
}

function operateFormatter(value, row, index) {
  return [
    '<a class="transfer" href="javascript:void(0)" title="Transfer to expenses">',
    '<i class="fas fa-cart-arrow-down"></i>',
    '</a>  ',
    '<a class="remove" href="javascript:void(0)" title="Remove">',
    '<i class="fas fa-trash"></i>',
    '</a>'
  ].join('')
}

function getIdSelections() {
  return $.map($('#purchasesTable').bootstrapTable('getSelections'), function (row) {
    return row.id
  })
}

window.operateEvents = {
  'click .transfer': function(e, value, row, index) {
    window.location.href = '/add-expense?purchaseId=' + row.id;
  },
  'click .remove': function (e, value, row, index) {
    var port = window.location.port;
    var host = window.location.hostname;
    makeDeleteRequest(host, port, '/api/purchases', row.id, function() {
      window.location.href = "/purchases";
    });
  }
}

function initTable() {
  $('#purchasesTable').bootstrapTable('destroy').bootstrapTable({
    columns: [
      [{
        field: 'state',
        checkbox: true
      }, {
        title: 'Name',
        field: 'name',
      }, {
        title: 'Type',
        field: 'type',
        sortable: true
      }, {
        title: 'Mandatory',
        field: 'is_mandatory'
      }, {
        title: 'Single-time',
        field: 'is_single_time',
        class: 'd-none d-lg-table-cell'
      }, {
        title: 'Created at',
        field: 'createdAt',
        class: 'd-none d-lg-table-cell'
      }, {
        field: 'operate',
        title: 'Actions',
        clickToSelect: false,
        events: window.operateEvents,
        formatter: operateFormatter
      }]
    ]
  });
  $('#purchasesTable').on('check.bs.table uncheck.bs.table ' +
      'check-all.bs.table uncheck-all.bs.table',
  function () {
    $('#deletePurchaseBtn').prop('disabled', !$('#purchasesTable').bootstrapTable('getSelections').length)
    $('#transferPurchaseBtn').prop('disabled', !$('#purchasesTable').bootstrapTable('getSelections').length)

    // save your data, here just save the current page
    selections = getIdSelections()
    // push or splice the selections if you want to save all data selections
  })
  $('#purchasesTable').on('all.bs.table', function (e, name, args) {
    console.log(name, args)
  });
  $('#transferPurchaseBtn').click(function () {
    let params = new URLSearchParams();
    getIdSelections().forEach((value, index, array) => {
      params.append('purchaseId', value);
    })
    $('#transferPurchaseBtn').prop('disabled', true)
      window.location.href = '/add-expense' + '?' + params.toString();
  });
  $('#deletePurchaseBtn').click(function () {
    var ids = getIdSelections();
    var host = window.location.hostname;
    var port = window.location.port;
    for (var i = 0; i < ids.length - 1; ++i) {
      makeDeleteRequest(host, port, '/api/purchases', ids[i], function() {});
    }
    makeDeleteRequest(host, port, '/api/purchases', ids[ids.length - 1], function() {
      $('#deletePurchaseBtn').prop('disabled', true)
      window.location.href = "/purchases";
    });
  });
}

function queryParams(params) {
  return {};
}

$(function() {
  initTable()
})

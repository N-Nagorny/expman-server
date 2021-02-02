function errorMessage (XMLHttpRequest, textStatus, errorThrown) {
  console.log(XMLHttpRequest.status + " " + XMLHttpRequest.responseText);
  alert('Error: ' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
  return false;
}

function makePostRequest(host, port, page, body, successCallback) {
  $.ajax({
    url: '//' + host + ':' + port + page,
    type: 'POST',
    data: body,
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
    '<a href="./add-expense?purchaseId='+row.id+'"',
    '<i class="fas fa-cart-arrow-down"></i>',
    '</a>  ',
    '<i class="remove fas fa-trash"></i>',
    '</a>',
  ].join('')
}

window.operateEvents = {
  'click .remove': function (e, value, row, index) {
    var port = window.location.port;
    var host = window.location.hostname;
    var body = {
      'id': row.id
    }
    $.ajax({
      url: '//' + host + ':' + port + '/api/purchase',
      type: 'DELETE',
      data: body,
      crossDomain: false,
      success: window.location.href = "/purchases",
      error: errorMessage
    });
  }
}

function initTable() {
  $('#purchasesTable').bootstrapTable('destroy').bootstrapTable({
    columns: [
      [{
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
  })
}

$(function() {
  initTable()
})

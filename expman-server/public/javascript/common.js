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

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

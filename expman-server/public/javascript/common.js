function errorMessage (XMLHttpRequest, textStatus, errorThrown) {
  console.log(XMLHttpRequest.status + " " + XMLHttpRequest.responseText);
  alert('Error: ' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
  return false;
}
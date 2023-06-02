const FUNCTION_URL =
  'https://us-central1-ut-dts-agrc-deq-enviro-dev.cloudfunctions.net/configs';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Deployment')
    .addItem(
      'Deploy Configs to Staging App (enviro.dev.utah.gov)',
      'callUpdateFunction'
    )
    .addToUi();
}

function callUpdateFunction() {
  const token = ScriptApp.getIdentityToken();
  const options = {
    method: 'get',
    headers: { Authorization: 'Bearer ' + token },
  };
  // call the server
  const response = UrlFetchApp.fetch(FUNCTION_URL, options);
  const responseJson = JSON.parse(response.getContentText());

  const ui = SpreadsheetApp.getUi();

  var title = 'Deploy Successful';
  var htmlOutput = HtmlService.createHtmlOutput(
    '<div style="font-family: sans-serif">'
  );
  if (responseJson.success) {
    htmlOutput.append(`<h4>${responseJson.message}</h4>`);
  } else {
    title = 'Deploy Unsuccessful';
    htmlOutput.append(
      `<h4>There was an error with the deployment:</h4><pre>${responseJson.error}</pre>`
    );
  }

  if (responseJson.validationErrors.length > 0) {
    htmlOutput.append('<h4>Validation Errors</h4>');
    for (var message of responseJson.validationErrors) {
      htmlOutput.append(`<p>${message}</p>`);
    }
  }
  htmlOutput.append('</div>');

  ui.showModalDialog(htmlOutput, title);
}

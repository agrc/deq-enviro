const FUNCTION_URL =
  'https://<project-id>.cloudfunctions.net/updateRemoteConfigFromSheets';

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

  const ui = SpreadsheetApp.getUi();
  ui.alert('Deploy Result', response.getContentText().trim(), ui.ButtonSet.OK);
}

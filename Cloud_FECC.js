const xapi = require('xapi');

var currentCallId = null;
var deviceId = '';
var Action = '';
var ParticipantsList = [];
var NumberOfParticipants = 0;
var Offset = 0;
var ActiveDevice = '';
var systemName = '';

const BOT_TOKEN = 'ENTER_YOUR_BOT_TOKEN_HERE'; //ADD YOUR BOT TOKEN HERE

init();

function init(){
  console.log('checking HttpClient Mode');
  xapi.config.get('HttpClient Mode').then ((value) => {
          var HttpClient_Mode = value;
          console.log('HttpClient Mode is ' + HttpClient_Mode);
          if (HttpClient_Mode == "Off"){
            xapi.config.set('HttpClient Mode', 'On');
          }
  });
  xapi.status.get('UserInterface ContactInfo').then((value) => {
    systemName = value.Name;
    if(systemName === ''){ console.log('system name not set'); }
    else{ console.log('System Name: ' + systemName) }
  });
}

function Reset_Camera(){
    var url = "https://api.ciscospark.com/v1/xapi/command/camera.positionreset";
    var payload = JSON.stringify({
            "deviceId": deviceId,
            "arguments": {
                "CameraId": 1
                }
            });
    sendWebexTeams(url, 'Post', payload);
}

function Move_Camera(Action, Direction){
    var speed_cmd = (Action + "Speed");
    var url = "https://api.ciscospark.com/v1/xapi/command/camera.ramp";
    var args = {};
    args['CameraId'] = 1;
    args[Action] = Direction;
    args[speed_cmd] = 1;
    var payload = JSON.stringify({
            "deviceId": deviceId,
            "arguments": args
            });
    sendWebexTeams(url, 'Post', payload);
}

function sendWebexTeams(url, method, data) {
  xapi.command('HttpClient ' + method, { 
    Header: ["Content-Type: application/json", "Authorization: Bearer " + BOT_TOKEN], 
    Url: url,
    AllowInsecureHTTPS: 'False',
    ResultBody: 'plaintext'
  }, 
    data)
  .then((result) => {
    console.log(`received response with status code: ${result.StatusCode}`);
  })
  .catch((err) => {
      console.log("failed: " + JSON.stringify(err.message));
      sendAlert('The command is not supported on the remote endpoint.');
  });
}

function sendAlert(Message){
  xapi.command("UserInterface Message Alert Display", {
                  Title: 'Failure'
                  , Text: Message
                  , Duration: 10
              }).catch((error) => { console.error(error); });
}

function getDeviceId(DeviceName) {
  DeviceName = encodeURI(DeviceName);
  var url = "https://api.ciscospark.com/v1/devices?displayName=" + DeviceName;
  xapi.command('HttpClient GET', { 
    Header: ["Content-Type: application/json", "Authorization: Bearer " + BOT_TOKEN], 
    Url: url,
    AllowInsecureHTTPS: 'False',
    ResultBody: 'PlainText'
  })
  .then((response) => {
    let result = JSON.parse(response.Body);
    deviceId = result.items[0].id;
    console.log('device id: ' + deviceId);
  })
  .catch((err) => {
    deviceId = '';
    console.log("failed: " + JSON.stringify(err));
    xapi.command("UserInterface Extensions Panel Close").then(result => {
    console.log(result);
    });
    sendAlert('Cannot control remote endpoint.');
  });
}

function openParticipantPanel(){
  var PromptData = {
      Title: "Select Remote Endpoint"
    , Text: 'Please select the remote endpoint to control.'
    , FeedbackId: 'participant_select'
    };
  var i;
  var Counter;
  var ParticipantCount = NumberOfParticipants - Offset;
  //console.log('Participants count = ' + ParticipantCount.toString());
  if (ParticipantCount > 5){ Counter = 5}
  else { Counter = ParticipantCount }
  for (i=0; i<Counter; i++) {
    var index = i + 1;
    var key = 'Option.' + index;
    if (index == 1 && Offset > 0){ PromptData[key] = 'Back';}
    else if (index == 5 && NumberOfParticipants > (Offset + 5)){ PromptData[key] = 'Next'; }
    else {
      var participant = ParticipantsList[i + Offset];
      PromptData[key] = participant;
      }
    }
  xapi.command("UserInterface Message Prompt Display", PromptData);
}

function getParticipants(){
  ParticipantsList = [];
  xapi.command('Conference ParticipantList Search', { CallId: currentCallId }).then((data) =>{
    var Participants = data.Participant;
    Participants.forEach(function (arrayItem) {
      if (arrayItem.Type=='Room' && arrayItem.Status=='connected' && arrayItem.DisplayName!=systemName){
        var x = arrayItem.DisplayName;
        ParticipantsList.push(x);
      }
    });
    NumberOfParticipants = ParticipantsList.length;
    console.log("Remote Participants = " + NumberOfParticipants.toString());
    if ( NumberOfParticipants > 1 ){
      openParticipantPanel();
    } else { 
      getDeviceId(ParticipantsList[0]);
      openPanel('FECC-2') }
  });
}

function openPanel(Panel_Id){
  xapi.command("UserInterface Extensions Panel Open", {
        PanelId: Panel_Id
    }).then(result => {
  console.log(result);
  });
}

xapi.event.on('UserInterface Message Prompt Response', (event) => {
  if (event.FeedbackId == 'participant_select'){
    var index = event.OptionId;
    if (index == 1 && Offset > 0){
      Offset = Offset - 3;
      openParticipantPanel();
    }
    else if (index == 5 && NumberOfParticipants > (Offset + 5)){ 
      Offset = Offset + 3;
      openParticipantPanel();
    } else {
      var ParticipantPosition = +index+Offset
      ActiveDevice = ParticipantsList[ParticipantPosition-1];
      console.log('ActiveDevice: ' + ActiveDevice);
      getDeviceId(ActiveDevice);
      openPanel('FECC-2');
    }
  }
});

xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
  if (event.PanelId == 'FECC-1');
  xapi.status.get('Call').then((CallData) => {
    currentCallId = CallData[0].id;
  });
  xapi.status.get('Conference Call').then((ConfData) => {
      //console.log(ConfData);
      var ParticipantList = ConfData[0].Capabilities.ParticipantList;
      console.log('ParticipantList: ' + ParticipantList);
      if (ParticipantList == 'Available'){}
        getParticipants();
  });
});

//Recieve input from touch 10 UI widgets
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
  var Direction = event.Value;
  if (Direction == 'right' || Direction == 'left'){
          Action = 'Pan';
        }
        else if (Direction == 'up' || Direction == 'down'){
          Action = 'Tilt';
        }
        else if (Direction == 'increment' || Direction == 'decrement'){
          Action = 'Zoom';
        }
  if(event.WidgetId == 'cameracontrol'){
      if(event.Type == 'pressed'){
          switch(event.Value){
              case 'right':
                Move_Camera('Pan', 'Right');
               break;
              case 'left':
                Move_Camera('Pan', 'Left');
               break;
              case 'up':
                Move_Camera('Tilt', 'Up');
               break;
              case 'down':
                Move_Camera('Tilt', 'Down');
               break;
              case 'center':
                Reset_Camera();
               break;
              default:
               console.log(`Unhandled Navigation`);
          }
      }
      if(event.Type == 'released' && event.Value != 'center'){
        Move_Camera(Action, 'Stop');
      }        
  }
    else if(event.WidgetId == 'fecc_zoom'){
    if(event.Type == 'pressed'){
        switch(event.Value){
            case 'increment':
             Move_Camera('Zoom', 'In');
             break;
            case 'decrement':
             Move_Camera('Zoom', 'Out');
             break;
        }
    }
    else if(event.Type == 'released'){
      Move_Camera(Action, 'Stop');
    }
  }
});

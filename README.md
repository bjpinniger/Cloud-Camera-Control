# Cloud-Camera-Control
![language:Python](https://img.shields.io/badge/Language-Python-blue.svg?style=flat-square)
![license:MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

This macro can be used to enable far end camera control for video endpoints registered to the Webex cloud.

1) login to developer.webex.com and create a new BOT (call it whatever you want) - [learn about bots here](https://developer.webex.com/docs/bots)

**WHEN YOU CREATE THE BOT MAKE SURE YOU ARE LOGGED IN WITH AN ACCOUNT THAT IS PART OF THE SAME ORG AS THE ENDPOINTS YOU WANT TO CONTROL**

2) add the BOT token to the macro
3) login to admin.webex.com and under workspaces give full API access to the BOT account for the places you want to enable for FECC.

![edit API access](/images/edit-api-access.png?raw=true)

Make sure you give the BOT full API access to each device...

![grant API access](/images/grant-api-access.png?raw=true)

4) load the UI extensions and macro on the video endpoints that the BOT has been granted API access to.

## Update - 29 June 2020
The macro now supports Webex Meetings. To support this change there are now 2 UI extensions...

FECC-1 - this button now launches the macro to check if the call has more than 1 remote endpoint
FECC-2 - this is the original UI extension that provides the buttons to control the camera on the remote endpoint

If there's more than 1 remote endpoint the user will now see a list of endpoints to choose from. Only 5 endpoints can be shown on a page, so to allow users to scroll through the entire list of endpoints there will be a "Next" option if there are more than 5 remote endpoints in the call.

![Image of 1st Page](/images/1st-page.png?raw=true)

On the 2nd and subsequent pages there will also be a "Back" option to return to the previous page.

![Image of 2nd Page](/images/2nd-page.png?raw=true)

After the user selects an endpoint to control the Remote Camera Control UI Extension will appear.

![Image of FECC Page](/images/FECC-panel.png?raw=true)

NOTE: If the BOT doesn't have access to the remote endpoint, or if the remote endpoint doesn't support PTZ camera control (e.g. a DX80) an alert will be shown to the user with an error message.


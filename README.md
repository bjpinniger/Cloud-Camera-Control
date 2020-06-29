# Cloud-Camera-Control
This macro can be used to enable far end camera control for video endpoints registered to the Webex cloud.

1) login to developer.webex.com and create a new BOT (call it whatever you want)
2) add the BOT token to the macro
3) login to admin.webex.com and under workspaces give full access to the BOT account for the places you want to enable for FECC
4) load the UI extension and macro on the video endpoints that the BOT has been given access to

## Update - 29 June 2020
The macro now supports Webex Meetings. To support this change there are now 2 UI extensions...

FECC-1 - this button now launches the macro to check if the call has more than 1 remote endpoint
FECC-2 - this is the original UI extension that provides the buttons to control the camera on the remote endpoint

If there's more than 1 remote endpoint the user will now see a list of endpoints to choose from. Only 5 endpoints can be shown on a page, so to allow users to scroll through the entire list of endpoints there will be a "Next" option if there are more than 5 remote endpoints in the call.

![Image of 1st Page](https://github.com/bjpinniger/Cloud-Camera-Control/images/1st-page.png)

On the 2nd and subsequent pages there will also be a "Back" option to return to the previous page.

![Image of 2nd Page](https://github.com/bjpinniger/Cloud-Camera-Control/images/2nd-page.png)

After the user selects an endpoint to control the Remote Camera Control UI Extension will appear.

![Image of FECC Page](https://github.com/bjpinniger/Cloud-Camera-Control/images/FECC-panel.png)

NOTE: If the BOT doesn't have access to the remote endpoint, or if the remote endpoint doesn't support PTZ camera control (e.g. a DX80) an alert will be shown to the user with an error message.


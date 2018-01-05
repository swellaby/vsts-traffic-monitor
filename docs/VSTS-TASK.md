# VSTS IP Address Scanner
![logo][logo-image]  
  
## Overview
Provides capabilities that allow you to analyze the IP Addresses that have been used to access your VSTS account, and cross-reference those IP Addresses against a known/white-listed set of IP Addresses that you define. This can help you determine if someone accessed your VSTS account from an unknown (or unallowed) machine/network.

## Disclaimer!!!!!!!!!!!
This extension is still in Beta. We've found plenty of bugs already, and we expect there will be more. Additionally, this extension leverages several VSTS APIs which are also still in Beta. Both this extension and the underlying VSTS APIs are very dynamic and experience regular changes, which can disrupt the scan capabilities. 

However, we are releasing it nonetheless because we had a pressing need for IP scanning capabilities, and it appears other teams do to. We ask you to be patient if you decide to use the extension in the current beta form, and to also please share any feedback, bugs you find.. or better yet send us a PR :-) , etc.

## Usage 
The extension currently provides the ability to scan IP Addresses  as a VSTS build/release task. 
  
Why a task you ask? Some of our requirements included being able to schedule recurring scans, recieve email notifications, and to have storage for scan results. Fortunately the VSTS Build/Release system provides all those capabilities without having to write a single line of code, so we started with the task and will provide more later on. 

#### Icon Credits
[Icons][vsts-task-icons] made by [Freepik][icon-author-url] from [www.flaticon.com][flaticon-url] are licensed by [CC 3.0 BY][cc3-url]

[vsts-task-icons]: docs/images
[icon-author-url]: http://www.freepik.com
[flaticon-url]: http://www.flaticon.com
[cc3-url]: http://creativecommons.org/licenses/by/3.0
[logo-image]: images/task-swell-green-128.png
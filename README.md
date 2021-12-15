# VSTS Traffic Monitor 
![logo][logo-image]  

**This extension has been deprecated and is no longer supported.**  

It was originally introduced years ago when Azure DevOps (then known as VSTS) did not honor Azure AD Conditional Access Policies (CAPs) for alternate authentication mechanisms like Personal Access Tokens (PAT). That meant that it used to be possible for users with a valid PAT to bypass CAPs, including those that restricted access to the Azure DevOps organization from a set of allowed IP Addresses.

Accordingly this extension was developed so that administrators would have a mechanism to automatically detect any cases where that bypass was exploited. However, that gap/bypass was resolved some time ago and Azure DevOps does indeed now honor AAD CAPs for all authentication mechanisms.

That resolution provides a preventative control which obviates the need for the retroactive detective control this extension provided, and we are therefore deprecating.

#### Icon Credits
[Icons][vsts-task-icons] made by [Freepik][icon-author-url] from [www.flaticon.com][flaticon-url] are licensed by [CC 3.0 BY][cc3-url]

[parent-generator-url]: https://github.com/swellaby/generator-swell
[logo-image]: docs/images/icons/task-swell-green-128.png

[contributingmd]: CONTRIBUTING.md
[extension-doc]: docs/VSTS-TASK.md
[vsts-marketplace-url]: https://marketplace.visualstudio.com/vsts
[icon-author-url]: http://www.freepik.com
[flaticon-url]: http://www.flaticon.com
[cc3-url]: http://creativecommons.org/licenses/by/3.0
[vsts-task-icons]: docs/images/icons

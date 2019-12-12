# VSTS Traffic Monitor *** BETA ***
![logo][logo-image]  

Provides capabilities that allow you to scan, analyze and monitor user traffic of a [Visual Studio Team Services][vsts-url] account. Current features allow you to analyze the IP Addresses that have accessed your VSTS account, and cross-reference those IP Addresses against a known/white-listed set of IP Addresses that you define.

[![Version Badge][version-badge]][ext-url]
[![Installs Badge][installs-badge]][ext-url]
[![Rating Badge][rating-badge]][ext-url]
[![License Badge][license-badge]][license-url]  

[![Linux CI Badge][linux-ci-badge]][linux-ci-url]
[![Mac CI Badge][mac-ci-badge]][mac-ci-url]
[![Windows CI Badge][windows-ci-badge]][windows-ci-url]  

[![Test Results Badge][tests-badge]][tests-url]
[![Coverage Badge][coverage-badge]][coverage-url]
[![Sonar Quality GateBadge][quality-gate-badge]][sonar-project-url] 

## Use Cases
- Analyze the IP addresses that have accessed your VSTS account(s)
- Make sure your users are accessing your VSTS account(s) only from known machines/networks (such as your corporate network)
  
## How to Use
The capabilities are currently exposed as:
- [A build/release task for VSTS][ext-marketplace-url] - **Now available to install from the [VSTS Marketplace][ext-marketplace-url]!!**

Future:
- Docker image
- Express.js API
- VSTS Hub

## Contributing
Pull requests are happily accepted! Check the [contributing guidelines][contributingmd] for more info on PRs, opening an Issue, and developing/building the application.  
  
<br />

### Generator
Initially created by this [swell generator][parent-generator-url]!  

#### Icon Credits
[Icons][vsts-task-icons] made by [Freepik][icon-author-url] from [www.flaticon.com][flaticon-url] are licensed by [CC 3.0 BY][cc3-url]

[parent-generator-url]: https://github.com/swellaby/generator-swell
[logo-image]: docs/images/icons/task-swell-green-128.png
[vsts-url]: https://www.visualstudio.com/team-services/


[installs-badge]: https://img.shields.io/vscode-marketplace/i/swellaby.ip-address-scanner?style=flat-square
[version-badge]: https://img.shields.io/vscode-marketplace/v/swellaby.ip-address-scanner?style=flat-square&label=marketplace
[rating-badge]: https://img.shields.io/vscode-marketplace/r/swellaby.ip-address-scanner?style=flat-square
[ext-url]: https://marketplace.visualstudio.com/items?itemName=swellaby.ip-address-scanner
[license-url]: https://github.com/swellaby/vsts-traffic-monitor/blob/master/LICENSE
[license-badge]: https://img.shields.io/github/license/swellaby/vsts-traffic-monitor?style=flat-square&color=informational
[linux-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/169/master?label=linux%20build&style=flat-square
[linux-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=169
[mac-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/167/master?label=mac%20build&style=flat-square
[mac-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=167
[windows-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/166/master?label=windows%20build&style=flat-square
[windows-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=166
[coverage-badge]: https://img.shields.io/azure-devops/coverage/swellaby/opensource/169/master?style=flat-square
[coverage-url]: https://codecov.io/gh/swellaby/vsts-traffic-monitor
[tests-badge]: https://img.shields.io/azure-devops/tests/swellaby/opensource/169/master?label=unit%20tests&style=flat-square
[tests-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=169&view=ms.vss-test-web.build-test-results-tab
[quality-gate-badge]: https://img.shields.io/sonar/quality_gate/swellaby:vsts-traffic-monitor?server=https%3A%2F%2Fsonarcloud.io&style=flat-square
[sonar-project-url]: https://sonarcloud.io/dashboard?id=swellaby%3Avsts-traffic-monitor


[contributingmd]: CONTRIBUTING.md
[extension-doc]: docs/VSTS-TASK.md
[vsts-marketplace-url]: https://marketplace.visualstudio.com/vsts
[icon-author-url]: http://www.freepik.com
[flaticon-url]: http://www.flaticon.com
[cc3-url]: http://creativecommons.org/licenses/by/3.0
[vsts-task-icons]: docs/images/icons

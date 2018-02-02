# VSTS Traffic Monitor *** BETA ***
![logo][logo-image]  

Provides capabilities that allow you to scan, analyze and monitor user traffic of a [Visual Studio Team Services][vsts-url] account. Current features allow you to analyze the IP Addresses that have accessed your VSTS account, and cross-reference those IP Addresses against a known/white-listed set of IP Addresses that you define.

<img src="docs/images/TravisCI-Mascot-2.png" width="25" height="25" /> [![Travis CI Badge][travis-ci-build-status-badge]][travis-ci-url]
[![Coveralls Badge][coveralls-badge]][coveralls-url]
[![Sonar Quality Gate Badge][sonar-quality-gate-badge]][sonar-url]
![License Badge][license-badge]
[![VSTS Badge][supercharge-vsts-badge]][vsts-url]  

[![License Badge][marketplace-version-badge]][ext-marketplace-url] 
[![Installs Badge][marketplace-installs-badge]][ext-marketplace-url]
[![License Badge][marketplace-rating-badge]][ext-marketplace-url]  

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
[travis-ci-build-status-badge]: https://travis-ci.org/swellaby/vsts-traffic-monitor.svg?branch=master
[travis-ci-url]: https://travis-ci.org/swellaby/vsts-traffic-monitor
[travis-ci-logo]: docs/images/TravisCI-Mascot-2.png
[supercharge-vsts-badge]: https://img.shields.io/badge/Supercharged%20By-VS%20Team%20Services-blue.svg
[coveralls-badge]: https://coveralls.io/repos/github/swellaby/vsts-traffic-monitor/badge.svg
[coveralls-url]: https://coveralls.io/github/swellaby/vsts-traffic-monitor
[sonar-quality-gate-badge]: https://sonarcloud.io/api/badges/gate?key=swellaby:vsts-traffic-monitor
[sonar-url]: https://sonarcloud.io/dashboard/index/swellaby:vsts-traffic-monitor
[license-badge]: https://img.shields.io/github/license/swellaby/vsts-traffic-monitor.svg
[ext-marketplace-url]: https://marketplace.visualstudio.com/items?itemName=swellaby.ip-address-scanner
[marketplace-version-badge]: https://vsmarketplacebadge.apphb.com/version-short/swellaby.ip-address-scanner.svg
[marketplace-installs-badge]: https://vsmarketplacebadge.apphb.com/installs/swellaby.ip-address-scanner.svg
[marketplace-rating-badge]: https://vsmarketplacebadge.apphb.com/rating/swellaby.ip-address-scanner.svg
[contributingmd]: CONTRIBUTING.md
[extension-doc]: docs/VSTS-TASK.md
[vsts-marketplace-url]: https://marketplace.visualstudio.com/vsts
[icon-author-url]: http://www.freepik.com
[flaticon-url]: http://www.flaticon.com
[cc3-url]: http://creativecommons.org/licenses/by/3.0
[vsts-task-icons]: docs/images/icons
# vsts-traffic-monitor *** BETA ***

Provides capabilities that allow you to scan, analyze and monitor user traffic of a [Visual Studio Team Services][vsts-url] account. 

<img src="docs/images/TravisCI-Mascot-2.png" width="25" height="25" /> [![Travis CI Badge][travis-ci-build-status-badge]][travis-ci-url]
[![Coveralls Badge][coveralls-badge]][coveralls-url]
[![Sonar Quality Gate Badge][sonar-quality-gate-badge]][sonar-url]
[![VSTS Badge][supercharge-vsts-badge]][vsts-url]

## Use Cases
- Analyze the IP addresses that have accessed your VSTS account(s)
- Make sure your users are accessing your VSTS account(s) only from known machines/networks
  
## How to Use
The capabilities are currently exposed as:
- [A build/release task for VSTS][extension-doc] - *this will be available as a [Marketplace Extension][vsts-marketplace-url] shortly*

Future:
- Docker image
- Express.js API
- VSTS Hub

## Contributing
Pull requests are happily accepted! Check the [contributing guidelines][contributingmd] for more info on PRs, opening an Issue, and developing/building the application.  
  
<br />

### Generator
Initially created by this [swell generator][parent-generator-url]!  

[parent-generator-url]: https://github.com/swellaby/generator-swell
[vsts-url]: https://www.visualstudio.com/team-services/
[travis-ci-build-status-badge]: https://travis-ci.org/swellaby/vsts-traffic-monitor.svg?branch=master
[travis-ci-url]: https://travis-ci.org/swellaby/vsts-traffic-monitor
[travis-ci-logo]: docs/images/TravisCI-Mascot-2.png
[supercharge-vsts-badge]: https://img.shields.io/badge/Supercharged%20By-VS%20Team%20Services-blue.svg
[coveralls-badge]: https://coveralls.io/repos/github/swellaby/vsts-traffic-monitor/badge.svg
[coveralls-url]: https://coveralls.io/github/swellaby/vsts-traffic-monitor
[sonar-quality-gate-badge]: https://sonarcloud.io/api/badges/gate?key=swellaby:vsts-traffic-monitor
[sonar-url]: https://sonarcloud.io/dashboard/index/swellaby:vsts-traffic-monitor
[contributingmd]: CONTRIBUTING.md
[extension-doc]: docs/VSTS-TASK.md
[vsts-marketplace-url]: https://marketplace.visualstudio.com/vsts
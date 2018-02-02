# VSTS IP Address Scanner
![logo][logo-image]  

[![License Badge][marketplace-version-badge]][ext-marketplace-url] 
[![Installs Badge][marketplace-installs-badge]][ext-marketplace-url]
[![License Badge][marketplace-rating-badge]][ext-marketplace-url]


[![Travis CI Badge][travis-ci-build-status-badge]][travis-ci-url]
[![Coveralls Badge][coveralls-badge]][coveralls-url]
[![Sonar Quality Gate Badge][sonar-quality-gate-badge]][sonar-url]
[![License Badge][license-badge]][repo-url]  

## Overview
Provides capabilities that allow you to analyze the IP Addresses that have accessed your VSTS account, and cross-reference those IP Addresses against a known/whitelisted set of IP Addresses that you define. Some use cases:  
- Analyze the IP addresses that have accessed your VSTS account(s)
- Make sure your users are accessing your VSTS account(s) only from known machines/networks (such as your corporate network)

*The intra-document navigation links below are working on the [GitHub Page][github-ref-url] but not on the [Marketplace hosted page][ext-marketplace-url]. You may want to use [GitHub Page][github-ref-url] for reviewing the more detailed documentation sections for easier navigation.*

## Usage
The extension currently provides the ability to scan IP Addresses via a VSTS build/release task which is added to your VSTS account when you install the extension. The IP Address Scanner task will provide information about the scan results and will fail the build/release if anyone accessed the VSTS account from outside the IP range you define. [Why is the scanner provided in a Build/Release Task?][background-section]  

*Note that this extension is currently only available for VSTS. Our thinking was that anyone running their own TFS instance would have far more useful mechanisms over networking, monitoring, controlling access, etc. but if you'd like to see this for TFS (and are willing to help support and test) then feel free to open a feature request on the [GitHub repo][repo-url].*

### Quick Steps to Get Started:  
  0. *Read our short [disclaimer][disclaimer-section]* 
  1. Install the extension
  2. Create a new build definition (it doesn't matter what source repo you point to, but a small/empty one is recommended)
  3. Add the `IP Address Scanner` task
  ![Add Task][task-add-image]
  4. Add your configuration to the task (see [configuration guide below for details][task-config-section])
  ![Example Task Configuration][config-task-image]
  5. Save & queue to run the build
  6. Look at the scan results! (see [results guidance section for more info][results-guidance-section])
  ![Example Scan Passed Output][scan-passed-image]

We've been running the scanner for several months and have also included some of our [usage tips][usage-tips-section] below!  

### Task Configuration
The IP Address Scanner has a few key inputs that you'll need to plug your respective values into. 

- *VSTS Account Name*  -   
The name of your VSTS account. If you are not sure of your account name, look at the part before `.visualstudio.com/...` in the url. For example, `https://fabrikam.visualstudio.com/...` the account name would be `fabrikam`
- *Personal Access Token* -  
This is the token the scanner will use to communicate with your VSTS account. This should be the token of a member of the Collection Administrators group, and we highly recommend you use a [definition variable] to store the value. If you've got more than one VSTS account you will be scanning then we also recommend giving your token access to all your accounts. See the [below section][access-token-section] for more information about this variable, and the [PAT documentation][pat-url] for information on creating Tokens.  

- *Allowed IP Adresses/CIDR Blocks* -  
These are the IP addresses or ranges that you are whitelisting; these are the addresses that you expect your team to use while accessing your VSTS account. All inputs must be IPv4, and CIDR blocks and IP addresses are supported. Enter each address or CIDR block on a separate line (do not add any delimters). The scanner will look at all the activity on your VSTS account, and will let you know if anyone accessed your account from _outside_ the set you define here. You would typically values here such as the public-facing IP range for your corporate network, public cloud resources (such as any servers where you have build/release agents), etc.  

- *Time Period* -  
The period of user activity to scan (note this is based on UTC). The value _Yesterday_ will scan the full 24 hours of the previous day. For example, if the current time is 13:00 UTC on February 2nd 2018 when you initiate the scan, the scanner will analyze all data from the prior day (00:00 UTC February 1st 2018 - 00:00 UTC February 2nd 2018). The value _The most recent 24 hour period_ will scan all activity from the latest 24 hours til the present time. For example, if the current time is 13:00 UTC on February 2nd 2018 when you initiate the scan, the scanner will analyze the latest data from (13:00 UTC February 1st 2018 - 13:00 UTC February 2nd 2018)  

- *User Origin* -  
This defines the bucket of users in your VSTS account whose activity will be scanned. The default value is _Azure Active Directory_ which means that the scan will review the VSTS activity for all users/accounts that are sourced from the [Azure Active Directory tenant that backs your VSTS account][vsts-azure-ad-doc-url]. Changing this to _All_ will result in the scan checking the activity of all objects in your VSTS account. This will include any [MSA account][msa-doc-url] users that have access to your VSTS account, but also includes other types such as service accounts VSTS uses internally (which you do not care about). We will add additional support for MSA accounts in the future, but AAD was our initial focus.  

- *Include Internal VSTS Activity* -  
You should not ever want nor need to enable this, and we will likely remove it. When a user takes an action or requests something from VSTS, there's a lot of activity that happens behind the scenes (for example the internal VSTS Release Management Service may talk to the internal VSTS Package Management service, etc.). When this setting is enabled, the scanner reivew will also analyze these internal VSTS service-to-service communications. This communication happens between Microsoft/VSTS-owned IP addresses, which naturally do not match to the IP ranges you defined in your configuration (and that causes your scan to fail)


Below is a sample configuration screenshot with random data.
![Example Task Configuration][config-task-image]  

Read the additional info on the PAT parameter or [jump to the next section][usage-tips-section].

#### Access Token Input Additional Info

1.  _Why does the scan require a PAT input parameter instead of using the OAuth token on the definition?_  
  One of our requirements was to support users that own and need to scan *multiple* VSTS accounts (we've got 15 we have to scan ourselves!). The OAuth token (System.AccessToken) that can be enabled in a build definition can only access the owning/containg VSTS account where that definition lives. If the scanner used the build OAuth token, then you'd have to create a separate build definition in each VSTS account you need to scan. We found it was a whole lot easier to create a single [variable group library][variable-groups-doc-url] to manage our configuration (like our IP ranges) in a single place, as opposed to having to maintain your configuration information (like your whitelisted IP addresses/ranges) in multiple places across in each account. We'd happily accept a PR that _added_ optional support to use the OAuth token, but the PAT approach will always be an option.  

2. _What are the minimum scopes the PAT needs?_  
  We haven't had a chance to test this yet, especially since the API's the scanner uses are still in beta too. The scanner is only reading information via two buckets of APIs on VSTS, so we assume the token would only need a couple of read-only scopes. We'll update this once we find out definitively, but feel free to play around with the scopes, and please let us know if you find out! 
  
The scanner source code is all open source, and you can review it directly on our [Github repo][repo-url] and/or you can use the [tfx utility][tfx-url] to download the same code from your VSTS account.

[Back to Task Configuration Section][task-config-section]

### Usage Tips
We've been using this extension for several months, and have included some things we've learned below.

- Use a non-user account (like a service or system account) to create the PAT
- Consider creating the PAT with access to all of your accounts if you have more than one VSTS account.
- Try to manage things as simply as possible! We scan our 15 VSTS accounts from a single Team Project.
- Use a [Task Library][variable-groups-doc-url] to store your IP ranges, tokens, etc., and link it to the different definitions. This way if a token expires, or your IP ranges change, you only have to make the update in one place.
- Be patient if you have a large number (> 100) total users in your VSTS account and note that your scan account *may* get throttled (slowed, not blocked), *see [more details here][disclaimer-section]*
- Create one definition per scan (don't add multiple scan steps to the same definition)  
- Consider having a separate agent queue/pool for agents dedicated to running your scans if you run multiple scans and want to running out of agents to handle your regular builds/releases
- Add Scheduled Triggers to your definitions so you can have recurring scans
- Consider having multiple definitions (with different Time Period targets) for each account. You can layer these to get more frequent scans if you want to scan more than once per day. We're going to add some shorter time intervals to support more active-monitoring types of scenarios.
- Don't panic if your scan flags an unrecognized IP address. When this happens it has almost always been something innocuous.
- If any unknown IP addresses are discovered during the scanner process, then the scanner will fail the build. Make sure you have your personal and/or team notification settings configured properly in VSTS so that the right people get the notification from VSTS when the build fails (this includes the offending users, IP addresses, etc. but doesn't have all the scanner output, so be sure to look at the build output in VSTS too).
- If you use the VSTS hosted build services, keep that in mind when looking at your scan results (for example: was a flagged record from a hosted build server for your VSTS account?)
- If you run private agents on public-cloud resources (build servers, deployment targets, etc.) then make sure you include those corresponding IP addresses in your config too
- You can run the scanner on hosted or private build/release agents, and on private agents that are on-premises/behind your firewall or in the public cloud. If you do run the scan definition on an agent behind your firewally, just make sure that you provide the relevant information (proxy info, etc.). The scanner will respect and use the below environment variables, so you can provide the relevant proxy info via these env variables:  

  - `HTTP_PROXY` and `http_proxy`
  - `HTTPS_PROXY` and `https_proxy`
  - `NO_PROXY` and `no-proxy`

[Back to Usage and Quick Start Section][usage-section]  

### Scan Results and Guidance
After a scan completes, the results will be displayed in the build output. The output will include some supporting information like the parameter values used and usage statistics to go along with result. 

If all of the analyzed activity came from within the set of IP ranges you defined, then you will see an output that looks something like this:

![Passed Scan Example][scan-passed-image]

If the scan found any activity that did *not* come from within your defined set of IP ranges, then the scan will fail the build and include some additional information about those records. An example would look something like this:

![Failed Scan Example][scan-fail-image]  

It is important to note that the scanner is not making any determination about what happened, nor whether it was a simple innocuous event or a malicious user; it is only telling you that it found something outside the configured IP range. It's providing you with information you can use to investigate to make those determinations yourself. However, in our experience, most of our items the scanner has flagged are entirely harmless and can easily be explained. The most common cause is a user working from home connected to the VPN, and their VPN connection will drop briefly, which results in one or two records with their home IP address hitting VSTS.  

For reference, on the rare occasions our scans flag something, we typically look at a few data points for each user:
- The `Application` and `Command` values. These two tell you _what_ the actual action was. A `git clone` of a source code repo to an unknown IP address would have a much higher likelihood of being malicious, whereas something like updating a work item or an IDE (Visual Studio, Eclipse, etc.) checking a build status is relatively harmless (this is one we see on brief VPN connection drops, and was used to create these screenshots)
- The number of usage records, both the total and the # that were flagged (which is included in the build output)
  -  The timing around all the records is also helpful too. For example, was there only 1 flagged record in the middle of 20 records during a 5 minutes period or 100+ records in a row from an unknown IP that were all flagged? 

Here's a closer view that shows the details of the flagged usage records from the above sample: 
![Failed Scan Example Details][scan-fail-wrapped-image]  
- The `UserAgent` value. We don't use this exclusively, but it is helpful in conjunction with the information identified above. In the example shown in these screenshots, we can tell from the `UserAgent` plus the `Application` and `Command` that all 3 of these records were from Visual Studio's BuildNotification tool checking build status during a brief VPN drop: You can recognize these from the `Application` and `Command` combo of *TFS Build* and *QueryBuilds* and a `UserAgent` value that contains *BuildNotification.exe* or *devenv.exe*
- We find the `AuthenticationMechanism` value is also useful in analysis as well.

Account Admins also have the ability to manually review all of the information for all users under the `Usage` hub from the admin portal `https://{{account}}.visualstudio.com/_admin`


[Back to Task Configuration Section][task-config-section]

## Disclaimer !!!!!!!!!!!
This extension is still in Beta. We've found plenty of bugs already, and we expect there will be more. Additionally, this extension leverages relies on several VSTS APIs which are also still in Beta. Both this extension and the underlying VSTS APIs are very dynamic and experience regular changes, which can disrupt the scan capabilities. 

However, we are releasing it nonetheless because we had a pressing need for IP scanning capabilities, and it appears other teams do to. We ask you to be patient if you decide to use the extension in the current beta form, and to also please share any feedback, bugs you find.. or better yet send us a PR :-)

If you have a *relatively* large number of total users (more than ~100-150) in your VSTS account then you should note that there your scan will run noticaeably more slowly than smaller VSTS accounts. Our largest accounts have between 750-1000 users, and the scans for these accounts usually take 45-60 minutes to complete. Another possible occurrence during the scan of these large accounts is that the user account that you specified for the scan (the owner of the token you provided in the task configuration) may also be *throttled* on that account by VSTS (meaning slowed, but not blocked). In the event the user is throttled, a VSTS-generated email will be sent to that user.  

[Back to Usage and Quick Start Section][usage-section]  
[Back to Tips Section][usage-tips-section]  


## Task Background
Why a task you ask? Some of our requirements included being able to schedule recurring scans, recieve email notifications, and to have storage for scan results. Fortunately, the VSTS Build/Release system provides all those capabilities without having to write a single line of code, so we started with the task and will expose these capabilities in other in the future.  

[Back to Usage Section][usage-section]

## Generator
Initially created by this [swell generator][parent-generator-url]!  

## Icon Credits
[Icons][vsts-task-icons] made by [Freepik][icon-author-url] from [www.flaticon.com][flaticon-url] are licensed by [CC 3.0 BY][cc3-url]  

<br />
  
[Back to Top][overview-section]

[parent-generator-url]: https://github.com/swellaby/generator-swell
[vsts-task-icons]: docs/images/icons
[task-config-section]: VSTS-TASK.md#task-configuration
[overview-section]: VSTS-TASK.md#overview
[results-guidance-section]: VSTS-TASK.md#scan-results-and-guidance
[usage-section]: VSTS-TASK.md#usage
[background-section]: VSTS-TASK.md#task-background
[disclaimer-section]: VSTS-TASK.md#disclaimer
[access-token-section]: VSTS-TASK.md#access-token-input-additional-info
[usage-tips-section]: VSTS-TASK.md#usage-tips
[icon-author-url]: http://www.freepik.com
[flaticon-url]: http://www.flaticon.com
[cc3-url]: http://creativecommons.org/licenses/by/3.0
[logo-image]: images/icons/task-swell-green-128.png
[task-add-image]: images/definition-task-add.png
[config-task-image]: images/config-task.png
[scan-passed-image]: images/scan-passed.png
[scan-fail-image]: images/scan-fail.png
[scan-fail-wrapped-image]: images/scan-fail-wrapped.png
[travis-ci-build-status-badge]: https://travis-ci.org/swellaby/vsts-traffic-monitor.svg?branch=master
[travis-ci-url]: https://travis-ci.org/swellaby/vsts-traffic-monitor
[travis-ci-logo]: images/TravisCI-Mascot-2.png
[coveralls-badge]: https://coveralls.io/repos/github/swellaby/vsts-traffic-monitor/badge.svg
[coveralls-url]: https://coveralls.io/github/swellaby/vsts-traffic-monitor
[sonar-quality-gate-badge]: https://sonarcloud.io/api/badges/gate?key=swellaby:vsts-traffic-monitor
[sonar-url]: https://sonarcloud.io/dashboard/index/swellaby:vsts-traffic-monitor
[ext-marketplace-url]: https://marketplace.visualstudio.com/items?itemName=swellaby.ip-address-scanner
[marketplace-version-badge]: https://vsmarketplacebadge.apphb.com/version-short/swellaby.ip-address-scanner.svg
[marketplace-installs-badge]: https://vsmarketplacebadge.apphb.com/installs/swellaby.ip-address-scanner.svg
[marketplace-rating-badge]: https://vsmarketplacebadge.apphb.com/rating/swellaby.ip-address-scanner.svg
[repo-url]: https://github.com/swellaby/vsts-traffic-monitor
[license-badge]: https://img.shields.io/github/license/swellaby/vsts-traffic-monitor.svg
[definition-variables-doc-url]: https://docs.microsoft.com/en-us/vsts/build-release/concepts/definitions/build/variables?tabs=batch#user-defined-variables
[pat-url]: https://docs.microsoft.com/en-us/vsts/integrate/get-started/authentication/pats#create-personal-access-tokens-to-authenticate-access
[variable-groups-doc-url]: https://docs.microsoft.com/en-us/vsts/build-release/concepts/library/variable-groups
[tfx-url]: https://github.com/Microsoft/tfs-cli
[vsts-azure-ad-doc-url]: https://docs.microsoft.com/en-us/vsts/accounts/connect-account-to-aad
[msa-doc-url]: https://account.microsoft.com/account
[github-ref-url]: https://github.com/swellaby/vsts-traffic-monitor/blob/master/docs/VSTS-TASK.md
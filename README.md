## Overview

[![Build Status](https://dev.azure.com/alexdrenea/ComsosScheduler/_apis/build/status/ComsosScheduler-CI?branchName=master)](https://dev.azure.com/alexdrenea/ComsosScheduler/_build/latest?definitionId=13&branchName=master)

Cosmos Scheduler is a simple utility that allows you to resize your cosmos instances on a schedule to save cost when your resource is not in high demand. 
Typical use cases might be scaling dev or QA databases at the end of the day to ensure that it is not charged overnight when it's not being used.

## Usage

Once deployed in your azure subscription you can navigate to your application (https://*yourapplicationname*.azurewebsites.net) and you will be able to add a new schedule.  To add a new schedule you need to create a complete Cosmos connection - Account, Key, Database, Collection. You can configure multiple Databases under an account and multiple collections under a database. Under a collection you can configure a schedule by specifying a start time and provisioned RU at that time. 
- Example 1: Scale down a dev database after hours
   - 6pm -> 500 RU
   
- Example 2:  Scale down a QA database after hours and revert back in the morning
  - 8am -> 5000 RU
  - 6pm -> 400 RU


## Architecture
Cosmos Scheduler is designed to be entirely serverless with Azure Functions. Everything from serving the React Web App, the API to manage the schedules and the schedule itself is built as functions that run on a Consumption Azure App Service Plan making the whole solution run virtually for free in your Azure subscription.

### API Functions
A simple set of CRUD functions to manage the schedules.

### Schedule Functions
Time based function and a couple of queue triggered functions to actually perform the scheduled resizes to the collection.
*Due to the nature of how Cosmos is charged at the boundary of the hour, all scale-up resizes happen 30seconds after the exact hour and scale-down resizes happen 30s before the exact hour - configurable from the application settings.*

### Serving the static React web app
The static website is uploaded in a storage account and served by the same instance of Azure Functions using a proxy configuration.


## Deployment
See the CosmosScheduler.Arm readme.


## Limitations / TODOs
- automatically detect and connect to all cosmos accounts in subscription
- validate a connection when a new one is added.
- notifications when scheduled resizes occur
- monitor and display provisioned throughput in the web app
- recommend a schedule based on history
- support for more complex schedules (i.e. by day of week)
- use KeyVault to store keys to the accounts that are set up in the application


## License
MIT

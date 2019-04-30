
This folder contains relevant files for easy single click deployment or replicating a CI / CD pipeline for the project

## ARM templates
 ### armtemplate.json

ARM template to deploy all azure infrastructure needed for the project. 
This file is used by the one click deployment script or the release pipeline

## CI/CD

### build.yaml

If you want to fork and update this project on your own, this is the CI build definition for the project. Simply create a new build definition and point it to the .yaml file.

### release.yaml
*Coming soon. Single file release definition.*

## Single "click" deployment

### deployall.ps1

Script that builds and deploys entire solution. Simply clone this repository and run this script from an an authenticated PowerShell instance (login to azure and select the subscription you want to deploy to)

 - **ApplicationName** (required)
	This parameter specifies the name of the application that will be deployed to Azure. The Resource Group and all resources deployed will share this name.

- **Location** (optional - defaults to Canada Central)
Location to deploy resources in.
 
#### Usage 
```/.deploy.ps1 -ApplicationName myCosmosScheduler```

Param(
    [string] $ApplicationName = 'cosmosscheduler1237',
	[string] $WebContainerName = 'webapp',
    [string] $Location = 'canadacentral',
    [string] $TemplateFile = './armtemplate.json'
)

$apiFolder = '..\CosmosScheduler.Api'
$appFolder = '..\CosmosScheduler.App'
$apiBuildFolder = 'build'
$appBuildFolder = 'build'


## 1. PACKAGE API AND APP 
Write-Output '========= 1. PACKAGE API AND APP  ========='
$apipublish = dotnet publish $apiFolder --configuration Release --output $apiBuildFolder

cd $appFolder
$apprestore = npm install $appFolder
$appbuild = npm run-script build $appFolder
cd ../CosmosScheduler.arm


# 2. DEPLOY RESOURCES TO AZURE
Write-Output '========= 2. DEPLOY RESOURCES TO AZURE ========='
New-AzResourceGroup -Name $ApplicationName -Location $Location -Verbose -Force

$TemplateParameters = @{
 appName = $ApplicationName
 webAppContainerName = $WebContainerName
}

$TemplateOutput = New-AzResourceGroupDeployment `
								 -Name ((Get-ChildItem $TemplateFile).BaseName + '-' + ((Get-Date).ToUniversalTime()).ToString('MMdd-HHmm')) `
								 -ResourceGroupName $ApplicationName `
								 -TemplateFile $TemplateFile `
								 -TemplateParameterObject $TemplateParameters `
								 -Force -Verbose `
								 -ErrorVariable ErrorMessages
if ($ErrorMessages) {
  Write-Output '', 'Template deployment returned the following errors:', @(@($ErrorMessages) | ForEach-Object { $_.Exception.Message.TrimEnd("`r`n") })
  exit
}
 
$functionAppName = $TemplateOutput.outputs.functionAppName.Value 
$storageAccountName = $TemplateOutput.outputs.storageAccountName.Value
$storageAccountKey = $TemplateOutput.outputs.storageAccountKey.Value


## 3. UPDATE APP SETTINGS.JS WITH FUNCTION URL AND KEY
Write-Output '========= 3. UPDATE WEB APP SETTINGS.JS WITH API URL AND HEADERS ========='
$publishProfile = Get-AzWebAppPublishingProfile -ResourceGroupName $ApplicationName -Name $functionAppName -Format WebDeploy
$publishProfile
$username = Select-Xml -Content $publishProfile -XPath "//publishProfile[@publishMethod='MSDeploy']/@userName"
$password = Select-Xml -Content $publishProfile -XPath "//publishProfile[@publishMethod='MSDeploy']/@userPWD"
$accessToken = "Basic {0}" -f [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username, $password)))
$masterApiUrl = "https://$($functionAppName).scm.azurewebsites.net/api/functions/admin/masterkey"
$masterKeyResult = Invoke-RestMethod -Uri $masterApiUrl -Headers @{"Authorization"=$accessToken;"If-Match"="*"}
$masterKey = $masterKeyResult.Masterkey

$settings = "var API_URL = ""//$($functionAppName).azurewebsites.net/api/schedules"";
var API_HEADERS = {
  headers: {
    ""Content-Type"": ""application/json"",
    ""x-functions-key"": ""$($masterKey)""
  }
};"
$settings | Set-Content "$appFolder\$appBuildFolder\settings.js"


## 4. UPDATE API PROXIES JSON REQUIRED TO SERVE THE STATIC WEBSITE
Write-Output '========= 4. UPDATE FUNCTIONS APP PROXY SETTINGS WITH STORAGE CIONTAINER URL ========='
$initialProxies = Get-Content "$apiFolder\$apiBuildFolder\proxies.json" | ConvertFrom-Json
$initialProxies.proxies.api.backendUri = "https://$functionAppName.azurewebsites.net/api/{path}"
$initialProxies.proxies.all.backendUri = "https://$storageAccountName.blob.core.windows.net/$WebContainerName/{path}"
$initialProxies.proxies.index.backendUri = "https://$storageAccountName.blob.core.windows.net/$WebContainerName/index.html"
$initialProxies | ConvertTo-Json -Depth 10 | Set-Content "$apiFolder\$apiBuildFolder\proxies.json"


## 5. COPY WEB APP TO STORAGE
Write-Output '========= 5. DEPLOY WEB APP - UPLOAD BUILD TO STORAGE ========='
$storageContext = New-AzureStorageContext -StorageAccountName $storageAccountName -StorageAccountKey $storageAccountKey
Get-ChildItem -File -Recurse "$appFolder\$appBuildFolder" | ForEach-Object {
  $extension = [IO.Path]::GetExtension($_.FullName)
  $relativeFileName = (Resolve-Path -Path $_.FullName -Relative).Substring("$appFolder\$appBuildFolder".length + 1)
  switch ($extension) {
        ".json" { $blobProperties = @{"ContentType" = "application/json"}; }
		".png" { $blobProperties = @{"ContentType" = "image/png"}; }
		".jpeg" { $blobProperties = @{"ContentType" = "image/jpeg"}; }
		".jpg" { $blobProperties = @{"ContentType" = "image/jpeg"}; }
        ".js" { $blobProperties = @{"ContentType" = "application/javascript"}; }
        ".svg" { $blobProperties = @{"ContentType" = "image/svg+xml"}; }
		".html" { $blobProperties = @{"ContentType" = "text/html"}; }
		".css" { $blobProperties = @{"ContentType" = "text/css"}; }
        Default { $blobProperties = @{"ContentType" = ""}; }
    }
  $blobProperties
  Set-AzureStorageBlobContent -File $_.FullName -Blob $relativeFileName -Container $WebContainerName -Context $storageContext -Properties $blobProperties -Force 
}


## 6. PUBLISH API TO FUNCTION APP
Write-Output '========= 6. DEPLOY API - PUBLISH TO FUNCTION APP ========='
Compress-Archive -path "$apiFolder\$apiBuildFolder\**" api.zip -Force	
Write-Output "archive done - pulbishing $(get-location)/api.zip"
Publish-AzWebApp -ResourceGroupName $ApplicationName -Name $ApplicationName -ArchivePath "$(get-location)/api.zip" -Force
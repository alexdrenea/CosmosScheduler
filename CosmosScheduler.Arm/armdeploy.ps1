Param(
    [string] $ApplicationName = 'cosmosscheduler123',
    [string] $Location = 'canadacentral',
    [string] $TemplateFile = './armtemplate.w.identity',
    [switch] $ValidateOnly
)

function Format-ValidationOutput {
  param ($ValidationOutput, [int] $Depth = 0)
  Set-StrictMode -Off
  return @($ValidationOutput | Where-Object { $_ -ne $null } | ForEach-Object { @('  ' * $Depth + ': ' + $_.Message) + @(Format-ValidationOutput @($_.Details) ($Depth + 1)) })
}


if ($ValidateOnly) {
  $ErrorMessages = Format-ValidationOutput (Test-AzResourceGroupDeployment -ResourceGroupName $ApplicationName -TemplateFile $TemplateFile -Verbose)
  if ($ErrorMessages) {
      Write-Output '', 'Validation returned the following errors:', @($ErrorMessages), '', 'Template is invalid.'
  }
  else {
      Write-Output '', 'Template is valid.'
  }
}
else {

  New-AzResourceGroup -Name $ApplicationName -Location $Location -Verbose -Force
  $sp = New-AzADServicePrincipal -DisplayName $ApplicationName

  $TemplateParameters = @{
    appName = $ApplicationName
    aadClientId = $sp.ApplicationId
  }

  $TemplateParameters

  New-AzResourceGroupDeployment -Name ((Get-ChildItem $TemplateFile).BaseName + '-' + ((Get-Date).ToUniversalTime()).ToString('MMdd-HHmm')) `
                                     -ResourceGroupName $ApplicationName `
                                     -TemplateFile $TemplateFile `
                                     -TemplateParameterObject $TemplateParameters `
                                     -Force -Verbose `
                                     -ErrorVariable ErrorMessages
  if ($ErrorMessages) {
      Write-Output '', 'Template deployment returned the following errors:', @(@($ErrorMessages) | ForEach-Object { $_.Exception.Message.TrimEnd("`r`n") })
  }
}
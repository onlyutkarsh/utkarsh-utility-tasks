# Azure Utility Tasks

A set of utility build and release tasks to help you in your Azure Pipelines. The tasks in this extension are written in `node` and hence can be run in both Windows or Linux based agents.

[![Twitter Follow](https://img.shields.io/twitter/follow/onlyutkarsh.svg?style=social&label=Follow)](https://twitter.com/onlyutkarsh)
[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/onlyutkarsh.utkarsh-utility-tasks.svg)](https://marketplace.visualstudio.com/items?itemName=onlyutkarsh.utkarsh-utility-tasks)
[![Build status](https://dev.azure.com/utkarshshigihalli/opensource/_apis/build/status/utkarsh-utilities-tasks-CI)](https://dev.azure.com/utkarshshigihalli/opensource/_build/latest?definitionId=1) 
[![Deployment status](https://vsrm.dev.azure.com/utkarshshigihalli/_apis/public/Release/badge/7dacb9d3-9bce-415a-a15a-1b3e415612c8/1/7)](https://vsrm.dev.azure.com/utkarshshigihalli/_apis/public/Release/badge/7dacb9d3-9bce-415a-a15a-1b3e415612c8/1/7)


## Tasks

This extension currently provides following tasks. I plan to add more in the future.

### Publish Secrets to Azure Key vault

As the name suggests this task publishes the secrets to selected azure key vault. The advantage of using this task is you can publish secrets in bulk. Useful especially when you need to publish multiple secrets at once. The task also allows you to add optional tags to each secret you write. 

[Read more](./tasks/publish-secrets-to-kv)


![publish-to-kv](/images/screenshots/publish-to-kv.png)

### Azure Lock/Unlock resource group/subscription


This task allows you to Lock/Unlock Azure resource group or a subscription. You can apply/remove **ReadOnly** or **CanNotDelete** locks. 

[Read more](./tasks/azure-lock-unlock)


![azure-lock-unlock](/images/screenshots/azure-lock-unlock.png)

### Manage tags

This task allows you to add one or multiple tags at once to Azure resource group. You can **replace** existing tags with the new one or also **Clear** the existing tags. 

[Read more](./tasks/azure-lock-unlock)

![azure-manage-tags](/images/screenshots/azure-manage-tags.png)

### Generate Secrets

This task generates a secure string based on the given criteria. The task will be useful 

- When you do not want to mantain the passwords, secrets in your files and commit in the source control. Use this task to generate passwords/secrets on the fly. 
- You would like to rotate your passwords every few days and hence would like to generate new passwords in your pipeline.  

[Read more](./tasks/secrets-for-strings)

![generate-secret](/images/screenshots/generate-secrets.png)

## Changes

> - v#{Release.ReleaseName}#
>   - Fix [issue 10](https://github.com/onlyutkarsh/utkarsh-utility-tasks/issues/10)
>   - Fix [issue 11](https://github.com/onlyutkarsh/utkarsh-utility-tasks/issues/11)
> - 1.0.16
>   - Add Manage tags task
>   - Add Lock/Unlock Azure task.
>   - Fix issue in `Publish Secrets to Keyvault` task where some characters were getting trimmed from secrets. 
> - 1.0.0 
>   - Initial release.

## Telemetry

To monitor/improve the tasks I send some telemetry **only when task errors out**. The data I send include platform (Windows/Linux etc) and the stacktrace of the exception. This will never send data like your name, subscription/tenant details. The code is open source and you are free to take a look. If you have any concerns, please raise an issue and I am happy investigate.

## Feedback

Please rate the extension and share/tweet to spread the word!!

- Found a bug or need to make a feature request? - Raise it as an [issue](https://github.com/onlyutkarsh/utkarsh-utility-tasks/issues).

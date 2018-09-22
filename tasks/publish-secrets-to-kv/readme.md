## Publish Secrets to Azure Key vault

As the name suggests this task publishes the secrets to selected azure key vault. The advantage of using this task is you can publish secrets in bulk. Useful especially when you need to publish multiple secrets at once. The task also allows you to add optional tags to each secret you write. 

> *Note: The service principal/app you use in your endpoint should have permission to write secrets to key vault. Read more on how to create an Azure AD application and service principal that can access resources [here](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal).*


![publish-to-kv](/images/screenshots/publish-to-kv.png)

## Usage

- **Azure Subscription** - Select the Azure subscription in which the Azure key vault exists.
- **Key vault** - The task pre-populates all the key vaults found in the subscription. 
- **List of secrets** - List of secrets to be added to the key vault. Add each secret as `secretname=secretvalue` and separate each pair by a newline. E.g. `Password=$(MySecretPassword)`
- **Tags** - List of tags to be added to each secret. Add as `tagName=tagValue` and separate each pair by newline. E.g. `Build=$(Build.BuildNumber)`. **Note**: If you are updating existing secrets, any existing tags will be overwritten.
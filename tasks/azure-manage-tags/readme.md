## Manage tags for Azure Resource group

This task allows you to add one or multiple tags at once to Azure resource group. You can **replace** existing tags with the new one or also **Clear** the existing tags. 

![azure-manage-tags](/images/screenshots/azure-manage-tags.png)

## Usage

- **Resource group** - Select the resource group you want to apply tag to.
- **Action** - 
  - `Append` to retain any existing tags and add the new ones defined here.
  - `Replace` to remove any existing tags and replace them with the new one defined in this task.
  - `Clear` to clear any existing tags.
- **Tags** - Define the tags to be added using `key:value` pair, separated by a new line.

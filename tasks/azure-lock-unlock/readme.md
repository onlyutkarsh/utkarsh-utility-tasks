## Lock/Unlock Azure Resource group or Subscription

This task allows you to Lock/Unlock Azure resource group or a subscription. You can apply/remove **ReadOnly** or **CanNotDelete** locks. 

![azure-lock-unlock](/images/screenshots/azure-lock-unlock.png)

> To create or delete management locks, you must have access to Microsoft.Authorization/* or Microsoft.Authorization/locks/* actions. Of the built-in roles, only **Owner** and **User Access Administrator** are granted those actions. See `Role assignment for SPN` section below.

## Usage

- **Apply To** - Select either a resource group or Subscription as per your requirement.
- **Action** - `Apply` to apply the lock and `Remove` to remove the lock based on the `Lock name` specified below.
- **Lock type** 
  - `ReadOnly` means authorized users can read a resource, but they can't delete or update the resource in a resource group/subscription. Applying this lock is similar to restricting all authorized users to the permissions granted by the `Reader` role.
  - `CanNotDelete` means authorized users can still read and modify a resource, but they can't delete the resources in a resource group/subscription.
- **Lock name** - Name for the lock.
- **Notes** - Optional text which will be added as a note to the lock.

## Role assignment for SPN

If you have created a service principal, ensure that it has **Owner** or **User Access Administrator** role assigned. For assigning, you need to go to `Subscription` blade and add the role assignment as shown below.

![azure-lock-unlock](/images/screenshots/user-access-admin-rbac.png)
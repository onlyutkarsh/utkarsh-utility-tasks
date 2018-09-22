## Generate Secrets

This task generates a secure string based on the given criteria. The task will be useful 

- When you do not want to mantain the passwords, secrets in your files and commit in the source control. Use this task to generate passwords/secrets on the fly. 
- You would like to rotate your passwords every few days and hence would like to generate new passwords in your pipeline.  

Once you configure and run this task in your pipeline, for each key, you will have a secret variable generated and the generated secret is assigned to it. You will be able to use the generated secret using the variable. For e.g. for the key `azure.user.sqldb.password` you will have a secret variable and can be accessed as `$(azure.user.sqldb.password)`.

![generate-secret](/images/screenshots/genrate-secrets.png)

## Usage

- **List of keys/strings** - Provide a list of keys/strings to generate the secrets for. Each key can be separated by `,`, `;`, `|` or a newline. The secret generated for each key will be available via a secret variable which you can use it in other tasks. E.g. Secret generated for key `azure.sqldb.password` can be accessed using `$(azure.sqldb.password)`
- **Length** - Length of the secret. Optional field and if not provided defaults to 12.
- **Use numeric characters** - If `true`, adds numeric characters (`0123456789`) in the generated secret.
- **Use special characters** - If `true`, adds special characters (`~!@#$%^&()_+-={}[];\\',.`) in the generated secret.
- **Characters to exclude** - If you do not want any characters in the generated secret, add it here.
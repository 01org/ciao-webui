# Ciao WebUI

Ciao Web UI is the user interface for [Ciao](https://github.com/01org/ciao)
built using the [express](http://expressjs.com/) web framework on top of
[Node.js](https://nodejs.org/en/), a lightweight JavaScript runtime.
It allows user's to take advantage of a simple and friendly design to
easily manage a running Ciao cluster.

## Requirements:

Running Ciao Web UI requires Node.js v5.9.0 or greater.
Third party sofware packages can be found in the package.json file.


## Setup Instructions

#### Install latest stable Node js version.

    $ node --version
    
#### Fill required information on the ciao_config.json file

The ciao_config.json file is a file in JSON format which contains the
information of the ciao-controller and keystone servers the Web UI is
going to connect to.
The root of the ciao_config.json is the "environment", and should match
the NODE_ENV environment variable. Then the parameters **controller**,
**storage**, **keystone** and **ui** will follow.
Note: an alternate configuration file may be used by running npm start with a
config_file parameter.

....npm start -- config_file="Path to configuration file"

######controller

Refers to the ciao-controller that the Web UI will connect to, it has the following parameters:
1. host - may be the hostname or ip address of ciao-controller (Ex. 127.0.0.1)
2. port - port in which the ciao-controller services are reachable.
3. protocol - lowercase protocol used by ciao-controller (currently only https is supported).

######keystone
1. host - may be the hostname or ip address of ciao-controller (Ex. 127.0.0.1)
2. port - port in which keystone's services are reachable.
3. protocol - lowercase protocol that keystone uses to provide it's services (http and https are supported).
4. uri - The uri in which keystone will provide tokens. (this should be "/v3/auth/tokens").

######storage
1. host - may be the hostname or ip address of block storage services provider (ciao-controller or cinder) (Ex. 127.0.0.1)
2. port - port in which block storage services are reachable.
3. protocol - lowercase protocol that block storage API uses to provide it's services (http and https are supported).

######ui
The following fields will determine how the Ciao Web UI will beconfigured.

    Note: if https protocol is set on ui options, Web UI will require a signed ssl certificate
    with a passphrase.
    A self-signed certificate may be generated using the following command:
    
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
    
    

1. protocol - the protocol that the Web UI will use to run, this can be http or https. 
   If the protocol used is http, then certificates field isn't required.
2. certificates - this is field is required for https protocol, pem key and certificate files will also be required.
  * key - this field holds the absolute path to a valid key.pem file.
  * cert - this field holds the absolute path to a valid cert.pem file (must match key.pem).
  * passphrase - the passphrase assign to key.pem file.
  * trusted - array of trusted certificates. Each element in the array must contain the absolute path of a trusted cert.pem file.

    Note: application can be started with this information specified on npm start parameters, see *Run application**.

#### Building application

In order to build application the 'install.sh' must be executed. This script will intsall dependencies using the npm package manager and also build minified JS scripts used with browser compatibility.
Note: this process is only necessary for development as minified scripts and dependencies are already provided by the application.

    # install while setting a "development" environment
    $ ./install.sh development
    # In this case NODE_ENV will be set to "development"

#### Running application:

In order to run the application use the deployment script 'deploy.sh'. Deployment supports using a configuration file located on config/ciao_config. Otherwise, parameters may be passed on to deploy.sh to specify controller, keystone and ui settings. deploy.sh also requires NODE_ENV as a first parameter, and will set it as the environment variable for running the UI (valid values for NODE_ENV are 'development' or 'production').
**Usage with valid configuration file:**

    $ ./deploy.sh [NODE_ENV]

**Usage without configuration file:**
To run UI with specific set of configuration regardless of ciao_config.json's content, use the following paramters:

1. protocol: set the protocol(Lowercase) that will be used by application, including controller, keystone and ui. For instance, if "https", the UI will run on https, and also controller and keystone are assumed to use this protocol as well.
2. keystone_addr: Keystone's IP address or hostname reachable within the network.
3. keystone_port: The port on which Kesytone's services are reachable.
4. controller_addr: Ciao controller's IP address or hostname reachable within the network.
5. controller_port: The port on which Controller services are reachable.
6. key_path: Needed to run over HTTPS, The PATH (absolute or relative) that holds the location for the key.pem file.
7. cert_path: Needed to run over HTTPS, the PATH (absolute or relative) that holds the location for the cert.pem file.
8. passphrase: The passphrase or password set on the pem certificates used to run over HTTPS.
Usage:

....$ ./deploy.sh [NODE_ENV] [protocol=**protocol**] [controller_addr=**ip_address**] [controller_port=**port**] [keystone_addr=**ip_address**] [key_path=**pem_file**] [cert_path=**pem_file**] [passphrase=**certificate_passphrase**]

Example:

    $ deploy.sh development protocol=https controller_addr=127.0.0.1 controller_port=8774 keystone_addr=127.0.0.1 keystone_port=35357 key_path=certs/key-pass.pem cert_path=certs/cert.pem passphrase=asecurepassphrase

App will then run on protocol://localhost:3000
To serve the UI on an alternativa port set the PORT environment variable with the value of the desired port.
Example.

    $ export PORT=80
    $ ./deploy.sh development

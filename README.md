# Neufood

## Project Creation

Created February 2022 as a Technical Entrepreneurship project and developed as a Lehigh Computer Science capstone project.

### Current Faculty Advisor

Thomas Micklas

### Sponsors

Brad DeMassa\
Grant Kim

### Students

Rory Stein\
Mike Hazaz\
Thor Long\
Kyrie Wu

## Neufood Backend Setup

### General App Information

Node installation page can be found [here](https://nodejs.org/en/download/)\

This Project currently consists of 2 repositories - [neufood-frontend](https://github.com/NeufoodCapstone/neufood-frontend) and [neufood-backend](https://github.com/NeufoodCapstone/neufood-backend)

### Building And Running the App Locally

#### Package Installation

1. You'll need to have Node installed on your local machine, so to check if Node is installed, type the below commands into your terminal

```bash
$> npm -v
$> node -v
```

If you encounter an error, then you need to install node\
2. A complete guide to install node can be found [here](https://dev.to/klvncruger/how-to-install-and-check-if-node-npm-on-windows-3ho1)\
3. Clone this repository from github onto your local machine in a place of your choosing\
4. Navigate to the `~/neufood-backend` (or whatever you have named the cloned repository root) folder on your local system in the terminal\
5. Run the install command to install the necessary dependencies

```bash
$> npm install
```

6. Install Nodemon globally for hot-reloading of the changes to server files

```bash
$> npm install -g nodemon
```

7. Install the mongoose module for for schema-like capabilities with the MongoDB backend structure

```bash
$> npm install mongoose
```

8. You should now have all the necessary packages installed on your machine

#### Configuring Environment Variables

##### This list is outdated, please wait for an updated list!

While running Neufood Backend locally, there are a set of environment variables that need to be used to make sure you are accessing the correct databases and other production instances.

1. Create a file called `.env` in the root directory of the repository
2. Copy the contents of [.env](https://docs.google.com/document/d/1HJmWSOsIh1xVDVxbja58afgPjwkw71O4Wsyq0ARcpV4/edit) into the `.env` file

#### Running Neufood Backend

1. Now that everything is up to date we will start the app by navigating to the root directory of the repository (i.e. `~/neufood-backend`)
2. To run the app locally with hot-reloading on any file change, type the below command into your terminal instance (strongly recommended)

```bash
$> nodemon index.js
```

3. To run the app locally without hot-reloading (you will have to manually shut-down and restart the server any time you change a file in the server), type the below command into your terminal instance (not recommended)

```bash
$> node index.js
```

3. The server will be hosted at the displayed address in your terminal

4. To stop the app from running, press `Ctrl-C` in your terminal instance

#### Deployment

Currently, there is no deployment, only testing backend routes.

Will update in the future.

#### Testing the Application

Neufood currently has no testing development setup. The previous Jest implementations are all out-dated.

#### Uninstalling node

1. A guide to uninstall node can be found [here](https://reactgo.com/uninstall-node-npm-from-windows/)
2. Restart your system to apply changes

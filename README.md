**FreeCodeCamp**- Information Security and Quality Assurance
------

Project Issue Tracker

1) SET NODE_ENV to `test` without quotes and set DB to your mongo connection string in .env file
2) Complete the project in `routes/api.js` or by creating a handler/controller
3) You will add any security features to `server.js`
4) You will create all of the functional tests in `tests/2_functional-tests.js`

# Issue Tracker

My implementation of FreeCodeCamp project: Issue Tracker

## Getting Started

project requires creating .env file that must contain Mongo database connection string
```
MONGOLAB_URI=connection string
```


### Prerequisites

Project requires Node JS. 


### Installing

Project can be run and installed with those commands

```
npm install
npm start
npm run dev
```

## Running the tests

Add entry in .env file:
```
NODE_ENV=test
```




## Usage - API explained

### Creating Issue
```
POST /api/issues/{projectname}
```
required parameters: issue_title, issue_text, created_by
optional: assigned_to and status_text

### Updating Issue
```
PUT /api/issues/{projectname}
```
parameters: _id and any fields that must be updated 


### Delete Issue
```
DELETE /api/issues/{projectname}
```
parameters: _id 


### Retrieving Issues
```
GET /api/issues/{projectname}
```
parameters: issues can be filtered by adding any issue sttribute. Example: ?open=false


## Authors

* Damian Pagowski



# Facetone Call Api

This is a api section which done for the facetone site call rating part integration. This api part develped by the **Express.js** and data base goes through the json files which are located in the file directory.

## APIs

##### Get All Data
`{URL}/api/v1/all-data`

`Method : GET`

- From this api can retrew the all the data that associated with each country.

##### Get Country List
`{URL}/api/v1/all-countries`

`Method : GET`

From this api can retrew the all the countries from the database.

##### Get Data From The Country Code
`{URL}/api/v1/country?code=LK`

`Method : GET`

The query parameter will be the country code and it should be bind with the API endpoint.

example : 

`code : LK`

From this api can retrew the the with the given country code from the database and return all the price ranges additional chargers and the discounts wich are provided to the each price and the actual price.


## Installation

`git clone https://github.com/nipmaxS/call-api`

The latest code is in the **branch api-es6-V2**.

`git checkout branch api-es6-V2 `

Then check the brach is switched properly by below command.

`git branch`

The go the the cloned folder to run the project.

`cd folderName`

Insatall the nodemodules to the project.

`npm install`

Run the project.

`nodemon app.js`

## Development

Development done by the facetone development team

## Maintaince :tw-1f527:

All new changes and the new features will be done by the facetone development team.





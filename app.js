const express = require('express')
const app = express()
const port = 3000
var _ = require('lodash');

// MODLES
var countries = require('./database/country.json');
var region = require('./database/region.json');
var numberTypes = require('./database/numberTypes.json');
var callTypes = require('./database/callTypes.json');
var prices = require('./database/price.json');
var additionalChargers = require('./database/aditionalChargers.json');

app.get('/', (req, res) => {

  for (let index = 0; index < countries.length; index++) {

    if (countries[index].Region) {
      for (let x = 0; x < countries[index].Region.length; x++) {
        const element = _.find(region, function (o) { return o.id == countries[index].Region[x]; });

        countries[index].Region = [];
        countries[index].Region.push(element);

        var numberArr = [];

        for (let n = 0; n < countries[index].Region[x].numberTypes.length; n++) {
          var typeId = '';
          if (typeof countries[index].Region[x].numberTypes[n] == "object") {
            console.log("yes");
            typeId = countries[index].Region[x].numberTypes[n].id
          }else{
            typeId = countries[index].Region[x].numberTypes[n]
          }
          const numberType = _.find(numberTypes, function (o) { return o.id == typeId; });

          console.log("========================");
          console.log(typeId);
          console.log(numberType);

          for (let c = 0; c < numberType.callType.length; c++) {

            const callType = _.find(callTypes, function (o) { return o.id == numberType.callType[c]; });

            numberType.callType[c] = callType;

            const price = _.find(prices, function (o) { return o.id == numberType.callType[c].price; });
            if (price) {

              numberType.callType[c].price = price;
              var total = price.amount;
              if (price.additionalChargers.length > 0) {
                for (let a = 0; a < price.additionalChargers.length; a++) {
                  const adChargers = _.find(additionalChargers, function (o) { return o.id == price.additionalChargers[a]; });
                  price.additionalChargers[a] = adChargers;
                  total = total + adChargers.amount;
                  console.log(total);
                }
                price.totalWithAdditionalChargers = total

              } else {
                price.totalWithAdditionalChargers = total

              }
            }

          }

          numberArr.push(numberType);

        }

        countries[index].Region[x].numberTypes = numberArr;


      }

    }

  }


  res.send({
    "status": true,
    "data": countries
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
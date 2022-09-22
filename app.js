const express = require('express')
const app = express()
const port = 3000
var _ = require('lodash');
var tmp = require('tmp');
var fs = require('fs');


// MODLES
const countries = require('./database/country.json');
var regions = require('./database/region.json');
var numberTypes = require('./database/numberTypes.json');
var callTypes = require('./database/callTypes.json');
var prices = require('./database/price.json');
var additionalChargers = require('./database/aditionalChargers.json');

app.get('/country', (req, res) => {


  const country_code = req.query.code;
  var message = "";

  const countries_arr = countries;

  var country = _.find(countries_arr, function (o) { return o.code == country_code });

  if (country) {

    message = "Data found";

    var regions_arr = []

    if (country.region != null) {

      for (let i = 0; i < country.region.length; i++) {

        var region = _.find(regions, function (o) { return o.id == country.region[i] });

        var numbers_arr = []

        if (region.numberTypes != null) {

          for (let n = 0; n < region.numberTypes.length; n++) {

            var number_type = _.find(numberTypes, function (o) { return o.id == region.numberTypes[n] });

            numbers_arr.push(number_type);

            var callTypes_arr = []

            if (number_type.callType != null) {

              for (let c = 0; c < number_type.callType.length; c++) {

                var call_type = _.find(callTypes, function (o) { return o.id == number_type.callType[c] });

                var price_obj = null;
                
                if (call_type.price) {

                  var price_obj = _.find(prices, function (o) { return o.id == call_type.price });

                  var additionalChargers_arr = []

                  for (let a = 0; a < price_obj.additionalChargers.length; a++) {

                    var additionalCharge_obj = _.find(additionalChargers, function (o) { return o.id == price_obj.additionalChargers[a] });

                    console.log("additionalChargers_arr");
                    console.log(additionalCharge_obj);
                    additionalChargers_arr.push(additionalCharge_obj);

                    var total_amount = price_obj.amount;

                    for (let t = 0; t < additionalChargers_arr.length; t++) {
                      total_amount = total_amount + additionalChargers_arr[t].amount
                    }

                    price_obj.total_amount = total_amount;

                  }

                  price_obj.additionalChargers_arr = additionalChargers_arr;

                }

                call_type.price_obj = price_obj;

                callTypes_arr.push(call_type);

              }

            }

            number_type.callTypes_arr = callTypes_arr;

          }

        }



        region.numbers_arr = numbers_arr;

        regions_arr.push(region);

      }

    }


    country.regions_arr = regions_arr;

  } else {
    message = "No country found on given code";
    country = {}
  }


  res.send({
    "status": true,
    "message": message,
    "data": country
  })
})

// app.get('/', (req, res) => {

//   for (let index = 0; index < countries.length; index++) {

//     if (countries[index].Region) {
//       for (let x = 0; x < countries[index].Region.length; x++) {
//         const element = _.find(region, function (o) { return o.id == countries[index].Region[x]; });

//         countries[index].Region = [];
//         countries[index].Region.push(element);

//         var numberArr = [];

//         for (let n = 0; n < countries[index].Region[x].numberTypes.length; n++) {

//           var typeId = '';

//           if (typeof countries[index].Region[x].numberTypes[n] == "object") {

//             typeId = countries[index].Region[x].numberTypes[n].id;

//           }else{

//             typeId = countries[index].Region[x].numberTypes[n];

//           }

//           const numberType = _.find(numberTypes, function (o) { return o.id == typeId; });

//           for (let c = 0; c < numberType.callType.length; c++) {

//             const callType = _.find(callTypes, function (o) { return o.id == numberType.callType[c]; });

//             numberType.callType[c] = callType;

//             const price = _.find(prices, function (o) { return o.id == numberType.callType[c].price; });
//             if (price) {

//               numberType.callType[c].price = price;
//               var total = price.amount;
//               if (price.additionalChargers.length > 0) {
//                 for (let a = 0; a < price.additionalChargers.length; a++) {
//                   const adChargers = _.find(additionalChargers, function (o) { return o.id == price.additionalChargers[a]; });
//                   price.additionalChargers[a] = adChargers;
//                   total = total + adChargers.amount;
//                   console.log(total);
//                 }
//                 price.totalWithAdditionalChargers = total

//               } else {
//                 price.totalWithAdditionalChargers = total

//               }
//             }

//           }

//           numberArr.push(numberType);

//         }

//         countries[index].Region[x].numberTypes = numberArr;


//       }

//     }

//   }

//   res.send({
//     "status": true,
//     "data": countries
//   })
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
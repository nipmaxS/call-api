
const countries = require("./database/country.json");
const regions = require("./database/region.json");
const numberTypes = require("./database/numberTypes.json");
const callTypes = require("./database/callTypes.json");
const prices = require("./database/price.json");
const additionalChargers = require("./database/aditionalChargers.json");
const discounts = require("./database/discount.json");
const express = require('express')
const serverless = require("serverless-http");
const app = express();
var _ = require("lodash");
const port = 3000;


// MODLES

const e = require("express");

const getData = (code) => {


  let selectedCountryArr = [];
  let selectedCountry = {};

  if (code) {
    selectedCountry = countries.find(element => element.code === code.code);
    selectedCountry ? selectedCountryArr.push(selectedCountry) : [];
  } else {
    selectedCountryArr = countries;
  }

  const conuntryRegion = selectedCountryArr.map(country => {

    const _regions = (country.region.map(region => {

      // GET NUMVER TYPE
      const regionNumber = regions.map(rg => {

        const _numberTypes = (rg.numberTypes.map(numberType => {

          // GET CALL TYPE
          const regionNumberCallType = numberTypes.map(nt => {

            const _callTypes = (nt.callType != null) ? (nt.callType.map(ct => {

              let singleCallType = callTypes.find(n => n.id === ct);

              // GET ADDITIONAL CHARGERS
              const priceAdditionalValues = prices.map(pa => {

                const _priceAdditionalValues = (pa.additionalChargers != null) ? (pa.additionalChargers.map(adValue => {

                  return additionalChargers.filter(p => p.id === adValue);

                })).flat() : [];

                // GET DISCOUNTS
                const _priceDiscountValues = (pa.discounts != null) ? (pa.discounts.map(dist => {

                  return discounts.filter(d => d.id === dist);

                })).flat() : [];

                // RETURN ADDITIONAL CHARGERS AND DISCOUNTS COMPONENT
                return { ...pa, additionalChargers: _priceAdditionalValues, discounts: _priceDiscountValues }

              });

              let _price = _.find(priceAdditionalValues, { 'contryCode': selectedCountry.code, 'numberType': nt.id, 'callType': ct, 'priceType': 0 });

              console.log("_price");
              console.log(_price);

              if (_price) {

                // CALCULATE ADDITIONAL CHARGERS
                let sum = _.sumBy(_price.additionalChargers, function (o) {
                  return (_price.amount * o.amount / 100);
                });

                let total = _price.amount + sum;

                // CALCULATE DISCOUNT
                let distAmount = _.sumBy(_price.discounts, function (o) {
                  return (total * o.amount / 100);
                });

                if (distAmount && distAmount > 0) {
                  total = total - distAmount;
                }

                // SET ACTUAL AMOUNT
                _price.actualAmount = Math.round((total) * 10000) / 10000;

                singleCallType.price = _price;

              }

              return singleCallType;

            })).flat() : [];

            // RETURN CALL TYPE COMPONENT
            return { ...nt, callType: [..._callTypes] }

          });


          // GET NUMBER ADDITIONAL CHARGERS
          const priceAdditionalValuesForNumber = prices.map(pa => {

            const _priceAdditionalValuesForNumber = (pa.additionalChargers != null) ? (pa.additionalChargers.map(adValue => {

              return additionalChargers.filter(p => p.id === adValue);

            })).flat() : [];

            // GET NUMBER DISCOUNTS
            const _numberPriceDiscountValues = (pa.discounts != null) ? (pa.discounts.map(dist => {

              return discounts.filter(d => d.id === dist);

            })).flat() : [];

            // RETURN ADDITIONAL CHARGERS AND DISCOUNTS OF NUMBER COMPONENT
            return { ...pa, additionalChargers: _priceAdditionalValuesForNumber, discounts: _numberPriceDiscountValues }

          });

          let _numberPrice = _.find(priceAdditionalValuesForNumber, { 'contryCode': selectedCountry.code, 'numberType': numberType, 'priceType': 1 });

          var numeberT = regionNumberCallType.find(n => n.id === numberType);

          if (_numberPrice) {

            // CALCULATE ADDITIONAL CHARGERS
            let sumOfN = _.sumBy(_numberPrice.additionalChargers, function (o) {
              return (_numberPrice.amount * o.amount / 100);
            });

            let totalOfN = _numberPrice.amount + sumOfN;

            // CALCULATE DISCOUNT
            let distAmountOfN = _.sumBy(_numberPrice.discounts, function (o) {
              return (totalOfN * o.amount / 100);
            });

            if (distAmountOfN && distAmountOfN > 0) {
              totalOfN = totalOfN - distAmountOfN;
            }

            // SET ACTUAL AMOUNT
            numeberT.pricePerNumber = Math.round((totalOfN) * 10000) / 10000;

            numeberT.price = _numberPrice;

          }

          return numeberT;

        })).flat();


        // RETURN NUMBER TYPE COMPONENT
        return { ...rg, numberTypes: [..._numberTypes] }

      });

      // RETURN REGION COMPONENT
      return regionNumber.filter(r => r.id === region).flat();

    })).flat();


    // RETURN COUNTRY COMPONENT
    return { ...country, region: [..._regions] }
  })

  return conuntryRegion;
};

app.get('/api/v1/country', (req, res) => {

  let code = req.query;
  let message = "";

  const data = getData(code);

  if (data.length > 0) {

    message = (data.length > 0) ? "Data found on selected country code" : "Data not found";

    res.send({
      "status": true,
      "message": message,
      "data": data[0]
    })

  } else {

    message = "Data not found on selected country code";

    res.send({
      "status": false,
      "message": message,
      "data": {}
    })

  }

})

// app.get('/api/v1/all-data', (req, res) => {

//   const data = getData();
//   message = (data.length > 0) ? "Data found" : "Data not found";

//   message =

//     res.send({
//       "status": true,
//       "message": message,
//       "data": data
//     })

// })

app.get('/api/v1/all-countries', (req, res) => {

  res.send({
    "status": true,
    "message": "Data found",
    "data": countries
  })

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// module.exports.app = app;
// module.exports.handler = serverless(app);
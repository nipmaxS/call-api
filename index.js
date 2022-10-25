
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

    // GET RELATED REGIONS
    let _regions = regions.filter(r => r.countryCode === country.code);

    const regionArr = _regions.map(r => {


      // GET RELATED NUMBER TYPES
      const numberTypesArr = r.numberTypes.map(numberType => {

        let nt = numberTypes.find(nt => nt.id === numberType);


        // GET RELATED NUMBER PRICE
        let _numberPrice = _.find(prices, { 'contryCode': country.code, 'numberType': numberType, 'priceType': 1 });

        const priceAdditionalValuesForNumber = [_numberPrice].map(pa => {

          // GET RELATED NUMBER PRICE RELATED ADDITIONAL CHARGERS
          const _priceAdditionalValuesForNumber = (pa && pa.additionalChargers != null) ? (pa.additionalChargers.map(adValue => {

            return additionalChargers.filter(p => p.id === adValue);

          })).flat() : [];

          // GET RELATED NUMBER PRICE RELATED DISCOUNTS
          const _numberPriceDiscountValues = (pa && pa.discounts != null) ? (pa.discounts.map(dist => {

            return discounts.filter(d => d.id === dist);

          })).flat() : [];

          return { ...pa, additionalChargers: _priceAdditionalValuesForNumber, discounts: _numberPriceDiscountValues }

        });


        // CALCULATE ADDITIONAL CHARGERS
        let sumOfN = _.sumBy(priceAdditionalValuesForNumber[0].additionalChargers, function (o) {
          return (_numberPrice.amount * o.amount / 100);
        });

        let totalOfN = _numberPrice ? _numberPrice.amount + sumOfN : 0;

        // CALCULATE DISCOUNT
        let distAmountOfN = _.sumBy(priceAdditionalValuesForNumber[0].discounts, function (o) {
          return (totalOfN * o.amount / 100);
        });

        if (distAmountOfN && distAmountOfN > 0) {
          totalOfN = totalOfN - distAmountOfN;
        }

        // NUMBER CHARGE ROUND OFF TO LAST 5 DECIMAL PLACES
        nt.pricePerNumber = Math.round((totalOfN) * 10000) / 10000;

        const callTypesArr = nt.callType.map(callType => {

          let _callType = callTypes.find(ct => ct.id === callType);

          // GET RELATED CALL RATES
          let _callTypePrice = _.filter(prices, { 'contryCode': country.code, 'numberType': nt.id, 'callType': callType, 'priceType': 0 });

          const priceAdditionalValuesForCalls = _callTypePrice.map(pa => {

            // GET RELATED CALL PRICE RELATED ADDITIONAL CHARGERS
            const _priceAdditionalValuesForCall = (pa && pa.additionalChargers != null) ? (pa.additionalChargers.map(adValue => {

              return additionalChargers.filter(p => p.id === adValue);

            })).flat() : [];

            // GET RELATED CALL PRICE RELATED DISCOUNTS
            const _priceDiscountValuesForCalls = (pa && pa.discounts != null) ? (pa.discounts.map(dist => {

              return discounts.filter(d => d.id === dist);

            })).flat() : [];

            return { ...pa, additionalChargers: _priceAdditionalValuesForCall, discounts: _priceDiscountValuesForCalls }

          });

          // CALCULATE ADDITIONAL CHARGERS
          let sumOfC = priceAdditionalValuesForCalls.length > 0 ? _.sumBy(priceAdditionalValuesForCalls[0].additionalChargers, function (o) {
            return (_callTypePrice[0].amount * o.amount / 100);
          }) : 0;

          let totalOfC = _callTypePrice.length > 0 ? _callTypePrice[0].amount + sumOfC : 0;

          console.log("totalOfC");
          console.log(totalOfC);

          // CALCULATE DISCOUNT
          let distAmountOfC = priceAdditionalValuesForCalls.length > 0 ? _.sumBy(priceAdditionalValuesForCalls[0].discounts, function (o) {
            return (totalOfC * o.amount / 100);
          }) : 0;

          if (distAmountOfC && distAmountOfC > 0) {
            totalOfC = totalOfC - distAmountOfC;
          }

          _callType.actualAmount = Math.round((totalOfC) * 10000) / 10000;
          _callType.ratePer = "min";
          _callType.rate = "$";

          return { ..._callType, price: [...priceAdditionalValuesForCalls] }

        }).flat();

        // SET NUMBER VALUE
        nt.price = _numberPrice ? priceAdditionalValuesForNumber[0] : null;
        nt.ratePer = "month";
        nt.rate = "$";

        return { ...nt, callType: [...callTypesArr] }

      }).flat();


      return { ...r, numberTypes: [...numberTypesArr] }

    });


    // RETURN COUNTRY COMPONENT
    return { ...country, region: [...regionArr] }
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
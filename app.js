const express = require('express')
const app = express()
const port = 3000
var _ = require('lodash');

// MODLES
const countries = require('./database/country.json');
const regions = require('./database/region.json');
var numberTypes = require('./database/numberTypes.json');
var callTypes = require('./database/callTypes.json');
var prices = require('./database/price.json');
var additionalChargers = require('./database/aditionalChargers.json');
var discounts = require('./database/discount.json');
const e = require('express');

app.get('/api/v1/country', (req, res) => {

  let code = req.query;
  let selectedCountryArr = [];
  let message = "";
  const selectedCountry = countries.find(element => element.code === code.code);

  if (selectedCountry) {

    selectedCountryArr.push(selectedCountry);

    const conuntryRegion = selectedCountryArr.map(country => {

      const _regions = (country.region.map(region => {

        // GET NUMVER TYPE
        const regionNumber = regions.map(rg => {

          const _numberTypes = (rg.numberTypes.map(numberType => {

            // GET CALL TYPE
            const regionNumberCallType = numberTypes.map(nt => {

              const _callTypes = (nt.callType != null) ? (nt.callType.map(ct => {

                // GET PRICE
                const calltypePrices = callTypes.map(cp => {

                  let _price = prices.filter(p => p.id === cp.price);

                  // GET ADDITIONAL CHARGERS
                  const priceAdditionalValues = prices.map(pa => {

                    const _priceAdditionalValues = (pa.additionalChargers != null) ? (pa.additionalChargers.map(adValue => {

                      return additionalChargers.filter(p => p.id === adValue);

                    })).flat() : [];

                    const _priceDiscountValues = (pa.discounts != null) ? (pa.discounts.map(dist => {

                      return discounts.filter(d => d.id === dist);

                    })).flat() : [];

                    // RETURN ADDITIONAL CHARGERS AND DISCOUNTS COMPONENT
                    return { ...pa, additionalChargers: _priceAdditionalValues, discounts: _priceDiscountValues }

                  });

                  _price = priceAdditionalValues.filter(p => p.id === cp.price);

                  // CALCULATE ADDITIONAL CHARGERS
                  let sum = _.sumBy(_price[0].additionalChargers, function (o) {
                    return Math.round((_price[0].amount * o.amount / 100) * 1000) / 1000;
                  });

                  sum = sum + _price[0].amount;

                  // CALCULATE DISCOUNT
                  let distAmount = _.sumBy(_price[0].discounts, function (o) {
                    return Math.round((sum * o.amount / 100) * 1000) / 1000;
                  });

                  // CALCULATE ACTUWAL AMOUNT
                  let actualAmount = (distAmount) ? sum - distAmount : sum;

                  // ROUND OFF TO TWO DECIMAL PLACES
                  _price[0].actualAmount = Math.round(actualAmount * 1000) / 1000;

                  // RETURN NUMBER COMPONENT
                  return { ...cp, price: _price[0] }

                }).flat();

                return calltypePrices.filter(n => n.id === ct);

              })).flat() : [];

              // RETURN CALL TYPE COMPONENT
              return { ...nt, callType: [..._callTypes] }

            });

            return regionNumberCallType.filter(n => n.id === numberType);

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

    message = "Data found on selected country code";

    res.send({
      "status": true,
      "message": message,
      "data": conuntryRegion[0]
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const countries = require('./database/country.json');
const regions = require('./database/region.json');

const conuntryRegion = countries.map(country => {
    const _regions =  (country.region.map(region => {
        return regions.filter(r => r.id === region).flat();
    })).flat();

    return {...country, region: [..._regions]}
})

console.log(JSON.stringify(conuntryRegion));
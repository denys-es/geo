// test.js
const assert = require('assert');
const {
    parse,
    parseGeoUri,
    parseGe0,
    parseLatLonParams,
    parseLatLon
} = require('./parser.js');

function runTest(name, testFunction) {
    try {
        testFunction();
        console.log(`✔ ${name}`);
    } catch (error) {
        console.error(`✖ ${name}`);
        console.error(error);
        process.exit(1);
    }
}

// --- Test Cases ---

runTest('parseGeoUri: should parse a valid geo URI', () => {
    const result = parseGeoUri('geo:34.0522,-118.2437');
    assert.deepStrictEqual(result, { lat: 34.0522, lon: -118.2437 });
});

runTest('parseGeoUri: should return null for invalid geo URI', () => {
    const result = parseGeoUri('not-geo:34.0522,-118.2437');
    assert.strictEqual(result, null);
});

runTest('parseGe0: should parse a valid om:// link', () => {
    const result = parseGe0('om://o4B4pYZsRs');
    assert.deepStrictEqual(result, { lat: 47.38593, lon: 8.57666 });
});

runTest('parseGe0: should parse a valid ge0:// link', () => {
    const result = parseGe0('ge0://o4B4pYZsRs');
    assert.deepStrictEqual(result, { lat: 47.38593, lon: 8.57666 });
});

runTest('parseGe0: should parse a valid omaps.app link', () => {
    const result = parseGe0('https://omaps.app/o4B4pYZsRs');
    assert.deepStrictEqual(result, { lat: 47.38593, lon: 8.57666 });
});

runTest('parseGe0: should parse a valid comaps.at link', () => {
    const result = parseGe0('https://comaps.at/o4B4pYZsRs');
    assert.deepStrictEqual(result, { lat: 47.38593, lon: 8.57666 });
});

runTest('parseLatLonParams: should parse lat/lon from query string', () => {
    const result = parseLatLonParams('https://example.com/?lat=48.8584&lon=2.2945');
    assert.deepStrictEqual(result, { lat: 48.8584, lon: 2.2945 });
});

runTest('parseLatLon: should parse "@lat,lon"', () => {
    const result = parseLatLon('@40.7128,-74.0060');
    assert.deepStrictEqual(result, { lat: 40.7128, lon: -74.0060 });
});

runTest('parseLatLon: should parse "q=lat,lon"', () => {
    const result = parseLatLon('?q=40.7128,-74.0060');
    assert.deepStrictEqual(result, { lat: 40.7128, lon: -74.0060 });
});

runTest('parseLatLon: should parse "lat,lon"', () => {
    const result = parseLatLon('40.7128,-74.0060');
    assert.deepStrictEqual(result, { lat: 40.7128, lon: -74.0060 });
});


runTest('Main `parse` function: should prioritize geo URI', () => {
    const result = parse('geo:1.0,2.0?lat=3.0&lon=4.0');
    assert.deepStrictEqual(result, { lat: 1.0, lon: 2.0 });
});

runTest('Main `parse` function: should prioritize ge0 link', () => {
    const result = parse('om://o4B4pYZsRs?lat=3.0&lon=4.0');
    assert.deepStrictEqual(result, { lat: 47.38593, lon: 8.57666 });
});

runTest('Main `parse` function: should fall back to lat/lon params', () => {
    const result = parse('https://example.com/?lat=48.8584&lon=2.2945&q=1,2');
    assert.deepStrictEqual(result, { lat: 48.8584, lon: 2.2945 });
});

runTest('Main `parse` function: should fall back to plain lat,lon in a simple string', () => {
    const result = parse('40.7128,-74.0060');
    assert.deepStrictEqual(result, { lat: 40.7128, lon: -74.0060 });
});

runTest('Main `parse` function: should fall back to plain lat,lon in a URL', () => {
    const result = parse('https://foo.example.org/whatever/40.123,45.123/foo');
    assert.deepStrictEqual(result, { lat: 40.123, lon: 45.123 });
});

runTest('Main `parse` function: should handle negative coordinates correctly', () => {
    const result = parse('https://foo.example.org/whatever/-40.123,-45.123/foo');
    assert.deepStrictEqual(result, { lat: -40.123, lon: -45.123 });
});

runTest('Main `parse` function: should return null for unparsable string', () => {
    const result = parse('this is not a coordinate string');
    assert.strictEqual(result, null);
});

console.log('\nAll tests passed!');

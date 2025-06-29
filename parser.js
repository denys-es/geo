// parser.js

// --- Ge0 Decoding (Parser 2) ---
let ge0ReverseArray = null;
function getGe0ReverseArray() {
    if (ge0ReverseArray) return ge0ReverseArray;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const arr = Array(256).fill(255);
    for (let i = 0; i < alphabet.length; i++) {
        arr[alphabet.charCodeAt(i)] = i;
    }
    ge0ReverseArray = arr;
    return ge0ReverseArray;
}

function decodeGe0LatLonZoom(latLonZoom) {
    const OM_MAX_POINT_BYTES = 10;
    const OM_MAX_COORD_BITS = OM_MAX_POINT_BYTES * 3;
    const FAILED = null;

    const base64Reverse = getGe0ReverseArray();

    let zoom = base64Reverse[latLonZoom.charCodeAt(0)];
    if (zoom > 63) return FAILED;
    zoom = zoom / 4.0 + 4.0;

    const latLonStr = latLonZoom.substring(1);
    const latLonBytes = latLonStr.length;
    let lat = 0;
    let lon = 0;

    for (let i = 0, shift = OM_MAX_COORD_BITS - 3; i < latLonBytes; i++, shift -= 3) {
        const a = base64Reverse[latLonStr.charCodeAt(i)];
        const lat1 = (((a >> 5) & 1) << 2 | ((a >> 3) & 1) << 1 | ((a >> 1) & 1));
        const lon1 = (((a >> 4) & 1) << 2 | ((a >> 2) & 1) << 1 | (a & 1));
        lat |= lat1 << shift;
        lon |= lon1 << shift;
    }

    const middleOfSquare = 1 << (3 * (OM_MAX_POINT_BYTES - latLonBytes) - 1);
    lat += middleOfSquare;
    lon += middleOfSquare;

    lat = parseFloat((lat / ((1 << OM_MAX_COORD_BITS) - 1) * 180.0 - 90.0).toFixed(5));
    lon = parseFloat((lon / (1 << OM_MAX_COORD_BITS) * 360.0 - 180.0).toFixed(5));

    if (lat <= -90.0 || lat >= 90.0) return FAILED;
    if (lon <= -180.0 || lon >= 180.0) return FAILED;

    return { lat, lon, zoom };
}

function parseGe0(input) {
    const prefixes = ["om://", "ge0://", "https://omaps.app/", "https://comaps.at/"];
    let data = null;

    for (const prefix of prefixes) {
        if (input.startsWith(prefix)) {
            data = input.substring(prefix.length);
            break;
        }
    }

    if (data === null) return null;

    // First, strip any query string from the URL part
    const urlPart = data.split('?')[0];
    // Then, get the code, which is the first segment of the path
    const code = urlPart.split('/')[0];

    if (!code) return null;

    const coords = decodeGe0LatLonZoom(code);
    return coords ? { lat: coords.lat, lon: coords.lon } : null;
}


// --- Geo URI Parsing (Parser 1) ---
function parseGeoUri(input) {
    const match = input.match(/^geo:(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lon)) {
            return { lat, lon };
        }
    }
    return null;
}

// --- Lat/Lon Query Param Parsing (Parser 3) ---
function parseLatLonParams(input) {
    const match = input.match(/lat=(-?\d+\.?\d*)&lon=(-?\d+\.?\d*)/);
    if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lon)) {
            return { lat, lon };
        }
    }
    return null;
}

// --- General Lat,Lon Parsing (Parser 4) ---
function parseLatLon(input) {
    // Find coordinates that are preceded by a non-word character or are at the start of the string.
    const match = input.match(/(?:^|\W)(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
        // match[0] is the full match (e.g., "/-40,70" or "-40,70")
        // match[1] is the latitude
        // match[2] is the longitude
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lon)) {
            return { lat, lon };
        }
    }
    return null;
}


// --- Main Parser ---
function parse(input) {
    const parsers = [
        parseGeoUri,
        parseGe0,
        parseLatLonParams,
        parseLatLon,
    ];

    for (const parser of parsers) {
        const result = parser(input);
        if (result) {
            return result;
        }
    }

    return null;
}

// --- Node.js Export for Testing ---
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parse,
        parseGeoUri,
        parseGe0,
        parseLatLonParams,
        parseLatLon
    };
}

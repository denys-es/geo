document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const h1 = document.getElementById('coords-display');
    const hash = window.location.hash.substring(1); // Remove the #
    const params = new URLSearchParams(hash);
    const geoInput = params.get('q');
    const targetProvider = params.get('p');

    function navigate(url) {
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const providers = {
        geo: {
            name: "Geo URI",
            url: (lat, lon) => `geo:${lat},${lon}`
        },
        gmaps: {
            name: "Google Maps",
            url: (lat, lon) => `https://maps.google.com/?q=${lat},${lon}`
        },
        osm: {
            name: "OpenStreetMap",
            url: (lat, lon) => `https://www.openstreetmap.org/#map=15/${lat}/${lon}`
        },
        citymapper: {
            name: "Citymapper",
            url: (lat, lon) => `https://citymapper.com/directions?endcoord=${lat},${lon}`,
            directions: true,
            directionsUrl: (userLat, userLon, lat, lon) => `https://citymapper.com/directions?startcoord=${userLat},${userLon}&endcoord=${lat},${lon}`
        },
        brouter: {
            name: "BRouter Web",
            url: (lat, lon) => `https://map.denys.es/#map=15/${lat}/${lon}/cyclosm,route-quality&lonlats=${lon},${lat}`,
            directions: true,
            directionsUrl: (userLat, userLon, lat, lon) => `https://map.denys.es/#map=15/${lat}/${lon}/cyclosm,route-quality&lonlats=${userLon},${userLat};${lon},${lat}`
        }
    };

    function handleGeolocationNavigation(key, lat, lon, fallbackUrl) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                const provider = providers[key];
                let url = provider.directionsUrl(userLat, userLon, lat, lon);
                navigate(url);
            },
            () => {
                navigate(fallbackUrl);
            }
        );
    }

    function showLinks(lat, lon) {
        h1.textContent = `→ ${lat}, ${lon}`;
        for (const key in providers) {
            const provider = providers[key];
            const a = document.createElement('a');
            a.href = provider.url(lat, lon);
            a.textContent = provider.name;
            a.rel = 'noopener noreferrer';

            if (provider.directions) {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleGeolocationNavigation(key, lat, lon, a.href);
                });
            }
            output.appendChild(a);
        }
    }

    function redirect(providerKey, lat, lon) {
        h1.textContent = `→ ${lat}, ${lon}`;
        if (providers[providerKey]) {
            const provider = providers[providerKey];
            if (provider.directions) {
                handleGeolocationNavigation(providerKey, lat, lon, provider.url(lat, lon));
            } else {
                navigate(provider.url(lat, lon));
            }
        } else {
            output.textContent = `Unknown provider: ${providerKey}`;
        }
    }

    if (!geoInput) {
        output.innerHTML = `
            <p>To use this tool, construct a URL with hash parameters:</p>
            <ul>
                <li><code>#q=geo:40.7,-74.0</code></li>
                <li><code>#p=gmaps&q=geo:40.7,-74.0</code></li>
                <li><code>#p=osm&q=https%3A%2F%2Fmaps.google.com%2F%4040.7%2C-74.0%2C15z</code> (URL encoded source)</li>
                <li><code>#q=om://o4B4pYZsRs</code> (encoded format)</li>
            </ul>
            <p>Use 'q' for the geo data and 'p' for the target provider (gmaps, osm, citymapper, brouter).</p>
        `;
        return;
    }

    const decodedGeoInput = decodeURIComponent(geoInput);
    const coords = parse(decodedGeoInput); // Using the parse function from parser.js

    if (!coords) {
        output.textContent = `Could not parse coordinates from: "${decodedGeoInput}"`;
        return;
    }

    if (targetProvider) {
        redirect(targetProvider, coords.lat, coords.lon);
    } else {
        showLinks(coords.lat, coords.lon);
    }
});

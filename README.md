# Geo Links Redirector

A simple, fully static web application built with HTML, CSS, and JavaScript that redirects short geo-links to their full URLs. This application processes all user data client-side, ensuring no server-side processing or storage of your location information.

## Usage

This application can be used by constructing a URL with specific hash parameters.

### Hash Parameters

-   `q`: (Required) The geo-data input. This can be in several formats:
    -   `geo:latitude,longitude` (Geo URI standard)
    -   A full URL from Google Maps or OpenStreetMap containing coordinates.
    -   A custom `om://`, `ge0://`, or `comaps://` encoded link (used by Organic Maps and CoMaps).
    -   Raw `latitude,longitude` string.

-   `p`: (Optional) The target map provider for direct redirection. If omitted, a page with links to all supported providers will be displayed.
    -   `geo`: Geo URI
    -   `gmaps`: Google Maps
    -   `osm`: OpenStreetMap
    -   `citymapper`: Citymapper (supports directions from current location if allowed)
    -   `brouter`: BRouter Web (supports directions from current location if allowed)

### Important Note on Google Maps Short URLs

Shortened Google Maps URLs (e.g., `https://goo.gl/maps/xxxx` or `https://maps.app.goo.gl/xxxx`) are **not supported** as direct inputs for the `q` parameter. This is because these URLs require server-side resolution to expand into their full, human-readable forms containing coordinates. Client-side JavaScript, which this application uses, is unable to perform this resolution due to browser security policies (e.g., Same-Origin Policy) and the lack of a public, client-accessible API for this purpose.

### Examples

**1. Displaying all provider links for a Geo URI:**

`https://geo.denys.es/?q=geo:40.7128,-74.0060`

**2. Direct redirection to Google Maps from a Geo URI:**

`https://geo.denys.es/?p=gmaps&q=geo:34.0522,-118.2437`

**3. Direct redirection to OpenStreetMap from a Google Maps URL (URL-encoded):**

`https://geo.denys.es/#p=osm&q=https%3A%2F%2Fmaps.google.com%2F%4034.0522%2C-118.2437%2C15z`

**4. Displaying all provider links from an Organic Maps (om://) encoded link:**

``https://geo.denys.es/#q=om://o4B4pYZsRs``

**5. Direct redirection to Citymapper from raw coordinates:**

`https://geo.denys.es/#p=citymapper&q=34.0522,-118.2437`

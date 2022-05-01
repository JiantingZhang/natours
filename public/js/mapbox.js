/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidGluZ3RpbmcxMDI5IiwiYSI6ImNsMXUxYTlyajJneHMzZnRjMWd2MHR2cDkifQ.4kGeGEiDq9U-W2vBg0lETQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/tingting1029/cl1u8mbq3001s15pe5w5ztrrh',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 5,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

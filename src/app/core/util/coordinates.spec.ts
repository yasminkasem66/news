import { osmLink, parseCoordinates } from './coordinates';

describe('coordinates', () => {
  it('parses the CMS "lat,lng" value', () => {
    expect(parseCoordinates('30.0444,31.2357')).toEqual({ lat: 30.0444, lng: 31.2357 });
    expect(parseCoordinates(' 30.0444 , 31.2357 ')).toEqual({ lat: 30.0444, lng: 31.2357 });
  });

  it('rejects empty, null and malformed values', () => {
    expect(parseCoordinates('')).toBeNull();
    expect(parseCoordinates(null)).toBeNull();
    expect(parseCoordinates('abc,1')).toBeNull();
    expect(parseCoordinates('91,10')).toBeNull();
    expect(parseCoordinates('1,2,3')).toBeNull();
  });

  it('builds an OpenStreetMap link', () => {
    expect(osmLink({ lat: 30.0444, lng: 31.2357 })).toBe(
      'https://www.openstreetmap.org/?mlat=30.0444&mlon=31.2357#map=16/30.0444/31.2357',
    );
  });
});

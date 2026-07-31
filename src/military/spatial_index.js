export class CantonmentSpatialIndex {
  constructor() {
    this.grid = new Map();
  }
  
  _getKey(lat, lon) {
    const latBin = Math.floor(lat * 2);
    const lonBin = Math.floor(lon * 2);
    return `${latBin}_${lonBin}`;
  }

  insert(station) {
    const key = this._getKey(station.lat, station.lng);
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key).push(station);
  }

  queryNear(lat, lon) {
    const key = this._getKey(lat, lon);
    return this.grid.get(key) || [];
  }
}

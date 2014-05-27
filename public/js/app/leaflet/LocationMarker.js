L.LocationMarker = L.Marker.extend({
  initialize: function (latlng, options) {
    L.Marker.prototype.initialize.call(this, latlng);

    this._accuracyCircle = L.circle(latlng, 0, {
      clickable: false,
      color: options.color,
      fillColor: options.color,
      fillOpacity: 0.15,
      weight: 2,
      opacity: 0.5
    });

    this._locationMarker = L.circleMarker(latlng, {
      color: options.color,
      fillColor: options.color,
      fillOpacity: 0.7,
      weight: 2,
      opacity: 0.9,
      radius: 5
    });

    this._location = L.layerGroup([this._accuracyCircle, this._locationMarker]);
  },

  addTo: function (map) {
    map.addLayer(this._location);
    return this;
  },

  onAdd: function (map) {
    this._map = map;
    map.addLayer(this._location);
    this._locationMarker

    L.DomEvent.on(this._locationMarker, 'click', this._onMouseClick, this);
  },

  onRemove: function (map) {
    map.removeLayer(this._location);
  },

  getLatLng: function() {
    return this._locationMarker.getLatLng();
  },

  setLatLng: function (latlng) {
    this._accuracyCircle.setLatLng(latlng);
    this._locationMarker.setLatLng(latlng);
    return this;
  },

  setAccuracy: function (accuracy) {
    this._accuracyCircle.setRadius(accuracy ? accuracy : 0);
    return this;
  },

  setColor: function(color) {
    this._accuracyCircle.options.color = color;
    this._accuracyCircle.options.fillColor = color;
    this._locationMarker.options.color = color;
    this._locationMarker.options.fillColor = color;
    return this;
  },

  _onMouseClick: function (e) {
    var wasDragged = this.dragging && this.dragging.moved();

    if (this.hasEventListeners(e.type) || wasDragged) {
      L.DomEvent.stopPropagation(e);
    }

    if (wasDragged) { return; }

    if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) { return; }

    this.fire(e.type, {
      originalEvent: e,
      latlng: this._latlng
    });
  },

  onPopupClose: function(fn, context) {
    return this._locationMarker.on('popupclose', fn, context);
  },

  offPopupClose: function(fn, context) {
    return this._locationMarker.off('popupclose', fn, context);
  }

  // on: function(types, fn, context) {
  //   return this._locationMarker.on(types, fn, context);
  // },
  //
  // off: function(types, fn, context) {
  //   return this._locationMarker.off(types, fn, context);
  // }

});

L.locationMarker = function (latlng, options) {
  return new L.LocationMarker(latlng, options);
};

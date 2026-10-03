export const metroGeoJson: GeoJSON.FeatureCollection = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "line-blue",
        "name": "Blue Line (Line 1 - North-South)",
        "code": "BLUE",
        "colorHex": "#0055A5"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [88.3614, 22.6547],
          [88.3697, 22.6468],
          [88.3905, 22.6375],
          [88.3775, 22.6214],
          [88.3804, 22.6074],
          [88.3698, 22.6006],
          [88.3638, 22.5947],
          [88.3592, 22.5858],
          [88.3585, 22.5794],
          [88.3582, 22.5678],
          [88.3518, 22.5647],
          [88.3514, 22.5539],
          [88.3498, 22.5482],
          [88.3475, 22.5401],
          [88.3468, 22.5332],
          [88.3461, 22.5255],
          [88.3457, 22.5186],
          [88.3464, 22.5085],
          [88.3459, 22.4965],
          [88.3472, 22.4851],
          [88.3584, 22.4729],
          [88.3698, 22.4682],
          [88.3792, 22.4645],
          [88.3912, 22.4608],
          [88.3982, 22.4542]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "line-green",
        "name": "Green Line (Line 2 - East-West)",
        "code": "GREEN",
        "colorHex": "#009944"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [88.3262, 22.5791],
          [88.3426, 22.5841],
          [88.3479, 22.5714],
          [88.3518, 22.5647],
          [88.3712, 22.5675],
          [88.3884, 22.5719],
          [88.4021, 22.5714],
          [88.4098, 22.5786],
          [88.4124, 22.5848],
          [88.4172, 22.5862],
          [88.4239, 22.5829],
          [88.4342, 22.5784]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "line-purple",
        "name": "Purple Line (Line 3 - Joka-Majerhat)",
        "code": "PURPLE",
        "colorHex": "#800080"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [88.3032, 22.4412],
          [88.3084, 22.4565],
          [88.3142, 22.4698],
          [88.3189, 22.4842],
          [88.3221, 22.4968],
          [88.3254, 22.5108],
          [88.3289, 22.5274]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "line-orange",
        "name": "Orange Line (Line 6 - Kavi Subhash-Ruby)",
        "code": "ORANGE",
        "colorHex": "#FF6600"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [88.3982, 22.4542],
          [88.3995, 22.4678],
          [88.4012, 22.4821],
          [88.4005, 22.4984],
          [88.3998, 22.5142]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-dakshineswar",
        "name": "Dakshineswar",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3614, 22.6547] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-dumdum",
        "name": "Dum Dum",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3775, 22.6214] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-shyambazar",
        "name": "Shyambazar",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3698, 22.6006] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-sovabazar",
        "name": "Sovabazar Ahiritola",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3638, 22.5947] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-girish-park",
        "name": "Girish Park",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3592, 22.5858] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-mg-road",
        "name": "Mahatma Gandhi Road",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "CENTRAL",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3585, 22.5794] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-central",
        "name": "Central",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "CENTRAL",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3582, 22.5678] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-esplanade",
        "name": "Esplanade",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "CENTRAL",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3518, 22.5647] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-park-street",
        "name": "Park Street",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3514, 22.5539] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-kalighat",
        "name": "Kalighat",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3457, 22.5186] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-rabindra-sarobar",
        "name": "Rabindra Sarobar",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3464, 22.5085] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-kavi-subhash",
        "name": "Kavi Subhash",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#0055A5",
        "zone": "SOUTH",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3982, 22.4542] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-howrah-maidan",
        "name": "Howrah Maidan",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#009944",
        "zone": "CENTRAL",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3262, 22.5791] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-sealdah",
        "name": "Sealdah",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#009944",
        "zone": "CENTRAL",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3712, 22.5675] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-salt-lake-sector-v",
        "name": "Salt Lake Sector V",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#009944",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4342, 22.5784] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-joka",
        "name": "Joka",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#800080",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3032, 22.4412] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-taratala",
        "name": "Taratala",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#800080",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3254, 22.5108] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-majerhat",
        "name": "Majerhat",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#800080",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3289, 22.5274] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-ruby",
        "name": "Hemanta Mukhopadhyay (Ruby)",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FF6600",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3998, 22.5142] }
    }
  ]
};

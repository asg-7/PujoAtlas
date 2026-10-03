export const metroGeoJson: GeoJSON.FeatureCollection = {
  "type": "FeatureCollection",
  "features": [
    // 1. Blue Line (Line 1 - North-South)
    {
      "type": "Feature",
      "properties": {
        "id": "line-blue",
        "name": "Blue Line (Line 1 - North-South)",
        "code": "BLUE",
        "colorHex": "#38BDF8"
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
          [88.3551, 22.5662],
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
    // 2. Green Line (Line 2 - East-West Underwater)
    {
      "type": "Feature",
      "properties": {
        "id": "line-green",
        "name": "Green Line (Line 2 - East-West)",
        "code": "GREEN",
        "colorHex": "#22C55E"
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
    // 3. Purple Line (Line 3 - Joka-Majerhat)
    {
      "type": "Feature",
      "properties": {
        "id": "line-purple",
        "name": "Purple Line (Line 3 - Joka-Majerhat)",
        "code": "PURPLE",
        "colorHex": "#C084FC"
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
    // 4. Orange Line (Line 6 - New Garia to Beleghata)
    {
      "type": "Feature",
      "properties": {
        "id": "line-orange",
        "name": "Orange Line (Line 6 - New Garia-Ruby-Beleghata)",
        "code": "ORANGE",
        "colorHex": "#FB923C"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [88.3982, 22.4542],
          [88.3995, 22.4678],
          [88.4012, 22.4821],
          [88.4005, 22.4984],
          [88.3998, 22.5142],
          [88.3988, 22.5245],
          [88.3992, 22.5350],
          [88.4001, 22.5475],
          [88.4015, 22.5580]
        ]
      }
    },
    // 5. Yellow Line (Line 4 - Noapara to Airport)
    {
      "type": "Feature",
      "properties": {
        "id": "line-yellow",
        "name": "Yellow Line (Line 4 - Airport Link)",
        "code": "YELLOW",
        "colorHex": "#FACC15"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [88.3905, 22.6375],
          [88.4112, 22.6415],
          [88.4285, 22.6450],
          [88.4410, 22.6515]
        ]
      }
    },

    // STATIONS
    // Blue Line Stations
    {
      "type": "Feature",
      "properties": {
        "id": "station-dakshineswar",
        "name": "Dakshineswar",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3614, 22.6547] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-baranagar",
        "name": "Baranagar",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3697, 22.6468] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-noapara",
        "name": "Noapara",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "NORTH",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3905, 22.6375] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-dumdum",
        "name": "Dum Dum",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "NORTH",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3775, 22.6214] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-belgachia",
        "name": "Belgachia",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3804, 22.6074] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-shyambazar",
        "name": "Shyambazar",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3698, 22.6006] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-sovabazar",
        "name": "Sovabazar Sutanuti",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
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
        "lineColorHex": "#38BDF8",
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
        "lineColorHex": "#38BDF8",
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
        "lineColorHex": "#38BDF8",
        "zone": "CENTRAL",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3582, 22.5678] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-chandni-chowk",
        "name": "Chandni Chowk",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "CENTRAL",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3551, 22.5662] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-esplanade",
        "name": "Esplanade",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
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
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3514, 22.5539] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-maidan",
        "name": "Maidan",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3498, 22.5482] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-rabindra-sadan",
        "name": "Rabindra Sadan",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3475, 22.5401] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-netaji-bhavan",
        "name": "Netaji Bhavan",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3468, 22.5332] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-jatin-das-park",
        "name": "Jatin Das Park",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3461, 22.5255] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-kalighat",
        "name": "Kalighat",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
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
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3464, 22.5085] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-uttam-kumar",
        "name": "Mahanayak Uttam Kumar",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3459, 22.4965] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-netaji",
        "name": "Netaji",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3472, 22.4851] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-masterda",
        "name": "Masterda Surya Sen",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3584, 22.4729] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-gitanjali",
        "name": "Gitanjali",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3698, 22.4682] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-kavi-nazrul",
        "name": "Kavi Nazrul",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3792, 22.4645] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-shahid-khudiram",
        "name": "Shahid Khudiram",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3912, 22.4608] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-kavi-subhash",
        "name": "Kavi Subhash",
        "lineId": "line-blue",
        "lineName": "Blue Line",
        "lineColorHex": "#38BDF8",
        "zone": "SOUTH",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3982, 22.4542] }
    },

    // Green Line Stations
    {
      "type": "Feature",
      "properties": {
        "id": "station-howrah-maidan",
        "name": "Howrah Maidan",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3262, 22.5791] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-howrah",
        "name": "Howrah",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "WEST",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3426, 22.5841] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-mahakaran",
        "name": "Mahakaran",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "CENTRAL",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3479, 22.5714] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-sealdah",
        "name": "Sealdah",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "CENTRAL",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3712, 22.5675] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-phoolbagan",
        "name": "Phoolbagan",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3884, 22.5719] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-salt-lake-stadium",
        "name": "Salt Lake Stadium",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4021, 22.5714] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-bengal-chemical",
        "name": "Bengal Chemical",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4098, 22.5786] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-city-center",
        "name": "City Center",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4124, 22.5848] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-central-park",
        "name": "Central Park",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4172, 22.5862] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-karunamoyee",
        "name": "Karunamoyee",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4239, 22.5829] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-salt-lake-sector-v",
        "name": "Salt Lake Sector-V",
        "lineId": "line-green",
        "lineName": "Green Line",
        "lineColorHex": "#22C55E",
        "zone": "EAST",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.4342, 22.5784] }
    },

    // Purple Line Stations
    {
      "type": "Feature",
      "properties": {
        "id": "station-joka",
        "name": "Joka",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#C084FC",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3032, 22.4412] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-thakurpukur",
        "name": "Thakurpukur",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#C084FC",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3084, 22.4565] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-sakher-bazar",
        "name": "Sakher Bazar",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#C084FC",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3142, 22.4698] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-behala-chowrasta",
        "name": "Behala Chowrasta",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#C084FC",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3189, 22.4842] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-behala-bazar",
        "name": "Behala Bazar",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#C084FC",
        "zone": "WEST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3221, 22.4968] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-taratala",
        "name": "Taratala",
        "lineId": "line-purple",
        "lineName": "Purple Line",
        "lineColorHex": "#C084FC",
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
        "lineColorHex": "#C084FC",
        "zone": "WEST",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3289, 22.5274] }
    },

    // Orange Line Stations
    {
      "type": "Feature",
      "properties": {
        "id": "station-satyajit-ray",
        "name": "Satyajit Ray",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FB923C",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3995, 22.4678] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-jyotirindra-nandi",
        "name": "Jyotirindra Nandi",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FB923C",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4012, 22.4821] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-kavi-sukanta",
        "name": "Kavi Sukanta",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FB923C",
        "zone": "SOUTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4005, 22.4984] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-ruby",
        "name": "Hemanta Mukhopadhyay",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FB923C",
        "zone": "EAST",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.3998, 22.5142] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-vip-bazar",
        "name": "VIP Bazar",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FB923C",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3988, 22.5245] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-ritwik-ghatak",
        "name": "Ritwik Ghatak",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FB923C",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.3992, 22.5350] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-barun-sengupta",
        "name": "Barun Sengupta",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FB923C",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4001, 22.5475] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-beleghata",
        "name": "Beleghata",
        "lineId": "line-orange",
        "lineName": "Orange Line",
        "lineColorHex": "#FB923C",
        "zone": "EAST",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4015, 22.5580] }
    },

    // Yellow Line Stations
    {
      "type": "Feature",
      "properties": {
        "id": "station-dum-dum-cantt",
        "name": "Dum Dum Cantt",
        "lineId": "line-yellow",
        "lineName": "Yellow Line",
        "lineColorHex": "#FACC15",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4112, 22.6415] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-jessore-road",
        "name": "Jessore Road",
        "lineId": "line-yellow",
        "lineName": "Yellow Line",
        "lineColorHex": "#FACC15",
        "zone": "NORTH",
        "isInterchange": false
      },
      "geometry": { "type": "Point", "coordinates": [88.4285, 22.6450] }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "station-jai-hind",
        "name": "Jai Hind",
        "lineId": "line-yellow",
        "lineName": "Yellow Line",
        "lineColorHex": "#FACC15",
        "zone": "NORTH",
        "isInterchange": true
      },
      "geometry": { "type": "Point", "coordinates": [88.4410, 22.6515] }
    }
  ]
};

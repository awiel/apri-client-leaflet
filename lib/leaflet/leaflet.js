/*jslint devel: true,  undef: true, newcap: true, white: true, maxerr: 50 */
/*global APRI*/
/**
 * @module aireas
 */

"use strict"; // This is for your code to comply with the ECMAScript 5 standard.

// ApriAppAir class def ===============================================================================
// parent: class ApriAppBase
var ApriAppLeaflet = ApriApps.ApriAppLeaflet = ApriApps.ApriAppLeaflet || ApriApps.ApriAppBase.extend(function () {
	
	//initializer is executed before the constructor.
    this.initializer = function() {
        //...
    };

	var apriCookieBase;
	
	var appConfig;
//	 = {
//		viewZoomLevel: 9,
//		mapCenterLat: 51.45401,
//		mapCenterLng: 5.47668
//		viewCoordinates: [51.45401, 5.47668],
//	} 
	
	var apriConfig, apriClientInfo;
	var appBodyContainer;
	var templates;
	
	var maxAreas = 5;

	var aireasAvgType 	= 'OZON'; // 'UFP', 'PM1', 'PM25', 'PM10', 'SPMI', 'OZON', 'NO2', 'CELC', 'HUM', 'AMBHUM', 'AMBTEMP'
	var aireasCity		= 'Eindhoven';
	var aireasTime		= 0;
	
	var movieLayers = {};
	

	var openBasisKaartLayer;

	// deeplink function 
	// url overrules cookie variables ? or todo personal profile defaults?
	// maximum of 4 areas. Key of variables is area plus keyname e.g. "1city" or "1lan". "city" defaults to "0city" (zero).
	// variables: city, layer[,layer], mapCenterLat, mapCenterLng, viewZoomLevel
	var urlVars;
//	var areaVars;
//	var areas;
	var currentArea;
	var currentAreaCode = 'EHV';
	var currentAreaCity = 'Eindhoven';
	//var areaCode = 'EHV'; // EHV, ASS, DLF
	
	
	this.constructor = function(objectId, options) {
		//Execute the constructor of the class we extended.
        this.super(objectId, options);
		
		apriConfig = APRI.getConfig();
		apriClientInfo = APRI.getClientInfo();
		
		
		// init config values
		appConfig = {};
		appConfig.viewZoomLevel 	= 11;
		appConfig.mapCenterLat		= 51.44;  //51.45401;
		appConfig.mapCenterLng		= 5.47668;
		appConfig.viewCoordinates	= [appConfig.mapCenterLat, appConfig.mapCenterLng];
		appConfig.mapHeaderHeight	= 0;
		appConfig.mapFooterHeight	= 0;
		
		
		// sessionstorage for session related data. Session data persists during lifetime every browser tab.
		// for info see https://code.google.com/p/sessionstorage/ (window.sessionStorage)
		sessionStorage.length; // 0
		sessionStorage.setItem("key", "value");
		// sessionStorage.getItem("key");
		// sessionStorage.removeItem("test");
		// sessionStorage.clear();
		
		
/* no cookies for this version		
		// reset config from cookies
		apriCookieBase = new ApriCore.ApriCookieBase();
		var _viewZoomLevel = apriCookieBase.getCookie('viewZoomLevel');
		if ( _viewZoomLevel != undefined && _viewZoomLevel >=0 && _viewZoomLevel <=18 ) {
			appConfig.viewZoomLevel = _viewZoomLevel;
		}		
		apriCookieBase.setCookie('viewZoomLevel', appConfig.viewZoomLevel, 31);  //expdays

		var _mapCenterLat = apriCookieBase.getCookie('mapCenterLat');
		var _mapCenterLng = apriCookieBase.getCookie('mapCenterLng');
		if ( _mapCenterLat == undefined || _mapCenterLng == undefined || _mapCenterLat == NaN || _mapCenterLng == NaN) {
		} else {
			appConfig.mapCenterLat = parseFloat(_mapCenterLat);
			appConfig.mapCenterLng = parseFloat(_mapCenterLng);
		}		
		apriCookieBase.setCookie('mapCenterLat', appConfig.mapCenterLat, 31);  //expdays
		apriCookieBase.setCookie('mapCenterLng', appConfig.mapCenterLng, 31);  //expdays
		
*/

		secureSite 			= false;
		siteProtocol 		= secureSite?'https://':'http://';
		siteAireas			= siteProtocol + 'scapeler.com/SCAPE604';
		sitePrefixExtern	= ''; //'scapeler.com/extern/'


		getDeepLinkVars();
		initDomainsRanges();
		
 		// get selection list for municipals
		ajaxGetData(siteAireas + "/data/aireas/getCbsGemeenten/*", 
			function(data) {
				var _data = JSON.parse(data);
				gemeenten = d3.map( _data ); 
		 		initDropDownGemeente({container:mapPanes.controlerPane});
			}
		);
		
//		apriLeafLetBase = new ApriCore.ApriLeafLetBase({viewCoordinates: [52.490, 4.97], viewZoomLevel: 12, mapHeaderHeight: 0, mapFooterHeight:0 });
		apriLeafLetBase = new ApriCore.ApriLeafLetBase(this.appContainer, {viewCoordinates: appConfig.viewCoordinates, viewZoomLevel: appConfig.viewZoomLevel, mapHeaderHeight:appConfig.mapHeaderHeight, mapFooterHeight:appConfig.mapFooterHeight });
		
		L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';
		

		
/*
		var appBodyContainer = document.getElementsByClassName('apri-app-body apri-client-leaflet')[0];
		var logoContainer = document.createElement('div');
		logoContainer.className = 'logo-container';
		appBodyContainer.appendChild(logoContainer);
		
		var _container = document.createElement('div');
		_container.className = 'top-logo-container';		
		var scapelerLogo = document.createElement('img');
		scapelerLogo.className = 'top-logo';
		scapelerLogo.src = "../client/apri-client-aireas/logos/scapeler.png";
		scapelerLogo.alt = "Scapeler";
		_container.appendChild(scapelerLogo);
		var _containerLabel = document.createElement('div');
		_containerLabel.className = 'top-logo-label';
		_containerLabel.innerHTML = 'Scapeler';
		_container.appendChild(_containerLabel);
		logoContainer.appendChild(_container);

		var _container = document.createElement('div');
		_container.className = 'top-logo-container';		
		var aireasLogo = document.createElement('img');
		aireasLogo.className = 'top-logo';
		aireasLogo.src = "https://pbs.twimg.com/profile_images/1524863861/aireas_profilepic_400x400.jpg";
		aireasLogo.alt = "AiREAS";
		_container.appendChild(aireasLogo);
		var _containerLabel = document.createElement('div');
		_containerLabel.className = 'top-logo-label';
		_containerLabel.innerHTML = 'AiREAS';
		_container.appendChild(_containerLabel);
		logoContainer.appendChild(_container);
		_container.addEventListener("click", aireasLogoClick );
		
*/		
		
		map 			= apriLeafLetBase.createMap(this.appContainer, {viewCoordinates: [appConfig.mapCenterLat, appConfig.mapCenterLng], viewZoomLevel: appConfig.viewZoomLevel });
		mapPanes 		= map.getPanes();
		baseMaps 		= {};
		aireasBaseMaps	= {};

//		aireasTileLayer 	= apriLeafLetBase.createTileLayer();
	
		retrievedDateCache 	= [];
		retrievedDateCacheTrafficFlow = [];


		//initGridGemLayer();  // actions for event add/remove layers
		initMapAddRemoveLayersEvent();  // actions for event add/remove layers

//		initCbsGridGemLayer();
//		cbsGridGemLayer.addTo(map);



  		var videoCameraMarker = L.AwesomeMarkers.icon({
    		icon: 'video-camera',
			//	prefix: 'fa',
    		markerColor: 'blue',
			//	spin:true,
			iconColor: 'white'
  		});
		
  		var airboxMarkerGreen = L.AwesomeMarkers.icon({
    		icon: 'bar-chart',
			//	prefix: 'fa',
    		markerColor: 'green',
			//	spin:true,
			iconColor: 'white'
  		});		
  		var airboxMarkerBlue = L.AwesomeMarkers.icon({
    		icon: 'bar-chart',
			//	prefix: 'fa',
    		markerColor: 'blue',
			//	spin:true,
			iconColor: 'white'
  		});
  		var airboxMarkerPurple = L.AwesomeMarkers.icon({
    		icon: 'bar-chart',
			//	prefix: 'fa',
    		markerColor: 'purple',
			//	spin:true,
			iconColor: 'white'
  		});
  		var airboxMarkerDarkPurple = L.AwesomeMarkers.icon({
    		icon: 'bar-chart',
			//	prefix: 'fa',
    		markerColor: 'darkpurple',
			//	spin:true,
			iconColor: 'white'
  		});
						
  		var solutionMarker = L.AwesomeMarkers.icon({
    		icon: 'thumbs-o-up',
			//	prefix: 'fa',
    		markerColor: 'green',
			//	spin:true,
			iconColor: 'white'
  		});		
  		var usersMarker = L.AwesomeMarkers.icon({
    		icon: 'users',
			//	prefix: 'fa',
    		markerColor: 'blue',
			//	spin:true,
			iconColor: 'white'
  		});		
  		var localProductMarker = L.AwesomeMarkers.icon({
    		icon: 'cutlery',
			//	prefix: 'fa',
    		markerColor: 'blue',
			//	spin:true,
			iconColor: 'white'
  		});		


        var icon32_32 = L.Icon.extend({
            options: {
                iconSize: [32,32],
                iconAnchor: [18,32],
                shadowUrl: APRI.getConfig().urlSystemRoot + '/apri/lib/images/marker-shadow.png',
                shadowSize: [32,13],
                shadowAnchor: [18,16],
                popupAnchor: [0,-30]
            }
        });

		var RDres = [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420];
/*		var RDcrs = new L.Proj.CRS('EPSG:28992',
              '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs <>',
            {
                transformation: new L.Transformation(1, 285401.920, -1, 903401.920),
			//	origin: [218128.7031, 6126002.9379],
                resolutions: RDres
            });
*/			
		var RDcrs = L.CRS.proj4js('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs', new L.Transformation(1, 285401.920, -1, 903401.920));
		RDcrs.scale = function(zoom) {
    		return 1 / res[zoom];
		};	
    	RDcrs.scale = function (zoom) {
        	return 1 / RDres[zoom];
    	};

        openBasisKaartLayer = L.tileLayer.wms("http://www.openbasiskaart.nl/mapcache?SRS=EPSG%3A28992", {  
			layers: 'osm',
            format: 'image/png',
            transparent: true,
			tiled: true,
		//	tilesorigin: [-180, 90],
			//crs: L.CRS.EPSG28992,    //
			//srs: 'EPSG:28992',
			crs : RDcrs,
            attribution: "osm/obk "
        });
        openBasisKaartLayer.addTo(map);
		
		createAireasGridGemLayer();
		aireasGridGemLayer.addTo(map);
		


//////////////////

L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  
  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
  },
  
  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
  },
  
  getFeatureInfo: function (evt) {
    // Make an AJAX request to the server and hope for the best
	var context = evt;
    var url = this.getFeatureInfoUrl(evt.latlng),
        showResults = L.Util.bind(this.showGetFeatureInfo, this);
	var apriAjaxBase = new ApriCore.ApriAjaxBase();
	var params = {};
	var options = {};
	var callback = function(data, contextCB, error) { 
		var err = typeof data === 'string' ? null : data;
		showResults(err, contextCB.latlng, data)
		};
	apriAjaxBase.request(url, params, options, callback, context );
  },
  
  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),
        
        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,      
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          //info_format: 'text/html'
          info_format: 'application/json'
        };
    
    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
    
    return this._url + L.Util.getParamString(params, this._url, true);
  },
  
  showGetFeatureInfo: function (data, latlng, content) {
    if (data == null) {  // html result from geoserver
		
		
		var popUp = L.popup({ maxWidth: 800})
      		.setLatLng(latlng)
      		.setContent(content)
      		.openOn(this._map);
			
		return;  
	};


  
    if (data && data.type=="FeatureCollection" && data.features.length>0 ) {
	    // Otherwise show the content in a popup, or something.
		var popupView 			= this.options.popupView;
		var popupViewTemplate 	= Handlebars.compile(popupView);

		var _record = data.features[0];
		var tmpDate = new Date(_record.properties.retrieveddate);	
		_record.properties.retrievedDateFormatted = moment(tmpDate).format('YYYY/MM/DD');     //tmpDate.format('yyyy-m-d');
		_record.properties.retrievedTimeFormatted = moment(tmpDate).format('HH:mm');   //tmpDate.format('HH:MM');
		
		var _airbox 		= _record.properties.airbox;
		var _locationName 	= _record.properties.airbox_location + ' ' + _record.properties.airbox_postcode;
		var _locationType 	= _record.properties.airbox_location_type ;
		var _locationDesc 	= _record.properties.airbox_location_desc ;
		var _locationX		= _record.properties.airbox_x ;
		var _locationY		= _record.properties.airbox_y ;
		
		
//		if (Addresses[_airbox]) {
//			var _voorv = Addresses[_airbox].voorv?Addresses[_airbox].voorv+' ':''; 
//			_locationName = _voorv + Addresses[_airbox].adres + ' ' + Addresses[_airbox].pcw;
//		}
		
		_record.properties.locationName = _locationName;
		_record.properties.locationCode = _record.properties.airbox;
		var _content = popupViewTemplate({
			data: _record.properties
		});

    	var popUp = L.popup({ maxWidth: 800, closeButton: false })
      		.setLatLng(latlng)
      		.setContent(_content)
      		.openOn(this._map)
			;
		
		var closeButton = popUp._container.getElementsByClassName('fa fa-times-circle')[0];
		closeButton.addEventListener("click", function(){
    		map.closePopup();
		});
		var chartContainer 	= popUp._container.getElementsByClassName('chart-wrapper')[0];
		var chartButton 	= popUp._container.getElementsByClassName('measurepoint-wrapper cta')[0];
		chartButton.addEventListener("click", function(){
			_record.properties.container = chartContainer;
    		getPopUpChartData(_record.properties);
		});
		

		createAireasPopUpView({ 
			measures: {
				pm1: 	_record.properties.pm1float, 
				pm25: 	_record.properties.pm25float, 
				pm10: 	_record.properties.pm10float,
				no2:	_record.properties.no2float  
			}
		});				
		
	} else { // not clicked on any feature
		//console.log(data);
		return; 
	} // do nothing if there's an error
  }

});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};



//==================== ajax call for AiREAS measure data
	function ajaxCall (options, callback) {
		
		var xmlhttp;
		xmlhttp=new XMLHttpRequest();

		var url = options.url;

		xmlhttp.onreadystatechange=function() {
		    var i, inpRecord, outRecord, data=[];
  			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			    //var jsonResponse = JSON.parse(xmlhttp.responseText);
		
				callback(xmlhttp.responseText, options);
			}
  		}
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
	}





		map.addLayer( new ApriLeafLetLayerBase().initLayer({latLng: L.latLng( 51.43881, 5.48046 )} )  );




	}

//===========================================================================  end of constructor

	var secureSite;
	var siteProtocol, siteAireas;
	var sitePrefixExtern;

	var map,  apriLeafLetBase, popupInfoCtrl, threeScene, webGlContext;
	var baseMaps, mapPanes;
	var aireasBaseMaps;
	
	var retrievedDateMax, retrievedDateMaxTrafficFlow;
	var retrievedDateCache, retrievedDateCacheTrafficFlow;
	
	var geoLocationCurrentPosition;

	var gemeenten, gemeenteSelected, dropDownGemeenteContainer, dropDownGemeenteDispatchers; 

	var aireasGridGemLayer;
	 

	var getDeepLinkVars = function() {
			var i = 0; 
			var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
				if (key == 'dltype') return; //future extension eg. for encrypted deeplink variables
				var areaIndChar = key.substr(0,1);
				var areaIndInt;
				var _area, _key;
				if (areaIndChar >= "1" && areaIndChar <= "4" ) {  // area 1, 2, 3 or 4
					areaIndInt 	= parseInt(areaIndChar);
					_key		= key.substr(1);
				} else { // area 0
					areaIndInt 	= 0
					_key 		= key;
				}
				
				if (_key == 'city') 	aireasCity 		= value.toUpperCase();
				if (_key == 'sensor') 	aireasAvgType 	= value.toUpperCase();
				if (_key == 'time') 	aireasTime 		= parseFloat(value);
				
				//_area 		= areas[areaIndInt].deepLinkVars;
				//
				//if (_key == 'layers') {
				//	_area[_key] = value.split(',');
				//} else {
				//	_area[_key]	= value;
				//}

			});

			return;
	};


	// A drop-down menu for selecting a state; uses the "menu" namespace.
	var initDropDownGemeente = function(options) {
		var _city;
		
		var container 						= document.getElementsByClassName('leaflet-bottom leaflet-left')[0];
		dropDownGemeenteContainer 			= document.createElement('div');
		dropDownGemeenteContainer.id 		= APRI.UTIL.apriGuid(dropDownGemeenteContainer.id );
		dropDownGemeenteContainer.className = dropDownGemeenteContainer.className + " leaflet-control gemeente-selector";
		container.appendChild(dropDownGemeenteContainer);
								
		dropDownGemeenteDispatchers = d3.dispatch("load", "statechange");
			
		dropDownGemeenteDispatchers.on("load.menu", function(gemeenten) {
  			gemeenteSelected = d3.select("#"+dropDownGemeenteContainer.id)
    			.append("div")
    			.append("select")
      			.on("change", function() { 
					dropDownGemeenteDispatchers.statechange(gemeenten.get(this.value));
				});
			gemeenteSelected.selectAll("option")
      			.data(gemeenten.values())
    			.enter().append("option")
      			.attr("value", function(d) { 
					return d.name; 
					})
      			.text(function(d) { return d.name; });
			dropDownGemeenteDispatchers.on("statechange.menu", function(city) {
				//var _cityTmp = city.name;
				//areas[currentArea].deepLinkVars.city = _cityTmp;
				//setPushState();
//				window.history.pushState({city:_cityTmp}, "city", "?"+"city=" + _cityTmp);
    			gemeenteSelected.property("value", 'Eindhoven');
				//currentAreaCity = areas[currentArea].deepLinkVars.city;
				//if (cityArea[currentAreaCity] && cityArea[currentAreaCity].cityAreaCode ) {
				//	currentAreaCode = cityArea[currentAreaCity].cityAreaCode; 
				//} else currentAreaCode = '';
				//initCbsGridGemLayer('Eindhoven');
				//cbsGridGemLayer.addTo(map);
  			});
		});
		
		
		
		dropDownGemeenteDispatchers.load(gemeenten);
  		dropDownGemeenteDispatchers.statechange(
			gemeenten.get('Eindhoven')
		);  
	};
	



	var initMapAddRemoveLayersEvent = function() {
			
		map.on('geojson', function(e) {
			alert('geojson add layer');
		});


		map.on('viewreset', function(e) {
			//console.log('testviewreset');
/*
			var zoomLevel = this.getZoom();
			if (appConfig.viewZoomLevel != zoomLevel ) {
				appConfig.viewZoomLevel = zoomLevel;
				apriCookieBase.setCookie('viewZoomLevel', appConfig.viewZoomLevel, 31);  //expdays
			}
			var mapCenter = this.getCenter();
			if (appConfig.mapCenterLat != mapCenter.lat && appConfig.mapCenterLng != mapCenter.lng ) {
				appConfig.mapCenterLat = mapCenter.lat;
				apriCookieBase.setCookie('mapCenterLat', appConfig.mapCenterLat, 31);  //expdays
				appConfig.mapCenterLng = mapCenter.lng;
				apriCookieBase.setCookie('mapCenterLng', appConfig.mapCenterLng, 31);  //expdays
			}
*/
			
		});

		map.on('layeradd',
			function (e) {
				var name = null;
				var _options = e.layer.options;				


				if (e.layer.options) {
					name = e.layer.options.name;
					
					if (e.layer.options.layerType) {

					}


				
					if (e.layer.options.layerType == 'aireasGridGemLayer' && e.layer.options.refreshData == true) {
						e.layer.options.refreshData=false;
						retrievedDateMax = new Date();
						var _date = retrievedDateMax.toISOString();

						if (e.layer.layerControl == null) {
							e.layer.layerControl = [ 
								initLegendCtrl({
									container: 	mapPanes.controlerPane, 
									label: 		aireasDomainsRanges[aireasAvgType].legendLabel + ' - Legenda',
									domain: 	aireasDomainsRanges[aireasAvgType].domain,
									range: 		aireasDomainsRanges[aireasAvgType].range,
									scale: 		aireasDomainsRanges[aireasAvgType].scale
								}),
								initLayerInfoCtrl({
									container: 	mapPanes.controlerPane, 
									ctrlPosition: 'leaflet-top leaflet-right'		
								})


							];

							e.layer.layerControl[0].initControl();
							e.layer.layerControl[1].initControl();
						} else {
							if (e.layer.layerControl) {
								if ( Object.prototype.toString.call( e.layer.layerControl ) === '[object Array]' ) {
									for (var i=0;i<e.layer.layerControl.length;i++) {
										e.layer.layerControl[i].show();
									}
								} else {
									e.layer.layerControl.show();
								}
							}

						}
					
						loadDataAireasGridGemLayer(e.layer, {retrievedDateMax:_date, avgType: e.layer.options.avgType}); //'2014-12-10T23:50:05.376Z'); toISOString
						
						//window.setTimeout(function(){
						window.setInterval(function(){
							//e.layer.clearLayers();
							retrievedDateMax = new Date();
							var _date = retrievedDateMax.toISOString();
							loadDataAireasGridGemLayer(e.layer, {retrievedDateMax:_date, avgType: e.layer.options.avgType}); //'2014-12-10T23:50:05.376Z'); toISOString
					//		layer.addData(retrievedDateCache[i].data);
					//		layer.layerControl[0].setActiveDateTime(retrievedDateMax, '(cache)');  //timeSliderCtrl
							//if (options.next) {
							//	var _newDate = new Date(new Date(retrievedDateMax).getTime()+ 600000);  // +10 minutes for next measure, no need for extra marge here
							//	//console.log('retrieveddate next : ' + _newDate.toISOString());
							//	playSliderMovie(layer, _newDate, options.avgType);
							//}
						}, 60000);
					
					
					}


					if (e.layer.options.infoCtrl) {
						if (e.layer.layerControl == null) {
							e.layer.layerControl = initLayerInfoCtrl({type: "infoCtrl", url: e.layer.options.infoCtrl} );
						}		
					}

					if (e.layer.options.legendPng) {
						if (e.layer.layerControl == null) {
							e.layer.layerControl = initLayerCtrl({type: "legendPgn", url: e.layer.options.legendPng} );
						}		
					}
					
					if (e.layer.options.zoomTo) {
						map.setZoom(e.layer.options.zoomTo);
					}



				}
			}
		);
		map.on('overlayadd',
			function (e) {
				var name = e.layer.options.name;
				var _options = e.layer.options;



				if (e.layer.options.layerType == 'aireasMeetkastenLayer' && e.layer.options.refreshData == true) {
					e.layer.options.refreshData=false;
					e.layer.options.loadDataOnce();
				}
				
				if (e.layer.layerControl) {
					if ( Object.prototype.toString.call( e.layer.layerControl ) === '[object Array]' ) {
						e.layer.layerControl[0].show();
						e.layer.layerControl[1].show();
					} else {
						e.layer.layerControl.show();
					}
				}


			}
		);
		
		map.on('layerremove', function(e) {

			if (e.layer.options) {

				if (e.layer.options.layerType) {

				}

			}

			
			if (e.layer.layerControl) {
				if ( Object.prototype.toString.call( e.layer.layerControl ) === '[object Array]' ) {
					e.layer.layerControl[0].hide();
					e.layer.layerControl[1].hide();
				} else {
					e.layer.layerControl.hide();
				}
			}
  
		});
		
		
	};



	function formatLocalDate(inpDate) {
		var testje = inpDate.toISOString();
    	var now = new Date(inpDate.getTime()),
        	tzo = -now.getTimezoneOffset(),
        	dif = tzo >= 0 ? '+' : '-',
        	pad = function(num) {
            	var norm = Math.abs(Math.floor(num));
            	return (norm < 10 ? '0' : '') + norm;
        	};
    	return now.getFullYear()
       	 	+ '-' + pad(now.getMonth()+1)
       	 	+ '-' + pad(now.getDate())
       	 	+ 'T' + pad(now.getHours())
       	 	+ ':' + pad(now.getMinutes())
       	 	+ ':' + pad(now.getSeconds())
			+ '.000Z'
//       	 	+ dif + pad(tzo / 60)
//        	+ ':' + pad(tzo % 60);
	}


	var aireasDomainsRanges = {
		'SPMI': { 
			domainStrict: [ 0,	14,	34,	61,	95,	100 ],  // 0=lowest value, 100=max value
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ 0,7,10,	14,20,27,	34,48,	61,68,	95,	100 ],  // 0=lowest value, 100=max value
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'SPMI'
		},
		'PM1': { 
			domainStrict: [ 0,	14,	34,	61,	95,	100 ],  // 0=lowest value, 100=max value
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ 0,7,10,	14,20,27,	34,48,	61,68,	95,	100 ],  // 0=lowest value, 100=max value
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'PM1'
		},
		'PM25': { 
			domainStrict: [ 0,	20,	50,	90,	140,	170 ],  // 0=lowest value, 170=max value
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ 0,10,15,	20,30,40,	50,70,	90,100,	140,	170 ],  // 0=lowest value, 170=max value
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'PM2.5'
		},
		'PM10': { 
			domainStrict: [ 0,	30,	75,	125,	200,	250 ],  // 0=lowest value, 250=max value
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ 0,10,20,	30,45,60,	75,100,	125,150,	200,	250 ],  // 0=lowest value, 250=max value
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'PM10'
		},
		'UFP': { 
			domainStrict: [ 0,	6,	15,	25,	40,	60 ],  // 0=lowest value, 60000=max value  in units of 1000 particals
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ 0,2,4,	6,9,12,	15,20,	25,30,	40,	60 ],  // 0=lowest value, 60000=max value  in units of 1000 particals
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'UFP (x1000)'
		},
		'OZON': { 
			domainStrict: [ 0,	40,	100,	180,	240,	300 ],  // 0=lowest value, 100=max value
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ 0,15,30,	40,60,80,	100,140,	180,200,	240,	300 ],  // 0=lowest value, 100=max value
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'Ozon'
		},
		'HUM': { 
			domainStrict: [ 0,	30,	50,	70,	90,	100 ],  // 0=lowest value, 100=max value
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ 0,10,20,	30,37,44,	50,60,	70,80,	90,	100 ],  // 0=lowest value, 100=max value
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'Humidity'
		},
		'CELC': { 
			domainStrict: [ -10,	0,	10,	20,	30,	40 ],  // 0=lowest value, 100=max value
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ -10,7,4,	0,4,7,	10,15,	20,25,	30,	40 ],  // 0=lowest value, 100=max value
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'Celsius'
		},
		'NO2': { 
			domainStrict: [ 0,	30,	75,	125,	200,	250 ],  // 0=lowest value, 250=max value
			rangeStrict: [ '#139FEB',
					'#139FEC',
					'#EFDF6D',	
					'#FDAB33',
					'#FC0008',
					'#5C198E'
				],
			domainSpecial: [ 0,10,20,	30,45,60,	75,100,	125,150,	200,	250 ],  // 0=lowest value, 250=max value
			rangeSpecial: [ '#139FEB',
					'#139FEC','#43CFEC','#73EFEC',   //'#00FFDD',
					'#EFDF6D','#FFFF0D','#FFEE00',	
					'#FDAB33','#FD6B33',
					'#FC0008','#DD0000',
					'#5C198E','#5C198E'
				],				
			domainGroups: 5,	
			domain: null,
			range: null,
			scale: null,
			scaleQuantize: null, 	
			scaleLinear: null,
			legendLabel: 'NO2'
		}
	}
	

		var initDomainsRanges = function() { 
			aireasDomainsRanges[aireasAvgType].domain = aireasDomainsRanges[aireasAvgType].domainSpecial;
			aireasDomainsRanges[aireasAvgType].range  = aireasDomainsRanges[aireasAvgType].rangeSpecial;

			aireasDomainsRanges[aireasAvgType].scaleQuantize = d3.scale.quantize()
				.domain(aireasDomainsRanges[aireasAvgType].domainSpecial)
				.range (aireasDomainsRanges[aireasAvgType].rangeSpecial);
			aireasDomainsRanges[aireasAvgType].scaleLinear = d3.scale.linear()
				.domain(aireasDomainsRanges[aireasAvgType].domain)
				.range (aireasDomainsRanges[aireasAvgType].range);
			aireasDomainsRanges[aireasAvgType].scaleThreshold = d3.scale.threshold()
				.domain(aireasDomainsRanges[aireasAvgType].domain)
				.range (aireasDomainsRanges[aireasAvgType].range);
				
			aireasDomainsRanges[aireasAvgType].scale  = aireasDomainsRanges[aireasAvgType].scaleThreshold;
	
		}


		var startStddevA, startStddevB, startStddevC,
			scaleStddevA,
			startAvgA, startAvgB, startAvgC, startAvgD, startAvgE, startAvgF,
			scaleAvgA;

		var initDomainsRangesScales = function() {  // conform RIVM schema voor PM1


			
			startStddevA 	= 7;
			startStddevB 	= 8;
			startStddevC 	= 9;
			scaleStddevA 	= d3.scale.quantize()
				.domain([startStddevA,startStddevB, startStddevC])
				.range(['#9999FF','#4444FF','#0000FF']);

			startAvgA 	= 11;
			startAvgB 	= 13;
			startAvgC 	= 15;
			startAvgD 	= 16;
			startAvgE 	= 17;
			startAvgF 	= 18;
			scaleAvgA 	= d3.scale.quantize()
				.domain([startAvgA,startAvgB, startAvgC, startAvgD, startAvgE, startAvgF])
				.range(['#FFFFFF','#DDFFDD','#AAFFAA','#77FF77','#44FF44','#00FF00']);

		}

	var createLayerClasses = function(layer) {
		if (layer == 'aireasGridGemLayer') {
		// first experimental layer for testing:
		layerClasses['aireasGridGemLayer'] = {};
		layerClasses['aireasGridGemLayer'].layerClass = function() {
			var layerObject = new L.geoJson(null, {
				layerType:"aireasGridGemLayer"
				, avgType: aireasAvgType
				, style: function (feature) {
					var color="#000000";
					var fillOpacity = 0.4;
					var cr=0;
					var cy=0;
					var cg=0;
					var r = 0;
					var g = 0;
					var b = 0;
					///var valueRounded = Math.round(feature.properties.avg_pm_all_hr*10)/10;
					var valueRounded = feature.properties.avg_avg; //Math.round(feature.properties.avg_avg*10)/10;
								
					color = aireasDomainsRanges[aireasAvgType].scale(valueRounded);
				
					if (valueRounded == 0) {
						fillOpacity = 0.1;
					} else {
						fillOpacity = 0.8 + (valueRounded%2)/10;  // domainGroups ; //0.8;
					}
				
					var opacity = 0.6; //line opacity
        			return {color: '#888', opacity:opacity, weight:1, fillColor:color, fillOpacity:fillOpacity};
    			}
				, onEachFeature:onEachAireasGridGemFeature
				, pointToLayer: function (feature, latlng) {
					return L.marker(latlng, { icon: trainIcon} );
				}
				, refreshData:true
				//, loadDataOnce:

			});

			return layerObject;
		}
		}
	}

		var createAireasGridGemLayer = function() {
		aireasGridGemLayer = new L.geoJson(null, {
			  layerType:"aireasGridGemLayer"
			, avgType: aireasAvgType  
			, style: function (feature) {
				var color="#000000";
				var fillOpacity = 0.4;
				var cr=0; 
				var cy=0;
				var cg=0;
				var r = 0;
				var g = 0;
				var b = 0;
				///var valueRounded = Math.round(feature.properties.avg_pm_all_hr*10)/10;
				var valueRounded = feature.properties.avg_avg; //Math.round(feature.properties.avg_avg*10)/10;
				
//				var red=false, yellow=false, green=false;
//				if (valueRounded > 0 && valueRounded<7) green = true;
//				if (valueRounded >= 7 && valueRounded<10) yellow = true;
//				if (valueRounded >= 10) red = true;
				
/*
				if (valueRounded >= startA && valueRounded < startB) {
					color = scaleA(valueRounded);
					fillOpacity = 0.7; //0.6;
				} 
				if (valueRounded >= startB && valueRounded < startC) {
					color = scaleB(valueRounded);
					fillOpacity = 0.8; //0.7;
				} 
				if (valueRounded >= startC ) {
					color = scaleC(valueRounded);
					fillOpacity = 0.8; //0.8;
				} 
*/
				
				color = aireasDomainsRanges[aireasAvgType].scale(valueRounded);
				
				if (valueRounded == 0) {
					fillOpacity = 0.1;
				} else {
					fillOpacity = 0.8 + (valueRounded%2)/10;  // domainGroups ; //0.8;
				}
				
				var opacity = 0.6; //line opacity
        		return {color: '#888', opacity:opacity, weight:1, fillColor:color, fillOpacity:fillOpacity};
    			}
			, onEachFeature:onEachAireasGridGemFeature
			, pointToLayer: function (feature, latlng) {
				return L.marker(latlng, { icon: trainIcon} );
				}
			, refreshData:true
			//, loadDataOnce: 

		});
		};

		function loadDataAireasGridGemLayer(layer, options) {
			//var _tmpDate1 = new Date(retrieveddatemax);
			
			for (var i=0; i<retrievedDateCache.length;i++) {
				var cacheTime = retrievedDateCache[i].retrievedDateDate.getTime();
				var targetTime = new Date(options.retrievedDateMax).getTime()+(aireasTime*60000);
				var diff = cacheTime - targetTime;
				if (diff > -600000) return;
//				if (diff > -480000 && diff < 480000) {  //less than 9min = hit
//					retrievedDateMax = retrievedDateCache[i].retrievedDate;
					//console.log('retrieveddate (cache/hit): ' + retrievedDateMax + ' '+options.retrievedDateMax);
/*
					window.setTimeout(function(){
						layer.clearLayers();
						layer.addData(retrievedDateCache[i].data);
						//layer.layerControl[0].setActiveDateTime(retrievedDateMax, '(cache)'); 
//						if (options.next) {
//							var _newDate = new Date(new Date(retrievedDateMax).getTime()+ 600000);  // +10 minutes for next measure, no need for extra marge here
//							//console.log('retrieveddate next : ' + _newDate.toISOString());
//							playSliderMovie(layer, _newDate, options.avgType);
//						}
					}, 200);
*/
//					return;					
//				}
			}
			
			var retrievedDatePlusMargeIso = new Date(new Date(options.retrievedDateMax).getTime()+60000+(aireasTime*60000) ).toISOString();  //aireasTime = back in time in -minutes
			
//			ajaxGetData(APRI.getConfig().urlSystemRoot +
			ajaxGetData( siteAireas +
				 "/data/aireas/getAireasGridGemInfo/*?retrieveddatemax=" +
				 retrievedDatePlusMargeIso + '&avgType=' + options.avgType ,
				function(data) {
					var _data = JSON.parse(data);
					if (_data.length == 0 ) return; 
					var _retrievedDate = _data[0].properties.retrieveddate;

					var _retrievedDateCacheRecord={};
					_retrievedDateCacheRecord.data = _data;
					_retrievedDateCacheRecord.retrievedDate = _retrievedDate;
					_retrievedDateCacheRecord.retrievedDateDate = new Date(_retrievedDate);
					retrievedDateCache.push(_retrievedDateCacheRecord);  // store in cache
					//console.log('retrieveddate (new cache): ' + _retrievedDate);
					
						
//					retrievedDateMax = _retrievedDate; //_retrievedDate?_retrievedDate:options.retrievedDateMax;
					layer.clearLayers();
					layer.addData(_data);
					var _tmpDate = new Date(Date.parse(_retrievedDate));
					var _dateFormatted = moment(_tmpDate).format('YYYY/MM/DD HH:mm'); //new Date(properties.avg_pm1_hr);
					layer.layerControl[1].setInfoCtrlItemHtml('Date and time of measurement ' + options.avgType + ' is ' + _dateFormatted );

					//layer.layerControl[0].setActiveDateTime(_retrievedDateCacheRecord.retrievedDateDate, '(db)'); //timeSliderCtrl

/*
					if (options.next) {
						var _newDate = new Date(new Date(options.retrievedDateMax).getTime()+ 600000);  // +10 minutes for next measure, no need for extra marge here
						//console.log('retrieveddate next : ' + _newDate.toISOString());
						window.setTimeout(function(){
							playSliderMovie(layer, _newDate, options.avgType);
						}, 200);
					}
*/
				}
			)
		}

        function onEachAireasGridGemFeature (feature, layer) {
            // does this feature have a property named popupContent?
			
			var _tmpDate = new Date(Date.parse(feature.properties.retrieveddate));
			var _dateFormatted = moment(_tmpDate).format('YYYY/MM/DD HH:mm'); //new Date(properties.avg_pm1_hr);
			var _data = [
				['Datum', _dateFormatted],
				[feature.properties.avgType, feature.properties.avg_avg]
				//	['PM1', properties.avg_pm1_hr],
				//	['PM2.5', properties.avg_pm25_hr],
				//	['PM10', properties.avg_pm10_hr],
				//	['PM Overall', properties.avg_pm_all_hr]
			];
						
            //if (feature.properties && feature.properties.bu_naam) {
                layer.bindPopup(feature.properties.avg_type + ":&nbsp;" + feature.properties.avg_avg );
            //}
			

			(function(layer, feature, properties) {
				var layerPopup;
				// Create a mouseover event
      			layer.on("mouseover", function (e) {
					//console.log('mouseover'+feature.properties.cell_x + ' ' +feature.properties.cell_y);
					
/*
					var _popupInfoCtrlTr = popupInfoCtrl
						.getTableContainer()
						//.append("table") // = d3.select('#'+popupInfoCtrl.id).select('.popupinfo-text');
						.selectAll('tr')
						.data(_data);
						
					_popupInfoCtrlTr	
						.enter()
						.append("tr");
					_popupInfoCtrlTr	
						.exit()
						.remove();
						
					var td = _popupInfoCtrlTr.selectAll("td")
						.data(function(d) { 
							return d;
							});
					td	
						.enter().append("td")
						.text(function(d) { 
							return d;});	
					td	
						.exit()
						.remove();		
										
*/						
						// .selectAll('.popupinfo-text');
					e.target.setStyle({
						//fillOpacity: 0.8, 
						opacity: 0.8, color:'#000'
						});

					
					//var latLng = e.layer.feature.getLatLng();
					var coordinates = e.target.feature.geometry.coordinates;
    				var swapped_coordinates = [coordinates[1], coordinates[0]];  //Swap Lat and Lng
    			//	if (map) {
       					layerPopup = L.popup({'offset': L.point(5,-40)})
           					//.setLatLng(swapped_coordinates)
							.setLatLng(e.latlng)
           					.setContent(''+e.target.feature.properties.avg_type+':&nbsp;'+ e.target.feature.properties.avg_avg)
            				.openOn(map);
    			//	};


/*
        			// Change the style to the highlighted version
        	//		layer.setStyle(highlightStyle);
        			// Create a popup with a unique ID linked to this record
					var popup 	= document.createElement('div');
					popup.id 	= 'popup-x' + properties.cell_x + '-y' + properties.cell_y;
					popup.style.position = 'absolute';
					popup.style.bottom = '150px';
					popup.style.left = '140px';
					popup.style.zIndex = 1002;
					popup.style.backgroundColor = 'white';
					popup.style.padding = '8px';
					popup.style.border = '1px solid #ccc';
        			// Insert a headline into that popup
					var head = document.createElement('div');
					var _innerHtml = "<div>Uur gemiddelde:</div>" + _dateFormatted + '<BR/>' + //todo
						properties.avg_type + ": " + properties.avg_avg;

//						"PM1: " + properties.avg_pm1_hr + '<BR/>' +
//						"PM2.5: " + properties.avg_pm25_hr + '<BR/>' +
//						"PM10: " + properties.avg_pm10_hr + '<BR/>' +
//						"PM All: " + properties.avg_pm_all_hr + '<BR/>' +
//						"cell: (" + properties.cell_x + ',' + properties.cell_y+ ')';
					//var textNode = document.createTextNode(_text);
					//head.appendChild(textNode);
					head.innerHTML = _innerHtml;
					head.style.fontSize = '14px';
					head.style.marginBottom = '3px';
					//head.appendTo(popup);
					popup.appendChild(head);

        			// Add the popup to the map
        			//popup.appendTo("#map");
//        			popup.appendTo("#"+this.apriFormContainerId + '-leafletjs-container');
        			//popup.appendTo("#"+map._container.id);

					//var container = document.getElementById("#"+map._container.id)
					mapPanes.popupPane.appendChild(popup);
*/					
					
				});
      			// Create a mouseout event that undoes the mouseover changes
      			layer.on("mouseout", function (e) {
					//console.log('mouseout');			
					var _data = [
					]

					if (layerPopup && map) {
        				map.closePopup(layerPopup);
        				layerPopup = null;
    				}
/*
					var _popupInfoCtrlTr = popupInfoCtrl
						.getTableContainer()
						//.append("table") // = d3.select('#'+popupInfoCtrl.id).select('.popupinfo-text');
						.selectAll('tr')
						.data(_data);
					_popupInfoCtrlTr	
						.exit()
						.remove();	
						
*/												
					//var _style = e.target.options.style(e.target.feature);
					
					//if (e.layer.resetStyle) {
					//	e.layer.resetStyle(e.target);
					//}
					e.target.setStyle({
						//fillOpacity: 0.8, 
						opacity: 0.6, color:'#888'
					});					
					
					//aireasGridGemLayer.resetStyle(e.target); //e.layer.options.style(e.target.feature));
        			// Start by reverting the style back
        	//		layer.setStyle(defaultStyle);
        			// And then destroying the popup
//					document.getElementById('popup-x' + properties.cell_x + '-y' + properties.cell_y).remove();
      			});
      			// Close the "anonymous" wrapper function, and call it while passing
      			// in the variables necessary to make the events work the way we want.
			})(layer, feature);
        }




	function ajaxGetData(url, callback ) {
		var xmlhttp;
		xmlhttp=new XMLHttpRequest();
		xmlhttp.onreadystatechange=function() {
  			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
				callback(xmlhttp.responseText);
			}
  		}
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
	}



	function initLayerCtrl(options) {
		var layerCtrl = new ApriLeafLetCtrlBase();
		layerCtrl.initControl(options);
		return layerCtrl;
	};


	function initLayerInfoCtrl(options) {
//		var layerCtrl = new ApriCore.ApriLeafLetCtrlInfoCtrl();
		var layerCtrl = new ApriLeafLetCtrlInfoCtrl(options);
		layerCtrl.initControl(options);
		return layerCtrl;
	};

	function initLegendCtrl(options) {
		var layerCtrl = new ApriD3Legend(options);
		return layerCtrl;
	};






});
// ApriAppLeaflet Class end ===============================================================================


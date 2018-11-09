firebase.initializeApp({
	apiKey: "AIzaSyCtelexWMdg5DnugUNbtX5gvrbPkmmG-OU",
	authDomain: "fleet-utem.firebaseapp.com",
	databaseURL: "https://fleet-utem.firebaseio.com",
	projectId: "fleet-utem",
	storageBucket: "fleet-utem.appspot.com",
	messagingSenderId: "414961957088"
});

var app = null;
var db = firebase.firestore();
db.settings({timestampsInSnapshots: true});

db.enablePersistence().then(function() {
	db.collection("config").doc("config").get().then(doc => {
		app = new Vue({
			el: '#app',
			data: {
				page: null,
				lov: {
					vehicleType: [],
				},
				list: {
					driver: [],
					smartphone: [],
					vehicle: [],
					maintenance: [],
				},
				modal: {
					driver: {},
					smartphone: {},
					vehicle: {},
					maintenance: {},
				},
				gmap: {
					map: null,
					zoom: doc.data().mapZoom,
					center: new google.maps.LatLng(doc.data().mapCenter.latitude, doc.data().mapCenter.longitude),
					bounds: null,
					search: '',
					markers: [],
					init: function() {
						app.$nextTick(function () { //nie nak buang
							if (window['google'] && !app.gmap.map) {
								
								//================================================================================================ init map
								app.gmap.map = new google.maps.Map(document.getElementById('gmap'), {
									zoom: app.gmap.zoom,
									center: app.gmap.center,
									gestureHandling: 'greedy',
									//maxZoom: 18,
								});

								//================================================================================================ map event listener
								app.gmap.map.addListener("rightclick", function(event) {
									console.log(event.latLng.lat().toFixed(6)+','+event.latLng.lng().toFixed(6));
								});

								//app.gmap.eventListener();
								//app.gmap.update();
								
								//================================================================================================ get fleet
								db.collection("current").onSnapshot(function(docs) {
									
									//============================================================================================ plot fleet
									docs.forEach(function(doc) {
											
										var foundMarker = app.gmap.markers.filter(marker => { return marker.v_registration === doc.id });
										if(foundMarker.length) {
											foundMarker.setPosition(new google.maps.LatLng(doc.data().location.latitude, doc.data().location.longitude));
										}
										else {
											app.gmap.markers.push(
												new google.maps.Marker({
													position: {
														lat: doc.data().location.latitude,
														lng: doc.data().location.longitude,
													},
													icon: {
														url: 'img/pin_fleet_'+doc.data().type+'.svg',
														size: new google.maps.Size(50, 80),
														scaledSize: new google.maps.Size(50, 80),
														anchor: new google.maps.Point(26, 73)
													},
													map: app.gmap.map,
													title: 'REG_'+doc.id,
													v_registration: doc.id
												})
											);
										}
									});
									
									console.log("Masa mula: ", app.gmap.markers);
									
									//============================================================================================ display fleet's v_registration and attach click event
									$('[title^=REG_]:first').siblings().not('[title^=REG_]').remove();
									$('[title^=REG_]:first').parent().siblings().remove();
									$('[title^=REG_]').each(function(){
										$(this)
											.attr('v_registration', $(this).attr('title').replace('REG_',''))
											.removeAttr('title').click(function(){
												console.log($(this).attr('v_registration'));
											});
									});
								});
								
							}
							else if (!window['google']) {
								setTimeout(app.gmap.init, 100);
							}
						});
					},
					update_zzz: function(fitBounds) {
						if (window['google']) {
							$.getJSON("api/getVehicleLocation.php", {
								filterByType: "'"+app.lov.vehicleType.filter(item => item.show).map(function(item, i) { return item.code }).join("','")+"'",
								filterBySearch: app.gmap.search
							}, function(data){
								app.gmap.bounds = new google.maps.LatLngBounds();
								var markers = data.vehicle_location.map(function(item, i) {

									app.gmap.bounds.extend(new google.maps.LatLng(
										Number(item.vl_location.split(',')[0]),
										Number(item.vl_location.split(',')[1])
									));

									return new google.maps.Marker({
										position: {
											lat: Number(item.vl_location.split(',')[0]),
											lng: Number(item.vl_location.split(',')[1])
										},
										icon: {
											url: 'img/pin_fleet_'+item.code+'.svg',
											size: new google.maps.Size(50, 80),
											scaledSize: new google.maps.Size(50, 80),
											anchor: new google.maps.Point(26, 73)
										},
										map: app.gmap.map,
										title: 'REG_'+item.v_registration
									});

								});

								app.gmap.markerCluster.clearMarkers();
								app.gmap.markerCluster = new MarkerClusterer(app.gmap.map, markers, {imagePath: 'img/m'}); //add new markers

								//only fit to boundaries if being called by user not auto update. Otherwise it will interupt when user panning
								if(fitBounds) app.gmap.fitBounds();
							});
						}
					},
					eventListener_zzz: function() {
						if(app.page=='map') {
							$('[title^=REG_]:first').siblings().not('[title^=REG_]').remove();
							$('[title^=REG_]:first').parent().siblings().remove();
							$('[title^=REG_]').each(function(){
								$(this)
									.attr('v_registration', $(this).attr('title').replace('REG_',''))
									.removeAttr('title').click(function(){
										console.log($(this).attr('v_registration'));
									});
							});
						}
						setTimeout(app.gmap.eventListener, 250);
					},
					centerMap: function() {
						app.gmap.map.setZoom(app.gmap.zoom);
						app.gmap.map.panTo(app.gmap.center);
					}
				}
			},
			methods: {
				login: function() {
					this.page = window.location.hash = 'map';
				},
				showInMap: function(v_registration) {
					this.gmap.search = v_registration;
					
					var foundMarkers = app.gmap.markers.filter(marker => { return marker.v_registration.toUpperCase().indexOf(v_registration.toUpperCase())>-1 });
					app.gmap.bounds = new google.maps.LatLngBounds();
					for(i=0; i<foundMarkers.length; i++ ) app.gmap.bounds.extend(foundMarkers[i].position);

					if(!app.gmap.bounds.isEmpty()) {
						app.gmap.map.fitBounds(app.gmap.bounds);
					
						var listener = google.maps.event.addListener(app.gmap.map, "idle", function() { 
							if(app.gmap.map.getZoom() > app.gmap.zoom) app.gmap.map.setZoom(app.gmap.zoom); 
							google.maps.event.removeListener(listener); 
						});
					}

					this.page = window.location.hash = 'map';
				},
				getLov: function() {
					var _this = this;
					
					db.collection("lov").doc("vehicleType").collection("vehicleType").onSnapshot(function(docs) {
						docs.forEach(function(doc) {
							_this.lov.vehicleType.push({...doc.data(), ...{show:true}});
						});
					});
				},
				generateQr: function(uuid) {
					UIkit.modal.alert(
						'<canvas id="qr"></canvas>'+
						'<div class="uk-text-large text-purple">'+uuid+'</div>'+
						'<p>To complete the pairing, scan the QR Code from targeted smartphone or send the code to the smartphone and type manually.</p>',
						{ bgClose:true }
					);
					$('#qr').parent().addClass('uk-text-center');
					
					var qr = new QRious({
						element: $('#qr')[0],
						value: uuid,
						background: 'white', // background color
						foreground: 'black', // foreground color
						backgroundAlpha: 1,
						foregroundAlpha: 1,
						level: 'L', // Error correction level of the QR code (L, M, Q, H)
						mime: 'image/png', // MIME type used to render the image for the QR code
						size: 150, // Size of the QR code in pixels.
						padding: null // padding in pixels
					});
					
					this.getActivationStatus(uuid);
				},
				getActivationStatus: function(uuid) {
					var _this = this;
					$.getJSON("api/getActivationStatus.php?uuid="+uuid, function(data){
						if(data.status=='ok') {
							_this.crudSmartphone('get');
							$('.uk-modal-close:visible').click();
						}
						else setTimeout(function(){ _this.getActivationStatus(uuid) }, 2000);
					});
				},
				crudDriver: function(operation, deleteId) {
					var _this = this;
					$.getJSON("api/crudDriver.php?operation="+operation+"&deleteId="+deleteId, _this.modal.driver, function(data){
						_this.list.driver = data.driver;
						$('#modal-driver .uk-modal-close').click();
					});
				},
				crudSmartphone: function(operation, deleteId) {
					var _this = this;
					$.getJSON("api/crudSmartphone.php?operation="+operation+"&deleteId="+deleteId, _this.modal.smartphone, function(data){
						_this.list.smartphone = data.smartphone;
						$('#modal-smartphone .uk-modal-close').click();
					});
				},
				crudVehicle: function(operation, deleteId) {
					var _this = this;
					$.getJSON("api/crudVehicle.php?operation="+operation+"&deleteId="+deleteId, _this.modal.vehicle, function(data){
						_this.list.vehicle = data.vehicle;
						$('#modal-vehicle .uk-modal-close').click();
					});
				},
				crudMaintenance: function(operation, deleteId) {
					var _this = this;
					$.getJSON("api/crudMaintenance.php?operation="+operation+"&deleteId="+deleteId, _this.modal.vehicle, function(data){
						_this.list.maintenance = data.maintenance;
						$('#modal-maintenance .uk-modal-close').click();
					});
				},
			},
			mounted: function() {
				var _this = this;

				_this.page = (window.location.hash)?(window.location.hash.replace('#','')):'login';
				
				_this.$nextTick(function () { _this.gmap.init() });

				_this.getLov();
				
				$(document).on('click', '[href^="#"]:not([uk-toggle])', function(){
					window.location.hash = $(this).attr('href');
					_this.page = $(this).attr('href').replace('#', '');
				});
				
				$(document).on('keyup', '[data-inputmask]', function(){
					//$(this).inputmask();
				});
			},
			watch: {
				page: function (newValue, oldValue) {
					var _this = this;
					
					if(newValue=='map') {
						//if(_this.lov.vehicleType) _this.gmap.update();
						//else _this.gmap.updatePending = true;
					}
					else if(newValue=='driver') {
						_this.crudDriver('get');
					}
					else if(newValue=='smartphone') {
						_this.crudSmartphone('get');
						_this.crudDriver('get');
					}
					else if(newValue=='vehicle') {
						_this.crudVehicle('get');
						_this.crudDriver('get');
					}
					else if(newValue=='maintenance') {
						_this.crudMaintenance('get');
					}
					
					_this.$nextTick(function () { 
						_this.page = ($('.uk-navbar-nav .uk-active').length==0 && window.location.hash)?'notfound':_this.page;
						$('body').toggleClass('notfound', _this.page=='notfound');
					});
				}
			}
		});
	});
});
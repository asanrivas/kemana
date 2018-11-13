firebase.initializeApp({
	apiKey: 'AIzaSyCtelexWMdg5DnugUNbtX5gvrbPkmmG-OU',
	authDomain: 'fleet-utem.firebaseapp.com',
	databaseURL: 'https://fleet-utem.firebaseio.com',
	projectId: 'fleet-utem',
	storageBucket: 'fleet-utem.appspot.com',
	messagingSenderId: '414961957088'
});

var app = null;
var db = firebase.firestore();
db.settings({timestampsInSnapshots: true});

Vue.use(VueMask.VueMaskPlugin);

db.enablePersistence().then(function() {
	db.collection('config').doc('config').get().then(doc => {
		app = new Vue({
			el: '#app',
			data: {
				page: null,
				lov: {
					vehicleType: [],
				},
				list: {
					smartphone: [],
					vehicle: [],
					history: [],
				},
				modal: {
					smartphone: {},
					vehicle: {},
				},
				gmap: {
					map: null,
					zoom: doc.data().mapZoom,
					center: doc.data().mapCenter,
					bounds: null,
					search: '',
					markers: [],
					init: function() {
						app.$nextTick(function () { //nie nak buang
							if (window['google'] && !app.gmap.map && app.page=='map') {
								
								//================================================================================================ init map
								app.gmap.map = new google.maps.Map(document.getElementById('gmap'), {
									zoom: app.gmap.zoom,
									center: new google.maps.LatLng(Number(app.gmap.center.split(',')[0]), Number(app.gmap.center.split(',')[1])),
									gestureHandling: 'greedy',
									//maxZoom: 18,
								});

								//================================================================================================ map event listener
								app.gmap.map.addListener('rightclick', function(event) {
									console.log(event.latLng.lat().toFixed(8)+','+event.latLng.lng().toFixed(8));
								});

								//================================================================================================ get fleet
								db.collection('tracking').doc('current').collection('current').where('timestamp', '>', moment().format('YYYYMMDD')+'000000').onSnapshot(function(docs) {
									
									//============================================================================================ plot fleet
									docs.forEach(function(doc) {
										var foundMarker = app.gmap.markers.filter(marker => { return marker.v_registration === doc.id });
										if(foundMarker.length) {
											foundMarker.setPosition(new google.maps.LatLng(Number(doc.data().location.split(',')[0]), Number(doc.data().location.split(',')[1])));
										}
										else {
											app.gmap.markers.push(
												new google.maps.Marker({
													position: {
														lat: Number(doc.data().location.split(',')[0]),
														lng: Number(doc.data().location.split(',')[1]),
													},
													icon: {
														url: 'img/pin_fleet_'+doc.data().type+'.svg',
														size: new google.maps.Size(50, 80),
														scaledSize: new google.maps.Size(50, 80),
														anchor: new google.maps.Point(26, 73)
													},
													map: app.gmap.map,
													title: 'REG|'+doc.id+'|'+doc.data().type,
													v_registration: doc.id,
													v_type: doc.data().type
												})
											);
										}
									});
								});
								
							}
							else {
								setTimeout(app.gmap.init, 100);
							}
						});
					},
					eventListener: function() {
						if(app.page=='map') {
							$('[title^="REG|"]:first').siblings().not('[title^="REG|"]').remove();
							$('[title^="REG|"]:first').parent().siblings().remove();
							$('[title^="REG|"]').each(function(){
								
								var attr = $(this).attr('title').split('|');
								
								$(this)
									.attr('v_registration', attr[1])
									.attr('v_type', attr[2])
									.addClass('marker')
									.removeAttr('title')
									.click(function(){
										console.log($(this).attr('v_registration'));
									});
									
								$(this).find('img').each(function(){
									$('img[src="'+$(this).attr('src')+'"]:first').hide();
								});
							});
						}
						setTimeout(app.gmap.eventListener, 250);
					},
					markerHide: function() {
						if(app) return '|'+app.lov.vehicleType.filter(item => !item.show).map(function(item, i) { return item.code }).join('|')+'|';
						else return '';
					},
					centerMap: function() {
						app.gmap.map.setZoom(app.gmap.zoom);
						app.gmap.map.panTo(new google.maps.LatLng(Number(app.gmap.center.split(',')[0]), Number(app.gmap.center.split(',')[1])));
					},
					showInMap: function(v_registration) {
						app.gmap.search = v_registration;
						
						var show = {};
						for(i=0; i<app.lov.vehicleType.length; i++) show[app.lov.vehicleType[i].code] = app.lov.vehicleType[i].show;
						
						var shownMarkers = app.gmap.markers.filter(marker => {
							return (marker.v_registration.toUpperCase().indexOf(v_registration.toUpperCase())>-1 && show[marker.v_type]);
						});
					
						app.gmap.bounds = new google.maps.LatLngBounds();
						for(i=0; i<shownMarkers.length; i++ ) app.gmap.bounds.extend(shownMarkers[i].position);

						if(!app.gmap.bounds.isEmpty()) {
							app.gmap.map.fitBounds(app.gmap.bounds);
						
							var listener = google.maps.event.addListener(app.gmap.map, 'idle', function() { 
								if(app.gmap.map.getZoom() > app.gmap.zoom) app.gmap.map.setZoom(app.gmap.zoom); 
								google.maps.event.removeListener(listener); 
							});
						}

						app.page = window.location.hash = 'map';
					},
				}
			},
			methods: {
				login: function() {
					this.page = window.location.hash = 'map';
				},
				monitorList: function() {
					var _this = this;
					
					db.collection('lov').doc('vehicleType').collection('vehicleType').onSnapshot(function(docs) {
						app.lov.vehicleType = [];
						docs.forEach(function(doc) {
							app.lov.vehicleType.push({...doc.data(), ...{show:true}});	
						});
					});
					
					db.collection('smartphone').onSnapshot(function(docs) {
						app.list.smartphone = [];
						docs.forEach(function(doc) {
							app.list.smartphone.push({...doc.data(), ...{id:doc.id}});
						});
					});
					
					db.collection('vehicle').onSnapshot(function(docs) {
						app.list.vehicle = [];
						docs.forEach(function(doc) {
							app.list.vehicle.push(doc.data());
						});
					});
				},
				customMask: function(maskType, value) {					
					if(maskType=='name') {
						value = value.replace(
							/\w\S*/g,
							function(txt) {
								return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
							}
						);
						
						value = value.replace(' Bin ', ' bin ').replace(' Binti ', ' binti ').replace(' A/p ', ' A/P ').replace(' A/l ', ' A/L ').replace(/\s+/g, ' ');
						value = value.trim();
					}
					else if(maskType=='location') {
						value = value.replace(/\s+/g, '');
					}
					
					return value;
				},
				addRow: function(type) {
					if(type=='modalVehicle') {
						app.modal.vehicle.checkpoint.push({
							desc: '',
							location: ''
						});
					}
				},
				showHistory: function(v_registration) {
					db.collection('tracking').doc('history').collection(moment().format('YYYY')).doc(v_registration).collection(v_registration).orderBy('timestamp', 'desc').get().then(docs => {
						app.list.history = [];
						docs.forEach(function(doc) {
							app.list.history.push({
								v_registration: v_registration,
								timestamp: moment(doc.data().timestamp, 'YYYYMMDDhhmmss').format('DD/MM/YYYY hh:mm:ssA'),
								speed: doc.data().speed,
								location: doc.data().location
							});
						});
						app.page = 'history';
					});
				},
				// generateQr: function(uuid) {
					// UIkit.modal.alert(
						// '<canvas id="qr"></canvas>'+
						// '<div class="uk-text-large text-purple">'+uuid+'</div>'+
						// '<p>To complete the pairing, scan the QR Code from targeted smartphone or send the code to the smartphone and type manually.</p>',
						// { bgClose:true }
					// );
					// $('#qr').parent().addClass('uk-text-center');
					
					// var qr = new QRious({
						// element: $('#qr')[0],
						// value: uuid,
						// background: 'white', // background color
						// foreground: 'black', // foreground color
						// backgroundAlpha: 1,
						// foregroundAlpha: 1,
						// level: 'L', // Error correction level of the QR code (L, M, Q, H)
						// mime: 'image/png', // MIME type used to render the image for the QR code
						// size: 150, // Size of the QR code in pixels.
						// padding: null // padding in pixels
					// });
					
					// this.getActivationStatus(uuid);
				// },
				// getActivationStatus: function(uuid) {
					// var _this = this;
					// $.getJSON('api/getActivationStatus.php?uuid='+uuid, function(data){
						// if(data.status=='ok') {
							// _this.crudSmartphone('get');
							// $('.uk-modal-close:visible').click();
						// }
						// else setTimeout(function(){ _this.getActivationStatus(uuid) }, 2000);
					// });
				// },
				// crudDriver: function(operation, deleteId) {
					// var _this = this;
					// $.getJSON('api/crudDriver.php?operation='+operation+'&deleteId='+deleteId, _this.modal.driver, function(data){
						// _this.list.driver = data.driver;
						// $('#modal-driver .uk-modal-close').click();
					// });
				// },
				crudSmartphone: function(operation, deleteId) {
					if(operation=='addupdate') {
						// ==============================================================================
						// Notes
						// ==============================================================================
						// Tak perlu check unique phone number sebab boleh 1 phone shared by two people
						// Document IDs generated in Firestore are just client-side keys that are statistically guaranteed to be unique which just boils down to calling AutoId.newId(). To access AutoId.newId(), just call db.collection(collectionName).doc().id

						if(!app.modal.smartphone.id) app.modal.smartphone.id = db.collection('smartphone').doc().id;
						db.collection('smartphone').doc(app.modal.smartphone.id).set(app.modal.smartphone);
					}
					else {
						db.collection('smartphone').doc(deleteId).delete();
					}
					
					$('#modal-smartphone .uk-modal-close').click();
				},
				crudVehicle: function(operation, deleteId) {
					if(operation=='addupdate') {
						// ==============================================================================
						// Notes
						// ==============================================================================
						// Perlu check unique tp tak buat lagi
						
						db.collection('vehicle').doc(app.modal.vehicle.registration).set(app.modal.vehicle);
					}
					else {
						db.collection('vehicle').doc(deleteId).delete();
					}
					
					$('#modal-vehicle .uk-modal-close').click();
				},
			},
			mounted: function() {
				$('#app').removeClass('uk-hidden');
				
				var _this = this;

				_this.page = (window.location.hash)?(window.location.hash.replace('#','')):'login';
				
				_this.$nextTick(function () {
					_this.gmap.init();
					_this.gmap.eventListener();
				});

				_this.monitorList();
				
				$(document).on('click', '[href^="#"]:not([uk-toggle])', function(){
					window.location.hash = $(this).attr('href');
					_this.page = $(this).attr('href').replace('#', '');
				});
			},
			watch: {
				page: function(newValue, oldValue) {
					
					// var _this = this;
					
					// if(newValue=='driver') {
						// _this.crudDriver('get');
					// }
					// else if(newValue=='smartphone') {
						// _this.crudSmartphone('get');
						// _this.crudDriver('get');
					// }
					// else if(newValue=='vehicle') {
						// _this.crudVehicle('get');
						// _this.crudDriver('get');
					// }
					// else if(newValue=='maintenance') {
						// _this.crudMaintenance('get');
					// }
					
					// _this.$nextTick(function () { 
						// _this.page = ($('.uk-navbar-nav .uk-active').length==0 && window.location.hash)?'notfound':_this.page;
						// $('body').toggleClass('notfound', _this.page=='notfound');
					// });
				},
				'gmap.center': function(newValue, oldValue) {
					newValue = newValue.replace(/\s/g,'').split(',')
					db.collection('config').doc('config').set({
						mapCenter: app.gmap.center,
						mapZoom: app.gmap.zoom
					});
				},
				'gmap.zoom': function(newValue, oldValue) {
					db.collection('config').doc('config').set({
						mapCenter: app.gmap.center,
						mapZoom: app.gmap.zoom
					});
				}
			}
		});
	});
});
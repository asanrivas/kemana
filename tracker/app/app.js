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

Number.prototype.toRad = function() {
	return this * Math.PI / 180;
}

Vue.use(VueMask.VueMaskPlugin);

db.enablePersistence().then(function() {
	db.collection('config').doc('config').get().then(doc => {
		app = new Vue({
			el: '#app',
			data: {
				page: null,
				number: null,
				activationCode: localStorage.getItem('JEJAK_ACTIVATION_CODE'),
				intervalUpdatePosition: doc.data().intervalUpdatePosition,
				intervalUpdateSpeed: doc.data().intervalUpdateSpeed,
				intervalUpdateHistory: doc.data().intervalUpdateHistory,
				selectedVehicle: {
					registration: null,
					checkpoint: [],
					type: null
				},
				headingCheckpoint: null,
				tracking: {
					on: false,
					speed: 0,
					current: null,
					previous: null
				},
				list: {
					vehicle: [],
				},
			},
			methods: {
				logout: function() {
					localStorage.removeItem('JEJAK_ACTIVATION_CODE');
					location.reload();
				},
				activate: function() {
					db.collection("smartphone").where('id', '==', app.activationCode).where('number', '==', app.number).get().then(docs => {
						if(docs.size) {
							localStorage.setItem('JEJAK_ACTIVATION_CODE', app.activationCode);
							app.page = 'tracking';
						}
						else {
							UIkit.modal.alert('Activation error. Please check your phone number and activation code.', { bgClose:true });
						}
					});
				},
				monitorList: function() {
					db.collection('vehicle').onSnapshot(function(docs) {
						app.list.vehicle = [];
						docs.forEach(function(doc) {
							app.list.vehicle.push(doc.data());
						});
					});
				},
				watchPosition: function() {
					var app = this;
					
					if(navigator.geolocation) {
						navigator.geolocation.watchPosition(
							function(crnt) {
								app.tracking.current = crnt;
								// app.arrivingCheckpoint();
							},
							app.errorCallback_highAccuracy,
							{ maximumAge:0, timeout:10000, enableHighAccuracy:true }
						);

						setInterval(function(){ app.updatePosition() }, app.intervalUpdatePosition);
						setInterval(function(){ app.updateSpeed() }, app.intervalUpdateSpeed);
						setInterval(function(){ app.updateHistory() }, app.intervalUpdateHistory);
					} else {
						$('#logOnScreen').html('Geolocation is not supported by your phone.');
					}
					
				},
				errorCallback_highAccuracy: function() {
					$('#logSpeed').html('Error '+error.code);
				},
				arrivingCheckpoint: function() {
					if(app.tracking.on && app.tracking.current && app.headingCheckpoint) {
						
						//================================================================== mark previous checkpoint as arrived
						for(i=0; i<Number($('#headingCheckpoint option:selected').attr('index')); i++) {
							app.selectedVehicle.checkpoint[i]['arrived'] = true;
						}
						
						//========================================================================== check current distance to headingCheckpoint
						var d = app.getDistanceInKM(app.tracking.current.coords.latitude, app.tracking.current.coords.longitude, Number(app.headingCheckpoint.split(',')[0]), Number(app.headingCheckpoint.split(',')[1]));
						$('#logD2CP').html(d+' KM');
						
						//========================================================================== 10meter considered arrived
						if(d<0.01) {
							var next = (Number($('#headingCheckpoint option:selected').attr('index'))+1) % app.selectedVehicle.checkpoint.length;
							app.headingCheckpoint = app.selectedVehicle.checkpoint[next].location;
							//$('#headingCheckpoint').prop('selectedIndex', next).change();
						}
					}
				},
				updatePosition: function() {
					if(app.tracking.on && app.tracking.current) {
						
						var data = {
							location: app.tracking.current.coords.latitude+','+app.tracking.current.coords.longitude,
							timestamp: moment().format('YYYYMMDDhhmmss'),
							type: app.selectedVehicle.type
						};
						
						// db.collection('tracking').doc('current').collection('current').doc(app.selectedVehicle.registration).update(data)
						// .catch((error) => {
							// db.collection('tracking').doc('current').collection('current').doc(app.selectedVehicle.registration).set(data)
						// });
					}
				},
				updateSpeed: function() {
					if(app.tracking.on && app.tracking.current) {
						if(app.tracking.previous) {
							
							var distance = app.getDistanceInKM(app.tracking.current.coords.latitude, app.tracking.current.coords.longitude, app.tracking.previous.coords.latitude, app.tracking.previous.coords.longitude);
							app.tracking.speed = (distance/app.intervalUpdateSpeed)*360;
							
							$('#logSpeed').html(app.tracking.speed);
							$('#logDistance').html((distance*1000)+' meter');
							
							// db.collection('tracking').doc('current').collection('current').doc(app.selectedVehicle.registration).update({ speed: app.tracking.speed })
							// .catch((error) => {
								// db.collection('tracking').doc('current').collection('current').doc(app.selectedVehicle.registration).set({ speed: app.tracking.speed })
							// });
						}
						
						app.tracking.previous = {
							coords: {
								latitude: app.tracking.current.coords.latitude,
								longitude: app.tracking.current.coords.longitude
							},
						};
					}
				},
				updateHistory: function() {
					if(app.tracking.on && app.tracking.current) {
						// db.collection('tracking').doc('history').collection(moment().format('YYYY')).doc(app.selectedVehicle.registration).collection(app.selectedVehicle.registration).add({
							// location: app.tracking.current.coords.latitude+','+app.tracking.current.coords.longitude,
							// speed: app.tracking.speed,
							// timestamp: moment().format('YYYYMMDDhhmmss'),
							// type: app.selectedVehicle.type
						// });
					}
				},
				getDistanceInKM: function(lat1, lon1, lat2, lon2) {
					var R = 6371; // Radius of the earth in km
					var dLat = (lat2-lat1).toRad();	// Javascript functions in radians
					var dLon = (lon2-lon1).toRad(); 
					var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon/2) * Math.sin(dLon/2); 
					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
					var d = R * c; // Distance in km
					return d;
				}
			},
			mounted: function() {
				$('#app').removeClass('uk-hidden');
							
				this.page = this.activationCode?'tracking':'welcome';
				
				this.monitorList();
				
				this.watchPosition();
			},
			watch: {
				'selectedVehicle.registration': function(newValue, oldValue) {
					app.selectedVehicle = app.list.vehicle.find(item => { return item.registration === app.selectedVehicle.registration });
				},
			}
		});
	});
});
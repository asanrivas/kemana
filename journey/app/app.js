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

app = new Vue({
	el: '#app',
	data: {
		selectedVehicle: {
			registration: null,
			checkpoint: [],
			type: null
		},
		list: {
			vehicle: [],
		},
		hasSubscribe: false,
		directionsService: null,
	},
	methods: {
		monitorList: function() {
			db.collection('vehicle').get().then(function(docs) {
				app.list.vehicle = [];
				docs.forEach(function(doc) {
					app.list.vehicle.push(doc.data());
				});
			});
		},
		initDirectionService: function() {
			var app = this;
			
			if(window['google']) {
				app.directionsService = new google.maps.DirectionsService;
			}
			else {
				setTimeout(app.initDirectionService, 100);
			}
		},
		monitorVehicleLocation: function() {
			//if(app.hasSubscribe) unsubscribe();
			//app.hasSubscribe = true;
			
			unsubscribe = db.collection('tracking').doc('current').collection('current').doc(app.selectedVehicle.registration).onSnapshot(function(doc1) {			
				app.selectedVehicle.speed = doc1.data().speed;
				app.selectedVehicle.location = doc1.data().location;
				
				db.collection('vehicle').doc(app.selectedVehicle.registration).get().then(function(doc2) {
					app.selectedVehicle.checkpoint = doc2.data().checkpoint;
					app.selectedVehicle.checkpoint.push(1);
					app.selectedVehicle.checkpoint.pop();
					
					var isHeadingCheckpoint = true;
					for(i=0; i<app.selectedVehicle.checkpoint.length; i++) {
						if(!app.selectedVehicle.checkpoint[i].arrived) {
							//var from = isHeadingCheckpoint?doc1.data().location:app.selectedVehicle.checkpoint[i-1].location; //nie kalo nak ETA from checkpoint to checkpoint
							var from = doc1.data().location;
							isHeadingCheckpoint = false;
							app.getETA(from, app.selectedVehicle.checkpoint[i].location, i);
						}
					}
				});
				
			});
		},
		getETA: function(from, to, i) {
			app.directionsService.route({
				origin: from,
				destination: to,
				travelMode: 'DRIVING'
			}, function(response, status) {
				if (status === 'OK') {
					var pickupDuration = i*10; //10 saat setiap kali org naik
					app.selectedVehicle.checkpoint[i].eta = moment('2018-01-01').add(response.routes[0].legs[0].duration.value + pickupDuration, 'seconds').format('HH:mm:ss');
					app.selectedVehicle.checkpoint.push(1);
					app.selectedVehicle.checkpoint.pop();
				} else {
					window.alert('Directions request failed due to ' + status);
				}
			});
			
			// This API can only be called from server or directly using browser. Ajax call will return CORS even hosted on https
			//$.get("https://maps.googleapis.com/maps/api/directions/json?origin="+from+"&destination="+to+"&key=AIzaSyAuK6RCR8833Ei9sbZ5Y7it9ananiJxYSg", function(data){
			//	return data.routes[0].legs[0].duration.text;
			//});
		},
		// accumulateETA: function(index) {
			// var sum = 0;
			// for(i=0; i<index+1; i++) {
				// sum += app.selectedVehicle.checkpoint[i].eta;
			// }
			
			// sum = moment('2018-01-01').add(sum, 'seconds').format('HH:mm:ss');
			// console.log(sum);
			// return moment('2018-01-01').add(sum, 'seconds').format('HH:mm:ss');
		// }
	},
	mounted: function() {
		$('#app').removeClass('uk-hidden');
		this.monitorList();
		this.initDirectionService();
	},
	watch: {
		'selectedVehicle.registration': function(newValue, oldValue) {
			app.selectedVehicle = app.list.vehicle.find(item => { return item.registration === app.selectedVehicle.registration });
			app.monitorVehicleLocation();			
		},
	}
});
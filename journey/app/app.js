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
	},
	methods: {
		monitorList: function() {
			db.collection('vehicle').onSnapshot(function(docs) {
				app.list.vehicle = [];
				docs.forEach(function(doc) {
					app.list.vehicle.push(doc.data());
				});
			});
		},
		getETA: function(from, to) {
			$.get("https://maps.googleapis.com/maps/api/directions/json?origin="+from+"&destination="+to+"&key=AIzaSyAuK6RCR8833Ei9sbZ5Y7it9ananiJxYSg", function(data){
				return data.routes[0].legs[0].duration.text;
			});
		}
	},
	mounted: function() {
		$('#app').removeClass('uk-hidden');
		this.monitorList();
	},
	watch: {
		'selectedVehicle.registration': function(newValue, oldValue) {
			app.selectedVehicle = app.list.vehicle.find(item => { return item.registration === app.selectedVehicle.registration });
			
			//====================================================== calculate ETA
			if(app.hasSubscribe) unsubscribe();
			app.hasSubscribe = true;
			unsubscribe = db.collection('tracking').doc('current').collection('current').doc(app.selectedVehicle.registration).onSnapshot(function(doc) {
				var isHeadingCheckpoint = true;
				for(i=0; i<app.selectedVehicle.checkpoint.length; i++) {
					if(!app.selectedVehicle.checkpoint[i].arrived) {
						var from = isHeadingCheckpoint?doc.data().location:app.selectedVehicle.checkpoint[i-1].location;
						isHeadingCheckpoint = false;
						app.selectedVehicle.checkpoint[i].eta = app.getETA(from, app.selectedVehicle.checkpoint[i].location);
					}
				}
			});
		},
	}
});
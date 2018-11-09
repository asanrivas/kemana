app = new Vue({
	el: '#app',
	data: {
		page: null,
		lov: {},
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
			zoom: 15,
			center: '2.3138884,102.3211577',
			bounds: null,
			search: '',
			markerCluster: { clearMarkers: function(){} },
			init: function() {
				app.$nextTick(function () {
					if (window['google'] && !app.gmap.map) {
						app.gmap.map = new google.maps.Map(document.getElementById('gmap'), {
							zoom: app.gmap.zoom,
							center: new google.maps.LatLng(app.gmap.center.split(',')[0],app.gmap.center.split(',')[1]),
							gestureHandling: 'greedy',
							//maxZoom: 18,
						});

						app.gmap.map.addListener("rightclick", function(event) {
							console.log(event.latLng.lat().toFixed(6)+','+event.latLng.lng().toFixed(6));
						});

						app.gmap.eventListener();
						app.gmap.update();
					}
					else if (!window['google']) {
						setTimeout(app.gmap.init, 100);
					}
				});
			},
			update: function(fitBounds) {
				if (window['google']) {
					$.getJSON("api/getVehicleLocation.php", {
						filterByType: "'"+app.lov.vehicle_type.filter(item => item.show).map(function(item, i) { return item.lvt_code }).join("','")+"'",
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
									url: 'img/pin_fleet_'+item.lvt_code+'.svg',
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
			eventListener: function() {
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
				app.gmap.map.panTo(new google.maps.LatLng(app.gmap.center.split(',')[0],app.gmap.center.split(',')[1]));
			},
			fitBounds: function() {
				if (app.gmap.bounds.isEmpty()) app.gmap.centerMap();
				else app.gmap.map.fitBounds(app.gmap.bounds);
			}
		}
	},
	methods: {
		login: function() {
			this.page = window.location.hash = 'map';
		},
		showInMap: function(v_registration) {
			this.gmap.search = v_registration;
			this.gmap.update(1);
			this.page = window.location.hash = 'map';
		},
		getLov: function() {
			var _this = this;
			$.getJSON("api/getLov.php", function(data){
				_this.lov = data;
				if(_this.gmap.updatePending) _this.gmap.update();
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
				if(_this.lov.vehicle_type) _this.gmap.update();
				else _this.gmap.updatePending = true;
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

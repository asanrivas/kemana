app = new Vue({
	el: '#app',
	data: {
		apiurl: '//demo.ansi.com.my/fleet/api/',
		page: 'welcome',
		uuid: localStorage.getItem('FLEET_UUID'),
		qr: {			
			scan: function(node) {
				var reader = new FileReader();
				reader.onload = function() {
					node.value = "";
					qrcode.callback = function(res) {
						if(res instanceof Error) {
							UIkit.modal.alert('No QR code detected. Please try again.', { bgClose:true });
						}
						else {
							$.getJSON(app.apiurl+"pwaActivate.php", {uuid: res}, function(data){
								if(data.status="ok") {
									localStorage.setItem('FLEET_UUID', app.uuid = res);
									app.page = 'tracking';
									app.tracking();
								}
								else {
									UIkit.modal.alert('Ops! mismatch activation code!', { bgClose:true });
								}
							});
						}
					};
					qrcode.decode(reader.result);
				};
				reader.readAsDataURL(node.files[0]);
			}
		},
	},
	methods: {
		logout: function() {
			localStorage.removeItem('FLEET_UUID');
			app.page = 'welcome';
		},
		tracking: function() {
			var _this = this;
			
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(pos){
					console.log(pos);
					$.getJSON(_this.apiurl+"pwaTracking.php", {
						uuid: _this.uuid,
						location: pos.coords.latitude+','+pos.coords.longitude,
						speed: pos.coords.speed*360
					}, null);
					setTimeout(_this.tracking, 5000);
				});
			} else {
				UIkit.modal.alert('Geolocation is not supported by this browser.', { bgClose:true });
			}
		}
	},
	mounted: function() {
		this.$nextTick(function() {
			this.page = this.uuid?'tracking':'welcome';
			if(this.page=='tracking') this.tracking();
		});
	}
});
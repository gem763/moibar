import { onMounted, ref, computed } from 'vue'

export default {
  setup() {
    const placer = ref(null);
	const instantTracker = ref(null);
	const showcaseBase = ref(null);
	const showcaseCategory = ref(null);
	const showcaseMovie = ref(null);
	const video = ref(null);
	const model = ref(null);

	const mode = ref('placing');
	const showcaseOn = ref(false);

	const bottomMessage = computed(() => {
		if (mode.value == 'placing') {
			return '위치 고정하기'

		} else if (mode.value == 'placed') {
			return '다시 시작하기'
		}
	})

	AFRAME.registerComponent('shadow-material', {
		init: function(){
			let mesh = this.el.getObject3D('mesh');
			if (!mesh){return;}
			mesh.material = new THREE.ShadowMaterial();
			mesh.material.opacity = 0.2;
		}
	});

	AFRAME.registerComponent('shadow-opts', {
		init: function(){
			// Configure some pretty shadows.
			let light = this.el.getObject3D('light');
			if (!light){return;}
			light.lookAt(0, 0, 0);
			light.castShadow = true;
			light.shadow.bias = 0.001;
			const shadowDistance = 8;
			light.shadow.camera.top = shadowDistance;
			light.shadow.camera.bottom = -shadowDistance;
			light.shadow.camera.left = -shadowDistance;
			light.shadow.camera.right = shadowDistance;

			light.shadow.camera.near = 0.1;
			light.shadow.camera.far = 50;
			light.shadow.radius = 2;
			light.shadow.mapSize.width = 1024;
			light.shadow.mapSize.height = 1024;
		}
	});


	// AFRAME.registerComponent('material-init', {
	// 	init: function() {
	// 		this.el.addEventListener('model-loaded', () => {
	// 			const obj = this.el.getObject3D('mesh');
				
	// 			obj.traverse(n => {
	// 				if (n.isMesh) {
	// 					console.log(n.material)
	// 					n.material.transparent = true;
	// 					n.opacity = 0.1;
	// 				}
	// 			})
	// 		})
	// 	}
	// })

	AFRAME.registerComponent('close', {
		init: function() {
			console.log('close')
		},

		events: {
			click: function(e) {
				if (mode.value == 'placed' && showcaseOn.value) {
					// console.log(this.el.parentEl.components)
					const components = this.el.parentEl.components;
					if ('show' in components) {
						this.el.parentEl.components.show.close()

					} else if ('movie' in components) {
						this.el.parentEl.components.movie.close()
					}
					
				}
				e.stopPropagation();
			}
		}
	})

	AFRAME.registerComponent('next', {
		init: function() {
			console.log('next')
			this.active = true;
		},

		setActive: function(val) {
			this.active = val;

			if (val) {
				this.el.setAttribute('material', 'opacity', 0);

			} else {
				this.el.setAttribute('material', 'opacity', 0.8);
			}
		},

		events: {
			click: function(e) {
				if (mode.value == 'placed' && showcaseOn.value && this.active) {
					this.el.parentEl.components.show.goNext();
				}
				e.stopPropagation();
			}
		}
	})

	AFRAME.registerComponent('prev', {
		init: function() {
			console.log('prev')
			this.active = true;
		},

		setActive: function(val) {
			this.active = val;

			if (val) {
				this.el.setAttribute('material', 'opacity', 0);

			} else {
				this.el.setAttribute('material', 'opacity', 0.8);
			}
		},

		events: {
			click: function(e) {
				if (mode.value == 'placed' && showcaseOn.value && this.active) {
					this.el.parentEl.components.show.goPrev();
				}
				e.stopPropagation();
			}
		}
	})

	AFRAME.registerComponent('show', {
		schema: {
			pages: { default: [], type: 'array' }
		},

		init: function() {
			console.log('show')
			this.ipage = 0;

			this.next = this.el.querySelector('.arrow-right').components.next;
			this.next.setActive(this.hasNext());

			this.prev = this.el.querySelector('.arrow-left').components.prev;
			this.prev.setActive(this.hasPrev());

			this.geo_initial = this.getGeos();
			this.geo_stored = {};
		},

		getGeo: function(type) {
			const geo = this.el.getAttribute(type);
			return { x: geo.x, y: geo.y, z: geo.z }
		},

		getGeos: function() {
			return {
				position: this.getGeo('position'),
				rotation: this.getGeo('rotation'),
				scale: this.getGeo('scale'),
			}
		},

		open: function() {
			this.geo_stored = this.getGeos();

			const scaler = 1.5;
			this.el.setAttribute('position', { x: 0, y: 1, z: 1 });
			this.el.setAttribute('rotation', { x: 0, y: 0, z: 0 });
			
			this.el.setAttribute('scale', { 
				x: this.geo_stored.scale.x * scaler, 
				y: this.geo_stored.scale.y * scaler, 
				z: this.geo_stored.scale.z * scaler 
			});

			showcaseOn.value = true;
		},

		close: function() {
			// console.log('close')
			this.el.setAttribute('position', this.geo_stored.position);
			this.el.setAttribute('rotation', this.geo_stored.rotation);
			this.el.setAttribute('scale', this.geo_stored.scale);
			showcaseOn.value = false;
		},

		reset: function() {
			this.el.setAttribute('position', this.geo_initial.position);
			this.el.setAttribute('rotation', this.geo_initial.rotation);
			this.el.setAttribute('scale', this.geo_initial.scale);
			showcaseOn.value = false;
		},

		goNext: function() {
			if (this.ipage < this.data.pages.length-1) {
				this.ipage += 1;
				this.el.setAttribute('material', 'src', this.data.pages[this.ipage])
			}

			this.next.setActive(this.hasNext());
			this.prev.setActive(this.hasPrev());
		},

		goPrev: function() {
			if (this.ipage > 0) {
				this.ipage -= 1;
				this.el.setAttribute('material', 'src', this.data.pages[this.ipage])
			}

			this.next.setActive(this.hasNext());
			this.prev.setActive(this.hasPrev());
		},

		hasNext: function() {
			return this.ipage < this.data.pages.length - 1
		},

		hasPrev: function() {
			return this.ipage > 0
		},

		events: {
			click: function(e) {
				if (mode.value == 'placed' && !showcaseOn.value) {
					this.open();
				}
				e.stopPropagation();
			}
		}
	})

	AFRAME.registerComponent('movie', {
		schema: {

		},

		init: function() {
			console.log('movie')
			// this.playing = false;
			this.geo_initial = this.getGeos();
			this.geo_stored = {};
		},

		getGeo: function(type) {
			const geo = this.el.getAttribute(type);
			return { x: geo.x, y: geo.y, z: geo.z }
		},

		getGeos: function() {
			return {
				position: this.getGeo('position'),
				rotation: this.getGeo('rotation'),
				scale: this.getGeo('scale'),
			}
		},

		open: function() {
			this.geo_stored = this.getGeos();

			const scaler = 1.5;
			this.el.setAttribute('position', { x: 0, y: 1, z: 1 });
			this.el.setAttribute('rotation', { x: 0, y: 0, z: 0 });
			
			this.el.setAttribute('scale', { 
				x: this.geo_stored.scale.x * scaler, 
				y: this.geo_stored.scale.y * scaler, 
				z: this.geo_stored.scale.z * scaler 
			});

			showcaseOn.value = true;
			document.querySelector('#movie').play();
		},

		close: function() {
			this.el.setAttribute('position', this.geo_stored.position);
			this.el.setAttribute('rotation', this.geo_stored.rotation);
			this.el.setAttribute('scale', this.geo_stored.scale);

			showcaseOn.value = false;
			document.querySelector('#movie').pause();
		},

		reset: function() {
			this.el.setAttribute('position', this.geo_initial.position);
			this.el.setAttribute('rotation', this.geo_initial.rotation);
			this.el.setAttribute('scale', this.geo_initial.scale);

			showcaseOn.value = false;
			document.querySelector('#movie').pause();
		},

		events: {
			click: function(e) {
				if (mode.value == 'placed' && !showcaseOn.value) {
					this.open();

				} else if (mode.value == 'placed' && showcaseOn.value) {
					// console.log(video.value)
					// video.value.play();
					// document.querySelector('#movie').play();
					// console.log(document.querySelector('video'))
					// this.el.querySelector('#movie').play()
				}
				e.stopPropagation();
			}
		}
	})

	const placeHere = () => {
		if (mode.value == 'placing') {
			instantTracker.value.setAttribute('zappar-instant', 'placement-mode: false');
			mode.value = 'placed';

			model.value.setAttribute('animation-mixer', 'timeScale', 1);
			showcaseBase.value.setAttribute('animation', "property: scale; loop: false; from: 0 0 0.001; to: 1.5 0.84 0.001; dur: 200; easing: easeInQuad")
			showcaseCategory.value.setAttribute('animation', "property: scale; loop: false; from: 0 0 0.001; to: 1.5 0.84 0.001; dur: 200; easing: easeInQuad")
			showcaseMovie.value.setAttribute('animation', "property: scale; loop: false; from: 0 0 0.001; to: 1.5 0.84 0.001; dur: 200; easing: easeInQuad")

		} else if (mode.value == 'placed') {
			instantTracker.value.setAttribute('zappar-instant', 'placement-mode: true');
			mode.value = 'placing';

			showcaseBase.value.components.show.reset();
			showcaseCategory.value.components.show.reset();
			showcaseMovie.value.components.movie.reset();

			showcaseBase.value.removeAttribute('animation');
			showcaseCategory.value.removeAttribute('animation');
			showcaseMovie.value.removeAttribute('animation');

			model.value.removeAttribute('animation-mixer');
			model.value.setAttribute('animation-mixer', 'timeScale', 0);
		}
		// placer.value.remove();	
	}

    return { 
		placer, 
		instantTracker, 
		showcaseBase,
		showcaseCategory,
		showcaseMovie,
		video,
		model,
		mode,
		showcaseOn,
		bottomMessage,
		placeHere  
	}
  },

  template: ``,
}
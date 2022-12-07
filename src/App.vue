<script setup>
import { onMounted, ref, computed } from 'vue'
const placer = ref(null);
const instantTracker = ref(null);
const showcase = ref(null);
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

AFRAME.registerComponent('close', {
	init: function() {
		console.log('close')
	},

	events: {
		click: function(e) {
			if (mode.value == 'placed' && showcaseOn.value) {
				this.el.parentEl.components.show.close()
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
		this.el.setAttribute('position', { x: 0, y: 1, z: 2 });
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

const placeHere = () => {
	if (mode.value == 'placing') {
		instantTracker.value.setAttribute('zappar-instant', 'placement-mode: false');
		mode.value = 'placed';

		model.value.setAttribute('animation-mixer', 'timeScale', 1);
		showcase.value.setAttribute('animation', "property: scale; loop: false; from: 0 0 0.001; to: 1.5 0.84 0.001; dur: 200; easing: easeInQuad")

	} else if (mode.value == 'placed') {
		instantTracker.value.setAttribute('zappar-instant', 'placement-mode: true');
		mode.value = 'placing';

		showcase.value.components.show.reset();
		model.value.removeAttribute('animation-mixer');
		model.value.setAttribute('animation-mixer', 'timeScale', 0);
		showcase.value.removeAttribute('animation');
	}
	// placer.value.remove();	
}

// const release = (e) => {
// 	console.log(1234);
// 	e.stopPropagation();
// }
</script>

<template>
	<div class="ar" :class="mode">
		<a-scene 
			id="zappar-scene" 
			shadow="type: pcfsoft" 
			light="defaultLightsEnabled: false">

			<a-assets>
				<img id="hotspotTexture" src="src/assets/hotspot.png">
				<img id="base_0" src="src/assets/showcase/base/base_0.jpg">
				<img id="base_1" src="src/assets/showcase/base/base_1.jpg">
				<img id="icon_close" src="src/assets/close.png">
			</a-assets>

			<a-entity zappar-permissions-ui id="permissions"></a-entity>
			<a-entity zappar-compatibility-ui id="compatibility"></a-entity>
			<a-camera 
				cursor="fuse: false; rayOrigin: mouse"
				raycaster="far: ${customFields.libVersion}; objects: .clickable"
				zappar-camera>
			</a-camera>

			<a-light type="ambient"></a-light>
			<a-entity 
				id="instant-tracker"
				position="0 -2 -5"
				zappar-instant="placement-mode: true"  
				ref="instantTracker">

				<a-entity 
					id="model"
					ref="model"
					gltf-model="src/assets/speaker.glb" 
					scale='0.6 0.6 0.6' 
					rotation="0 0 0" 
					position="0 0 0"
					shadow="cast: true"
					animation-mixer="timeScale: 0">
				</a-entity>

				<a-box
					ref="showcase"
					class="showcase base clickable"
					position="-1 1 0"
					rotation="-45 20 0"
					scale="0 0 0.001"
					material="src: #base_0"
					show="pages: #base_0, #base_1">

					<a-plane
						class="close clickable"
						position="0.46 -0.6 1"
						scale="0.11 0.19 1"
						material="src: #icon_close; side: double; transparent: true"
						close>
					</a-plane>

					<a-plane
						class="arrow-right clickable"
						position="0.45 0.006 1"
						scale="0.08 0.5 1"
						color="black"
						material="opacity: 0"
						next>
					</a-plane>

					<a-plane
						class="arrow-left clickable"
						position="-0.45 0.006 1"
						scale="0.08 0.5 1"
						color="black"
						material="opacity: 0"
						prev>
					</a-plane>
				</a-box>

				<a-entity 
					id="shadowPlane" 
					geometry="primitive:plane; width: 100; height: 100" 
					material="color: red; side:double" 
					rotation="-90 0 0" 
					position="0 0 0" 
					shadow="receive: true" 
					shadow-material>
				</a-entity>

				<a-entity 
					id="hotspot" 
					geometry="primitive:plane;" 
					scale="1.2 1.2 1.2" 
					position="-0.1 0.001 0" 
					rotation="-90 0 0" 
					material="src: #hotspotTexture; transparent: true; alphaTest: 0.5">
				</a-entity>

				<a-entity id="dirLight" light="type: directional; castShadow: true" position="0 30 10" shadow-opts></a-entity>
			</a-entity>
		</a-scene>

		<div class='placer' ref="placer" @click="placeHere">{{ bottomMessage }}</div>
	</div>
</template>

<style scoped>
.ar {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.ar > .placer {
	position: absolute;
	bottom: 30px;
	/* width: 200px; */
	/* left: calc(50% - 100px); */
	left: 50%;
	transform: translateX(-50%);

	background: rgba(0, 0, 0, 0.8);
	color: white;
	text-align: center;
	font-family: sans-serif;
	padding: 10px;
	border-radius: 5px;
	cursor: pointer;
}

.ar.placed > .placer {
	background: silver;
	color: black
}
</style>

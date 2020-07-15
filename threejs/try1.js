
	import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';

	var main_canvas;

	var camera, scene, renderer;
	var camera1, camera2;
	var cameraControls;

	var headlight;

	var cubeTurns;

	var mouse = new THREE.Vector2();

	var cameraPz = 600; //600
	var cameraPy = 800; //800
	var cameraPx = 2700;  //2700

	var imageBool = false;
	var imageSprite;

	var clock = new THREE.Clock();

	var raycaster;
	var INTERSECTED;
	var CAMERACHANGE = false;

	var init = function() {
		//scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color('black');
		//scene.fog = new THREE.Fog( 0x00FFFF, 100, 200 );
		//AXES
		//scene.add( new THREE.AxesHelper( 1000 ) );




		//lights
		setLights();


		//cameras
		camera = new THREE.PerspectiveCamera( 35	, window.innerWidth/window.innerHeight, 40, 10000 );

		camera1 = new THREE.PerspectiveCamera( 35	, window.innerWidth/window.innerHeight, 40, 10000 );
		camera2 = new THREE.PerspectiveCamera( 35, window.innerWidth/window.innerHeight, 40, 10000 );
		//
		camera1.position.z = cameraPz;
		camera1.position.y = cameraPy;
		camera1.position.x = cameraPx;

		camera2.position.z = cameraPz;
		camera2.position.y = cameraPy;
		camera2.position.x = cameraPx;

		camera.position.z = cameraPz;
		camera.position.y = cameraPy;
		camera.position.x = cameraPx;

	

		//renderer
		var c = main_canvas = document.createElement( 'canvas' );

		renderer = new THREE.WebGLRenderer({canvas: c, antialias: true});
		document.body.appendChild( renderer.domElement );

		renderer.antialias = true;
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.outputEncoding = THREE.sRGBEncoding;
		document.body.appendChild( renderer.domElement );

		// EVENTS
		//cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
		//cameraControls.target.set(0,310,0);
		window.addEventListener( 'mousemove', onMouseMove, false );
		window.addEventListener( 'dblclick', onMouseDoubleClick, false );
		window.addEventListener( 'resize', onWindowResize, false );
		window.addEventListener( 'mousedown', onDocumentMouseDown, false );



		raycaster = new THREE.Raycaster();



		creatElementsInScene();

		createImage();




	//end init()		
	}

	
	var setLights = function(){
		//lights
		//scene.add( new THREE.AmbientLight( 0x111111 ) );
		//
		//headlight = new THREE.PointLight( 0xFFFFFF, 1.0 );
		//headlight.position.x=0;
		//scene.add( headlight );
		//
		//Ceiling 1
		//
		var spotLightC1 = createSpotlight( 0xffffff,);
		spotLightC1.position.set( 1700, 1000, 700  );
		spotLightC1.target.position.set( 220, 220, 1600 );
		scene.add( spotLightC1.target );
		scene.add( spotLightC1 );
		//
		//Ceiling 2
		//
		var spotLightC2 = createSpotlight( 0xffffff);
		spotLightC2.position.set( 1700, 1000, 200  );
		spotLightC2.target.position.set( 220, 220, 200 );
		scene.add( spotLightC2.target );
		scene.add( spotLightC2 );
				//
		//Ceiling 3
		//
		var spotLightC3 = createSpotlight( 0xffffff);
		spotLightC3.position.set( 2000, 1000, 450  );
		spotLightC3.target.position.set( 220, 220, 750 );
		scene.add( spotLightC3.target );
		scene.add( spotLightC3 );
		//
		// Floor 2
		//
		var spotLightF2 = createSpotlight( 0xffffff,);
		spotLightF2.position.set( 1200, 50, 500  );
		spotLightF2.target.position.set( 220, 15, 1000 );
		scene.add( spotLightF2.target );
		//scene.add( spotLightF2 );

		
		//HELPPPP
		var lightHelper = new THREE.SpotLightHelper( spotLightC2 );
		//scene.add( lightHelper );
		//
		var shadowCameraHelper = new THREE.CameraHelper( spotLightC2.shadow.camera );
		//scene.add( shadowCameraHelper );
		var shadowCameraHelper = new THREE.CameraHelper( spotLightC1.shadow.camera );
		//scene.add( shadowCameraHelper );
		var shadowCameraHelper = new THREE.CameraHelper( spotLightC3.shadow.camera );
		//scene.add( shadowCameraHelper );

	}


	var createImage = function(){

		var map = new THREE.TextureLoader().load( "img/0_stage.jpg" );
		var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
		imageSprite = new THREE.Sprite( material );
		var scalar = 1.3;
		imageSprite.scale.set(1024*scalar,739*scalar,1);
		imageSprite.position.set(1300, 2350, 700)
		scene.add( imageSprite );
	}

	var creatElementsInScene = function()
	{
		//cubes
		//
		var geometry = new THREE.BoxGeometry(100, 100, 100);
		//
		var material1 = new THREE.MeshLambertMaterial( { color: 0xff6600 } );
		var material2 = new THREE.MeshLambertMaterial( { color: 0xff6600 } );
		var material3 = new THREE.MeshLambertMaterial( { color: 0xff6600 } );
		//
		material1.emissive.setHex( 0xff0000 );
		material2.emissive.setHex( 0xff0000 );
		material3.emissive.setHex( 0xff0000 );
		//
		//1
		//		
		var cube1 = new THREE.Mesh( geometry, material1 );
		cube1.position.x = 1180;
		cube1.position.y = 51.5;
		cube1.position.z = 430;
		//
		cube1.rotation.y = (-15)*Math.PI/180;
		//
		cube1.receiveShadow = true;
		cube1.castShadow = true;
		scene.add( cube1 );
		//		
		//2
		//		
		var cube2 = new THREE.Mesh( geometry, material2 );
		cube2.position.x = 1000;
		cube2.position.y = 51.5;
		cube2.position.z = 1090;
		//
		cube2.rotation.y = 45*Math.PI/180;
		//
		cube2.receiveShadow = true;
		cube2.castShadow = true;
		scene.add( cube2 );
		//		
		//3
		//		
		var cube3 = new THREE.Mesh( geometry, material3 );
		cube3.position.x = 690;
		cube3.position.y = 51.5;
		cube3.position.z = 630;
		//
		cube3.rotation.y = 15*Math.PI/180;
		//
		cube3.receiveShadow = true;
		cube3.castShadow = true;
		scene.add( cube3 );
		//
		// cube turns
		//
		cubeTurns = new THREE.Mesh( geometry, material1 );
		cubeTurns.position.x = 400;
		cubeTurns.position.y = 100;
		cubeTurns.position.z = 300;
		cubeTurns.receiveShadow = true;
		cubeTurns.castShadow = true;
		//scene.add( cubeTurns );
		//		



		//tifora
		var OrangeMaterial = new THREE.MeshLambertMaterial( { color: 0xff6600, reflectivity: 2  } );
		OrangeMaterial.emissive.setHex( 0xff0000 )
		var OrangeDarkMaterial = new THREE.MeshLambertMaterial( { color: 0x0a0500, reflectivity: 2 } );
		OrangeDarkMaterial.emissive.setHex( 0x10000 )
		//
		// Instantiate a loader - orange
		//
		var loader = new GLTFLoader();
		loader.load( 'models/TITLE4.gltf', ( gltf ) => {
			var model = gltf.scene;
			console.log("load");
			console.log(gltf.animations);

			model.traverse ( ( obj ) => {
				model.position.y = 2;

				if ( obj.isMesh ) {
				obj.castShadow = true;
				obj.receiveShadow = true;
				obj.scale.multiplyScalar( 1);
				obj.material = OrangeMaterial;
				}
			} );
			scene.add( model );
		} );
		//
		// Instantiate a loader - OrangeDark
		// 
		var loader = new GLTFLoader();
		loader.load( 'models/TITLE4-Y.gltf', ( gltf ) => {
			var model = gltf.scene;
			model.position.y = 2;
			//
			model.traverse ( ( obj ) => {
				if ( obj.isMesh ) {
				obj.castShadow = true;
				obj.receiveShadow = true;
				obj.scale.multiplyScalar( 1);
				obj.material = OrangeDarkMaterial;
				}
			} );
		scene.add( model );
		} );

	}


	function createSpotlight( color ) {

		var spotLight = new THREE.SpotLight( color, 1 );

		spotLight.angle = Math.PI/6;
		spotLight.penumbra = 0.2;
		spotLight.distance = 4000;
		spotLight.castShadow = true;
		spotLight.shadow.mapSize.width = 2048;
		spotLight.shadow.mapSize.height = 2048;

		return spotLight;

	}

	function onWindowResize( event ) {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function onMouseMove( event ) {
		//console.log(mouse);

			//2x-1=x-0.5
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		
		//headlight.position.z = 1000;
		//headlight.position.z = -mouse[0]*1000+1000;
		//headlight.position.y = -mouse[1]*1000+500;


	}

	function onMouseDoubleClick( ev ) {
		if (imageBool)
		{
			imageSprite.position.set(1300, 2350, 700)
			imageBool = false;

		}
		else
		{
			imageSprite.position.set(1300, 450, 700)
			imageBool = true;

		}

	}

	function onDocumentMouseDown( event ) {

		raycaster.setFromCamera( mouse, camera );

		// calculate objects intersecting the picking ray
		var intersects = raycaster.intersectObjects( scene.children );
	
		if ( intersects.length > 0 ) {
			console.log(intersects[ 0 ].object.id)

			if (intersects[ 0 ].object.id == '31')
			{
				cameraPz = -1000;
			}

			if (intersects[ 0 ].object.id == '32')
			{
				cameraPz = 2000;
			}

			if (intersects[ 0 ].object.id == '33')
			{
				cameraPz = 600;
			}
		}
	
		/*
		// Parse all the faces, for when you are using face materials
		for ( var i in intersects ) {
			intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xFFFFFF | 0x80000000 );
		}
		*/
	}

	var animate = function () {
		requestAnimationFrame( animate );

		cubeTurns.rotation.x += 0.01;
		cubeTurns.rotation.y += 0.01;
		
		render();
		
	};

	var render = function() {
		var delta = clock.getDelta();
		//cameraControls.update(delta);
		var posShift = 100;
		var comptXZ =  Math.sin( .5 * Math.PI * ( mouse.x));
		var comptY = Math.sin( .25 * Math.PI * ( mouse.y) );
		//console.log(400*(comptXZ+2))
		camera.position.x = cameraPx + comptXZ*posShift;
		camera.position.y = cameraPy + comptY*posShift;
		camera.position.z = cameraPz + comptXZ*posShift;
		camera.lookAt( 0*comptXZ,-150*comptY,400*(comptXZ+2) );
		camera.updateMatrixWorld();

		raycaster.setFromCamera( mouse, camera );

		// calculate objects intersecting the picking ray
		var intersects = raycaster.intersectObjects( scene.children );

		
		//console.log(intersects.length)
		if ( intersects.length > 0 ) {
			if(intersects[ 0 ].object.geometry.type=='BoxGeometry'){
				//console.log(intersects[ 0 ].object.id)

				if ( INTERSECTED != intersects[ 0 ].object ) {

					if ( INTERSECTED )
					{
						INTERSECTED.material.emissive.setHex( INTERSECTED.currentHexE );
						INTERSECTED.material.color.setHex( INTERSECTED.currentHexF );
					} 

					INTERSECTED = intersects[ 0 ].object;
					INTERSECTED.currentHexE = INTERSECTED.material.emissive.getHex();
					INTERSECTED.currentHexF = INTERSECTED.material.color.getHex();

					INTERSECTED.material.color.setHex( 0x0000D6 );
					INTERSECTED.material.emissive.setHex( 0xD60000);


				}

			} else {

				if ( INTERSECTED )
				{
					INTERSECTED.material.emissive.setHex( INTERSECTED.currentHexE );
					INTERSECTED.material.color.setHex( INTERSECTED.currentHexF );
				} 

				INTERSECTED = null;
			}
		}
		




		renderer.render(scene, camera);
		// if (CAMERACHANGE){
		// 	camera2.lookAt( 0,-75,1000 );
		// 	camera2.updateMatrixWorld();
		// 	renderer.render( scene, camera2 );
		// }
		// else{
		// 	renderer.render( scene, camera1 );
		//}
		//renderer.render( scene, camera2 );
	}




	function createGround() {

		//adding floor
		var groundMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF,
			// polygonOffset moves the plane back from the eye a bit, so that the lines on top of
			// the grid do not have z-fighting with the grid:
			// Factor == 1 moves it back relative to the slope (more on-edge means move back farther)
			// Units == 4 is a fixed amount to move back, and 4 is usually a good value
			polygonOffset: true, polygonOffsetFactor: 1.0, polygonOffsetUnits: 4.0
		})
		groundMaterial.reflectivity = 1;

		var ground = new THREE.Mesh(
		new THREE.PlaneGeometry(10000, 10000, 100, 100), groundMaterial)
		// When we use a ground plane we use directional lights, so illuminating
		// just the corners is sufficient.
		// Use MeshPhongMaterial if you want to capture per-pixel lighting:
		// new THREE.MeshPhongMaterial({ color: color, specular: 0x000000,
			
		ground.rotation.x = - Math.PI / 2;
		ground.receiveShadow = true;
		scene.add(ground);
		}


	init();
	createGround();

	animate();







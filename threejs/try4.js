
	import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';

	import { OrbitControls } from '../three/examples/jsm/controls/OrbitControls.js';

    import { EffectComposer } from '../three/examples/jsm/postprocessing/EffectComposer.js';
    import { RenderPass } from '../three/examples/jsm/postprocessing/RenderPass.js';
    import { ShaderPass } from '../three/examples/jsm/postprocessing/ShaderPass.js';

	import { MaskPass, ClearMaskPass } from '../three/examples/jsm/postprocessing/MaskPass.js';
	import { TexturePass } from '../three/examples/jsm/postprocessing/TexturePass.js';
    import { HorizontalBlurShader } from '../three/examples/jsm/shaders/HorizontalBlurShader.js';
    import { VerticalBlurShader } from '../three/examples/jsm/shaders/VerticalBlurShader.js';
	import { RGBShiftShader } from '../three/examples/jsm/shaders/RGBShiftShader.js';
    import { BleachBypassShader } from '../three/examples/jsm/shaders/BleachBypassShader.js';
    import { VignetteShader } from '../three/examples/jsm/shaders/VignetteShader.js';
	import { FilmPass } from '../three/examples/jsm/postprocessing/FilmPass.js';
	import { GammaCorrectionShader } from '../three/examples/jsm/shaders/GammaCorrectionShader.js';

	{ //globals
	var permanent = document.getElementById( 'permanent' );

    var manager;
    var main_canvas;

	var camera, MainScene, renderer;
	var overlayScene, OverlayComposer, newComposer;
	var ground;
	var controls;
	var composer;

	var start = true;
	var start_cube;

	var spotLightsList = [];
	var testLight;
	var mainSL1, mainSL2, mainSL3;
	var sp02D;
	var sp12d;

	
	var listener;
	var sound_02, sound_06, sound_09, sound_10, sound_12, sound_13, sound_21;
	var cup, head;
	var mat_video_11, video_11, video11_Sprite;
	var mat_video_14, video_14;


	var currentCube;
	var currntFrame;

	var OrangeMaterial, PinkeMaterial, whiteMaterial;

	var CubeMaterial_O, CubeMaterial_P;
	var mouse = new THREE.Vector2();
	var prev_frame_mouse = new THREE.Vector2();


	var animation_mixers = {};

	var cameraPosVec = new THREE.Vector3(-300, 19900, 10);   // מבט על
	var cameraLookAt = new THREE.Vector3(-3000, 200, 800);   // מבט על


	var cameraLookAt = new THREE.Vector3(0, 200, 800);  // מקורי
	var cameraPosVec = new THREE.Vector3(2700, 800, 600); // מקורי


	var cameraLookAt = new THREE.Vector3(4000, -200, 800);  // כותרת
	var cameraPosVec = new THREE.Vector3(8500, 1200, 600); // כותרת



	var cameraTurn = new THREE.Vector3(0, 200, -400); 

	var posShift = 50;
	var cameraZrotate = 0;
	var libraryAnimation;
	var waitFor10 = false;

	var imageSprite;

	var mixers = [];

	var clock = new THREE.Clock();

	var raycaster;
	var INTERSECTED0, INTERSECTED, INTERSECTED2;
	var CAMERACHANGE = false;
	var postP = false;
	var readMode = false;

	var allModelsLoaded = false;

	var DarkPinkMaterial;

	var modelObjects = [];
	}

	function init() {

		//SCENE
		MainScene = new THREE.Scene();
		MainScene.background = new THREE.Color('black');
		MainScene.fog = new THREE.Fog( 0x000000, 4500, 7000 ); //2500, 11000
		overlayScene = new THREE.Scene();
		overlayScene.fog = new THREE.Fog( 0x000000, 4500, 7000 ); //2500, 11000

        
		//AXES
		//MainScene.add( new THREE.AxesHelper( 100000 ) );
		//overlayScene.add( new THREE.AxesHelper( 1000 ) );

		//LIGHTS
		//scene.add( new THREE.AmbientLight( 0x888888) );
		//
		//var headlight = new THREE.PointLight( 0x00FF00, 2.5 );
		//headlight.position.x=400;
		//headlight.position.y=500;
		//headlight.position.z=400;
		//scene.add( headlight );
		

		//CAMERA
		camera = new THREE.PerspectiveCamera( 35, window.innerWidth/window.innerHeight, 40, 30000 );
		//camera.rotation.x +=  90*Math.PI/180;
		//camera.rotation.y +=  30*Math.PI/180;
		//camera.rotation.z +=  45*Math.PI/180;

        
		camera.position.z = cameraPosVec.x;
		camera.position.y = cameraPosVec.y;
        camera.position.x = cameraPosVec.x;

		//RENDERER
		main_canvas = document.createElement( 'canvas' );
        //
		renderer = new THREE.WebGLRenderer({canvas: main_canvas, antialias: true});
        //
		renderer.antialias = true;
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.outputEncoding = THREE.sRGBEncoding;
		document.body.appendChild( renderer.domElement );
		
		// EVENTS
		window.addEventListener( 'mousemove', onMouseMove, false );
		window.addEventListener( 'dblclick', onMouseDoubleClick, false ); // <--------
		window.addEventListener( 'resize', onWindowResize, false );
		window.addEventListener( 'mousedown', onDocumentMouseDown, false );
		window.addEventListener( 'keydown', onkeydown, false);
		//
		raycaster = new THREE.Raycaster();

		// AUDIO
		listener = new THREE.AudioListener();
		camera.add( listener );
		loadSounds();


        //OBJECTS - MAIN SCENE
        createGround();
        //
		creatElementsInScene();
        //
		//createImage();

		//OVERLAY SCENE
		createOverlayScene();

        // POST-PROCESSING
		postProcessingScene();



	//end init()		
	}

	function postProcessingScene ()
	{
		var rtParameters = {
            //minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: true
		};
		var height = window.innerHeight;
		var width =  window.innerWidth;

		//	
		// effects
		//
		var effectFilmBW = new FilmPass( 0.35, 0.5, 2048, true );
		var effectHBlur = new ShaderPass( HorizontalBlurShader );
        var effectVBlur = new ShaderPass( VerticalBlurShader );
        effectHBlur.uniforms[ 'h' ].value = 0.3 / ( width / 1);
        effectVBlur.uniforms[ 'v' ].value = 2 / ( height /2 );
        var shaderVignette = VignetteShader;
        var effectVignette = new ShaderPass( shaderVignette );
        effectVignette.uniforms[ "offset" ].value = 0.75;
		effectVignette.uniforms[ "darkness" ].value =0.2;
		var gammaCorrection = new ShaderPass( GammaCorrectionShader );
        var effectBleach = new ShaderPass(BleachBypassShader);
        effectBleach.uniforms[ "opacity" ].value = 0.5;
        var effect = new ShaderPass( RGBShiftShader );
        effect.uniforms[ 'amount' ].value = 0.0055;

		//
		// masks
		//
		var clearMask = new ClearMaskPass();
        var renderMask = new MaskPass( overlayScene, camera );
		var renderMaskInverse = new MaskPass( overlayScene, camera );
		renderMaskInverse.inverse = true;
		//


		//
		// main scene
		//
        composer = new EffectComposer( renderer , new THREE.WebGLRenderTarget( width, height, rtParameters ) );
		composer.addPass( renderMaskInverse );
		composer.addPass( new RenderPass( MainScene, camera ) );
		composer.addPass( clearMask );
		composer.addPass( effectFilmBW );
        composer.addPass( effectVignette );
		composer.addPass(effectBleach);
		composer.addPass( effect );
		composer.addPass(effectHBlur);
        composer.addPass( clearMask );

		//
		// overlayScene scene
		//
		OverlayComposer = new EffectComposer( renderer , new THREE.WebGLRenderTarget( width, height, rtParameters) );

		OverlayComposer.addPass( new RenderPass( overlayScene, camera ) );
		//OverlayComposer.addPass( effect );
		OverlayComposer.addPass( clearMask );


		OverlayComposer.clear = false;

		//
		// enter here filters for overlat scene
		//


		//
		var mainTextureComp = new TexturePass( composer.renderTarget2.texture );
        var overlayTextureComp = new TexturePass( OverlayComposer.renderTarget2.texture );

		newComposer = new EffectComposer( renderer , new THREE.WebGLRenderTarget( width, height, rtParameters) );
		//
		newComposer.addPass(mainTextureComp);
		newComposer.addPass( renderMask );
		newComposer.addPass(overlayTextureComp);
		newComposer.addPass( clearMask );


		var effectVBlur2 = new ShaderPass( VerticalBlurShader );
		effectVBlur2.uniforms[ 'v' ].value = 0;
		
		newComposer.addPass(effectVBlur2);


		//


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

		ground = new THREE.Mesh(
		new THREE.PlaneGeometry(50000, 50000, 100, 100), groundMaterial)
		// When we use a ground plane we use directional lights, so illuminating
		// just the corners is sufficient.
		// Use MeshPhongMaterial if you want to capture per-pixel lighting:
		// new THREE.MeshPhongMaterial({ color: color, specular: 0x000000,
			
		ground.rotation.x = - Math.PI / 2;
		ground.receiveShadow = true;
		ground.material.transparent = true;
		MainScene.add(ground);
        
    }

	function createImage(){
		var map = new THREE.TextureLoader().load( "img/poster.jpg" );
		var scalar = 0.6;

		var geometry = new THREE.PlaneGeometry( 800*scalar,595*scalar,1, 32 );
		var material = new THREE.MeshBasicMaterial( { map: map, color: 0xffffff , side: THREE.DoubleSide} );
		var plane = new THREE.Mesh( geometry, material );
		plane.rotation.y = 90*Math.PI/180;
		plane.position.set(0, 0, 500);
		plane.castShadow = true;
		plane.receiveShadow = true;
		//overlayScene.add( plane );

		var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
		imageSprite = new THREE.Sprite( material );
		imageSprite.scale.set(800*scalar,595*scalar,1);
		imageSprite.position.set(100, 0, 500)
		overlayScene.add( imageSprite );

		var map2 = new THREE.TextureLoader().load( "img/tonia-1.jpg" );
		var scalar2 = 0.2;
		var material2 = new THREE.SpriteMaterial( { map: map2, color: 0xffffff } );
		var imageSprite2 = new THREE.Sprite( material2 );
		imageSprite2.scale.set(1900*scalar2,1700*scalar2,1);
		imageSprite2.position.set(0, 0, 1200)

		overlayScene.add( imageSprite2 );
	}

	function creatElementsInScene()
	{
		// CUBES geometry and material
		//
		var geometry = new THREE.BoxGeometry(100, 100, 100);
		var geometryX = new THREE.BoxGeometry(120, 6, 12);
		var cubeHeight = 3;
		//
		CubeMaterial_O = new THREE.MeshLambertMaterial( { color: 0xff6600 } );
		CubeMaterial_O.emissive.setHex( 0xff0000 );

		CubeMaterial_P = new THREE.MeshLambertMaterial( { color: 0x0000D6 } );
		CubeMaterial_P.emissive.setHex( 0xD60000 );

		whiteMaterial = new THREE.MeshPhongMaterial( { color: 0xdddddd, reflectivity: 1  } );
        whiteMaterial.emissive.setHex( 0x000000 )
		
		OrangeMaterial = new THREE.MeshPhongMaterial( { color: 0xff6600, reflectivity: 1  } );
        OrangeMaterial.emissive.setHex( 0xff0000 )
        
		var OrangeDarkMaterial = new THREE.MeshLambertMaterial( { color: 0x0a0500, reflectivity: 2 } );
        OrangeDarkMaterial.emissive.setHex( 0x000000 )
        
		PinkeMaterial = new THREE.MeshPhongMaterial( { color: 0x0000D6, reflectivity: 1  } );
		PinkeMaterial.emissive.setHex( 0xD60000 )

		DarkPinkMaterial = new THREE.MeshPhongMaterial( { color: 0x060503, reflectivity: 1, shininess: 1} );
		DarkPinkMaterial.emissive.setHex( 0x000000 )

		var MaterialX = new THREE.MeshLambertMaterial( { color: 0x060503, reflectivity: 2 } );
		MaterialX.emissive.setHex( 0x000000 )
		
		var MnaMaterial = new THREE.MeshPhongMaterial( { color: 0x0000D6, reflectivity: 1  } );
		MnaMaterial.emissive.setHex( 0xD60000 )
		MnaMaterial.shininess = 5;


		//tifora


		// 00 אמבטיה
		loadModelAndAnimation(false, 'models/TITLE4.gltf', OrangeMaterial, [5000, 2, 0], [0,0,0], 1);
		loadModelAndAnimation(false, 'models/TITLE4-Y.gltf', OrangeDarkMaterial, [5000, 2, 0], [0,0,0], 1);
		//
		mainSL1 = createSpotLight("00_A", [6700,1000,700], [5220, 220, 1600]);
		mainSL2 = createSpotLight("00_B", [7000,1000,450], [5220, 220, 750]);
		mainSL3 = createSpotLight("00_C", [6700,1000,200], [5220, 220, 200]);
		mainSL1.castShadow = true;
		mainSL2.castShadow = true;
		mainSL3.castShadow = true;
		//
		// A
		//		
		var cube1 = new THREE.Mesh( geometry, CubeMaterial_O );
		cube1.position.set(6180,51,430);
		cube1.rotation.y = (-15)*Math.PI/180;
		cube1.receiveShadow = true;
        cube1.castShadow = true;
		cube1.cameraCords = [8500, 1400, -1000];
		cube1.cameraLookAt = [5000, 0, 800];
		cube1.cameraTurn = [0, 200, -400];
		//cube1.lights = [L_02_A];
		MainScene.add( cube1 );
		//		
		// B
		//		
		var cube2 = new THREE.Mesh( geometry, CubeMaterial_O );
		cube2.position.set(6000, 51, 1090);
		cube2.rotation.y = 45*Math.PI/180;
		cube2.receiveShadow = true;
        cube2.castShadow = true;
		cube2.cameraCords = [8500, 1400, 2000];
		cube2.cameraLookAt = [5000, 0, 800];
		cube2.cameraTurn = [0, 200, -400];
		//cube2.lights = [];
		MainScene.add( cube2 );
		//		
		// C
		//		
		var cube3 = new THREE.Mesh( geometry, CubeMaterial_O );
		cube3.position.set(5690, 51,630);
		cube3.rotation.y = 15*Math.PI/180;
		cube3.receiveShadow = true;
        cube3.castShadow = true;
		cube3.cameraCords = [8500, 1200, 600];
		cube3.cameraLookAt = [5000, -200, 800];
		cube3.cameraTurn = [0, 200, -400];
		//cube3.lights = [L_02_A, L_02_B, L_02_C];
		MainScene.add( cube3 );
		//
		currentCube = cube3;
		//

		/*

		var spriteMap = new THREE.TextureLoader().load( "img/red_sprite.png" );
		var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.position.set(5090, 630,-200);
		sprite.scale.set(50, 50, 1)

		MainScene.add( sprite );
*/



		// 02 אנשי בסדר
		loadModelAndAnimation(false, 'models/scenes/02/ass.gltf', OrangeMaterial, [-800, 2, 300], [0,240,0], 4.5);
		loadModelAndAnimation(false, 'models/scenes/02/flowers2.gltf', PinkeMaterial, [-800, 2, 300], [0,240,0], 4.5);
		//
		loadModelAndAnimation(true, 'models/scenes/02/02_title.gltf', PinkeMaterial, [150, 2, 500], [0,-25,0], 0.25);
		loadModelAndAnimation(false, 'models/scenes/02/02_title_d.gltf', DarkPinkMaterial, [150, 2, 500], [0,-25,0], 0.25);
		//
		var sp02a = createSpotLight("02_A", [1700,1000,700], [220, 220, 1600]);
		var sp02b = createSpotLight("02_B", [2000,1000,450], [220, 220, 750]);
		var sp02c = createSpotLight("02_C", [1700,1000,200], [220, 220, 200]);
		sp02D = createSpotLight("12D", [-1600, 2200, 800], [-900, 200, 400]);
		sp02D.intensity = 0;
		//
		// A
		//		
		var cube1 = new THREE.Mesh( geometryX, MaterialX );
		cube1.position.set(700,cubeHeight,230);
		cube1.rotation.y = (-15)*Math.PI/180;
		cube1.receiveShadow = true;
        cube1.castShadow = true;
		cube1.cameraCords = [2700, 800, -1000];
		cube1.cameraLookAt = [0, 200, 800];
		cube1.cameraTurn = [0, 200, -400];
		cube1.lights = [sp02a, sp02b, sp02c];
		MainScene.add( cube1 );
		//		
		var cube1X = new THREE.Mesh( geometryX, MaterialX );
		cube1X.position.set(700,cubeHeight,230);
		cube1X.rotation.y = (-105)*Math.PI/180;
		cube1X.receiveShadow = true;
        cube1X.castShadow = true;
		cube1X.cameraCords = [2700, 800, -1000];
		cube1X.cameraLookAt = [0, 200, 800];
		cube1X.cameraTurn = [0, 200, -400];
		cube1X.lights = [sp02a, sp02b, sp02c];
		MainScene.add( cube1X );
		//
		cube1X.dual = cube1;
		cube1.dual = cube1X;
		//		
		// B
		//		
		var cube2 = new THREE.Mesh( geometryX, MaterialX );
		cube2.position.set(800, cubeHeight, 1090);
		cube2.rotation.y = 45*Math.PI/180;
		cube2.receiveShadow = true;
        cube2.castShadow = true;
		cube2.cameraCords = [2700, 800, 2000];
		cube2.cameraLookAt = [0, 200, 800];
		cube2.cameraTurn = [0, 200, -400];
		cube2.lights = [sp02a, sp02b, sp02c];
		MainScene.add( cube2 );
		//
		var cube2X = new THREE.Mesh( geometryX, MaterialX );
		cube2X.position.set(800, cubeHeight, 1090);
		cube2X.rotation.y = -	45*Math.PI/180;
		cube2X.receiveShadow = true;
        cube2X.castShadow = true;
		cube2X.cameraCords = [2700, 800, 2000];
		cube2X.cameraLookAt = [0, 200, 800];
		cube2X.cameraTurn = [0, 200, -400];
		cube2X.lights = [sp02a, sp02b, sp02c];
		MainScene.add( cube2X );
		//
		cube2X.dual = cube2;
		cube2.dual = cube2X;
		//		
		// C
		//		
		var cube3 = new THREE.Mesh( geometryX, MaterialX );
		cube3.position.set(590, cubeHeight,730);
		cube3.rotation.y = 15*Math.PI/180;
		cube3.receiveShadow = true;
        cube3.castShadow = true;
		cube3.cameraCords = [2700, 800, 600];
		cube3.cameraLookAt = [0, 200, 800];
		cube3.cameraTurn = [0, 200, -700];
		cube3.lights = [sp02a, sp02b, sp02c];
		MainScene.add( cube3 );
		//		
		var cube3X = new THREE.Mesh( geometryX, MaterialX );
		cube3X.position.set(590, cubeHeight,730);
		cube3X.rotation.y = 115*Math.PI/180;
		cube3X.receiveShadow = true;
        cube3X.castShadow = true;
		cube3X.cameraCords = [2700, 800, 600];
		cube3X.cameraLookAt = [0, 200, 800];
		cube3X.cameraTurn = [0, 200, -700];
		cube3X.lights = [sp02a, sp02b, sp02c];
		MainScene.add( cube3X );
		//
		cube3X.dual = cube3;
		cube3.dual = cube3X;
		//
		start_cube = cube3;
		//
		var geometry = new THREE.CylinderGeometry( 64, 64, 5, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		material.transparent = true;
		material.opacity = 0.6;
		var sphere = new THREE.Mesh( geometry, material );
		sphere.position.set(270, 3,420);
		//MainScene.add( sphere );
		//
		var spriteMap = new THREE.TextureLoader().load( "img/red_circle.png" );
		var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
		spriteMaterial.opacity = 0.6;
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.position.set(270, 280,450);
		sprite.scale.set(50, 50, 1)
		sprite.scene = 2;
		MainScene.add( sprite );


		// 03 החיזור
		//loadModelAndAnimation('models/scenes/03/airplane.gltf', OrangeMaterial, [-400, 270, 500], [20,0,0], 2);
		

		// 06 פגשתי בתותח ביישן
		loadModelAndAnimation(false, 'models/scenes/06/rocket.gltf', OrangeMaterial, [-2191, 4, 4850], [0,30,0], 0.2, 0.2);
		loadModelAndAnimation(true, 'models/scenes/06/6_title.gltf', PinkeMaterial, [-1950, 2, 4900], [0,20,0], 0.25, 0.3);
		loadModelAndAnimation(false, 'models/scenes/06/6_title_down.gltf', DarkPinkMaterial, [-1950, 2, 4900], [0,20,0], 0.25);
		//
		var sp06a = createSpotLight("06_A", [-350,1000,4750], [-1550, 220, 5500]);
		var sp06b = createSpotLight("06_B", [-50,1000,4500], [-1550, 220, 4650]);
		var sp06c = createSpotLight("06_C", [-350,1000,4250], [-1550, 220, 4100]);
		//		
		var cube_06 = new THREE.Mesh( geometryX, MaterialX );
		cube_06.position.set(-1400,cubeHeight,4000);
		cube_06.rotation.y = (-15)*Math.PI/180;
		cube_06.receiveShadow = true;
        cube_06.castShadow = true;
		cube_06.cameraCords = [700, 800, 4600];
		cube_06.cameraLookAt = [-2000, 200, 4800];
		cube_06.cameraTurn = [0, 200, -400];
		cube_06.lights = [sp06a, sp06b, sp06c];
		MainScene.add( cube_06 );
		//		
		var cube_06X = new THREE.Mesh( geometryX, MaterialX );
		cube_06X.position.set(-1400,cubeHeight,4000);
		cube_06X.rotation.y = (-105)*Math.PI/180;
		cube_06X.receiveShadow = true;
        cube_06X.castShadow = true;
		cube_06X.cameraCords = [700, 800, 4600];
		cube_06X.cameraLookAt = [-2000, 200, 4800];
		cube_06X.cameraTurn = [0, 200, -400];
		cube_06X.lights = [sp06a, sp06b, sp06c];
		MainScene.add( cube_06X );
		//
		cube_06X.dual = cube_06;
		cube_06.dual = cube_06X;
		//
		//
		// השמאלי		
		var cube_06 = new THREE.Mesh( geometryX, MaterialX );
		cube_06.position.set(-1100,cubeHeight,5900);
		cube_06.rotation.y = (-15)*Math.PI/180;
		cube_06.receiveShadow = true;
        cube_06.castShadow = true;
		cube_06.cameraCords = [400, 800, 8000];
		cube_06.cameraLookAt = [-2000, 200, 4800];
		cube_06.cameraTurn = [900, 200, -400];
		cube_06.lights = [sp06a, sp06b, sp06c];
		MainScene.add( cube_06 );
		//		
		var cube_06X = new THREE.Mesh( geometryX, MaterialX );
		cube_06X.position.set(-1100,cubeHeight,5900);
		cube_06X.rotation.y = (-105)*Math.PI/180;
		cube_06X.receiveShadow = true;
        cube_06X.castShadow = true;
		cube_06X.cameraCords = [400, 800, 8000];
		cube_06X.cameraLookAt = [-2000, 200, 4800];
		cube_06X.cameraTurn = [900, 200, -400];
		cube_06X.lights = [sp06a, sp06b, sp06c];
		MainScene.add( cube_06X );
		//
		cube_06X.dual = cube_06;
		cube_06.dual = cube_06X;

		// 09 הגטו שלי
		loadModelAndAnimation(false, 'models/scenes/09/nose.gltf', OrangeMaterial, [-5400, 0, -500], [0,10,0], 7);
        loadModelAndAnimation(false, 'models/scenes/09/tail2.gltf', PinkeMaterial, [-5400, 0, -500], [0,10,0], 7);
		loadModelAndAnimation(true, 'models/scenes/09/09_title.gltf', PinkeMaterial, [-4900, 2, -1300], [0,0,0], 0.25);
		loadModelAndAnimation(false, 'models/scenes/09/09_title_d.gltf', DarkPinkMaterial, [-4900, 2, -1300], [0,0,0], 0.25);
		//
		var sp09a = createSpotLight("09_A", [-3300,1000,-300], [-4780, 220, 600]);
		var sp09b = createSpotLight("09_B", [-3000,1000,-550], [-4780, 220, -250]);
		var sp09c = createSpotLight("09_C", [-3300,1000,-800], [-4780, 220, -800]);
		//		
		var cube_09 = new THREE.Mesh( geometryX, MaterialX );
		cube_09.position.set(-4200,cubeHeight,-900);
		cube_09.rotation.y = (5)*Math.PI/180;
		cube_09.receiveShadow = true;
        cube_09.castShadow = true;
		cube_09.cameraCords = [-2000, 800, 200];
		cube_09.cameraLookAt = [-5100, 200, -400];
		cube_09.cameraTurn = [100, 200, -800];
		cube_09.lights = [sp09a, sp09b, sp09c];
		MainScene.add( cube_09 );
		//		
		var cube_09X = new THREE.Mesh( geometryX, MaterialX );
		cube_09X.position.set(-4200,cubeHeight,-900);
		cube_09X.rotation.y = (95)*Math.PI/180;
		cube_09X.receiveShadow = true;
        cube_09X.castShadow = true;
		cube_09X.cameraCords = [-2000, 800, 200];
		cube_09X.cameraLookAt = [-5100, 200, -400];
		cube_09X.cameraTurn = [100, 200, -800];
		cube_09X.lights = [sp09a, sp09b, sp09c];
		MainScene.add( cube_09X );
		//
		cube_09X.dual = cube_09;
		cube_09.dual = cube_09X;
		//

		// 10 ספריה
		loadModelAndAnimation(false, 'models/scenes/10/box2.gltf', OrangeMaterial, [-3500, 600, 2100], [0,-30,0], 1);
		//
		loadModelAndAnimation(true, 'models/scenes/10/10_title.gltf', PinkeMaterial, [-3000, 2, 800], [0,-5,0], 0.25);
		loadModelAndAnimation(false, 'models/scenes/10/10_title_d.gltf', DarkPinkMaterial, [-3000, 2, 800], [0,-5,0], 0.25);
		//
		var sp10a = createSpotLight("10_A", [-1600,1000,2100], [-2800, 220, 2850]);
		var sp10b = createSpotLight("10_B", [-1300,1000,1850], [-2800, 220, 2000]);
		var sp10c = createSpotLight("10_C", [-1600,1000,1600], [-2800, 220, 1450]);
		//		
		var cube_10 = new THREE.Mesh( geometryX, MaterialX );
		cube_10.position.set(-2600,cubeHeight,2500);
		cube_10.rotation.y = (40)*Math.PI/180;
		cube_10.receiveShadow = true;
        cube_10.castShadow = true;
		cube_10.cameraCords = [-500, 800, 2100];
		cube_10.cameraLookAt = [-3400, 200, 2000];
		cube_10.cameraTurn = [200, 200, -600];
		cube_10.lights = [sp10a, sp10b, sp10c];
		MainScene.add( cube_10 );
		//		
		var cube_10X = new THREE.Mesh( geometryX, MaterialX );
		cube_10X.position.set(-2600,cubeHeight,2500);
		cube_10X.rotation.y = (120)*Math.PI/180;
		cube_10X.receiveShadow = true;
        cube_10X.castShadow = true;
		cube_10X.cameraCords = [-500, 800, 2100];
		cube_10X.cameraLookAt = [-3400, 200, 2000];
		cube_10X.cameraTurn = [200, 200, -600];
		cube_10X.lights = [sp10a, sp10b, sp10c];
		MainScene.add( cube_10X );
		//
		cube_10X.dual = cube_10;
		cube_10.dual = cube_10X;

		
		// 11 צ'מבלולו
		var position_11 = [-3500,2,-4200]; //-500, 2, -3700
		loadModelAndAnimation(true, 'models/scenes/11/11_title.gltf', PinkeMaterial, position_11, [0,0,0], 0.25);
		loadModelAndAnimation(false, 'models/scenes/11/11_title_d.gltf', DarkPinkMaterial, position_11, [0,0,0], 0.25);
		loadModelAndAnimation(false, 'models/scenes/11/head.gltf', OrangeMaterial, position_11, [0,0,0], 0.25);
		// 12
		loadModelAndAnimation(true, 'models/scenes/11/12_title.gltf', PinkeMaterial, position_11, [0,0,0], 0.25);
		loadModelAndAnimation(false, 'models/scenes/11/12_title_d.gltf', DarkPinkMaterial, position_11, [0,0,0], 0.25);
		loadModelAndAnimation(false, 'models/scenes/11/heads.gltf', OrangeMaterial, position_11, [0,0,0], 0.25, 0);
		
		//
		var sp11a = createSpotLight("11_A", [-1500,1000,-3650], [-3000, 220, -3350]);
		var sp11b = createSpotLight("11_B", [-1200,1000,-3900], [-3000, 220, -4300]);
		var sp11c = createSpotLight("11_C", [-1500,1000,-4150], [-3000, 220, -4850]);
		//
		var sp12a = createSpotLight("12_A", [-8000,1000,-3150], [-3000, 220, -3550]);
		var sp12b = createSpotLight("12_B", [-8300,1000,-3500], [-3000, 220, -4500]);
		var sp12c = createSpotLight("12_C", [-8000,1000,-3950], [-3000, 220, -5050]);

		sp12d = createSpotLight("12_D", [-5700,500,-4000], [-2000, 220, -4000]);
		sp12d.castShadow = true;
		sp12d.angle = Math.PI/3;
		sp12d.intensity = 2;
		

		//		
		var cube_11 = new THREE.Mesh( geometryX, MaterialX );
		cube_11.position.set(-2600,cubeHeight,-4000);
		cube_11.rotation.y = (40)*Math.PI/180;
		cube_11.receiveShadow = false;
        cube_11.castShadow = true;
		cube_11.cameraCords = [-300, 800, -4500];  // [2700, 800, 600];
		cube_11.cameraLookAt = [-4000, 200, -3300];  // 0 200 800
		cube_11.cameraTurn = [-100, 200, -1000];
		cube_11.lights = [sp11a, sp11b, sp11c];
		MainScene.add( cube_11 );
		//
		var cube_11X = new THREE.Mesh( geometryX, MaterialX );
		cube_11X.position.set(-2600,cubeHeight,-4000);
		cube_11X.rotation.y = (130)*Math.PI/180;
		cube_11X.receiveShadow = false;
        cube_11X.castShadow = true;
		cube_11X.cameraCords = [-300, 800, -4500];  // [2700, 800, 600];
		cube_11X.cameraLookAt = [-4000, 200, -3300];  // 0 200 800
		cube_11X.cameraTurn = [-100, 200, -1000];
		cube_11X.lights = [sp11a, sp11b, sp11c];
		MainScene.add( cube_11X );
		//
		cube_11X.dual = cube_11;
		cube_11.dual = cube_11X;
		//
		video_11 = document.getElementById( 'video11' );
		video_11.preload = 'auto';
		video_11.autoload = true;
		var texture11 = new THREE.VideoTexture( video_11 );
		video_11.currentTime = 1;
		texture11.offset = new THREE.Vector2( 0, 0 );
		texture11.repeat = new THREE.Vector2( 10, 5 );
		texture11.wrapS = THREE.RepeatWrapping;
		texture11.wrapT = THREE.RepeatWrapping;
		texture11.format = THREE.RGBFormat;
		//
		mat_video_11 = new THREE.MeshPhongMaterial(  {color: 0xffffff, map: texture11 });  //MeshLambertMaterial
		mat_video_11 = new THREE.SpriteMaterial( { map: texture11,  } );
		video11_Sprite = new THREE.Sprite( mat_video_11 );
		video11_Sprite.scale.set(512*8,512*4,1);
		video11_Sprite.position.set(-3330, 500, -3000);
		mat_video_11.opacity = 0.0;
		mat_video_11.transparent = true;
		video11_Sprite.visible = false;
		MainScene.add( video11_Sprite );
		//
		//
		var cube_12 = new THREE.Mesh( geometryX, MaterialX );
		cube_12.position.set(-6800,cubeHeight,-4000);
		cube_12.rotation.y = (40)*Math.PI/180;
		cube_12.receiveShadow = true;
        cube_12.castShadow = true;
		cube_12.cameraCords = [-9000, 800, -4500];  
		cube_12.cameraLookAt = [-5400, 200, -4300]; 
		cube_12.cameraTurn = [-100, 200, 600];
		cube_12.lights = [sp12a, sp12b, sp12c];
		MainScene.add( cube_12 );
		//
		var cube_12X = new THREE.Mesh( geometryX, MaterialX );
		cube_12X.position.set(-6800,cubeHeight,-4000);
		cube_12X.rotation.y = (130)*Math.PI/180;
		cube_12X.receiveShadow = true;
        cube_12X.castShadow = true;
		cube_12X.cameraCords = [-9000, 800, -4500];  
		cube_12X.cameraLookAt = [-5400, 200, -4300]; 
		cube_12X.cameraTurn = [-100, 200, 600];
		cube_12X.lights = [sp12a, sp12b, sp12c];
		MainScene.add( cube_12X );
		//
		cube_12X.dual = cube_12;
		cube_12.dual = cube_12X;
		//		
		//
		//
		var cube_112 = new THREE.Mesh( geometryX, MaterialX );
		cube_112.position.set(-3900,cubeHeight,-6200);
		cube_112.rotation.y = (40)*Math.PI/180;
		cube_112.receiveShadow = false;
        cube_112.castShadow = true;
		cube_112.cameraCords = [-3900, 800, -8000];  // [2700, 800, 600];
		cube_112.cameraLookAt = [-4000, 200, -3300];  // 0 200 800
		cube_112.cameraTurn = [-1000, 200, -100];
		cube_112.lights = [sp11a, sp11b, sp11c];
		MainScene.add( cube_112 );
		//
		var cube_112X = new THREE.Mesh( geometryX, MaterialX );
		cube_112X.position.set(-3900,cubeHeight,-6200);
		cube_112X.rotation.y = (130)*Math.PI/180;
		cube_112X.receiveShadow = false;
        cube_112X.castShadow = true;
		cube_112X.cameraCords = [-3900, 800, -8000];  // [2700, 800, 600];
		cube_112X.cameraLookAt = [-4000, 200, -3300];  // 0 200 800
		cube_112X.cameraTurn = [-1000, 200, -100];
		cube_112X.lights = [sp11a, sp11b, sp11c];
		MainScene.add( cube_112X );
		//
		cube_112X.dual = cube_112;
		cube_112.dual = cube_112X;




		// 13 סמטוכה
		loadModelAndAnimation(false, 'models/scenes/13/man2.gltf', OrangeMaterial, [-6100, 0, 5000], [0,-50,0], 7);
		loadModelAndAnimation(false, 'models/scenes/13/tools.gltf', PinkeMaterial, [-6100, 0, 5000], [0,-50,0], 7);
		loadModelAndAnimation(true, 'models/scenes/13/13_title.gltf', PinkeMaterial, [-5900, 2, 5200], [0,-45,0], 0.25);
		//
		var sp13a = createSpotLight("06_A", [-5650,1000,7550], [-7250, 220, 5500]);		// עליון
		var sp13b = createSpotLight("06_B", [-5100,1000,7900], [-6550, 220, 4650]);
		var sp13c = createSpotLight("06_C", [-4550,1000,7550], [-6050, 220, 4100]);     // תחתון
		//		
		var cube_13 = new THREE.Mesh( geometryX, MaterialX );
		cube_13.position.set(-6200,cubeHeight,6600); 
		cube_13.rotation.y = (10)*Math.PI/180;
		cube_13.receiveShadow = true;
        cube_13.castShadow = true;
		cube_13.cameraCords = [-4200, 800, 7900];
		cube_13.cameraLookAt = [-6500, 200, 5200];
		cube_13.cameraTurn = [600, 200, -200];
		cube_13.lights = [sp13a, sp13b, sp13c];
		MainScene.add( cube_13 );
		//		
		var cube_13X = new THREE.Mesh( geometryX, MaterialX );
		cube_13X.position.set(-6200,cubeHeight,6600); 
		cube_13X.rotation.y = (100)*Math.PI/180;
		cube_13X.receiveShadow = true;
        cube_13X.castShadow = true;
		cube_13X.cameraCords = [-4200, 800, 7900];
		cube_13X.cameraLookAt = [-6500, 200, 5200];
		cube_13X.cameraTurn = [600, 200, -200];
		cube_13X.lights = [sp13a, sp13b, sp13c];
		MainScene.add( cube_13X );
		//
		cube_13X.dual = cube_13;
		cube_13.dual = cube_13X;
		//
		//

		// 14 רגעים יפים 
		var pos_14 = [-2400, 2, -1500]; //-400,2,500
		var pos_14_t = [-2500, 2, -2300]; //150,2,100
        loadModelAndAnimation(false, 'models/scenes/14/CUP.gltf', OrangeMaterial, pos_14, [0,0,0], 1, -1);
        loadModelAndAnimation(false, 'models/scenes/14/CUP_FILL.gltf', PinkeMaterial, pos_14, [0,0,0], 1, -1);
		loadModelAndAnimation(false, 'models/scenes/14/MEN.gltf', MnaMaterial, pos_14, [0,0,0], 1);
		//
        loadModelAndAnimation(true, 'models/scenes/14/text_moments_new.gltf', PinkeMaterial, pos_14_t, [0,40,0], 1);
        loadModelAndAnimation(false, 'models/scenes/14/text_moments_new_d.gltf', DarkPinkMaterial, pos_14_t, [0,40,0], 1);
		//
		var sp14a = createSpotLight("14_A", [-800,1000,-3050], [-2380, 220, -1150]);
		var sp14b = createSpotLight("14_B", [-500,1000,-3300], [-2380, 220, -2000]);
		var sp14c = createSpotLight("14_C", [-800,1000,-3550], [-2380, 220, -2550]);
		//		
		var cube_14 = new THREE.Mesh( geometryX, MaterialX );
		cube_14.position.set(-1800,cubeHeight,-2800);
		cube_14.rotation.y = (5)*Math.PI/180;
		cube_14.receiveShadow = true;
        cube_14.castShadow = true;
		cube_14.cameraCords = [-2000, 800, -5000];    
		cube_14.cameraLookAt = [-2600, 200, -1600];
		cube_14.cameraTurn = [-400, 300, -600];
		cube_14.lights = [sp14a, sp14b, sp14c];
		MainScene.add( cube_14 );
		//		
		var cube_14X = new THREE.Mesh( geometryX, MaterialX );
		cube_14X.position.set(-1800,cubeHeight,-2800);
		cube_14X.rotation.y = (95)*Math.PI/180;
		cube_14X.receiveShadow = true;
        cube_14X.castShadow = true;
		cube_14X.cameraCords = [-2000, 800, -5000];    
		cube_14X.cameraLookAt = [-2600, 200, -1600];
		cube_14X.cameraTurn = [-400, 300, -600];
		cube_14X.lights = [sp14a, sp14b, sp14c];
		MainScene.add( cube_14X );//
		cube_14X.dual = cube_14;
		cube_14.dual = cube_14X;
		//
		video_14 = document.getElementById( 'video14' );
		video_14.preload = 'auto';
		video_14.autoload = true;
		video_14.currentTime = 1;
		//
		var texture14 = new THREE.VideoTexture( video_14 );
		texture14.repeat = new THREE.Vector2( 2.7, 3 );
		texture14.offset = new THREE.Vector2( 0.58, 0 );
		texture14.wrapS = THREE.RepeatWrapping;
		texture14.wrapT = THREE.RepeatWrapping;
		texture14.format = THREE.RGBFormat;
		//
		mat_video_14 = new THREE.MeshPhongMaterial(  {color: 0xffffff, map: texture14 });
		//
		//
		//		השמאלי
		var cube_14b = new THREE.Mesh( geometryX, MaterialX );
		cube_14b.position.set(-1250,cubeHeight,-2650);
		cube_14b.rotation.y = (5)*Math.PI/180;
		cube_14b.receiveShadow = true;
        cube_14b.castShadow = true;
		cube_14b.cameraCords = [600, 800, -3900];    
		cube_14b.cameraLookAt = [-2600, 200, -1600];
		cube_14b.cameraTurn = [-400, 300, -600];
		cube_14b.lights = [sp14a, sp14b, sp14c];
		MainScene.add( cube_14b );
		//		
		var cube_14bX = new THREE.Mesh( geometryX, MaterialX );
		cube_14bX.position.set(-1250,cubeHeight,-2650);
		cube_14bX.rotation.y = (95)*Math.PI/180;
		cube_14bX.receiveShadow = true;
        cube_14bX.castShadow = true;
		cube_14bX.cameraCords = [600, 800, -3900];    
		cube_14bX.cameraLookAt = [-2600, 200, -1600];
		cube_14bX.cameraTurn = [-400, 300, -600];
		cube_14bX.lights = [sp14a, sp14b, sp14c];
		MainScene.add( cube_14bX );
		//
		cube_14bX.dual = cube_14b;
		cube_14b.dual = cube_14bX;
		//


		// 21 המלכות היא  שלמה
		var pos_21 = [-6650, 2, 2700];  //-150,2,-200
		var rot_21 = [0, 210, 0];
		loadModelAndAnimation(false, 'models/scenes/21/legs.gltf', OrangeMaterial, pos_21, rot_21, 0.25, 0.05, true);
		//
		loadModelAndAnimation(true, 'models/scenes/21/21_title.gltf', PinkeMaterial, pos_21, rot_21, 0.25);
		loadModelAndAnimation(false, 'models/scenes/21/21_title_d.gltf', DarkPinkMaterial, pos_21, rot_21, 0.25);
		//
		var sp21a = createSpotLight("02_A", [-9200,1000,3700], [-7300, 220, 2850]);
		var sp21b = createSpotLight("02_B", [-9500,1000,3450], [-7300, 220, 2250]);
		var sp21c = createSpotLight("02_C", [-9200,1000,3200], [-7300, 220, 1450]);
		//
		var cube_21 = new THREE.Mesh( geometryX, MaterialX );
		cube_21.position.set(-7400, cubeHeight, 3500);    /// (1180,51,800)
		cube_21.rotation.y = (-15)*Math.PI/180;
		cube_21.receiveShadow = true;
        cube_21.castShadow = true;
		cube_21.cameraCords = [-9500, 800, 4200];  
		cube_21.cameraLookAt = [-7000, 200, 2000];
		cube_21.cameraTurn = [200, 200, 400];
		cube_21.lights = [sp21a, sp21b, sp21c];
		MainScene.add( cube_21 );
		//
		var cube_21X = new THREE.Mesh( geometryX, MaterialX );
		cube_21X.position.set(-7400, cubeHeight, 3500);    /// (1180,51,800)
		cube_21X.rotation.y = (-105)*Math.PI/180;
		cube_21X.receiveShadow = true;
        cube_21X.castShadow = true;
		cube_21X.cameraCords = [-9500, 800, 4200];  
		cube_21X.cameraLookAt = [-7000, 200, 2000];
		cube_21X.cameraTurn = [200, 200, 400];
		cube_21X.lights = [sp21a, sp21b, sp21c];
		MainScene.add( cube_21X );
		//
		cube_21X.dual = cube_21;
		cube_21.dual = cube_21X;
		//
		//
		// השמאלי
		var cube_21 = new THREE.Mesh( geometryX, MaterialX );
		cube_21.position.set(-8400, cubeHeight, 1500);    /// (1180,51,800)
		cube_21.rotation.y = (-15)*Math.PI/180;
		cube_21.receiveShadow = true;
        cube_21.castShadow = true;
		cube_21.cameraCords = [-10500, 800, 2200];  
		cube_21.cameraLookAt = [-7000, 200, 2000];
		cube_21.cameraTurn = [200, 200, 400];
		cube_21.lights = [sp21a, sp21b, sp21c];
		MainScene.add( cube_21 );
		//
		var cube_21X = new THREE.Mesh( geometryX, MaterialX );
		cube_21X.position.set(-8400, cubeHeight, 1500);    /// (1180,51,800)
		cube_21X.rotation.y = (-105)*Math.PI/180;
		cube_21X.receiveShadow = true;
        cube_21X.castShadow = true;
		cube_21X.cameraCords = [-10500, 800, 2200];  
		cube_21X.cameraLookAt = [-7000, 200, 2000];
		cube_21X.cameraTurn = [200, 200, 400];
		cube_21X.lights = [sp21a, sp21b, sp21c];
		MainScene.add( cube_21X );
		//
		cube_21X.dual = cube_21;
		cube_21.dual = cube_21X;
		//
		

        //
        //
		//

	}

	function loadSounds()
	{
		var audioLoader = new THREE.AudioLoader();
		//
		sound_02 = new THREE.Audio( listener );
		audioLoader.load( 'audio/02_song.mp3', function( buffer ) {sound_02.setBuffer( buffer );});
		//
		sound_06 = new THREE.Audio( listener );
		audioLoader.load( 'audio/06_song.mp3', function( buffer ) {sound_06.setBuffer( buffer );});
		//
		sound_09 = new THREE.Audio( listener );
		audioLoader.load( 'audio/09_song.mp3', function( buffer ) {sound_09.setBuffer( buffer );});				
		//
		sound_10 = new THREE.Audio( listener );
		audioLoader.load( 'audio/10_record.mp3', function( buffer ) {sound_10.setBuffer( buffer );});					
		//
		sound_12 = new THREE.Audio( listener );
		audioLoader.load( 'audio/12_song.mp3', function( buffer ) {sound_12.setBuffer( buffer );});			
		//
		sound_13 = new THREE.Audio( listener );
		audioLoader.load( 'audio/13_record.mp3', function( buffer ) {sound_13.setBuffer( buffer );});					
		//
		sound_21 = new THREE.Audio( listener );
		audioLoader.load( 'audio/21_song.mp3', function( buffer ) {sound_21.setBuffer( buffer );});			
	}

    function loadModelAndAnimation ( boolName, name, material, position, rotation, scale, timeScale, loop)
    {
        //
		// Instantiate a loader
		//
		var loader = new GLTFLoader(manager);
		loader.load( name, ( gltf ) => {
			var model = gltf.scene;
			console.log("loaded:", name);
			model.scale.multiplyScalar( scale );

			model.position.x = position[0];
			model.position.y = position[1];
			model.position.z = position[2];

			model.rotation.x = rotation[0] * Math.PI / 180;
			model.rotation.y = rotation[1] * Math.PI / 180;
			model.rotation.z = rotation[2] * Math.PI / 180;


			model.traverse ( ( obj ) => {
				if ( obj.isMesh ) {

					if ((name == 'models/scenes/14/CUP.gltf') && (obj.name == "Lathe1")) //
					{
						cup = obj;
					}
					if ((name == 'models/scenes/11/head.gltf') && (obj.name == "Default")) //
					{
						head = obj;
					}
					
					if ((name == "models/scenes/10/box2.gltf") || (name == 'models/scenes/21/legs.gltf')){
						if (obj.material.color.r == 0)
						{
							obj.material = PinkeMaterial;
						}

						else
						{
							obj.material = OrangeMaterial;
						}
					}

					else
					{
						obj.material = material;
					}

                    obj.castShadow = true;
                    obj.receiveShadow = true;
					obj.material.morphTargets=true;
					obj.material.morphNormals=true;
					
					if (boolName)
					{
						obj.sceneName = name;
						modelObjects.push(obj);
					}
					

					//obj.name = name;
					
					
				}
		} );
        //
		// animation
		//

		var animations = gltf.animations;
		
		if ( animations && animations.length ) {
			console.log(animations);
			var mixer = new THREE.AnimationMixer( model );
			mixers.push( mixer );

			for ( var i = 0; i < animations.length; i ++ ) {

				var animation = animations[ i ];
				var action = mixer.clipAction( animation );
				if (timeScale != undefined)
				{mixer.timeScale = timeScale;}
				if (loop) 
				{action.loop = THREE.LoopPingPong;}
				action.play();

				if (name == "models/scenes/10/box2.gltf")
				{
					libraryAnimation = action;
				}
			}
			animation_mixers[name] = mixer;


		}
		model.name = name;
		MainScene.add( model );
		return model;
		} );
		
    }

	function createSpotLight(name, pos, target, helperBool)
	{
		var spotLight = new THREE.SpotLight( 0xffffff, 1 );
		spotLight.name = name;

		spotLight.angle = Math.PI/6;
		spotLight.penumbra = 0.2;
		spotLight.distance = 4000;
		//spotLight.castShadow = true;
		spotLight.shadow.mapSize.width = 2048;
		spotLight.shadow.mapSize.height = 2048;

		spotLight.position.set( pos[0], pos[1], pos[2] );
		spotLight.target.position.set( target[0], target[1], target[2] );
		MainScene.add( spotLight.target );
		MainScene.add( spotLight );

		if (helperBool)
		{
			var lightHelper = new THREE.SpotLightHelper( spotLight );
			//MainScene.add( lightHelper );
			var shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
			MainScene.add( shadowCameraHelper );
		}

		//spotLightsList.push(spotLight);

		return spotLight
	}

	function createOverlayScene()
	{
		var geometry = new THREE.SphereGeometry( 25, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		material.transparent = true;
		material.opacity = 0.65;
		var sphere = new THREE.Mesh( geometry, material );
		sphere.position.set(5090, 660,-300);
		//overlayScene.add( sphere );

		var geometry = new THREE.SphereGeometry( 15, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		material.transparent = true;
		material.opacity = 0.65;
		var sphere = new THREE.Mesh( geometry, material );
		sphere.position.set(150, 300,350);
		//overlayScene.add( sphere );



		/*
		var spriteMap = new THREE.TextureLoader().load( "img/red_sprite.png" );
		var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.position.set(5090, 660,-300);
		sprite.scale.set(50, 50, 1)

		//overlayScene.add( sprite );
		*/

		/*
		overlayScene.add( new THREE.AmbientLight( 0x8877ff) );

		*/

	}

	function onWindowResize( event ) {
        //FROM  INTERNET

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
		//composer.setSize( window.innerWidth, window.innerHeight );
		//OverlayComposer.setSize( window.innerWidth, window.innerHeight );
		//newComposer.setSize( window.innerWidth, window.innerHeight );

		//console.warn(window.innerWidth, window.innerHeight);

	}

	function onMouseMove( event ) {

		//console.warn("OUT", event.clientX, event.clientY);

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	function onMouseDoubleClick( ev ) {
		if (start)
		{
			cameraCubeAnimation(start_cube);
			FogFade(2500, 11000, 20);
			//start = false;
			return;
		}	
	}

	function onkeydown( ev ) {
		if (ev.keyCode == 49)  //  1
		{
			location.reload();
			return false;
		}
		if (ev.keyCode == 65) // a
		{
			readEnd();
			return false;
		}
		if (ev.keyCode == 76) // l
		{
			testLight.castShadow = true;
			return false;
		}
		if (ev.keyCode == 66) // b
		{
			postP = !postP;
			return false;
		}		

		if (ev.keyCode == 27) // Esc
		{
			
		}
		
		console.log(ev.keyCode);
			
	}

	function onDocumentMouseDown( event ) {

		raycaster.setFromCamera( mouse, camera );

		// calculate objects intersecting the picking ray
		var intersects = raycaster.intersectObjects( modelObjects.concat(MainScene.children) );
		
		if ((intersects.length > 0)&&(!permanent.pp))
		{
			var index = 0;
			if ((intersects[0].object.type == 'Sprite')&&(intersects[0].object.scene))
			{
				readClick('models/scenes/02/02_title.gltf');
			}
			else if (intersects[0].object.type == 'Sprite')
			{
				index = 1;
			}
			if((intersects[index].object.sceneName) && (!readMode))
			{
				readClick(intersects[index].object.sceneName);
			}
			if ((intersects[ index ].object.geometry.type == 'BoxGeometry') && (!readMode))
			{
				currentCube.position.y = 3;
				currentCube.dual.position.y = 3;
				intersects[index].object.position.y = 0;
				intersects[index].object.dual.position.y = 0;
				cameraCubeAnimation(intersects[index].object);
			}
			console.log(intersects[index].object);
		}

		if (postP)
		{
					// calculate objects intersecting the picking ray
		var intersectsPP = raycaster.intersectObjects(overlayScene.children);
		
		if (intersectsPP.length > 0)
		{
			console.log(intersectsPP[0].object);
		}

		}
	
        //
	}
	
	function readClick(name)
	{
		var changeDownText = true;

		var whiteColor = 0xeeeeee;

		var nearF = 6000;
		var farF = 6300;
		var stepsColor = 100;
		var durationCamera = 2000;

		var cameraPosTurn = [0, 0, 0];

		var cameraPos, cameraPosLookAt, text;

		var x_from_top = '5%';
		var x_from_right = '5%';
		
		if (name == 'models/scenes/02/02_title.gltf') //אנשי בסדר
		{
			var x_from_top = '5%';
			var x_from_right = '2.5%';

			cameraPos = [-600, 2200, 400];       //[2700, 800, 2000]
			cameraPosLookAt = [-900, 200, 400];	 // 0    200    800
			text = "text_02";

			posShift = 5;

			cameraPosTurn = [-10, 200, -10];
			var nearF = 1500; //1500
			var farF = 1920; //1900

			whiteColor = 0x000000;
			//whiteColor = 0xff0088;
			//stepsColor = 90;
			
			sound_02.play();
			sp02D.intensity = 0.3;	
		}
		else if (name == 'models/scenes/06/6_title.gltf') // תותחן
		{
			var x_from_top = '7%';
			var x_from_right = '7%';

			cameraPos = [-200, 300, 4000];	
			cameraPosLookAt = [-2000, 500, 5000]; 
			text = "text_06";

			nearF = 1750;
			farF = 2200;

			sound_06.play();

			whiteColor = false;

			cameraPosTurn = [-30, 40, -30];

		}
		else if (name == 'models/scenes/09/09_title.gltf') //גטו
		{
			cameraPos = [-2700, 700, 170];		
			cameraPosLookAt = [-5100, 600, -430];  
			text = "text_09";
			nearF = 3700;
			farF = 4000;

			cameraPosTurn = [20, 30, -20];

			nearF = 2500;
			farF = 3500;
			
			var whiteColor = false;

			sound_09.play();

		}
		else if (name == 'models/scenes/10/10_title.gltf')   //  ספריה
		{
			waitFor10 = true;
			cameraPos = [-3300, 750, 2500];		//  [-300, 800, 2100];
			cameraPosLookAt = [-3450, 750, 2310];  // [-3400, 200, 2000]
			text = "text_10";
			nearF = 375;
			farF = 475;
			//stepsColor = 200;
			durationCamera = 3000;

			whiteColor = false;


			var rotate =  0;
			function fadeRotate() {
				if (rotate == -90) { 
					return; 
				}
				rotate -= 0.5;
				cameraZrotate = rotate;
				setTimeout(fadeRotate, 10);
			}
			fadeRotate();

			cameraPosTurn = [-0.1, 0.1, -0.1];
			posShift = 5;

			libraryAnimation.timeScale = 5;
			
			libraryAnimation.loop = THREE.LoopOnce;

			var intensity =  1;
			function fadeIntensity() {
				if (intensity >= 4) { 
					mainSL2.intensity = 4;
					return; 
				}
				intensity += 0.05;
				mainSL2.intensity = intensity;
				setTimeout(fadeIntensity, 10);
			}
			fadeIntensity();

			sound_10.play();
		}
		else if (name == 'models/scenes/11/11_title.gltf') // צמבלולו
		{
			//var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );

			var opacity =  0;
			function fadeOpacity() {
				if (opacity >= 1) { 
					mat_video_11.opacity = 1.0;
					return; 
				}
				if (opacity >= 0.3) { 
					video_11.play();
				}
				video11_Sprite.visible = true;
				opacity += 0.01;
				mat_video_11.opacity = opacity;
				setTimeout(fadeOpacity, 10);
			}
			setTimeout(fadeOpacity, 1000);
		

			cameraPos = [-1500, 600, -4600];
			cameraPosLookAt = [-4000, 550, -3100]; 
			text = "text_11";
			nearF = 3000;
			farF = 3600;
			cameraPosTurn = [-30, 40, -30];

			//PinkeMaterial.color.setHex( 0x020202 )
			//PinkeMaterial.emissive.setHex( 0x000000 )
			
			PinkeMaterial.color.setHex( 0xeeeeee )
			PinkeMaterial.emissive.setHex( 0x000000 )

			changeDownText = false;

		}
		else if (name == 'models/scenes/11/12_title.gltf') // אחים
		{
			cameraPos = [-6400, 1400, -4750];		//  [-9000, 800, -4500]
			cameraPosLookAt = [-5900, 300, -4350];  // [-5400, 200, -4300]
			text = "text_12";
			nearF = 5300;
			farF = 6300;
			
			sound_12.play();
			sp12d.intensity = 0;

			whiteColor = false;
			
			animation_mixers['models/scenes/11/heads.gltf'].timeScale = 1;

			cameraPosTurn = [0, 0, 8];
		}
		else if (name == 'models/scenes/13/13_title.gltf') // סמטוכה
		{
			cameraPos = [-4300, 650, 6900];	
			cameraPosLookAt = [-6500, -150, 4900]; 
			text = "text_13";
			nearF = 2400; //3300
			farF = 3200;  // 4500
			cameraPosTurn = [30, 20, -30];

			whiteColor = 0x000000;

			sound_13.play();

			var intensity =  1;
			function fadeIntensity() {
				if (intensity >= 2) { 
					mainSL3.intensity = 2;
					return; 
				}
				intensity += 0.01;
				mainSL3.intensity = intensity;
				setTimeout(fadeIntensity, 10);
			}
			fadeIntensity();
			//mainSL3.intensity = 2;


		}
		else if (name == 'models/scenes/14/text_moments_new.gltf') // רגעים
		{
			cameraPos = [-650, 600, -3250];		//  [600, 800, -3900]
			cameraPosLookAt = [-2650, 500, -1250];  // [-2600, 200, -1600];
			text = "text_14";
			nearF = 3250;
			farF = 3350;

			//mat.reflectivity = 0;
			video_14.play();
			cup.material = mat_video_14;

			animation_mixers['models/scenes/14/CUP.gltf'].timeScale = -0.4; //cup
			animation_mixers['models/scenes/14/MEN.gltf'].timeScale = 0.5;
			whiteColor = false;

			nearF = 2500;
			farF = 3500;

			cameraPosTurn = [-20, 20, -20];

		}
		else if (name == 'models/scenes/21/21_title.gltf')
		{
			//cameraPos = [-10500, 1000, 3800];		//  [-9500, 800, 4200]
			//cameraPosLookAt = [-7000, 900, 1200];  // [-7000, 200, 200];
			cameraPos = [-7070, 110, 2700];
			cameraPosLookAt = [-6900, 100, 2620]; 
			text = "text_21";
			//nearF = 5250;
			//farF = 5350;
			nearF = 300;
			farF = 650;
			cameraPosTurn = [50, 40, 30];

			whiteColor = 0xff0088;

			stepsColor = 100;

			sound_21.play();
			animation_mixers['models/scenes/21/legs.gltf'].timeScale = 1;

		}

		var x_text_frame = document.getElementById( 'x_text_frame' );
		x_text_frame.style.top = x_from_top;
		x_text_frame.style.right = x_from_right;

		FogFade(nearF, farF, stepsColor);

		if (whiteColor)
		{	
			readColorFade(whiteColor, stepsColor, changeDownText); 
		}

		var elem = document.getElementById(text);
		elem.style.display = 'block';

		cameraReadAnimation (cameraPos, cameraPosLookAt, cameraPosTurn, text, durationCamera);

		currntFrame = text;
	}

	function FogFade(nearF, farF, steps)
	{
		var disN = (MainScene.fog.near - nearF);
		var stepN =  disN / steps;

		function fadeFogNear() {
			if ((disF > -1.0)&&(disF < 1.0)) { 
				MainScene.fog.near = nearF;
				return; 
			}
			MainScene.fog.near -= stepN;
			disN = (MainScene.fog.near - nearF);
			setTimeout(fadeFogNear, 20);
		}
		fadeFogNear();


		var disF = (MainScene.fog.far - farF);
		var stepF =  disF / steps;

		function fadeFogFar() {
			if ((disF > -1.0)&&(disF < 1.0)) { 
				
				MainScene.fog.far = farF;
				return; 
			}
			MainScene.fog.far -= stepF;
			disF = (MainScene.fog.far - farF);
			setTimeout(fadeFogFar, 20);
		}
		fadeFogFar();
	}

	function readColorFade(whiteColor, steps, changeDownText)
	{

		var newColor = new THREE.Color(whiteColor);
		var count = 0;
		var stepR = (MainScene.fog.color.r - newColor.r) / steps;
		var stepG = (MainScene.fog.color.g - newColor.g) / steps;
		var stepB = (MainScene.fog.color.b - newColor.b) / steps;
		function fadeFogColor() {
			if (count == steps) { 
				MainScene.fog.color.setHex(whiteColor);
				return; 
			}
			MainScene.fog.color.r -= stepR;
			MainScene.fog.color.g -= stepG;
			MainScene.fog.color.b -= stepB;
			count++;
			setTimeout(fadeFogColor, 10);
		}
		fadeFogColor();
		
		
		var count2 = 0;
		var stepR = (MainScene.background.r - newColor.r) / steps;
		var stepG = (MainScene.background.g - newColor.g) / steps;
		var stepB = (MainScene.background.b - newColor.b) / steps;
		function fadeBgColor() {
			if (count2 == steps) { 
				MainScene.background.setHex(whiteColor);
				return; 
			}
			MainScene.background.r -= stepR;
			MainScene.background.g -= stepG;
			MainScene.background.b -= stepB;
			count2++;
			setTimeout(fadeBgColor, 10);
		}
		fadeBgColor();
		
		var count3 = 0;
		var stepR = (ground.material.color.r - newColor.r) / steps;
		var stepG = (ground.material.color.g - newColor.g) / steps;
		var stepB = (ground.material.color.b - newColor.b) / steps;
		function fadeGroundColor() {
			if (count3 == steps) { 
				ground.material.color.setHex(whiteColor);
				return; 
			}
			ground.material.color.r -= stepR;
			ground.material.color.g -= stepG;
			ground.material.color.b -= stepB;
			count3++;
			setTimeout(fadeGroundColor, 10);
		}
		fadeGroundColor();


		var count4 = 0;
		var stepR = (ground.material.emissive.r - newColor.r) / steps;
		var stepG = (ground.material.emissive.g - newColor.g) / steps;
		var stepB = (ground.material.emissive.b - newColor.b) / steps;
		function fadeGroundEmissive() {
			if (count4 == steps) { 
				ground.material.emissive.setHex(whiteColor);
				return; 
			}
			ground.material.emissive.r -= stepR;
			ground.material.emissive.g -= stepG;
			ground.material.emissive.b -= stepB;
			count4++;
			setTimeout(fadeGroundEmissive, 10);
		}
		fadeGroundEmissive();

		var opacityStep = 1/steps;
		function fadeGroundOpacity() {
			if (ground.material.opacity <= 0) { 
				ground.material.opacity = 0;
				return; 
			}
			ground.material.opacity -= opacityStep;
			setTimeout(fadeGroundOpacity, 10);
		}
		fadeGroundOpacity();

		//ground.visible = false;
		//
		if (changeDownText)
		{
			DarkPinkMaterial.color.setHex(0x666666);
			DarkPinkMaterial.emissive.setHex(0x333333);
		}
		//

	}

	function readEnd()
	{
		
		permanent.style.opacity = 1;
		permanent.style.display = 'block';

		readMode = false;
		if (currntFrame == "text_02")
		{
			sound_02.pause();
		}
		if (currntFrame == "text_06")
		{
			sound_06.pause();
		}

		else if (currntFrame == "text_09")
		{
			sound_09.pause();
		}
		else if (currntFrame == "text_10")
		{
			waitFor10 = false;
			var rotate =  -90;
			function fadeRotate() {
				if (rotate >= 0) { 
					cameraZrotate = 0;
					return; 
				}
				rotate += 0.6;
				cameraZrotate = rotate;
				setTimeout(fadeRotate, 10);
			}
			fadeRotate();

			console.log(libraryAnimation);
			posShift = 50;
			libraryAnimation.timeScale = 1;
			libraryAnimation.loop = THREE.LoopRepeat;
			libraryAnimation.reset();


			var intensity =  4;
			function fadeIntensity() {
				if (intensity <= 1) { 
					mainSL2.intensity = 1;
					return; 
				}
				intensity -= 0.01;
				mainSL2.intensity = intensity;
				setTimeout(fadeIntensity, 10);
			}
			fadeIntensity();

			sound_10.pause();
		}
		else if (currntFrame == "text_11")
		{
			video11_Sprite.visible = false;
			mat_video_11.opacity = 0.0;

			PinkeMaterial.color.setHex( 0x0000D6 )
			PinkeMaterial.emissive.setHex( 0xD60000 )

			video_11.pause();
		}
		else if (currntFrame == "text_12")
		{
		sound_12.pause();
		sp12d.intensity = 2;
		animation_mixers['models/scenes/11/heads.gltf'].timeScale = 0;
		}
		else if (currntFrame == "text_13")
		{
		sound_13.pause();

		var intensity =  2;
		function fadeIntensity() {
			if (intensity <= 1) { 
				mainSL3.intensity = 1;
				return; 
			}
			intensity -= 0.01;
			mainSL3.intensity = intensity;
			setTimeout(fadeIntensity, 10);
		}
		fadeIntensity();

		}
		else if (currntFrame == "text_14")
		{
			video_14.pause();
			cup.material = OrangeMaterial;
			animation_mixers['models/scenes/14/CUP.gltf'].timeScale = -1;
		}
		else if (currntFrame == "text_21")
		{
			sound_21.pause();
			animation_mixers['models/scenes/21/legs.gltf'].timeScale = 0.05;
		}


		var elem = document.getElementById(currntFrame);
		elem.style.opacity = 0;
		elem.style.display = 'none';

		cameraCubeAnimation(currentCube);
		//cameraCubeAnimation(2700, 800, 600);

		MainScene.background = new THREE.Color('black');
		ground.material.color.setHex(0xffffff);
		ground.material.emissive.setHex(0x000000);
		ground.visible = true;
		ground.material.opacity = 1;
		//
		DarkPinkMaterial.color.setHex(0x060503);
		DarkPinkMaterial.emissive.setHex(0x000000);
		//

		FogFade(2500, 11000, 20);
		MainScene.fog.color.setHex(0x000000);
	}

    function cameraCubeAnimation(object)
    {
		var cameraPos = object.cameraCords;
		var cameraPosLookAt =  object.cameraLookAt;
		var cameraPosTurn = object.cameraTurn;

        CAMERACHANGE = true;
        var target = new THREE.Vector3(cameraPos[0], cameraPos[1], cameraPos[2]); // create on init
		animateVector3(cameraPosVec, target, {
            
            duration: 2000, 
            
            easing : TWEEN.Easing.Quadratic.InOut,
            
            update: function(d) {
                //console.log("Updating: " + d);
            },
            
            callback : function(){
			
            CAMERACHANGE = false;				

            }
		});

		var target_L = new THREE.Vector3(cameraPosLookAt[0], cameraPosLookAt[1], cameraPosLookAt[2]); // create on init
        animateVector3(cameraLookAt, target_L, {
            
            duration: 2000, 
            
            easing : TWEEN.Easing.Quadratic.InOut,
            
            update: function(d) {
                //console.log("Updating: " + d);
            },
            
            callback : function(){
            CAMERACHANGE = false;				
            }
		});
		
		var target_T = new THREE.Vector3(cameraPosTurn[0], cameraPosTurn[1], cameraPosTurn[2]); // create on init
        animateVector3(cameraTurn, target_T, {
            
            duration: 2000, 
            
            easing : TWEEN.Easing.Quadratic.InOut,
            
            update: function(d) {
                //console.log("Updating: " + d);
            },
            
            callback : function(){

            }
		});

		//
		// 1
		//
		var sl1p = object.lights[0].position;
		var target_L1 = new THREE.Vector3(sl1p.x, sl1p.y, sl1p.z);
        animateVector3(mainSL1.position, target_L1, {
            duration: 2000, 
            easing : TWEEN.Easing.Quadratic.InOut,
            update: function(d) {
                //console.log("Updating: " + d);
            },
            callback : function(){
            }
		});
		//
		var sl1tp = object.lights[0].target.position;
		var target_L1T = new THREE.Vector3(sl1tp.x, sl1tp.y, sl1tp.z); 
        animateVector3(mainSL1.target.position, target_L1T, {
            duration: 2000, 
            easing : TWEEN.Easing.Quadratic.InOut,
            update: function(d) {
                //console.log("Updating T: " + d);
            },
            callback : function(){
				//console.log(mainSL1.target.position);
            }
		});

		//
		// 2
		//
		var sl1p = object.lights[1].position;
		var target_L1 = new THREE.Vector3(sl1p.x, sl1p.y, sl1p.z);
        animateVector3(mainSL2.position, target_L1, {
            duration: 2000, 
            easing : TWEEN.Easing.Quadratic.InOut,
            update: function(d) {
                //console.log("Updating: " + d);
            },
            callback : function(){
            }
		});
		//
		var sl1tp = object.lights[1].target.position;		
		var target_L1T = new THREE.Vector3(sl1tp.x, sl1tp.y, sl1tp.z); 
        animateVector3(mainSL2.target.position, target_L1T, {
            duration: 2000, 
            easing : TWEEN.Easing.Quadratic.InOut,
            update: function(d) {
                //console.log("Updating T: " + d);
            },
            callback : function(){
            }
		});

		//
		// 3
		//
		var sl1p = object.lights[2].position;
		var target_L1 = new THREE.Vector3(sl1p.x, sl1p.y, sl1p.z);
        animateVector3(mainSL3.position, target_L1, {
            duration: 2000, 
            easing : TWEEN.Easing.Quadratic.InOut,
            update: function(d) {
                //console.log("Updating: " + d);
            },
            callback : function(){
            }
		});
		//
		var sl1tp = object.lights[2].target.position;
		var target_L1T = new THREE.Vector3(sl1tp.x, sl1tp.y, sl1tp.z); 
		animateVector3(mainSL3.target.position, target_L1T, {
            duration: 2000, 
            easing : TWEEN.Easing.Quadratic.InOut,
            update: function(d) {
                //console.log("Updating T: " + d);
            },
            callback : function(){
            }
		});

		var opacity = 0;
		var opacity2 = 1.0;

		var sameLight = ((object.lights[0].position.x == mainSL1.position.x) &&
						(object.lights[0].position.y == mainSL1.position.y) &&
						(object.lights[0].position.z == mainSL1.position.z));
		
		function fadeOutLights() {
			if (opacity2 <= 0.0) { 
				return; 
			}
			opacity2 -= 0.01;
			object.lights[0].intensity = opacity2 ;
			object.lights[1].intensity = opacity2 ;
			object.lights[2].intensity = opacity2 ;
			setTimeout(fadeOutLights, 10);
		}
		if (!sameLight)
		{
			fadeOutLights();
		}
		
		
		function fadeInLights() {
			if (opacity >= 1) { 
				currentCube = object;
				return; 
			}
			opacity += 0.01;
			currentCube.lights[0].intensity = opacity ;
			currentCube.lights[1].intensity = opacity ;
			currentCube.lights[2].intensity = opacity ;
			setTimeout(fadeInLights, 10);
		}

		if (start)
		{
			currentCube = object;
			start = false;
		}
		else
		{
			if (!sameLight)
			{
				fadeInLights();
			}
			else
			{
				currentCube = object;
			}
			
		}
		
		
	}
	    
    function cameraReadAnimation(cameraPos, cameraPosLookAt, cameraPosTurn, text, duration)
    {
		

		var opacity = 1
		function fadeOutPermanent() {
			if (opacity <= 0) { 
				permanent.style.opacity = 0; 
				permanent.style.display = 'none';
				return; }
				opacity -= 0.01;
				permanent.style.opacity = opacity ;
			setTimeout(fadeOutPermanent, 10);
		}
		fadeOutPermanent();




		var startReadMode = function()
		{
			console.log(libraryAnimation.isRunning(), waitFor10);
			if ((libraryAnimation.isRunning())&&(waitFor10))
			{
				setTimeout(startReadMode, 10);
			}
			else
			{
			CAMERACHANGE = false;
			var elem = document.getElementById(text);
			if (!readMode)
				{
				fadeText(elem, 750);
				readMode = true;
				}
			return;
			}
			//elem.style.opacity = 1;
		}
			

        CAMERACHANGE = true;
        var target = new THREE.Vector3(cameraPos[0], cameraPos[1], cameraPos[2]); // create on init
		animateVector3(cameraPosVec, target, {
            
            duration: duration, 
            
            easing : TWEEN.Easing.Quadratic.InOut,
            
            update: function(d) {
                //console.log("Updating: POS" + d);
            },
            
            callback : startReadMode
		});

		var target_L = new THREE.Vector3(cameraPosLookAt[0], cameraPosLookAt[1], cameraPosLookAt[2]); // create on init
        animateVector3(cameraLookAt, target_L, {
            
            duration: duration, 
            
            easing : TWEEN.Easing.Quadratic.InOut,
            
            update: function(d) {
                //console.log("Updating:  LA" + d);
            },
            
            callback : function(){
            CAMERACHANGE = false;				

            }
		});

		var target_T = new THREE.Vector3(cameraPosTurn[0], cameraPosTurn[1], cameraPosTurn[2]); // create on init
        animateVector3(cameraTurn, target_T, {
            
            duration: duration, 
            
            easing : TWEEN.Easing.Quadratic.InOut,
            
            update: function(d) {
                //console.log("Updating: TU" + d);
            },
            
            callback : function(){

            }
		});
		
	}
	
	function fadeText(el, duration) {

		/*
		* @param el - The element to be faded out.
		* @param duration - Animation duration in milliseconds.
		*/
		var x_text_frame = document.getElementById( 'x_text_frame' );


		
		var step = 10 / duration;
			
		
		function fadeIn() {
			if (opacity >= 1) { 
				el.style.opacity = 1;
				x_text_frame.style.opacity = 1 ;
				return; }
			el.style.opacity = (opacity += step) ;
			x_text_frame.style.opacity = (opacity += step) ;
			setTimeout(fadeIn, 10);
		}
		
		function fadeOut() {
			if (opacity <= 0) { 
				el.style.opacity = 0;
				el.style.display = 'none';
				return; }
			el.style.opacity = (opacity -= step) ;
			setTimeout(fadeOut, 10);
		}
		if  (el.style.opacity == 0) {
			var opacity = 0;
			fadeIn();}

		if  (el.style.opacity == 1) {
			var opacity = 1; 
			fadeOut();}

	}

    function animateVector3(vectorToAnimate, target, options){
        //ALL FROM INTERNET - DONT TOUCH
        options = options || {};
        // get targets from options or set to defaults
        var to = target || THREE.Vector3(),
            easing = options.easing || TWEEN.Easing.Quadratic.In,
            duration = options.duration || 2000;
        // create the tween
        var tweenVector3 = new TWEEN.Tween(vectorToAnimate)
            .to({ x: to.x, y: to.y, z: to.z, }, duration)
            .easing(easing)
            .onUpdate(function(d) {
                if(options.update){ 
                    options.update(d);
                }
             })
            .onComplete(function(){
              if(options.callback) options.callback();
            });
        // start the tween
        tweenVector3.start();
        // return the tween in case we want to manipulate it later on
        return tweenVector3;

    }

	function animate (time) {
        requestAnimationFrame( animate );

		// check X ppress
		var x_text_frame = document.getElementById( 'x_text_frame' );
		if (x_text_frame.clicked == true)
		{
			readEnd();
			x_text_frame.clicked = false;
		}


        //tween update
		TWEEN.update(time);
        
        //animation mixers
		var delta = clock.getDelta();
        //
		for ( var i = 0; i < mixers.length; ++ i ) {
			mixers[ i ].update( delta );
		}

		//camera - update - on mouse move
		//
		

		var comptXZ =  Math.sin( .5 * Math.PI * ( mouse.x));
		var comptY = Math.sin( .25 * Math.PI * ( mouse.y) );
		//

		if ((cameraTurn.y != 0))
		{
			camera.position.x = cameraPosVec.x + comptXZ*posShift;
			camera.position.y = cameraPosVec.y + comptY*posShift;
			camera.position.z = cameraPosVec.z + comptXZ*posShift;
		}
		//


		camera.lookAt( cameraTurn.x*comptXZ+cameraLookAt.x,
						cameraTurn.y*comptY+cameraLookAt.y,
						cameraTurn.z*comptXZ+cameraLookAt.z );


		if (cameraZrotate)
		{
			camera.rotateZ(cameraZrotate * Math.PI/180);
		}
				
		if (readMode)
		{
			var info = document.getElementById('all');
			var info2 = document.getElementById(currntFrame);
			var info3 = info2.contentWindow.document.getElementById('run_text');

			var top = 0;
			var left = 0;

			switch(currntFrame) {
				case "text_02":
					left = 0.7;
					top = 0.06;
					break;
				case "text_06":
					var changeY = (58 + comptY * 3);
					info2.style.top = changeY+'%';
					var changeXZ = (-28 - comptXZ * 1.7);
					info2.style.left = changeXZ+'%';
					//
					left = 0.12;
					top = 0.58;
				 	break;
				case "text_09":
					var changeY = (15 + comptY * 1.5);
					info2.style.top = changeY+'%';
					var changeXZ = (0 - comptXZ * 1.2);
					info2.style.left = changeXZ+'%';
					//
					left = 0.15;
					top = 0.15;
					break;
				case "text_10":
					left = 0.2;
					top = 0.15;
					break;
				case "text_11":
					left = 0.05;
					top = 0.0;
					break;
				case "text_12":
					var changeY = (30 - comptY * 0.1);
					info2.style.top = changeY+'%';
					var changeXZ = (-1 + comptXZ * 0.1);
					info2.style.left = changeXZ+'%';
					//
					left = 0.2;
					top = 0.3;
					break;
				case "text_13":
					left = 0.25;
					top = 0.55;
				break;
				case "text_14":
					left = 0.22;
					top = 0.05;
				break;
				case "text_21":
					left = 0.09;
					top = 0.12;
					break;
				default:
				  // code block
			  }

			var x = ( (info3.x +window.innerWidth * left) / window.innerWidth ) * 2 - 1;
			var y = - ( (info3.y+ window.innerHeight * top) / window.innerHeight ) * 2 + 1;
			if ((prev_frame_mouse.x != x) || (prev_frame_mouse.y != y))
			{
				mouse.x = x;
				mouse.y = y;
				prev_frame_mouse.x = x;
				prev_frame_mouse.y = y;
			}

		}



		render();
		
	};

	function render() {
        // CUBES CHANGE COLOR ON MOUSE MOVE
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( modelObjects.concat(MainScene.children) );
        //
		if (( intersects.length > 0 ) && ( !readMode ) &&(!permanent.pp)) {
			var index = 0;
			if(intersects[ index ].object.type=='Sprite'){
				//intersects[ index ].object.material.opacity = 1;
				if ( INTERSECTED0 != intersects[ index ].object ) {
					if ( INTERSECTED0 )
					{
						INTERSECTED0.material.opacity = 0.6;
						INTERSECTED0 = null;
					} 
					INTERSECTED0 = intersects[index].object;
					INTERSECTED0.material.opacity = 1;
					
				}

			}
			else {
				if ( INTERSECTED0 )
				{
					INTERSECTED0.material.opacity = 0.6;
					INTERSECTED0 = null;
				} 
			}

			if ((intersects[0].object.type == 'Sprite')&&(intersects.length > 1))
			{
				index = 1;
			}
			
				if(intersects[ index ].object.geometry.type=='BoxGeometry'){
					if ( INTERSECTED != intersects[ index ].object ) {
						if ( INTERSECTED )
						{
							INTERSECTED.material = INTERSECTED.OldMaterial;
							if( INTERSECTED.dual) {INTERSECTED.dual.material = INTERSECTED.OldMaterial;}
						} 
						INTERSECTED = intersects[ index ].object;
						INTERSECTED.OldMaterial = INTERSECTED.material
						INTERSECTED.material = CubeMaterial_P;
						if( INTERSECTED.dual) {INTERSECTED.dual.material = CubeMaterial_P;}

					}
				}
				else
				{
					if ( INTERSECTED )
					{
						INTERSECTED.material = INTERSECTED.OldMaterial;
						if( INTERSECTED.dual) {INTERSECTED.dual.material = INTERSECTED.OldMaterial;}

					} 
					INTERSECTED = null;
				}

				if (intersects[index].object.sceneName)
				{
					if ( INTERSECTED2 != intersects[ index ].object.sceneName ) {
						if ( INTERSECTED2 )
						{
							modelObjects.forEach(element => {
								if (element.sceneName == INTERSECTED2)
								{
									element.material = PinkeMaterial;
								}
							});
						} 
						INTERSECTED2 = intersects[ index ].object.sceneName;
						
						modelObjects.forEach(element => {
							if (element.sceneName == INTERSECTED2)
							{
								element.material = whiteMaterial;
							}
						});
					}
			} 
			else
			{
				if (INTERSECTED2)
				{
					modelObjects.forEach(element => {
						if (element.sceneName == INTERSECTED2)
						{
							element.material = PinkeMaterial;
						}
					});
				}
				INTERSECTED2 = null;
			}
			
		}
		
        //RENDER
		

		if ((postP)||(permanent.pp)){
			composer.render(0.1);
			OverlayComposer.render(0.1);
			newComposer.render(0.1);

		}
		else
		{
			renderer.render(MainScene, camera);
		}


	}


	function loadingManager()
	{
		manager = new THREE.LoadingManager();
		manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

			console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

		};

		manager.onLoad = function ( ) {
			allModelsLoaded=true;
			console.log( 'Loading complete!');

		};


		manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

			//console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

		};

		manager.onError = function ( url ) {

			console.error( 'There was an error loading ' + url );

		};

	}



    // MAIN


	loadingManager();

	init();

	animate();







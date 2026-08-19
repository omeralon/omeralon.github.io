

  //  import * as THREE from '../build/three.module.js';

    import Stats from '/three/examples/jsm/libs/stats.module.js';

    import { EffectComposer } from '/three/examples/jsm/postprocessing/EffectComposer.js';
    import { RenderPass } from '/three/examples/jsm/postprocessing/RenderPass.js';
    import { ShaderPass } from '/three/examples/jsm/postprocessing/ShaderPass.js';
    import { BloomPass } from '/three/examples/jsm/postprocessing/BloomPass.js';
    import { FilmPass } from '/three/examples/jsm/postprocessing/FilmPass.js';
    import { DotScreenPass } from '/three/examples/jsm/postprocessing/DotScreenPass.js';
    import { MaskPass, ClearMaskPass } from '/three/examples/jsm/postprocessing/MaskPass.js';
    import { TexturePass } from '/three/examples/jsm/postprocessing/TexturePass.js';

    import { BleachBypassShader } from '/three/examples/jsm/shaders/BleachBypassShader.js';
    import { ColorifyShader } from '/three/examples/jsm/shaders/ColorifyShader.js';
    import { HorizontalBlurShader } from '/three/examples/jsm/shaders/HorizontalBlurShader.js';
    import { VerticalBlurShader } from '/three/examples/jsm/shaders/VerticalBlurShader.js';
    import { SepiaShader } from '/three/examples/jsm/shaders/SepiaShader.js';
    import { VignetteShader } from '/three/examples/jsm/shaders/VignetteShader.js';
    import { GammaCorrectionShader } from '/three/examples/jsm/shaders/GammaCorrectionShader.js';

    import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';

    var composerSceneM;
    var container, stats;
    var cubeTurns, cubeTurns2;
    var composerScene, composer1, composer2, composer3, composer4;

    var cameraOrtho, cameraPerspective, sceneModel, sceneBG, renderer, mesh, directionalLight;

    var width = window.innerWidth || 2;
    var height = window.innerHeight || 2;

    var halfWidth = width / 2;
    var halfHeight = height / 2;

    var quadBG, quadMask, renderScene;

    var delta = 0.01;

    init();
    animate();

    function init() {

        container = document.getElementById( 'canvas' );

        //

        cameraOrtho = new THREE.OrthographicCamera( - halfWidth, halfWidth, halfHeight, - halfHeight, - 10000, 10000 );
        cameraOrtho.position.z = 100;

        cameraPerspective = new THREE.PerspectiveCamera( 50, width / height, 1, 10000 );
        cameraPerspective.position.z = 900;

        //

        sceneModel = new THREE.Scene();
        sceneBG = new THREE.Scene();

        //

        directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.set( 0, - 0.1, 1 ).normalize();
        sceneModel.add( directionalLight );

        var loader = new GLTFLoader();
        loader.load( "models/CUP.gltf", function ( gltf ) {

            createMesh( gltf.scene.children[ 0 ].geometry, sceneModel, 100 );

        } );

        //

        var diffuseMap = new THREE.TextureLoader().load( "img/0_stage.jpg" );
        diffuseMap.encoding = THREE.sRGBEncoding;

        var materialColor = new THREE.MeshBasicMaterial( {
            map: diffuseMap,
            depthTest: false
        } );

        quadBG = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), materialColor );
        quadBG.position.z = - 500;
        quadBG.scale.set( width, height, 1 );
        sceneBG.add( quadBG );

        var geometry = new THREE.BoxGeometry(100, 100, 100);
		//
		var material1 = new THREE.MeshLambertMaterial( { color: 0xff6600 } );
		cubeTurns2 = new THREE.Mesh( geometry, material1 );
		cubeTurns2.position.x = 400;
		cubeTurns2.position.y = 100;
		cubeTurns2.position.z = -900;
		cubeTurns2.receiveShadow = true;
		cubeTurns2.castShadow = true;
		sceneBG.add( cubeTurns2 );

        //

        var sceneMask = new THREE.Scene();

        quadMask = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) );
        quadMask.position.z = - 300;
        quadMask.scale.set( width / 2, height / 2, 1 );
        sceneMask.add( quadMask );

        //

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( width, height );
        renderer.autoClear = false;

        //

		document.body.appendChild( renderer.domElement );

        //

        stats = new Stats();
        //container.appendChild( stats.dom );

        //

        var shaderBleach = BleachBypassShader;
        var shaderSepia = SepiaShader;
        var shaderVignette = VignetteShader;
        var effectBleach = new ShaderPass( shaderBleach );
        var effectSepia = new ShaderPass( shaderSepia );
        var effectVignette = new ShaderPass( shaderVignette );
        var gammaCorrection = new ShaderPass( GammaCorrectionShader );
        effectBleach.uniforms[ "opacity" ].value = 0.95;
        effectSepia.uniforms[ "amount" ].value = 0.9;
        effectVignette.uniforms[ "offset" ].value = 0.95;
        effectVignette.uniforms[ "darkness" ].value = 1.6;
        var effectFilm = new FilmPass( 0.35, 0.025, 648, false );
        var effectFilmBW = new FilmPass( 0.35, 0.5, 2048, true );
        var effectHBlur = new ShaderPass( HorizontalBlurShader );
        var effectVBlur = new ShaderPass( VerticalBlurShader );
        effectHBlur.uniforms[ 'h' ].value = 2 / ( width / 2 );
        effectVBlur.uniforms[ 'v' ].value = 2 / ( height / 2 );
        var effectColorify1 = new ShaderPass( ColorifyShader );
        var effectColorify2 = new ShaderPass( ColorifyShader );
        effectColorify1.uniforms[ 'color' ] = new THREE.Uniform( new THREE.Color( 1, 0.8, 0.8 ) );
        effectColorify2.uniforms[ 'color' ] = new THREE.Uniform( new THREE.Color( 1, 0.75, 0.5 ) );

        
        var clearMask = new ClearMaskPass();
        var renderMask = new MaskPass( sceneModel, cameraPerspective );
        var renderMaskInverse = new MaskPass( sceneModel, cameraPerspective );
        renderMaskInverse.inverse = true;

        //

        var rtParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: true
        };

        var rtWidth = width / 2;
        var rtHeight = height / 2;

        //

        var renderBackground = new RenderPass( sceneBG, cameraOrtho );
        var renderModel = new RenderPass( sceneModel, cameraPerspective );

        renderModel.clear = false;

        composerScene = new EffectComposer( renderer, new THREE.WebGLRenderTarget( rtWidth * 2, rtHeight * 2, rtParameters ) );

        composerScene.addPass( renderBackground );
        //composerScene.addPass( renderModel );
        composerScene.addPass( renderMaskInverse );
        composerScene.addPass( effectHBlur );
        composerScene.addPass( effectVBlur );
        composerScene.addPass( clearMask );


        composerSceneM = new EffectComposer( renderer);

        composerSceneM.addPass( renderModel );
        composerSceneM.addPass( clearMask );

        //

        renderScene = new TexturePass( composerScene.renderTarget2.texture );
        var renderSceneM = new TexturePass( composerSceneM.renderTarget2.texture );

        //

        composer1 = new EffectComposer( renderer, new THREE.WebGLRenderTarget( rtWidth*2, rtHeight*2, rtParameters ) );

        composer1.addPass( renderScene );
        composer1.addPass( renderMask );
        composer1.addPass( renderSceneM );
        composer1.addPass( clearMask );
        composer1.addPass( gammaCorrection );
        composer1.addPass( renderMaskInverse );

        composer1.addPass( effectFilmBW );
        composer1.addPass( clearMask );

        composer1.addPass( effectVignette );

        //

       
        //renderScene.uniforms[ "tDiffuse" ].value = composerScene.renderTarget2.texture;

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {

        halfWidth = window.innerWidth / 2;
        halfHeight = window.innerHeight / 2;

        cameraPerspective.aspect = window.innerWidth / window.innerHeight;
        cameraPerspective.updateProjectionMatrix();

        cameraOrtho.left = - halfWidth;
        cameraOrtho.right = halfWidth;
        cameraOrtho.top = halfHeight;
        cameraOrtho.bottom = - halfHeight;

        cameraOrtho.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        composerScene.setSize( halfWidth * 2, halfHeight * 2 );

        composer1.setSize( halfWidth, halfHeight );
        composer2.setSize( halfWidth, halfHeight );
        composer3.setSize( halfWidth, halfHeight );
        composer4.setSize( halfWidth, halfHeight );

        renderScene.uniforms[ "tDiffuse" ].value = composerScene.renderTarget2.texture;

        quadBG.scale.set( window.innerWidth, window.innerHeight, 1 );
        quadMask.scale.set( window.innerWidth / 2, window.innerHeight / 2, 1 );

    }

    function createMesh( geometry, scene, scale ) {



        var geometry = new THREE.BoxGeometry(100, 100, 100);
		//
		var material1 = new THREE.MeshLambertMaterial( { color: 0xff6600 } );
		cubeTurns = new THREE.Mesh( geometry, material1 );
		cubeTurns.position.x = 400;
		cubeTurns.position.y = 100;
		cubeTurns.position.z = -900;
		cubeTurns.receiveShadow = true;
		cubeTurns.castShadow = true;
		scene.add( cubeTurns );

    }

    //

    function animate() {

        requestAnimationFrame( animate );

                
        //cube turning 
		cubeTurns.rotation.x += 0.01;
		cubeTurns.rotation.y += 0.01;
		
                
        //cube turning 
		cubeTurns2.rotation.x += 0.01;
		cubeTurns2.rotation.y += 0.01;
        render();

    }

    function render() {

        //renderer.setViewport( 0, 0, halfWidth, halfHeight );
        composerScene.render( delta );
        composerSceneM.render(delta);
        composer1.render( delta );


    }
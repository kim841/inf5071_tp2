"use strict";
import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

let scene, camera, renderer;  // Bases pour le rendu Three.js
let controls; // Pour l'interaction avec la souris
let canvas;  // Le canevas où est dessinée la scène
let ambient_light;
let camera_light;
let last_render = Date.now();

const color = {
    rouge: 0xff0000,
    vert: 0x00ff00,
    bleu: 0x0000ff,
    jaune: 0xffff00,
    cyan: 0x00ffff,
    orange: 0xffa500,
    blanc: 0xffffff,
    vertFonce: 0x006400,
}
let L1, L2, L3, L4, L5; //Points de lagrange
let orbitSatteliteJamesWebb, earth, sun;

const planetRadius = {
    earth: 0.05,
    sun: 0.09,
}

const orbitRadius = {
    earthAroundSun: 1,
    othersAroundSun: 2,
}


// NOTE: vous pouvez ajouter des variables globales au besoin.



/* Création de la scène 3D */
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0,0,0);

    // TODO: Dessiner les étoiles

    // TODO: Dessiner le soleil
    sun = draw_sun(planetRadius.sun);
    scene.add(sun);

    // // TODO: Dessiner l'orbite de la planète
    scene.add(draw_orbit(orbitRadius.earthAroundSun, color.blanc));
    
    // Dessiner le système Terre-Lagrange
    // TODO: dessiner la planète
    earth = draw_earth(planetRadius.earth);
    scene.add(earth);
    
    const coordL2 = cartisianCoordinates(0.5, degresToRadians(0), {x:1, y:0, z:0})
    L2 = draw_pyramid(color.vert, 0.1, {x:coordL2.x, y:coordL2.y, z:coordL2.z});
    scene.add(L2);
    
    orbitSatteliteJamesWebb = draw_orbit((1/8.0)*orbitRadius.earthAroundSun, color.vertFonce);
    orbitSatteliteJamesWebb.position.set(1.5,0,0);
    scene.add(orbitSatteliteJamesWebb);

    const theta = Math.random() * 2 * Math.PI;
    const orbitPoint = calculateOrbitPoint((1/8.0) * orbitRadius.earthAroundSun, theta);
    
    // https://threejs.org/docs/#examples/en/loaders/GLTFLoader
    
    const loaderSatellite = new GLTFLoader();
    loaderSatellite.load('tp2_satellite.glb', function (gltf) {
        const satellite = gltf.scene;
        satellite.scale.set(0.02,0.02,0.02);
        satellite.position.set(orbitPoint.x, orbitPoint.y, orbitPoint.z);
        

        orbitSatteliteJamesWebb.add(satellite);

    }, undefined, function (error) {
        console.error(error);
    });

    // TODO: Ajout d'une source de lumière directionnelle
    var light = new THREE.DirectionalLight(0xFFFFFF)
    light.position.set(1, 0, 0)
    // const helper = new THREE.DirectionalLightHelper( light, 5 );
    // scene.add( helper );
    scene.add(light)

    // TODO: Dessiner les points de Lagrange et l'orbite L2
    scene.add(draw_orbit(orbitRadius.othersAroundSun, color.blanc));
    const coordL1 = cartisianCoordinates(-0.5, degresToRadians(0), {x:1, y:0, z:0})
    L1 = draw_pyramid(color.rouge, 0.1, {x:coordL1.x, y:coordL1.y, z:coordL1.z});
    scene.add(L1);
    
    const coordL3 = cartisianCoordinates(2, degresToRadians(180), {x:1, y:0, z:0})
    L3 = draw_pyramid(color.bleu, 0.1, {x: coordL3.x, y:coordL3.y, z:coordL3.z});
    scene.add(L3);

    const coordL4 = cartisianCoordinates(1, degresToRadians(60), {x:0, y:0, z:0})
    L4 = draw_pyramid(color.jaune, 0.1, {x: coordL4.x, y:coordL4.y, z:coordL4.z});
    scene.add(L4);

    const coordL5 = cartisianCoordinates(1, degresToRadians(-60), {x:0, y:0, z:0})
    L5 = draw_pyramid(color.cyan, 0.1, {x:coordL5.x, y:coordL5.y, z:coordL5.z});
    scene.add(L5);


    sun.add(L2);
    sun.add(orbitSatteliteJamesWebb);
    sun.add(earth);
    sun.add(L1);
    sun.add(L3);
    sun.add(L4);
    sun.add(L5);

    // Créer une caméra
    camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 0.1, 100);
    camera.position.x = 2;
    camera.position.y = 2;
    camera.position.z = 1; //déplacer la caméra pour voir la scène position.z initial = 1
    camera.lookAt(0,0,0);
    scene.add(camera);

    ambient_light = new THREE.AmbientLight("white", 0.0); // soft white light
    scene.add( ambient_light );

    camera_light = new THREE.DirectionalLight("white", 0.0);
    camera.add(camera_light);

}

function generate_randomStars() {
    // TODO: générer les positions des étoiles
}

/**
 * Structure de données du système de fonctions itératives (IFS) qui génère des pyramides
 * @returns {Object} model - un modèle IFS
 */
function generate_pyramid_IFS(){

    let model = {}

    let vertices = new Float32Array([
        Math.sqrt(8/parseFloat(9)),0,-1/parseFloat(3),  
        - Math.sqrt(2/parseFloat(9)),Math.sqrt(2/parseFloat(3)),-1/parseFloat(3),
        - Math.sqrt(2/parseFloat(9)),-Math.sqrt(2/parseFloat(3)),-1/parseFloat(3),
        0,0,1,
    ]);
    let indicesOfFaces = [
        0,3,2,  1,3,0,  2,3,1,  0,2,1
    ];

    model = {vertices, indicesOfFaces}
   
    return model
}

function draw_pyramid(color, scale, position) {
    let pyramid = null;
    // TODO: dessiner la pyramide
    let pyramidIFS = generate_pyramid_IFS();
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex( pyramidIFS.indicesOfFaces );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( pyramidIFS.vertices, 3 ) );
    const material = new THREE.MeshBasicMaterial( { color: color } );
    pyramid = new THREE.Mesh( geometry, material );

    pyramid.scale.set(scale,scale,scale);
    pyramid.position.set(position.x, position.y, position.z);

    //calculer les normales
    // pour avoir le visuel des normales, commenter le code d'animation dans animate(), "if (run_animation.checked)"
    // geometry.computeVertexNormals();
    // const helper = new VertexNormalsHelper( pyramid, 1, 0xff0000 );
    // scene.add( helper );

    return pyramid
}


function draw_sun(radius) {
    // TODO: dessiner le soleil
    const geometry = new THREE.SphereGeometry( radius, 32, 16 ); 
    const material = new THREE.MeshBasicMaterial( { color: color.orange } ); 
    const sphere = new THREE.Mesh( geometry, material );

    return sphere;

}

function draw_earth(radius) {
    let earth = null;
    // TODO: dessiner la planète
    const geometry = new THREE.SphereGeometry( radius, 32, 16 ); 

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load( 'tp2_texture_planete.jpg' );

    texture.minFilter = THREE.LinearFilter;
    
    const material = new THREE.MeshBasicMaterial( { map: texture, specular: 0x000000} ); 

    // const material = new THREE.MeshLambertMaterial( { color: color.blanc } ); 
    earth = new THREE.Mesh( geometry, material );
    earth.position.x = 1;
    return earth
}

function draw_stars() {
    // TODO: dessiner les étoiles
}

function draw_orbit(radius, color){
    let orbit = null;
    // TODO: dessiner l'orbite de la planète
    const geometry = new THREE.RingGeometry( radius, radius + 0.01, 100 ); 
    const material = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide } );
    orbit = new THREE.Mesh( geometry, material ); 
    return orbit
}

function animate() {
    // let textureTranslation = 0; // Translation tx des coordonnées de texture pour simuler la rotation de la Terre autour de son axe.
    // let orbitAngle1 = 0; // Angle de rotation θ1 pour simuler l’orbite du satellite autour du point de Lagrange L2
    // let orbitAngle2 = 0; // Angle de rotation θ2 pour simuler l’orbite de la Terre, des points de Lagrange et du satellite autour du soleil.

    // Ajout d'une lumière de point de vue
    let camera_light_intensity = document.getElementById("toggleViewlight").checked;
    if (camera_light_intensity) {
        camera_light.intensity = 1.0;
    } else {
        camera_light.intensity = 0.0;
    }

    // Ajout d'une lumière ambiante
    let ambient_light_intensity = document.getElementById("controlAmbientLight").value;
    ambient_light.intensity = ambient_light_intensity/ 100;

    // Affichage du gizmo pour l'interaction avec la souris
    let acrball_gizmo = document.getElementById("toggleGizmo");
    if (acrball_gizmo.checked) {
        controls.setGizmosVisible(true);
    } else {
        controls.setGizmosVisible(false);
    }

    // Contrôle de l'animation
    let run_animation = document.getElementById("toggleAnimation");
    if (run_animation.checked) {
        // TODO: animer la scène
        // textureTranslation += 0.001;
        // orbitAngle1 += 0.01;
        // orbitAngle2 += 0.005;

        earth.rotation.z += 0.001; 
        earth.rotation.x += 0.001;  
        orbitSatteliteJamesWebb.rotation.z  += 0.003;     
        sun.rotation.z += 0.001;
    }
    
    last_render = Date.now();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    
}

function degresToRadians(angle) {
    return angle * (Math.PI / 180.0);
}
//https://stackoverflow.com/questions/2912779/how-to-calculate-a-point-with-an-given-center-angle-and-radius
function cartisianCoordinates(radius, angle, points){
    var x = points.x + radius * Math.cos(angle);
    var y = points.y + radius * Math.sin(angle);

    return {x:x, y:y, z:0};
}

function calculateOrbitPoint(radius, theta) {
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    const z = 0;  
    return { x, y, z };
}

function init() {
    try {
        canvas = document.getElementById("canvas");
        renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load( 'tp2_texture_planete.jpg' );

        texture.minFilter = THREE.LinearFilter;

        const material = new THREE.MeshBasicMaterial( { map: texture } );

    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML="<p><b>Sorry, an error occurred:<br>" +
            e + "</b></p>";
        return;
    }

    // Initialisation de la scène
    //generate_randomStars(); // TODO (a): Décommenter cette ligne
    //pyramidIFS = generate_pyramid_IFS(); // TODO (a): Décommenter cette ligne
    
    // TODO (a): calcul des positions des points de Lagrange
    //voir degresToRadians(angle) et cartisianCoordinates(radius, angle, points)

    // TODO: Importation des textures

    // TODO: Importer le satellite
    
    // Création de la scène 3D
    createScene();
    
    // Ajout de l'interactivité avec la souris
    controls = new ArcballControls(camera, canvas, scene);
    controls.setGizmosVisible(false);

    // Animation de la scèene (appelée toutes les 30 ms)
    animate();
}

init();
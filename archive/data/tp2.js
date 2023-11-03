"use strict";
import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer;  // Bases pour le rendu Three.js
let controls; // Pour l'interaction avec la souris
let canvas;  // Le canevas où est dessinée la scène
let ambient_light;
let camera_light;
let last_render = Date.now();

// NOTE: vous pouvez ajouter des variables globales au besoin.



/* Création de la scène 3D */
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0,0,0);

    // TODO: Dessiner les étoiles

    // TODO: Dessiner le soleil
    draw_sun(0.09);
    // TODO: Dessiner l'orbite de la planète
    scene.add(draw_orbit(0.2));
    
    // Dessiner le système Terre-Lagrange
    // TODO: dessiner la planète
    scene.add(draw_earth(0.05));

    // TODO: Ajout d'une source de lumière directionnelle

    // TODO: Dessiner les points de Lagrange et l'orbite L2
    scene.add(draw_orbit(2));

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

function generate_pyramid_IFS(){
    let model = {}
    // TODO: créer le modèle IFS de la pyramide
    return model
}

function draw_pyramid() {
    let pyramid = null;
    // TODO: dessiner la pyramide
    return pyramid
}

function draw_sun(radius) {
    // TODO: dessiner le soleil
    const geometry = new THREE.SphereGeometry( radius, 32, 16 ); 
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
    const sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

}

function draw_earth(radius) {
    let earth = null;
    // TODO: dessiner la planète
    const geometry = new THREE.SphereGeometry( radius, 32, 16 ); 
    const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } ); 
    earth = new THREE.Mesh( geometry, material );
    earth.position.x = 0.2;
    
    return earth
}

function draw_stars() {
    // TODO: dessiner les étoiles
}

function draw_orbit(radius){
    let orbit = null;
    // TODO: dessiner l'orbite de la planète
    const geometry = new THREE.RingGeometry( radius, radius + 0.01, 100 ); 
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    orbit = new THREE.Mesh( geometry, material ); 
    return orbit
}

function animate() {
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
    }   
    last_render = Date.now();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    
}

function init() {
    try {
        canvas = document.getElementById("canvas");
        renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );
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
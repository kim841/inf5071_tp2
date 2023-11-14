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
    scene.add(draw_pyramid())

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
    let model = {};

    // Définir les sommets de la pyramide
    let vertices = {
        v1: [Math.SQRT(8/parseFloat(9)),0,-1/parseFloat(3)], 
        v2: [- Math.sqrt(2/parseFloat(9)),Math.sqrt(2/parseFloat(3)),-1/parseFloat(3)], 
        v3: [- Math.sqrt(2/parseFloat(9)),-Math.sqrt(2/parseFloat(3)),-1/parseFloat(3)], 
        v4: [0,0,1]
    }

    // Définir les points de Lagrange avec leurs propriétés
    let lagrangePoints = {
        L1: { theta: 0, radius: 0.7, color: 0xff0000 }, // Rouge
        L2: { theta: 0, radius: 1.3, color: 0x00ff00 }, // Vert
        L3: { theta: 180, radius: 1.0, color: 0x0000ff }, // Bleu
        L4: { theta: 60, radius: 1.0, color: 0xffff00 }, // Jaune
        L5: { theta: -60, radius: 1.0, color: 0x00ffff } // Cyan
    };

    // Créer un tableau pour stocker les faces des pyramides de Lagrange
    let lagrangePyramidFaces = [];

    // Générer une pyramide pour chaque point de Lagrange
    for (let point in lagrangePoints) {
        let lagrangePoint = lagrangePoints[point];
        let lagrangeVertices = {
            v1: [lagrangePoint.radius * Math.cos(THREE.Math.degToRad(lagrangePoint.theta)), 
                 lagrangePoint.radius * Math.sin(THREE.Math.degToRad(lagrangePoint.theta)), 
                 -1/3],
            v2: [...vertices.v2],
            v3: [...vertices.v3],
            v4: [...vertices.v4]
        };

        let lagrangeFaces = {
            f1: [lagrangeVertices.v1, lagrangeVertices.v4, lagrangeVertices.v3],
            f2: [lagrangeVertices.v2, lagrangeVertices.v4, lagrangeVertices.v1],
            f3: [lagrangeVertices.v3, lagrangeVertices.v4, lagrangeVertices.v2],
            f4: [lagrangeVertices.v1, lagrangeVertices.v3, lagrangeVertices.v2]
        };

        lagrangePyramidFaces.push(lagrangeFaces);
    }

    // Calculer les faces de la pyramide, chaque face est un triangle
    let faces = {f1:[vertices.v1,vertices.v4,vertices.v3],
                f2:[vertices.v2,vertices.v4,vertices.v1],
                f3:[vertices.v3,vertices.v4,vertices.v2],
                f4:[vertices.v1,vertices.v3,vertices.v2]} //under
    
    // todo: créer le modèle IFS de la pyramide
    // Calculer les vecteurs normaux aux faces
    let compute_normal = function(a,b,c){
        let v1 = new THREE.Vector3(a[0],a[1],a[2]);
        let v2 = new THREE.Vector3(b[0],b[1],b[2]);
        let v3 = new THREE.Vector3(c[0],c[1],c[2]);
        let v1v2 = new THREE.Vector3().subVectors(v2,v1);
        let v1v3 = new THREE.Vector3().subVectors(v3,v1);
        let normal = new THREE.Vector3().crossVectors(v1v2,v1v3);
        normal.normalize();
        return normal.toArray();
    }

    // Calculer les vecteurs normaux aux faces et les ajouter à l'objet normals
    let normal = {
        n1: compute_normal(faces.f1[0],faces.f1[1],faces.f1[2]),
        n2: compute_normal(faces.f2[0],faces.f2[1],faces.f2[2]),
        n3: compute_normal(faces.f3[0],faces.f3[1],faces.f3[2]),
        n4: compute_normal(faces.f4[0],faces.f4[1],faces.f4[2])
    };

    // Ajouter les sommets, les faces et les normales à l'objet model
    model = {vertices:vertices,faces:faces,normals:normal};

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
    const material = new THREE.MeshBasicMaterial( { color: 0xffa500, emissive: 0xffff00 } ); 
    const sun = new THREE.Mesh( geometry, material );
    scene.add( sun );

}

function draw_earth(radius) {
    let earth = null;
    // TODO: dessiner la planète
    const geometry = new THREE.SphereGeometry( radius, 32, 16 ); 
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff, specular: 0x000000} ); 
    earth = new THREE.Mesh( geometry, material );
    earth.position.x = 1;
    scene.add( earth );

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
/*
 *
 *
 *
 *      Fait par Daniel Zhu
 *
 *
 *
 */

"use strict";



// ----------------------------------------------------------------------------
//      Classe `Interrupteur`
// ----------------------------------------------------------------------------

class Interrupteur {

    /* ------------------------------------------------------------------------
     *      Constructeur
     * ------------------------------------------------------------------------
     *
     * canvas   : (obj) Objet DOM du canvas
     * x        : (int) Abscisse de position
     * y        : (int) Ordonnée de position
     *
     */

    constructor( canvas, x, y ) {

        this.canvas = canvas;

        this.objet = new Image();
        this.objet.src = "./images/interrupteurA.png";
        this.x = x * this.canvas.grille;
        this.y = y * this.canvas.grille;
    }

    ajouter() {
        this.canvas.dessiner( this );
    }

    disparaitre() {
        this.canvas.effacer( this.x, this.y, this.canvas.grille, this.canvas.grille );
    }
}
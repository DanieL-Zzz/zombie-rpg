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
//      Classe `Canvas`
// ----------------------------------------------------------------------------

class Canvas {

    /* ------------------------------------------------------------------------
     *      Constructeur
     * ------------------------------------------------------------------------
     *
     * objet    : (obj) objet DOM du canvas
     * grille   : (int) si non nul, définit une grille composée de carrés
     *                  de dimension `grille`
     *
     */

    constructor( objet, grille = 0, afficherGrille = false, ips = 30 ) {

        // Objet DOM ----------------------------------------------------------

        this.objet = objet;
        this.contexte = this.objet.getContext("2d");


        // Propriétés du canvas -----------------------------------------------

        this.largeur = document.documentElement.clientWidth;
        this.hauteur = document.documentElement.clientHeight;

        this.grille = grille;
        this.afficherGrille = afficherGrille;

        this.objet.width = this.largeur;
        this.objet.height = this.hauteur;
        this.style = "vertical-align:middle;position:absolute;";
        this.objet.style = this.style;

        this.nbCasesX = Math.floor(this.largeur / this.grille);
        this.nbCasesY = Math.floor(this.hauteur / this.grille);
        this.nbCases  = this.nbCasesX * this.nbCasesY;


        // Grille -------------------------------------------------------------

        if (this.grille === 0) {
            alert("Veuillez spécifier une valeur non nulle à `grille` !");
            return;
        }

        if (afficherGrille) {
            this.griller();
        }


        // Composants animables du canvas -------------------------------------

        this.composants = [];


        // Animation ----------------------------------------------------------

        this.ips = ips;
        this.ips_interval = 1000 / this.ips;
        this.ips_prochain = Date.now();

        if (!afficherGrille) {
            this.animation = requestAnimationFrame(() => this.animer());
        }
    }

    // Affiche une grille
    griller() {
        this.contexte.strokeStyle = '#555555';
        for (let iy = 0; iy < Math.floor(this.hauteur / 30); iy++) {
            for (let ix = 0; ix < Math.floor(this.largeur / 30); ix++) {
                this.contexte.strokeRect(ix * 30, iy * 30, 30, 30);
            }
        }
    }



    /* ------------------------------------------------------------------------
     *      Dessine un objet dans le canvas
     * ------------------------------------------------------------------------
     *
     * objet    : (obj) objet DOM à dessiner
     * xSource  : (int) Abscisse de l'origine de la source à dessiner
     * ySource  : (int) Ordonnée de l'origine de la source à dessiner
     * largeur  : (int) Largeur de la source à dessiner
     * hauteur  : (int) Hauteur de la source à dessiner
     *
     */

     dessiner( objet
             , xSource = 0
             , ySource = 0
             , largeur = this.grille
             , hauteur = this.grille ) {

        this.contexte.drawImage(
            objet.objet,
            
            // Coordonnées haut-gauche de la source
            xSource, ySource,

            // Taille apparente de l'image
            largeur, hauteur,

            // POSITION DE L'IMAGE DANS LE CONTEXTE
            objet.x, objet.y,

            // Taille de l'image à utiliser
            largeur, hauteur,
        );

     }



    /* ------------------------------------------------------------------------
     *      Anime le canvas
     * ------------------------------------------------------------------------
     *
     * Noter que la méthode anime dans un premier temps les sprites et les
     * personnages et ensuite seulement elle affiche les répliques.
     *
     */

    animer() {

        // Contrôle du nombre d'images par secondes ---------------------------
        this.ips_courant = Date.now();
        this.ips_ecart = this.ips_courant - this.ips_prochain;

        if ( this.ips_ecart > this.ips_interval ) {
            this.ips_prochain = this.ips_courant - (this.ips_ecart % this.ips_interval);
            for (let objet of this.composants) {

                // Mouvement des sprites
                objet.deplacement();
                this.dessiner( objet, objet.spriteX, objet.spriteY );

                // Actualisation de la bulle de réplique
                objet.bulleReplique();

            }
        }

        this.animation = requestAnimationFrame(() => this.animer());

    }



    /* ------------------------------------------------------------------------
     *      Met l'animation en pause
     * ------------------------------------------------------------------------
     *
     * duree    : (int) Durée de la pause en milliseconde avant la reprise
     *                  de l'animation.
     *
     * Si `duree` vaut 0, alors la reprise de l'animation nécessitera d'appeler
     * la méthode Canvas.animer().
     *
     */

    pauseAnimation( duree = 0 ) {
        cancelAnimationFrame( this.animation );

        if (duree > 0) {
            setTimeout(
                function () {
                    this.animer();
                }.bind( this )
              , duree
            );
        }
    }



    /* ------------------------------------------------------------------------
     *      Fait trembler la carte
     * ------------------------------------------------------------------------
     *
     * nombre    : (int) Nombre de secousses (1 toutes les décisecondes)
     * direction : (int) Sens visuel du seisme (0 : top, 1 : bas);
     *
     */

    seisme( nombre = 10, direction = 0 ) {
        const sens = (direction === 0) ? "top:-5px;" : "bottom:-5px;";
        this.objet.style = `${this.style}${sens}`;

        // Changer la direction
        direction = (direction === 0) ? 1 : 0;

        if (nombre === 0) {
            this.objet.style = this.style;

            // mode développeur
            if ( devmode ) {
                devmode("SÉISME", `Un séisme s'est produit.`);
            }
        } else {
            nombre -= 1;
            setTimeout(() => this.seisme( nombre, direction ), 100);
        }
    }



    /* ------------------------------------------------------------------------
     *      Deux éléments sont proches
     * ------------------------------------------------------------------------
     *
     * objetA   : (obj) objet DOM du premier élément
     * objetB   : (obj) objet DOM du second élément
     *
     */

    seTouchent(objetA, objetB) {
        return ( Math.abs(objetA.x - objetB.x) <= (this.grille / 2)
              && Math.abs(objetA.y - objetB.y) <= (this.grille / 2) );
    }



    /* ------------------------------------------------------------------------
     *      Efface le canvas
     * ------------------------------------------------------------------------
     *
     * x        : (int) Origine du rectangle à effacer
     * y        : (int) Origine du rectangle à effacer
     * largeur  : (int) Largeur du rectangle à effacer
     * hauteur  : (int) Hauteur du rectangle à effacer
     *
     */

    effacer( x = 0, y = 0, largeur = this.largeur, hauteur = this.hauteur ) {
        this.contexte.clearRect(x
                              , y
                              , largeur
                              , hauteur);

        if ( this.afficherGrille ) {
            this.griller();
        }
    }
}


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
//      Classe `Personnage`
// ----------------------------------------------------------------------------

class Personnage {

    /* ------------------------------------------------------------------------
     *      Constructeur
     * ------------------------------------------------------------------------
     *
     * canvas   : (obj) objet DOM du canvas associé
     * image    : (str) chemin vers le sprite
     * vitesse  : (int) vitesse de déplacement (en px/s ; max : 10)
     * x        : (int) position initiale sur le canvas
     * y        : (int) position initiale sur le canvas
     *
     */

    constructor( canvas, image, vitesse = 1, x, y, controlable = false ) {
        this.canvas = canvas;

        this.objet = new Image();
        this.objet.src = image;

        this.vitesse = vitesse;

        this.objet.addEventListener("load"
                                  , () => this.placerEn( x, y )
                                  , false);

        // Gestion de la vitesse d'animation ----------------------------------

        this.pasAnime = 0;
        this.compteurAnime = 0;


        // Gestion du déplacement ---------------------------------------------

        this.evntMarcherReference = this.evntMarcher.bind( this );

        if (controlable) {
            this.controlable();
        }

    }



    /* ------------------------------------------------------------------------
     *      Déplacement du personnage par le clic
     * ------------------------------------------------------------------------
     *
     * Ensemble de fonctions gérant le déplacement du personnage par le clic
     *
     */

     evntMarcher( evnt ) {
        this.vaVers( Math.floor(evnt.clientX / this.canvas.grille)
                   , Math.floor(evnt.clientY / this.canvas.grille) )
     }


     // Après `apres` millisecondes, le personnage sera contrôlable.

     controlable( apres = 0 ) {

        if ( apres > 0 ) {

            setTimeout(function () {
                this.controlable();
            }.bind( this ), apres);

        } else {

            this.canvas.objet.addEventListener(
                "click"
              , this.evntMarcherReference
            );

            // mode développeur activé
            if ( devmode ) {

                devmode(`CONTRÔLABLE`, `Est contrôlable.
${this.objet.src}`);

            }

        }

     }


    // Après `apres` millisecondes, le personnage ne sera PLUS contrôlable.

     nonControlable( apres = 0 ) {

        if ( apres > 0 ) {

            setTimeout(function () {
                this.nonControlable();
            }.bind( this ), apres);

        } else {

            this.canvas.objet.removeEventListener(
                "click"
              , this.evntMarcherReference
            );

            // mode développeur activé
            if ( devmode ) {

                devmode(`NON CONTRÔLABLE`, `N'est PLUS contrôlable.
${this.objet.src}`);

            }

        }
     }



    /* ------------------------------------------------------------------------
     *      Place le personnage dans le canvas
     * ------------------------------------------------------------------------
     *
     * x        : (int) Abscisse du personnage dans le canvas
     * y        : (int) Ordonnée du personnage dans le canvas
     *
     * Si rien n'est spécifié, alors le personnage sera placé au centre.
     *
     * Les paramètres correspondent aux coordonnées de grille (entiers compris
     * entre 0 et le nombre de cases maximal).
     *
     * Les coordonnées réelles sont les coordonnées de grille multipliées par 
     * la taille d'une grille, ce sont les coordonnées utilisées pour le dessin.
     *
     * Les coordonnées locales permettent de gérer l'animation.
     *
     */

    placerEn( x, y ) {

        // Coordonnées de grille ----------------------------------------------

        if ( !isNaN(x) && 0 <= x && x <= this.canvas.nbCasesX ) {
            this.x = x * grille;
        } else {
            this.x = Math.floor( this.canvas.nbCasesX / 2 ) * grille;
        }

        if ( !isNaN(y) && 0 <= y && y <= this.canvas.nbCasesY ) {
            this.y = y * grille;
        } else {
            this.y = Math.floor( this.canvas.nbCasesY / 2 ) * grille
        }


        // Placement et attachement au canvas ---------------------------------

        this.canvas.dessiner( this );
        this.canvas.composants.push( this );


        // Ne rien faire si ceci n'est pas vérifié ----------------------------

        this.aEtePlace = true;


        // (mode développeur)
        if ( devmode ) {

            const a = `${Math.floor(this.x/grille)}:${Math.floor(this.y/grille)}`;
            devmode("PLACÉ"
                 , `${a} (${this.x}:${this.y})
${this.objet.src}`);

        }

    }



    /* ------------------------------------------------------------------------
     *      Assigne une destination au personnage
     * ------------------------------------------------------------------------
     *
     * x        : (int) Abscisse de la destination dans le canvas
     * y        : (int) Ordonnée de la destination dans le canvas
     *
     */

    vaVers( x, y ) {

        const grille = this.canvas.grille;

        // Doit d'abord avoir été placé ---------------------------------------

        if ( !this.aEtePlace ) {
            setTimeout(
                function () { this.vaVers( x, y ); }.bind(this)
              , 0
            );
            return;
        }


        // Vérifie que l'on ne sort pas de la grille --------------------------

        if ( (x >= this.canvas.nbCasesX)
          || (y >= this.canvas.nbCasesY)
          || (x < 0)
          || (y < 0) ) {

            // (mode développeur)
            if ( devmode ) {
                devmode("DESTINATION IMPOSSIBLE"
                      , `${x}:${y} (${x*grille}:${y*grille})
${this.objet.src}`);
            }

        } else { // -----------------------------------------------------------

            this.versX = x * grille;
            this.versY = y * grille;

            // (mode développeur)
            if ( devmode ) {
                devmode("DESTINATION FIXÉE"
                      , `${x}:${y} (${x*grille}:${y*grille})
${this.objet.src}`);
            }

        }

    }



    /* ------------------------------------------------------------------------
     *      Arrête tout mouvement si le personnage est en marche
     * ------------------------------------------------------------------------
     *
     * x        : (int) Abscisse de la destination dans le canvas
     * y        : (int) Ordonnée de la destination dans le canvas
     *
     */

    stop() {
        const grille = this.canvas.grille
            , Xact = Math.floor(this.x / grille)
            , Yact = Math.floor(this.y / grille)
            , X = ( this.x < this.versX ) ? Xact + 1 : Xact
            , Y = ( this.y < this.versY ) ? Yact + 1 : Yact;

        this.vaVers( X, Y );

        // mode développeur
        if ( devmode ) {
            devmode("STOP", `Reste en ${X}:${Y} (${X*grille}:${Y*grille})
${this.objet.src}`);
        }
    }



    /* ------------------------------------------------------------------------
     *      Tourne le personnage vers un côté
     * ------------------------------------------------------------------------
     *
     * sens     : (str) "HAUT", "BAS, "GAUCHE" et "DROITE" sont les seules
     *                  valeurs possibles
     *
     */

    tourne( sens ) {
        switch ( sens ) {
            case "HAUT":
                this.spriteY = 31;
                break;

            case "BAS":
                this.spriteY = 0;
                break;

            case "GAUCHE":
                this.spriteY = 62;
                break;

            case "DROITE":
                this.spriteY = 93;
                break;

            default:
                if ( devmode ) {
                    devmode("TOURNER", `Le sens « ${sens} » n'existe pas !
        ${this.objet.src}`);
                }
                return;
                break;
        }

        if ( devmode ) {
            devmode("TOURNER", `A tourné vers le « ${sens} » !
${this.objet.src}`);
        }

        this.canvas.effacer( this.x, this.y, this.canvas.grille, this.canvas.grille );
    }



    /* ------------------------------------------------------------------------
     *      Gère le déplacement du personnage
     * ------------------------------------------------------------------------
     */

    deplacement() {

        // Doit d'abord avoir été placé ---------------------------------------

        if ( !this.aEtePlace ) {
            // Étant tout le temps appelée par Canvas.animer(),
            // inutile de mettre un setTimeout ici pour rappeler
            // ultérieurement cette méthode.
            return;
        }


        // Déplacement --------------------------------------------------------

        if ( this.versX !== undefined || this.versY !== undefined ) {


            // Efface l'ancienne image ----------------------------------------

            const grille = this.canvas.grille;
            this.canvas.effacer( this.x, this.y, grille, grille );


            // Animer ---------------------------------------------------------

            if ( this.compteurAnime >= (10 - this.vitesse) ) {
                this.pasAnime = ( this.pasAnime === 0 ) ? 1 : 0;
                this.compteurAnime = 0;
            } else {
                this.compteurAnime += 1;
            }


            // Déplacement vers le haut ---------------------------------------

            if ( this.versY < this.y ) {
                const distance = this.y - this.versY;
                this.spriteX = ( this.pasAnime === 0 ) ? 31 : 62 ;
                this.spriteY = 31;
                this.y -= ( distance >= this.vitesse )
                          ? this.vitesse
                          : distance;
            }


            // Déplacement vers le bas ----------------------------------------

            else if ( this.versY > this.y ) {
                const distance = this.versY - this.y;
                this.spriteX = ( this.pasAnime === 0 ) ? 31 : 62 ;
                this.spriteY = 0;
                this.y += ( distance >= this.vitesse )
                          ? this.vitesse
                          : distance;
            }


            // Déplacement vers la gauche -------------------------------------

            else if ( this.versX < this.x ) {
                const distance = this.x - this.versX;
                this.spriteX = ( this.pasAnime === 0 ) ? 31 : 62 ;
                this.spriteY = 62;
                this.x -= ( distance >= this.vitesse )
                          ? this.vitesse
                          : distance;
            }


            // Déplacement vers la droite -------------------------------------

            else if ( this.versX > this.x ) {
                const distance = this.versX - this.x;
                this.spriteX = ( this.pasAnime === 0 ) ? 31 : 62 ;
                this.spriteY = 93;
                this.x += ( distance >= this.vitesse )
                          ? this.vitesse
                          : distance;
            }


            // Aucun mouvement à faire ----------------------------------------

            else {} // Étrangement, ce `else` n'est jamais exécuté


            // Si au prochain pas, on arrive à destination : fin --------------

            if ( this.x === this.versX
              && this.y === this.versY ) {

                this.versX = undefined;
                this.versY = undefined;

                // Sprite au repos
                this.spriteX = 0;
                
                // (mode développeur)
                if ( devmode ) {

                    const a1 = Math.floor( this.x / grille )
                        , a2 = Math.floor( this.y / grille )
                        , b1 = this.x
                        , b2 = this.y;
                    
                    devmode("ARRIVÉ"
                          , `${a1}:${a2} (${b1}:${b2})
${this.objet.src}`);

                }

            } else {
                
                // (mode développeur)
                if ( devmodeDeplacement ) {

                    const a1 = Math.floor( this.x / grille )
                        , a2 = Math.floor( this.y / grille )
                        , b1 = Math.floor( this.versX / grille )
                        , b2 = Math.floor( this.versY / grille )
                        , c  = `${this.x}:${this.y}`
                        , d  = `${this.versX}:${this.versY}`;

                    devmode("DÉPLACEMENT"
                          , `${a1}:${a2} -> ${b1}:${b2} (${c} -> ${d})
${this.objet.src}`);

                }

            }

        }
    }



    /* ------------------------------------------------------------------------
     *      Gère les bulles de texte
     * ------------------------------------------------------------------------
     *
     * texte    : (str) Ce que le personnage doit dire
     * duree    : (int) Temps en milliseconde d'affichage
     *
     * Noter que si `texte` est un `array`, alors chaque entrée sera lue
     * successivement pendant `duree` secondes.
     *
     * De plus, aucune chaîne ne doit excéder `limite` caractères.
     *
     */

    dire( texte, duree = 3000 ) {

        const limite = 70;


        // Vérifie la limite de taille ----------------------------------------

        if (Array.isArray(texte)) { // Liste de chaînes -----------------------

            let i = 0
              , erreurs = 0;

            for (let entree of texte) {
                i += 1;

                if (entree.length > limite) {
                    erreurs += 1;

                    // mode développeur
                    if ( devmode ) {

                        devmode("RÉPLIQUE (\`array\`)"
                              , `Réplique trop longue (${entree.length} > ${limite})
${this.objet.src}
« ${entree} »`);

                    }
                }
            }

            if (erreurs > 0 || !texte.length) { // Erreur OU vide : stop
                return;
            }

        } else if (typeof texte === "string"
                || texte instanceof String) { // Chaîne de caractère ----------

            if (texte.length > limite) {

                // mode développeur
                if ( devmode ) {

                    devmode("RÉPLIQUE (\`string\`)"
                         , `Réplique trop longue (${texte.length} > ${limite})
${this.objet.src}
« ${texte} »`);
                        
                    }
                return;
            }

            if (!texte.length) { // Vide : stop
                return;
            }

        } else { // Autre type détecté : erreur -------------------------------

            // mode développeur
            if ( devmode ) {

                console.log("RÉPLIQUE (type indéfini)"
                          , `Type spécifié inconnu (${typeof texte} != string && != array)
${this.objet.src}`);

            }
            return;

        }


        // Supprimer l'ancienne boite si elle était remplie -------------------

        if (this.replique) {
            this.replique.remove();
            this.replique = undefined;
            this.repliqueExpiration = 0;
        }


        // Changer l'état de l'instance ---------------------------------------

        this.repliqueId = Date.now() * Math.floor(Math.random() * 10);
        this.repliqueExpiration = Date.now() + duree;

        this.replique = document.createElement("section");
        this.canvas.objet.after(this.replique);

        this.replique.setAttribute("class", "message");
        this.replique.setAttribute("style", "display: none;"); // Ne pas afficher tout de suite

        if ( Array.isArray(texte) && texte.length ) {
            this.replique.innerHTML = texte.shift();
            setTimeout( () => this.dire( texte, duree ), duree );
        } else {
            this.replique.innerHTML = texte;
        }

        // Mode développeur
        if ( devmode ) {

            devmode(`RÉPLIQUE`
                  , `${this.objet.src}
A dit pendant ${duree} ms : « ${this.replique.innerHTML} »`);

        }
    }



    /* ------------------------------------------------------------------------
     *      Gère la persistence visuelle de la réplique
     * ------------------------------------------------------------------------
     */

    bulleReplique() {
        if (this.replique && !isNaN(this.repliqueExpiration)) {

            if (this.repliqueExpiration <= Date.now()) {
                // Réplique expirée : réinitialiser les attributs -------------
                this.replique.remove();
                this.replique = undefined;
                this.repliqueExpiration = 0;
            } else {

                // Position de la bulle ---------------------------------------

                const largeur = this.replique.offsetWidth
                    , hauteur = this.replique.offsetHeight
                    , canLargeur = this.canvas.largeur
                    , canHauteur = this.canvas.hauteur
                    , grille = this.canvas.grille;


                // Marge gauche

                let gauche;
                if (largeur <= this.x && this.x <= canLargeur - largeur) {
                    gauche = this.x - Math.floor((largeur - grille) / 2);
                } else {
                    gauche = (largeur > this.x) ? 10 : canLargeur - (largeur + 10);
                }

                // Marge haut

                let haut;
                if (Math.floor(canHauteur / 2) <= this.y) { // Bulle au dessus
                    haut = this.y - (hauteur + 5);
                } else {                                    // Bulle en dessous
                    haut = this.y + (grille + 5);
                }


                // Application de la marge ------------------------------------

                const style = `left: ${gauche}px; top: ${haut}px;`;
                this.replique.setAttribute("style", style);

            }
        }
    }
}
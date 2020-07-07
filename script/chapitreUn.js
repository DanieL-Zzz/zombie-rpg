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


const grille = 30
    , milX = Math.floor(document.documentElement.clientWidth / (2 * grille))
    , milY = Math.floor(document.documentElement.clientHeight / (2 * grille));

const Grille = new Canvas( document.getElementById("grille"), grille, true )
    , Carte  = new Canvas( document.getElementById("carte"), grille, false )
    , Moi    = new Personnage( Carte
                             , "./images/sprite.png"
                             , 1
                             , milX
                             , milY - 2
                             , false )
    , Zombie = [];

const activateurZombie = new Interrupteur( Grille
                                         , 1 // grille*(Carte.nbCasesX - 2)
                                         , 1 // grille*(Carte.nbCasesY - 2)
                                         );



// CHAPITRE 1 -----------------------------------------------------------------

const chapitreUn = {

    listeEvenements: [],
    listeAttentes: [],

    sauvegarde: function () {
        Carte.composants.length = 0;
        Zombie.length = 0;

        for (let evenementId of this.listeEvenements) {
            clearInterval( evenementId );
        }

        for (let attenteId of this.listeAttentes) {
            clearInterval( attenteId );
        }

        Carte.effacer();
        Carte.animer();

        activateurZombie.x = grille;
        activateurZombie.y = grille;
        activateurZombie.ajouter();

        Moi.placerEn( 5, 5 );
        Moi.vaVers( 5, 5 );
        Moi.dire( "Bon on recommence. Ne rate plus cette fois !" );
        Moi.vitesse = 1;

        setTimeout( this.infoDeux.bind( this ), 3000 );
    },

    // Infos
    infoUn: function () {
        alert("Dirigez le scout en cliquant sur la carte.");
        this.actionTrois();
    },

    infoDeux: function () {
        alert("Activez l'interrupteur rouge en HAUT à GAUCHE.");
        this.actionCinq();
    },

    infoTrois: function () {
        alert("Ne vous faites pas attr... Oops !");
        this.actionSept();
    },


    // Actions
    debut: function () {
        Moi.dire( "Eh, toi là !", 2000 );
        this.listeAttentes.push( setTimeout( this.actionUn.bind( this ), 2100 ) );
    },

    actionUn: function () {
        Moi.vaVers( milX, milY );
        this.listeAttentes.push( setTimeout( this.actionDeux.bind( this ), 2500 ) );
    },

    actionDeux: function () {
        Moi.dire( ["Oui, toi là !"
                 , "Qui d'autres veux-tu que ce soit ?"
                 , "Bon bref. Je me suis perdu, aide moi à sortir d'ici stp."]
                , 2000 );
        
        this.listeAttentes.push( setTimeout( this.infoUn.bind( this ), 6500 ) );
    },

    actionTrois: function () {

        // Contrôle -----------------------------------------------------------
        
        Moi.controlable();


        // Quelques répliques quand le joueur se déplace, pour le rendre ------
        // plus "vivant" :)

        let dernierePriseDeParole = 0
        const repliques = [
                "Oui, deux secondes. Y'a pas le feu."
              , "Un seul clic suffit, amateur !"
              , "Quoi ? Si loin ?!?!"
        ];

        function direDesTrucs() {
            if (repliques.length) {
                if (Date.now() - dernierePriseDeParole > 4000) {
                    const index = Math.floor(Math.random() * repliques.length);

                    dernierePriseDeParole = Date.now();
                    Moi.dire( repliques.splice(index, 1), 2000 );
                }
            } else {
                Carte.objet.removeEventListener("click", direDesTrucs);
            }
        }

        Carte.objet.addEventListener("click", direDesTrucs);


        // Fini de jouer + la suite -------------------------------------------

        this.listeAttentes.push( setTimeout( function () {
            Carte.objet.removeEventListener("click", direDesTrucs);
        }, 10000 ) );

        this.listeAttentes.push( setTimeout( this.actionQuatre.bind( this ), 15000 ) );
    },

    actionQuatre: function () {
        activateurZombie.ajouter();

        Moi.stop();
        Moi.nonControlable();

        Moi.dire( ["Oh ! Un interrupteur est apparu en HAUT à GAUCHE !"
                 , "Je sais pas toi mais moi j'ai <em>vraiment</em> envie de l'activer."] );

        this.listeAttentes.push( setTimeout( this.infoDeux.bind( this ), 6500 ) );
    },

    actionCinq: function () {

        Moi.controlable();

        const activateurActif = setInterval( function () {
            this.listeEvenements.push( activateurActif );

            if ( Moi.x === activateurZombie.x && Moi.y === activateurZombie.y ) {
                clearInterval( activateurActif );
                activateurZombie.disparaitre();

                Moi.nonControlable();

                Carte.seisme();
                Grille.seisme();

                Moi.dire( "Ah ! Une secousse !", 2000 );
                this.listeAttentes.push( setTimeout( this.actionSix.bind( this ), 2000 ) );
            }

        }.bind( this ), 0 );

    },

    actionSix: function () {
        Moi.dire( "Ouf, c'est terminé. Je t'avais dit qu'on n'aurait pas dû activer ça !"
                , 3000 );
        
        this.listeAttentes.push( setTimeout( function () {
            Moi.tourne("BAS");
            Moi.dire( "!!!", 1000 )

            Zombie.push( new Personnage( Carte
                                       , "./images/demon.png"
                                       , 2
                                       , 1
                                       , 5
                                       , false ) );

            Zombie.push( new Personnage( Carte
                                       , "./images/demon.png"
                                       , 1
                                       , 5
                                       , 1
                                       , false ) );

            this.listeAttentes.push( setTimeout( function () {
                Moi.dire( "AAAH ! DES ZOMBIES !", 2500 );
                Zombie[0].tourne("HAUT");
                Zombie[1].tourne("GAUCHE");

                Zombie[0].vaVers( 1, 1 );
                Zombie[1].vaVers( 1, 1 );

                this.listeAttentes.push( setTimeout( this.infoTrois.bind( this ), 2500 ) );
            }.bind( this ), 1000 ) );
        }.bind( this ), 3000 ) );
    },

    actionSept: function () {
        Moi.vitesse = 3;
        Moi.dire( ["TECHNIQUE SECRÈTE !", "Bon maintenant on file !"], 1500 );
        Moi.x = 3 * grille;
        Moi.y = 3 * grille;
        this.zombies();

        Moi.controlable();

        this.listeAttentes.push( setTimeout( function () {
            Moi.dire( "PS : Ma technique ne fonctionne qu'une fois." );
        }.bind( this ), 7000 ) );

        activateurZombie.x = (2 * milX - 3) * grille;
        activateurZombie.y = (2 * milY - 3) * grille;
        activateurZombie.ajouter();

        const autreInterrupteur = setInterval( function () {
            this.listeEvenements.push( autreInterrupteur );

            if ( Moi.x === activateurZombie.x && Moi.y === activateurZombie.y ) {

                Zombie.push( new Personnage( Carte
                                           , "./images/demon.png"
                                           , 2
                                           , activateurZombie.x / grille - 2
                                           , activateurZombie.y / grille - 2
                                           , false )  );

                Zombie.push( new Personnage( Carte
                                           , "./images/demon.png"
                                           , 1
                                           , activateurZombie.x / grille - 2
                                           , activateurZombie.y / grille + 1 
                                           , false )  );

                Moi.dire( "AAH", 2000 );

                activateurZombie.disparaitre();
                activateurZombie.x = grille;
                activateurZombie.y = grille;
                activateurZombie.ajouter();

                Carte.seisme();
                Grille.seisme();

                this.actionHuit();
                clearInterval( autreInterrupteur );
            }
        }.bind( this ), 0 );
    },

    actionHuit: function () {
        const diableApparait = setInterval( function () {
            this.listeEvenements.push( diableApparait );

            if ( Moi.x <= (milX + 3) * grille ) {
                clearInterval( diableApparait );

                Zombie.push( new Personnage( Carte
                                           , "./images/diable.png"
                                           , 3
                                           , milX
                                           , milY
                                           , false ) );

                Zombie[4].dire( "SURPRISE !!!", 1500 );

                Carte.seisme();
                Grille.seisme();

                this.listeAttentes.push( setTimeout( () => Moi.dire("HELP !!"), 1500 ) );

                const sortie = setInterval( function () {
                    this.listeEvenements.push( sortie );

                    if ( Moi.x === activateurZombie.x && Moi.y === activateurZombie.y ) {
                        this.youWin();
                        clearInterval( sortie );
                    }
                }.bind( this ), 0 );
            }
        }.bind( this ), 1000 );
    },

    gameOver: function () {
        Moi.nonControlable();
        Carte.pauseAnimation();
        alert( "You lose!" );
        this.sauvegarde();
    },

    youWin: function () {
        Moi.nonControlable();
        Carte.pauseAnimation();

        const audio = document.getElementById("musique");
        document.getElementById("musiqueMP3").src = "musiques/ff.mp3";
        audio.load();
        audio.play();

        const redirection = confirm(`Féliciation ! Vous avez réussi le premier niveau.
Vous allez être redirigé vers le prochain niveau.`);

        if (redirection) {
            window.location = "nivDeux.html";
        }
    },

    // Continuel
    zombies: function () {
        const zomb = setInterval(function () {
            this.listeEvenements.push( zomb );

            const X = Math.floor( Moi.x / grille )
                , Y = Math.floor( Moi.y / grille );

            for (let mob of Zombie) {
                if ( Carte.seTouchent( mob, Moi ) ) {
                    clearInterval( zomb );
                    this.gameOver();
                } else {
                    if (Zombie.length === 5) {
                        if (mob.vitesse < 2) {
                            mob.vitesse = 2;
                        }
                    }
                    mob.vaVers( X, Y );
                }
            }
        }.bind( this ), 250)
    }
};

chapitreUn.debut();

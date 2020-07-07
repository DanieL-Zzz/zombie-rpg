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



// ----------------------------------------------------------------
//      En local seulement
// ----------------------------------------------------------------

let   premierAppelDevmode = true;

const devmodeSep = '--------------------------------------------------'
    , devmodeDeplacement = false
    , devmode = ( window.location.host === "" )
                ?   function (type, message) {
                        if ( premierAppelDevmode ) {
                            premierAppelDevmode = false;
                            devmode( "MODE DÉVELOPPEUR ACTIVÉ", "" );
                        }
                        console.log( `${devmodeSep}\n    ${type}\n${devmodeSep}\n${message}\n` );
                    }
                : false;

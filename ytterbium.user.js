// ==UserScript==
// @version         0.2.5
// @name            YtterBium
// @description     Better Theater mode and PiP function for YouTube!
// @compatible      chrome
// @icon            https://raw.githubusercontent.com/StellarisStudio/YtterBium/img/ytterbium-64.png
// @author          Loky (StellarisStudio)
// @namespace       https://github.com/StellarisStudio/YtterBium
// @homepageURL     https://github.com/StellarisStudio/YtterBium
// @match           *://www.youtube.com/*
// @grant           GM_setValue
// @grant           GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    /* Main functions */
    var doc = document;
    var win = window;

    if (win.frameElement) throw new Error("Stopped JavaScript.");

    function simulClick(el) {
        var clickEvent = doc.createEvent('MouseEvents');
        clickEvent.initEvent('click', true, true);
        clickEvent.artificialevent = true;
        el.dispatchEvent(clickEvent);
    }

    function xpath(outer_dom, inner_dom, query) {
        //XPathResult.ORDERED_NODE_SNAPSHOT_TYPE = 7
        return outer_dom.evaluate(query, inner_dom, null, 7, null); }

    function docsearch(query) { return xpath(doc, doc, query); }

    /* CSS */
    var css = ( `
    .ytp-button:not([aria-disabled=true]):not([disabled]):not([aria-hidden=true]).ytp-miniplayer-button, .ytp-button:not([aria-disabled=true]):not([disabled]):not([aria-hidden=true]).ytp-size-button { display:none!important; }
    .YbStrech { fill:none; stroke:rgba(255,255,255); stroke-width:6; margin:0 -10px 0 7px; }
    .YbStrech:hover { stroke:rgba(255,255,255,.6); }
    .YbPIP { fill:rgba(255,255,255); }
    .YbPIP:hover { fill:rgba(255,255,255,.6); }
    .fillwin { width:99%!important; max-width:100vw!important; height:99.6vh!important; max-height:100vh!important; top:0!important; left:0!important; margin-left:0!important; }
    .fillwin .ytp-chrome-bottom { width:70%!important; margin:auto!important; text-align:center; left:0; right:0; }
    .StrechVideo { width:100%!important; height:auto!important; left:0!important; margin-left:0!important; }
    .StVideo { width:100%!important; height:auto!important; left:0!important; }
    ` );
    /* Inject the CSS */
    //if (typeof GM_addStyle != "undefined") { GM_addStyle(css);
    //} else if (typeof PRO_addStyle != "undefined") { PRO_addStyle(css);
    //} else if (typeof addStyle != "undefined") { addStyle(css);
    //} else {
       var sheet = doc.createElement("style");
       sheet.type = "text/css";
       sheet.appendChild(doc.createTextNode(css));
       var heads = doc.getElementsByTagName("head");
         if (heads.length > 0) { heads[0].appendChild(sheet);
         } else { doc.documentElement.appendChild(sheet); } // no head yet, stick it whereever
    //}

    /* Declarations */
    var page = docsearch("//ytd-page-manager/ytd-watch-flexy").snapshotItem(0);
    var YtMenu = doc.getElementsByClassName('ytp-right-controls');
    var PiPvid = doc.getElementsByTagName('video');

    /* create additional button into the playback control */
        /* Theater button */
        var YbCine = doc.createElement('button');
            YbCine.setAttribute('class', 'YbPIP ytp-button');
            YbCine.setAttribute('title', 'Theather mode');
            YbCine.innerHTML = " <svg viewBox='0 0 36 36' width='100%'><path d='m 28,11 0,14 -20,0 0,-14 z m -18,2 16,0 0,10 -16,0 0,-10 z' fill-rule='evenodd'/></svg>";
            YbCine.addEventListener("click",function(e){
                if (docsearch("//ytd-page-manager/ytd-watch-flexy[@theater]").snapshotLength == 0) {
                    if (docsearch("//ytd-page-manager/ytd-watch-flexy[@theater]").snapshotLength > 0) return; //already in theater mode
                    var thnode = docsearch("//*[@class='ytp-chrome-controls']//*[contains(@class,'ytp-size-button')]").snapshotItem(0);
                      doc.getElementById('masthead').setAttribute('style', 'display:none!important;');
                      doc.getElementById("page-manager").setAttribute('style', 'margin-top:0px!important;');
                      doc.getElementById('player-theater-container').classList.add('fillwin');
                    if (thnode) simulClick(thnode); }
                else {
                    if (docsearch("//ytd-page-manager/ytd-watch-flexy[@theater]").snapshotLength == 0) return; //already in default view
                    var thnoda = docsearch("//*[@class='ytp-chrome-controls']//*[contains(@class,'ytp-size-button')]").snapshotItem(0);
                      doc.getElementById('masthead').setAttribute('style', 'display:block');
                      doc.getElementById("page-manager").setAttribute('style', 'margin-top:56px;');
                      doc.getElementById('player-theater-container').classList.remove('fillwin');
                    if (thnoda) simulClick(thnoda);
                }
            });
        YtMenu[0].insertBefore(YbCine, YtMenu[0].children[6]); // Inject Theater button

        /* PiP button */
        var PiP = doc.createElement('button');
            PiP.setAttribute('class', 'YbPIP ytp-button');
            PiP.setAttribute('title', 'PiP Player');
            PiP.innerHTML = " <svg viewBox='0 0 36 36' width='100%'><path d='M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z'/></svg>";
            PiP.onclick = function(e){
              if (doc.pictureInPictureElement) {
                doc.exitPictureInPicture()
                  .then(() => { /**/ })
                  .catch(() => { /**/ }); }
              else { // Request Picture-in-Picture
                  PiPvid[0].requestPictureInPicture()
                    .then(() => { /**/ })
                    .catch(() => { /**/ }); }
            };
        YtMenu[0].appendChild(PiP); // Inject PiP button

    /* Show back the Top Nav on Scroll */
    win.onscroll = function(e){
          if (docsearch("//ytd-page-manager/ytd-watch-flexy[@theater]").snapshotLength == 0 || doc.body.scrollTop > 100 || doc.documentElement.scrollTop > 100) {
              doc.getElementById('masthead').setAttribute('style', 'display:block;');
              doc.getElementById("page-manager").setAttribute('style', 'margin-top:56px;');
          } else if (docsearch("//ytd-page-manager/ytd-watch-flexy[@theater]").snapshotLength == 0 || doc.body.scrollTop < 80 || doc.documentElement.scrollTop < 80) {
              doc.getElementById('masthead').setAttribute('style', 'display:none!important;');
              doc.getElementById("page-manager").setAttribute('style', 'margin-top:0px!important;'); }
    };
})();

/*
   This file is part of Visual Chap.

   Visual Chap is free software: you can redistribute it and/or modify
   it under the terms of the wonderful GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   any later version.
   
   Visual Chap is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with Visual Chap. If not, see https://www.gnu.org/licenses/gpl-3.0.html .
*/

(function(){

    var jQ = jQuery.noConflict();    

    /* document ready START */
    jQ(document).ready(function(){

	/* main object */
	var wikipediaVisualChap = {
	    switchedOn: false,
	    // set content div
	    blogContentDiv: jQ('div#wikipedia-visual-chap-box').parent('div'),
	    // main obj div
	    div: jQ('div#wikipedia-visual-chap-box'),
	    // check availabilities
	    available: ( jQ('div#wikipedia-visual-chap-box').parent('div').width() > 700 && jQ('div#wikipedia-visual-chap-box').parent('div').height() > 350 ) ? true : false,
	    disabled: ( jQ(window).width() <= 700 || jQ(window).height() < 600 || jQ('div#wikipedia-visual-chap-box').parent('div').height() < 350 ) ? true : false,
	    firstRun: false,
	    results: [],
	    /* browser compatibility */
	    pageYMode: {
		standard: window.pageY ? true : false,
		alt: window.pageYOffset ? true : false
	    },
	    lastPositionY: 0,
	    language: (document.documentElement.lang.length > 2) ? document.documentElement.lang.slice(0, 2) : document.documentElement.lang,
	    // from WP options
	    options: WVCWPOptions,
	    wordsFilter: (WVCWPOptions.wvcWordsFilter === '') ? '' : WVCWPOptions.wvcWordsFilter.split(/[\,]+/)
	};
	/* log recognized html language */
	console.log('Visual Chap recognized HTML language:' , wikipediaVisualChap.language);
	
	 // FUNCTIONS 

	/* when the switch button is pressed, toggle css classes (and detach events if switched off) */
	wikipediaVisualChap.switchButton = function(content){
	    /* set inner container on relative if fixed now (then launch timeout to reset it to old Y offset) */
	    var wvcInnerContainer = jQ('div#wikipedia-visual-chap-inner-container');
	    if (wvcInnerContainer.css('position') === 'fixed'){
		var oldContainerOffset = wvcInnerContainer.offset();
		wvcInnerContainer.css({
		    position: 'relative'
		});
		wvcInnerContainer.offset({
		    top: oldContainerOffset.top,
		    left: wikipediaVisualChap.div.offset().left
		});
	    }
	    /* if is now off */
	    if (wikipediaVisualChap.switchedOn === false){
		wikipediaVisualChap.switchedOn = true;
		/* if extended version is available (enough real estate in content div) */
		if (wikipediaVisualChap.available){
		    wikipediaVisualChap.div.addClass('wvc-box-extended');
		    wvcInnerContainer.css({
			maxWidth: '460px'
		    });
		}
		else {
		    wikipediaVisualChap.div.addClass('wvc-box-pocket');
		    wvcInnerContainer.css({
			maxWidth: '260px'
		    });
		}
		setContent(content);
		/* WP option - show Visual Chap logo */
		if (jQ('img#wikipedia-visual-chap-box-logo')){
		    jQ('img#wikipedia-visual-chap-box-logo').fadeIn(1000);
		}
	    }
	    else {
		wikipediaVisualChap.switchedOn = false;
		wikipediaVisualChap.div.removeClass('wvc-box-extended').removeClass('wvc-box-pocket');
		resetContent(content);
		wvcInnerContainer.css({
		    maxWidth: '28px'
		});
		/* WP option - show Visual Chap logo */
		if (jQ('img#wikipedia-visual-chap-box-logo')){
		    jQ('img#wikipedia-visual-chap-box-logo').fadeOut(1000);
		    jQ('img#wikipedia-visual-chap-box-logo').css('display', 'none');
		}
	    }
	    /* main box */
	    wikipediaVisualChap.div.toggleClass('wvc-box-standby').toggleClass('wvc-box-active');
	    /* switch */
	    jQ('div#wikipedia-visual-chap-box-switch').toggleClass('wvc-switch-standby').toggleClass('wvc-switch-active');
	    /* inner elements */
	    jQ('div#wikipedia-visual-chap-inner-container').toggleClass('wvc-active-container');
	    jQ('div#wikipedia-visual-chap-inner-container div').not('div#wikipedia-visual-chap-box-switch, div#wikipedia-visual-chap-img-loading').toggleClass('wikipedia-visual-chap-standby-item').toggleClass('wikipedia-visual-chap-active-item');
	    jQ('div#wikipedia-visual-chap-inner-container p, div#wikipedia-visual-chap-inner-container div p, div.wikipedia-visual-chap-link-wiki-donate p, div.wikipedia-visual-chap-link-dev p').fadeOut(200).toggleClass('wikipedia-visual-chap-standby-item').toggleClass('wikipedia-visual-chap-active-item').fadeIn(200);
	    /* setup word clicking */
	    jQ('span.wvc-word-standby').click(function(){
		wikipediaVisualChap.search(jQ(this).text());
	    });
	    /* setup css classes on words hovering */
	    jQ('span.wvc-word-standby').mouseenter(function(){
		if (wikipediaVisualChap.switchedOn){
		    jQ(this).removeClass('wvc-word-standby').addClass('wvc-word-hover');
		}
		/* WP option  - content words underline color */
		jQ('.wvc-word-hover').css('border-color', wikipediaVisualChap.options.wvcUnderlineColor);
	    });
	    jQ('span.wvc-word-standby').mouseleave(function(){
		jQ(this).removeClass('wvc-word-hover').addClass('wvc-word-standby');
		jQ('.wvc-word-standby').css('border-color', 'transparent');
	    });
	    /* after css animations, run resize */
	    setTimeout(function(){
		wikipediaVisualChap.adjustSizes(jQ('div#wikipedia-visual-chap-box').parent('div'));
	    }, 1000);
	    /* animated closing scroll */
	    wikipediaVisualChap.closingScroll(1300);

	    /* switch on */
	    function setContent(contentDiv){
		/* select all content */
		var contentElements = contentDiv.children('*').not('div#wikipedia-visual-chap-box, div#wikipedia-visual-chap-box *'),
		    contentWidth = contentDiv.width();
		if ( wikipediaVisualChap.div.hasClass('wvc-box-extended') ){
		    contentElements.css({
			maxWidth: (contentWidth - 462) + 'px'
		    });
		}
		else if ( wikipediaVisualChap.div.hasClass('wvc-box-pocket') ){
		    contentElements.css({
			maxWidth: (contentWidth - 262) + 'px'
		    });
		}
		else {
		    /* throw error - box has no assigned width css class */
		    console.log('box has no assigned width css class!!! (wvc-box-extended OR wvc-box-pocket)');
		}
	    }
	    
	    /* switch off */
	    function resetContent(contentDiv){
		/* select all content */
		var contentElements = contentDiv.children('*').not('div#wikipedia-visual-chap-box, div#wikipedia-visual-chap-box *'),
		    contentWidth = contentDiv.width();
		contentElements.animate({
		    maxWidth: (contentWidth - 72) + 'px'
		}, '850', 'swing');
		/* reset words hovering */
		jQ('span.wvc-word-standby').off('click').off('mouseenter').off('mouseleave');
	    }

	};

	/* original content setup */
	wikipediaVisualChap.contentSetup = function(content){
	    /* wvc main offset */
	    wikipediaVisualChap.div.offset({
		top: wikipediaVisualChap.blogContentDiv.offset().top,
		left: wikipediaVisualChap.blogContentDiv.offset().left + wikipediaVisualChap.blogContentDiv.outerWidth() - 28
	    });
	    setTimeout(function(){
		wikipediaVisualChap.div.animate({
		    opacity: 1
		}, 250);
	    }, 250);
	    /* get all possible text elements in the content div */
	    content.not('div#wikipedia-visual-chap-box, div#wikipedia-visual-chap-box *').each(function(){
		var output = '',
		    previousContent = ( jQ(this).html() != '') ? jQ(this).html() : false;
		/* if WP words filter option is OFF */
		if (wikipediaVisualChap.options.wvcWordsFilter === ''){
		    if (previousContent){
			/* split elements in single words */
			output = previousContent.split(/[\s]+/);
			if (jQ(this).html() === jQ(this).text()){
			    /* rebuild word-by-word */
			    contentTextSetup(jQ(this), output);
			    /* re-build output */
			    jQ(this).html(output.join(' '));
			}
			else {
			    /* return the whole element - no mods */
			    output += jQ(this).html();
			}
		    }
		}
		/* if WP words filter option is ON */
		else {
		    if (previousContent){
			/* split all chosen words */
			var wvcChosenWords = wikipediaVisualChap.wordsFilter;
			if (jQ(this).html() === jQ(this).text()){
			    output = previousContent;
			    for (i = 0; i < wvcChosenWords.length; i++){
				/* filter validation */
				if (wvcChosenWords[i].replace(/[^a-zA-Z0-9\s] /g, '') === wvcChosenWords[i]){
				    /* create new word filter */
				    var wvcWordFilter = new RegExp(wvcChosenWords[i], 'g');
				    /* repace including WVC html tags */
				    output = output.replace(wvcWordFilter, '<span class="wvc-word-standby">' + wvcChosenWords[i] + '</span>');
				    //console.log(previousContent.replace(wvcWordFilter, '<span class="wvc-word-standby">' + wvcChosenWords[i] + '</span>'));
				}
			    }
			    /* re-build output */
			    jQ(this).html(output);
			}
		    }
		}
	    });

	    /* word-by-word check */
	    function contentTextSetup(element, textArr){
		/* non-alphabetic filter */
		var wordsFilter = /([^0-9a-zA-Z]+)/g;
		for (i = 0; i < textArr.length; i++){
		    var thisWord = textArr[i],
			specialCharPosition = thisWord.search(wordsFilter),
			doubleCheck,
			wordSplit,
			foundWord,
			newWord;
		    /* if special character is found */
		    if (specialCharPosition !== -1){
			/* if special characters is at the end of the word */
			if (specialCharPosition > 0){
			    doubleCheck = thisWord.charAt(0);
			    /* if double is found */
			    if (doubleCheck.search(wordsFilter) !== -1){
				/* if entry is a word */
				if (thisWord.length > 2){
				    // -- TO IMPROVE!!! write specific dictionary filter for each language
				    if (thisWord !== 'and' && thisWord !== 'or' && thisWord !== 'by' && thisWord !== 'in' && thisWord !== 'for' && thisWord !== 'if' && thisWord !== 'else' && thisWord !== 'as'){
					wordSplit = thisWord.split('');
					foundWord = [];
					for (char = 1; char < wordSplit.length -1; char++){
					    foundWord.push(wordSplit[char]);
					}
					newWord = foundWord.join('');
					if (newWord.search(wordsFilter) === -1){
					    textArr[i] = wordSplit[0] + wrapWord(newWord) + wordSplit[wordSplit.length -1];
					}
				    }
				}
				/* if word is not allowed */
				else {
				    textArr[i] = thisWord;
				}
			    }
			    /* if special character is only at the end of the word */
			    else {
				/* if entry is a word */
				if (thisWord.length > 1){
				    // -- TO IMPROVE!!! write specific dictionary filter for each language
				    if (thisWord !== 'and' && thisWord !== 'or' && thisWord !== 'by' && thisWord !== 'in' && thisWord !== 'for' && thisWord !== 'if' && thisWord !== 'else' && thisWord !== 'as'){
					wordSplit = thisWord.split('');
					foundWord = [];
					for (char = 0; char < wordSplit.length -1; char++){
					    foundWord.push(wordSplit[char]);
					}
					newWord = foundWord.join('');
					if (newWord.search(wordsFilter) === -1){
					    textArr[i] = wrapWord(newWord) + wordSplit[wordSplit.length -1];
					}
				    }
				}
				/* if word is not allowed */
				else {
				    textArr[i] = thisWord;
				}
			    }
			}
			/* if special character is at the beggining of the word */
			else {
			    doubleCheck = thisWord.charAt(thisWord.length -1);
			    /* if double is found */
			    if (doubleCheck.search(wordsFilter) !== -1){
				/* if entry is a word */
				if (thisWord.length > 2){
				    // -- TO IMPROVE!!! write specific dictionary filter for each language
				    if (thisWord !== 'and' && thisWord !== 'or' && thisWord !== 'by' && thisWord !== 'in' && thisWord !== 'for' && thisWord !== 'if' && thisWord !== 'else' && thisWord !== 'as'){
					wordSplit = thisWord.split('');
					foundWord = [];
					for (char = 1; char < wordSplit.length -1; char++){
					    foundWord.push(wordSplit[char]);
					}
					newWord = foundWord.join('');
					if (newWord.search(wordsFilter) === -1){
					    textArr[i] = wordSplit[0] + wrapWord(newWord) + wordSplit[wordSplit.length -1];
					}
				    }
				}
				/* if word is not allowed */
				else {
				    textArr[i] = thisWord;
				}
			    }
			    /* if special character is only at the beginning of the word */
			    else {
				/* if entry is a word */
				if (thisWord.length > 1){
				    // -- TO IMPROVE!!! write specific dictionary filter for each language
				    if (thisWord !== 'and' && thisWord !== 'or' && thisWord !== 'by' && thisWord !== 'in' && thisWord !== 'for' && thisWord !== 'if' && thisWord !== 'else' && thisWord !== 'as'){
					wordSplit = thisWord.split('');
					foundWord = [];
					for (char = 1; char < wordSplit.length; char++){
					    foundWord.push(wordSplit[char]);
					}
					newWord = foundWord.join('');
					if (newWord.search(wordsFilter) === -1){
					    textArr[i] = wordSplit[0] + wrapWord(newWord);
					}
				    }
				}
				/* if word is not allowed */
				else {
				    textArr[i] = thisWord;
				}
			    }
			}
		    }
		    /* if no special character is found */
		    else {
			// -- TO IMPROVE!!! write specific dictionary filter for each language
			if (thisWord !== 'and' && thisWord !== 'or' && thisWord !== 'by' && thisWord !== 'in' && thisWord !== 'for' && thisWord !== 'if' && thisWord !== 'else' && thisWord !== 'as'){
			    textArr[i] = wrapWord(thisWord);
			}
		    }
		}
	    }
	    
	    /* wrap single word */
	    function wrapWord(word){
		return '<span class="wvc-word-standby">' + word + '</span>';
	    }
	};
	
	/* delay (if needed...) */
	wikipediaVisualChap.delay = function(){
	    var timer = 0;
	    return function(callback, ms){
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	    };
	};
	
	/* update display */
	wikipediaVisualChap.updateDisplay = function(updatedData, updatedURL, updatedDescription, updatedImg){
	    jQ('h3#wikipedia-visual-chap-display-title').html(updatedData);
	    if (updatedImg){
		if (updatedImg !== undefined){
		    jQ('img#wikipedia-visual-chap-display-image').attr('src', updatedImg);
		}
		if (jQ('img#wikipedia-visual-chap-display-image').attr('src') === 'https://upload.wikimedia.org/wikipedia/en/5/5f/Disambig_gray.svg'){
		    jQ('img#wikipedia-visual-chap-display-image').parent('a').attr('href', updatedURL);
		}
	    }
	    if (updatedURL){
		if ( updatedURL !== jQ('a#wikipedia-visual-chap-display-title-link').attr('href') ){
		    jQ('a#wikipedia-visual-chap-display-title-link').attr('href', updatedURL);
		    if (jQ('img#wikipedia-visual-chap-display-image').attr('src') === wikipediaVisualChap.options.wvcPluginsURL + '/visual-chap/assets/img/Wikipedia-logo-v2.svg'){
			jQ('img#wikipedia-visual-chap-display-image').parent('a').attr('href', updatedURL);
		    }
		}
	    }
	    if (updatedDescription){
		if (updatedDescription() !== 'No description found!'){
		    jQ('p#wikipedia-visual-chap-display-description').html(updatedDescription);
		}
		else {
		    var wvcLangCheck = wikipediaVisualChap.language;
		    /* no description EN */
		    if (wvcLangCheck === 'en'){
			jQ('p#wikipedia-visual-chap-display-description').html(updatedDescription);
		    }
		    /* no description FR */
		    else if (wvcLangCheck === 'fr'){
			jQ('p#wikipedia-visual-chap-display-description').html('Aucune description trouvée!');
		    }
		    /* no description IT */
		    else if (wvcLangCheck === 'it'){
			jQ('p#wikipedia-visual-chap-display-description').html('Nessuna descrizione trovata!');
		    }
		    /* no description DE */
		    else if (wvcLangCheck === 'de'){
			jQ('p#wikipedia-visual-chap-display-description').html('Keine Beschreibung gefunden!');
		    }
		    /* no description ES */
		    else if (wvcLangCheck === 'es'){
			jQ('p#wikipedia-visual-chap-display-description').html('No se ha encontrado ninguna descripción!');
		    }
		    /* no description default */
		    else {
			jQ('p#wikipedia-visual-chap-display-description').html(updatedDescription);
		    }
		}
	    }
	    /* set main img max-height */
	    wikipediaVisualChap.wvcMainImgMaxHeight();
	};
	
	/* main search */
	wikipediaVisualChap.search = function(query){
	    /* load waiting spinning loading icon */
	    jQ('div#wikipedia-visual-chap-img-loading').css({
		width: jQ('div#wikipedia-visual-chap-inner-container').outerWidth() + 'px',
		maxWidth: jQ('div#wikipedia-visual-chap-inner-container').outerWidth() + 'px',
		maxHeight: (wikipediaVisualChap.blogContentDiv.offset().top + wikipediaVisualChap.blogContentDiv.outerHeight()) - jQ('div#wikipedia-visual-chap-display').offset().top
	    });
	    jQ('div#wikipedia-visual-chap-img-loading i').addClass('fa-spin');
	    jQ('div#wikipedia-visual-chap-img-loading').addClass('wvc-loading-image-active').removeClass('wvc-loading-image-standby');
	    jQ('div#wikipedia-visual-chap-img-loading').fadeIn(200);
	    /* reset main img */
	    jQ('img#wikipedia-visual-chap-display-image').attr('href', '');
	    /* reset old search - comment to save results */
	    wikipediaVisualChap.results = [];
	    var pageLocalLang = wikipediaVisualChap.language,
	        queryString = 'https://' + pageLocalLang + '.wikipedia.org/w/api.php?action=query&titles=' + query + '&prop=imageinfo|pageprops|images|pageimages|pageterms|links&iiprop=url&pilimit=10&redirects=return&origin=*&ascii=&format=json&formatversion=2';
	    jQ.ajax({
		url: queryString,
		type: 'POST',
		headers: { 'Api-User-Agent': 'Visual Chap 1.0.5 WordPress plugin - request 1 of 3 (http://visualchap.nouveausiteweb.fr/)' },
		dataType: 'json',
		success: function(data){
		    //console.log('First query: ', data);
		    wikipediaVisualChap.results.push(data);
		    /* when request has successfully pushed the result */
		},
		error: function(){
		    console.log(errorMessage);
		},
		complete: function(){
		    queryString = 'https://' + pageLocalLang + '.wikipedia.org/w/api.php?action=query&titles=' + wikipediaVisualChap.results[0].query.pages[0].title + '&prop=imageinfo|pageprops|images|pageimages|pageterms|links&iiprop=url&pilimit=10&redirects=return&origin=*&ascii=&format=json&formatversion=2';
		    jQ.ajax({
			url: queryString,
			type: 'POST',
			headers: { 'Api-User-Agent': 'Visual Chap 1.0.5 WordPress plugin - request 2 of 3 (http://visualchap.nouveausiteweb.fr/)' },
			dataType: 'json',
			success: function(data){
			    //console.log('Second query: ', data);
			    wikipediaVisualChap.results.push(data);
			    /* when request has successfully pushed the second result */
			},
			complete: function(){
			    /* images search setup */
			    var imgNames = [];
			    if (wikipediaVisualChap.results[1] && wikipediaVisualChap.results[1].query.pages[0].images){
				for (i = 0; i < wikipediaVisualChap.results[1].query.pages[0].images.length; i++){
				    imgNames.push(wikipediaVisualChap.results[1].query.pages[0].images[i].title);
				}
			    }
			    imgNames.unshift('File:' + wikipediaVisualChap.results[1].query.pages[0].pageimage);
			    imgNames = imgNames.join('|');
			    /* ready to request imgs */
			    queryString = 'https://' + pageLocalLang + '.wikipedia.org/w/api.php?action=query&titles=' + imgNames + '&prop=imageinfo&iiprop=url&redirects=return&origin=*&ascii=&format=json&formatversion=2';
			    jQ.ajax({
				url: queryString,
				type: 'POST',
				headers: { 'Api-User-Agent': 'Visual Chap 1.0.5 WordPress plugin - request 3 of 3 (http://visualchap.nouveausiteweb.fr/)' },
				dataType: 'json',
				success: function(data){
				    //console.log('Third query: ', data);
				    /* assign images property to main obj */
				    wikipediaVisualChap.images = data;
				},
				complete: function(thirdResult){
				    /* build html */
				    var photoLink = '',
					photoDetails = '',
					photos = wikipediaVisualChap.images.query.pages,
					mainImg = (wikipediaVisualChap.results[1] && wikipediaVisualChap.results[1].query.pages[0].pageimage) ? wikipediaVisualChap.results[1].query.pages[0].pageimage : wikipediaVisualChap.options.wvcPluginsURL + '/visual-chap/assets/img/Wikipedia-logo-v2.svg';
				    for (i = 0; i < photos.length; i++){
					var correctedTitle;
					/* language checks */
					// -- TO IMPROVE!!! write complete language checks
					if (wikipediaVisualChap.language === 'en' || wikipediaVisualChap.language === 'it' || wikipediaVisualChap.language === 'es' || wikipediaVisualChap.language === 'de'){
					    correctedTitle = photos[i].title.replace('File:', '').replace(/ /g, '_');
					}
					else if (wikipediaVisualChap.language === 'fr'){
					    correctedTitle = photos[i].title.replace('Fichier:', '').replace(/ /g, '_');
					}
					else {
					    console.log('Visual Chap error : the recognized html language is not supported! Please visit: http://visualchap.nouveausiteweb.fr/faq/');
					    // -- TO IMPROVE!!! - easy fix for unrecognized language (fallback to standard 'File:')
					    correctedTitle = photos[i].title.replace('File:', '').replace(/ /g, '_');
					}
					//console.log(correctedTitle);
					if (correctedTitle === mainImg){
					    photoLink = photos[i].imageinfo[0].url;
					    photoDetails = photos[i].imageinfo[0].descriptionshorturl;
					}
					if ( ! mainImg){
					    var titleCheck = photos[i].title,
						thisTitle;
					    /* language checks */
					    // -- TO IMPROVE!!! write complete language checks
					    if (wikipediaVisualChap.language === 'en' || wikipediaVisualChap.language === 'it' || wikipediaVisualChap.language === 'es' || wikipediaVisualChap.language === 'de'){
						thisTitle = photos[i].title.replace('File:', '');
					    }
					    else if (wikipediaVisualChap.language === 'fr'){
						thisTitle = photos[i].title.replace('Fichier:', '');
					    }
					    else {
						console.log('Visual Chap error : the recognized html language is not supported! Please visit: http://visualchap.nouveausiteweb.fr/faq/');
						// -- TO IMPROVE!!! - easy fix for unrecognized language (fallback to standard 'File:')
						thisTitle = photos[i].title.replace('File:', '');
					    }
					    //console.log(thisTitle);
					    if (photos[i].imageinfo && titleCheck.search(thisTitle) >= 0){
						photoLink = photos[i].imageinfo[0].url;
						photoDetails = photos[i].imageinfo[0].descriptionshorturl;
					    }
					    if ( ! photos[i].imageinfo) {
						photoLink = 'Undefined';
					    }
					}
				    }
				    
				    var titleUpdate = (wikipediaVisualChap.results[0].query.pages[0].title === undefined) ? 'No title found!' : wikipediaVisualChap.results[0].query.pages[0].title,
					urlUpdate = '',
					descriptionUpdate = (wikipediaVisualChap.results[0].query.pages[0]) ?
					    function(){
						if (wikipediaVisualChap.results[0].query.pages[0].terms){
						    if (wikipediaVisualChap.results[0].query.pages[0].terms.description){
							if (wikipediaVisualChap.results[0].query.pages[0].terms.description[0]){
							    return wikipediaVisualChap.results[0].query.pages[0].terms.description[0];
							}
							else {
							    return 'No description found!';
							}
						    }
						    else {
							return 'No description found!';
						    }
						}
						
						else {
						    return 'No description found!';
						}
					    }
					: wikipediaVisualChap.results[0].query.pages[0].terms.description[0],
					imgUpdate = '';
				    if (wikipediaVisualChap.results[0].query.pages[0].pageid !== undefined){
					urlUpdate = 'http://' + pageLocalLang + '.wikipedia.org/?curid=' + wikipediaVisualChap.results[0].query.pages[0].pageid;
				    }
				    /* assign images */
				    if (photoLink !== ''){
					jQ('img#wikipedia-visual-chap-display-image').attr('href', photoLink);
					var imageLink = '<a class="wvc-main-img-details" href="' + photoDetails + '" target="_blank"></a>';
					jQ('img#wikipedia-visual-chap-display-image').removeClass('wvc-img-standby').addClass('wvc-img-active');
					/* if link to img has been already created */
					if (jQ('img#wikipedia-visual-chap-display-image').parent('a.wvc-main-img-details').length){
					    jQ('img#wikipedia-visual-chap-display-image').parent('a.wvc-main-img-details').attr('href', photoDetails);
					}
					else {
					    /* create link to img details */
					    jQ('img#wikipedia-visual-chap-display-image').wrap(imageLink);
					}
					if (photoLink === 'Undefined' || wikipediaVisualChap.results[0].warnings) {
					    photoLink = wikipediaVisualChap.options.wvcPluginsURL + '/visual-chap/assets/img/Wikipedia-logo-v2.svg';
					    jQ('div#wikipedia-visual-chap-img-loading').removeClass('wvc-loading-image-active').addClass('wvc-loading-image-standby');
					    /* reset image loading box */
					    jQ('div#wikipedia-visual-chap-img-loading i').removeClass('fa-spin');
					    jQ('div#wikipedia-visual-chap-img-loading').fadeOut(200);
					}
					else {
					    var mediaFilter = /.+\.([^?]+)(\?|$)/,
						mediaCheck = photoLink.match(mediaFilter);
					    /* if img link is NOT a video or multimedia*/
					    if ( mediaCheck[1] !== 'ogg' && mediaCheck[1] !== 'mp4' && mediaCheck[1] !== 'webm' && mediaCheck[1] !== 'pdf'){
						/* remove load waiting spinning icon */
						jQ('img#wikipedia-visual-chap-display-image').on('load', function(){
						    /* if no description is found, reset img */
						    if (descriptionUpdate == 'No description found!'){
							jQ('img#wikipedia-visual-chap-display-image').attr('src', wikipediaVisualChap.options.wvcPluginsURL + '/visual-chap/assets/img/Wikipedia-logo-v2.svg');
						    }
						    /* reset image loading box */
						    jQ('div#wikipedia-visual-chap-img-loading i').removeClass('fa-spin');
						    jQ('div#wikipedia-visual-chap-img-loading').removeClass('wvc-loading-image-active').addClass('wvc-loading-image-standby');
						    jQ('div#wikipedia-visual-chap-img-loading').fadeOut(200);
						});
					    }
					    else {
						/* if no description is found, reset img */
						if (descriptionUpdate == 'No description found!'){
						    jQ('img#wikipedia-visual-chap-display-image').attr('src', wikipediaVisualChap.options.wvcPluginsURL + '/visual-chap/assets/img/Wikipedia-logo-v2.svg');
						}
						/* reset image loading box */
						jQ('div#wikipedia-visual-chap-img-loading i').removeClass('fa-spin');
						jQ('div#wikipedia-visual-chap-img-loading').removeClass('wvc-loading-image-active').addClass('wvc-loading-image-standby');
						jQ('div#wikipedia-visual-chap-img-loading').fadeOut(200);
					    }
					}
				    }
				    else {
					photoLink = wikipediaVisualChap.options.wvcPluginsURL + '/visual-chap/assets/img/Wikipedia-logo-v2.svg';
					jQ('img#wikipedia-visual-chap-display-image').attr('href', photoLink);
					/* reset image loading box */
					jQ('div#wikipedia-visual-chap-img-loading i').removeClass('fa-spin');
					jQ('div#wikipedia-visual-chap-img-loading').fadeOut(200);
				    }
				    /* update display */
				    wikipediaVisualChap.updateDisplay(titleUpdate, urlUpdate, descriptionUpdate, photoLink);
				}
			    });
			}
		    });
		}
	    });
	};

	/* set image max height */
	wikipediaVisualChap.wvcMainImgMaxHeight = function(){
	    var wvcBoxAllElements = jQ('div#wikipedia-visual-chap-box').children('*').not('img#wikipedia-visual-chap-display-image'),
		wvcBoxAllElementsHeight = 0,
		wvcCreditBoxCheck = wikipediaVisualChap.options.wvcWikiLink || wikipediaVisualChap.options.wvcDevLink ? jQ('div.wikipedia-visual-chap-link-dev').outerHeight() || jQ('div.wikipedia-visual-chap-link-wiki-donate').outerHeight() : 20;
	    jQ(wvcBoxAllElements).each(function(boxEl){
		wvcBoxAllElementsHeight += jQ(boxEl).height();
	    });
	    jQ('img#wikipedia-visual-chap-display-image').css({
		maxHeight: jQ(window).height() - (jQ('img#wikipedia-visual-chap-display-image').offset().top - jQ('div#wikipedia-visual-chap-inner-container').offset().top) - (parseInt(wikipediaVisualChap.options.wvcMarginTop) + wvcBoxAllElementsHeight) - (wvcCreditBoxCheck + 40) + 'px'
	    }, function(){
		wikipediaVisualChap.autoScroll(jQ('html'.scrollTop()));
	    });
	};
	
	/* get text from user selection */
	wikipediaVisualChap.getSelectionText = function(){
	    var text = '';
	    if (window.getSelection){
		text = window.getSelection().toString();
	    }
	    else if (document.selection && document.selection.type != "Control"){
		text = document.selection.createRange().text;
	    }
	    return text;
	};

	// assign WP color options // words underline color option is on line 85 - wikipediaVisualChap.switchButton function
	wikipediaVisualChap.adjustColors = function(){
	    var wvcWPOptions = wikipediaVisualChap.options;
	    jQ('head').append('<style id="wvc-active-container" type="text/css"></style>');
	    jQ('#wvc-active-container').html('.wvc-active-container {color: ' + wvcWPOptions.wvcColor + '; background-color: ' + wvcWPOptions.wvcBackgroundColor + ';}');
	    jQ('div#wikipedia-visual-chap-display').css('background-color', wvcWPOptions.wvcBackgroundColor);
		jQ('div#wikipedia-visual-chap-img-loading').css('background-color', wvcWPOptions.wvcBackgroundColor);
	    jQ('div#wikipedia-visual-chap-box-switch').css({
		color: wvcWPOptions.wvcBackgroundColor,
		backgroundColor: wvcWPOptions.wvcIconColor,
		boxShadow: '0 0 6px 1px ' + wvcWPOptions.wvcColor
	    });
	    jQ('p#wikipedia-visual-chap-name').css({
		color: wvcWPOptions.wvcIconColor
	    });
	    jQ('a#wikipedia-visual-chap-display-title-link, #wikipedia-visual-chap-display-title-link h3').css('color', wvcWPOptions.wvcLinkColor);
	};
	
	/* adjust size of html elements to fit WVC - used on document.ready and for each window.resize */
	wikipediaVisualChap.adjustSizes = function(content, resized){
	    /* select all content */
	    var contentElements = content.children('*').not('div#wikipedia-visual-chap-box, div#wikipedia-visual-chap-box *');
	    /* reset width */
	    contentElements.css('max-width', '0');
	    /* if launched on resize, re-asign css width class to box */
	    if (resized) {
		/* re-evaluate available value (check if there is more or less real estate) */
		wikipediaVisualChap.available = ( content.width() > 700 && content.height() > 750 ) ? true : false;
		/* if extended version is available (enough real estate in content div) */
		if (wikipediaVisualChap.available){
		    if (wikipediaVisualChap.switchedOn){
			if (wikipediaVisualChap.div.hasClass('wvc-box-pocket')){
			    wikipediaVisualChap.div.removeClass('wvc-box-pocket').addClass('wvc-box-extended');
			}
		    }
		}
		/* if pocket */
		else {
		    if (wikipediaVisualChap.switchedOn){
			if (wikipediaVisualChap.div.hasClass('wvc-box-extended')){
			    wikipediaVisualChap.div.removeClass('wvc-box-extended').addClass('wvc-box-pocket');
			}
		    }
		}
		wikipediaVisualChap.div.finish();
		wikipediaVisualChap.div.children('*').finish();
		if (wikipediaVisualChap.switchedOn){
		    /* select all content and resize */
		    var contentElems = wikipediaVisualChap.blogContentDiv.children('*').not('div#wikipedia-visual-chap-box, div#wikipedia-visual-chap-box *'),
			contentWidth = wikipediaVisualChap.blogContentDiv.width();
		    if ( wikipediaVisualChap.div.hasClass('wvc-box-extended') ){
			contentElems.css({
			    maxWidth: (contentWidth - 480) + 'px'
			}, 850);
		    }
		    else if ( wikipediaVisualChap.div.hasClass('wvc-box-pocket') ){
			contentElems.css({
			    maxWidth: (contentWidth - 280) + 'px'
			}, 850);
		    }
		    else {
			/* throw error - box has no assigned width css class */
			console.log('box has no assigned width css class!!! (wvc-box-extended OR wvc-box-pocket)');
		    }  
		}
	    }
	    /* get content's original width and resize */
	    var contentPrevWidth = content.outerWidth(),
		boxWidth = wikipediaVisualChap.div.outerWidth(),
		/* width of standby bar + margin of 30 (below) */
		switchStandby = 72;
	    /* if display is NOT visible */
	    if (wikipediaVisualChap.switchedOn === true){
		/* difference with margin of 30  */
		contentElements.css('max-width', (contentPrevWidth - (boxWidth + 30)) + 'px');
	    }
	    /* if display IS visible */
	    else {
		contentElements.css('max-width', (contentPrevWidth - switchStandby) + 'px');
	    }
	    /* get content's original height and resize */
	    var contentHeight = content.height();
	    wikipediaVisualChap.div.css({
		height: contentHeight + 'px',
		maxHeight: contentHeight + 'px'
	    });
	};

	/* on window resize */
	wikipediaVisualChap.resized = function(){
	    /* adjust sizes with resize arg (to eventually remove and re-assign extended or pocket css classes) */
	    wikipediaVisualChap.adjustSizes(wikipediaVisualChap.blogContentDiv, true);
	    /* set main img max-height */
	    wikipediaVisualChap.wvcMainImgMaxHeight();
	    /* wvc main offset */
	    jQ('div.wvc-box-active, div.wvc-box-standby').css('transition', 'all ease-in-out 0s');
	    var contentWidth = wikipediaVisualChap.blogContentDiv.offset().left + wikipediaVisualChap.blogContentDiv.outerWidth(),
		internalElementsWidth = wikipediaVisualChap.blogContentDiv.offset().left + wikipediaVisualChap.blogContentDiv.children('*').not('div#wikipedia-visual-chap-box, div#wikipedia-visual-chap-box *').outerWidth(),
		conditionalWidth = (wikipediaVisualChap.switchedOn) ? wvcResetOffset(wikipediaVisualChap.available, contentWidth) : contentWidth;
	    //console.log('Rezized reached! \nConditional Width: ', conditionalWidth);
	    function wvcResetOffset(available, contWidth){
		/* if extended */
		if (available){
		    return  contWidth - (wikipediaVisualChap.div.outerWidth() - 42);
		}
		/* if pocket */
		else {
		    return contWidth - (wikipediaVisualChap.div.outerWidth() - 42);
		}
	    }
	    /* reposition WVC box */
	    jQ('div#wikipedia-visual-chap-box').offset({
		top: wikipediaVisualChap.blogContentDiv.offset().top,
		left: conditionalWidth - 28
	    });
	    jQ('.wvc-box-active, .wvc-box-standby').css('transition', 'all ease-in-out .85s');
	};
	
	/* auto scroll */
	wikipediaVisualChap.autoScroll = function(wvcWindowInfo){
	    var windowOffset = wvcWindowInfo,
		previousWindowOffset = wikipediaVisualChap.lastPositionY,
		box = jQ('div#wikipedia-visual-chap-box'),
		boxOffset = box.offset(),
		boxHeight = box.outerHeight(),
		container = jQ('div#wikipedia-visual-chap-inner-container'),
		containerOffset = container.offset(),
		containerTopMargin = parseInt(wikipediaVisualChap.options.wvcMarginTop),
		containerHeight = container.outerHeight(),
		containerChecksDown = (containerHeight + containerOffset.top) < (boxHeight + boxOffset.top) -20 ? true : false,
		scrollCheckTop = (windowOffset > boxOffset.top - containerTopMargin) ? true : false,
		scrollCheckBottom = (windowOffset < containerOffset.top - containerTopMargin) ? true : false;
	    
	    if ( scrollCheckTop ){
		/* if viewport is between treshold points, set container to fixed CSS position */
		if  ( windowOffset < (boxHeight + boxOffset.top) - (containerHeight + containerTopMargin) ){
		    container.css({
			position: 'fixed'
		    });
		    container.offset({
			top: windowOffset + containerTopMargin,
			left: boxOffset.left
		    });
		}
		/* if viewport is outside treshold points, set container to relative CSS position */
		else if ( windowOffset >= (boxHeight + boxOffset.top) - (containerHeight + containerTopMargin) ){
		    container.css({
			position: 'relative'
		    });
		    container.offset({
			top: (boxOffset.top + boxHeight) - (containerHeight),
			left: boxOffset.left
		    });
		}
		else {
		    console.log('ERROR! scrollCheckTop: ', scrollCheckTop);
		}
	    }
	    /* if viewport is outside treshold points, set container to relative CSS position */
	    else if ( ! scrollCheckTop ){
		container.css({
		    position: 'relative'
		});
		container.offset({
		    top: boxOffset.top,
		    left: boxOffset.left
		});
	    }
	    else {
		console.log('ERROR! scrollCheckTop: ', scrollCheckTop);
	    }
	    /* set main img max-height */
	    wikipediaVisualChap.wvcMainImgMaxHeight();
	    /* set last window position */
	    wikipediaVisualChap.lastPositionY = windowOffset;
	};

	/* closing scroll animation (launched when switch button is pressed to turn Visual Chap OFF) */
	wikipediaVisualChap.closingScroll = function(wvcClosingDelay){
	    var wvcWindowObjCheck;
	    if (wikipediaVisualChap.pageYMode.standard){
		wvcWindowObjCheck = window.pageY;
	    }
	    else {
		wvcWindowObjCheck = window.pageYOffset;
	    }
	    /* if viewport offset > Visual Chap offset */
	    if (wvcWindowObjCheck > wikipediaVisualChap.div.offset().top){
		/* set page scroll timeout animation once all adjustments are done */
		var wvcPreviousWindowOffset = wvcWindowObjCheck,
		    wvcPreviousContent = jQ('div#wikipedia-visual-chap-box').parent('div'),
		    wvcPreviousContentHeight = wvcPreviousContent.outerHeight(),
		    wvcFinalScrollAnchor = wikipediaVisualChap.wvcCheckProximity(wvcPreviousContent, wvcPreviousWindowOffset);
		setTimeout(function(){
		    /* compute new offset for scrollTop */
		    var wvcComputedFinalScroll = parseInt(jQ(wvcPreviousContent[0].children[wvcFinalScrollAnchor]).offset().top) + parseInt(wikipediaVisualChap.options.wvcMarginTop);
		    /* animate and reset */
		    jQ('html').animate({
			scrollTop: wvcComputedFinalScroll
		    }, '500', 'swing', function(){
			window.scrollTo(0, wvcComputedFinalScroll);
		    });
		}, wvcClosingDelay);
	    }
	};

	/* compute proximity */
	wikipediaVisualChap.wvcCheckProximity = function(thisParagraphsSet, referenceOffset){
	    var wvcContentParagraphs = thisParagraphsSet.children('*').not('div#wikipedia-visual-chap-box, div#wikipedia-visual-chap-box *').length,
		wvcAnchorParagraph = 1; // skip Visual Chap div
	    for (elOffsetCheck = 1; elOffsetCheck < wvcContentParagraphs; elOffsetCheck++){
		var wvcParagraphOffsetCheck = jQ(thisParagraphsSet[0].children[elOffsetCheck]);
		if (wvcParagraphOffsetCheck){
		    var wvcParagraphTop = wvcParagraphOffsetCheck.offset().top;
		    /* check if viewport is within element height range */
		    if ( referenceOffset < (wvcParagraphTop + wvcParagraphOffsetCheck.height()) && referenceOffset > wvcParagraphTop ){
			wvcAnchorParagraph = elOffsetCheck;
			elOffsetCheck = wvcContentParagraphs;
		    }
		}
	    }
	    return wvcAnchorParagraph;
	};
	
	/* configure */
	wikipediaVisualChap.configure = function(){

	    /* add first run check if not present */
	    if ( ! wikipediaVisualChap.firstRun ){
		wikipediaVisualChap.firstRun = true;
	    }
	    
	    /* set custom colors (from WP options) */
	    wikipediaVisualChap.adjustColors();
	    
	    /* set elements sizes and position */
	    wikipediaVisualChap.adjustSizes(wikipediaVisualChap.blogContentDiv);
	    /* resize each credit to half width if both are present */
	    if ( wikipediaVisualChap.options.wvcWikiLink === '1' && wikipediaVisualChap.options.wvcDevLink === '1' ){
		jQ('div.wikipedia-visual-chap-link-wiki-donate, div.wikipedia-visual-chap-link-dev').addClass('wikipedia-visual-chap-both-credits');
		jQ('div.wikipedia-visual-chap-link-wiki-donate').css('margin-right', '1%');
		jQ('div.wikipedia-visual-chap-link-dev').css('margin-left', '1%');
	    }

	    /* switch on/off */
	    jQ('div#wikipedia-visual-chap-box-switch').on('click', function(){
	    /* pause body scrolling */
	    jQ('body').addClass('wvc-stop-body-scrolling');
	    /* for mobiles */
	    jQ('body').bind('touchmove', function(e){e.preventDefault()});
	    setTimeout(function(){
		jQ('body').removeClass('wvc-stop-body-scrolling');
		jQ('body').unbind('touchmove', function(e){e.preventDefault()});
	    }, 1200);
		wikipediaVisualChap.switchButton(wikipediaVisualChap.blogContentDiv);
	    });

	    /* setup content css classes */
	    wikipediaVisualChap.contentSetup(wikipediaVisualChap.blogContentDiv.children('*'));

	    /* trigger search when selecting content with mouse */
	    wikipediaVisualChap.blogContentDiv.not('div#wikipedia-visual-chap-box').mouseup(function(){
		if (wikipediaVisualChap.switchedOn === true && wikipediaVisualChap.getSelectionText() !== ''){
		    wikipediaVisualChap.search(wikipediaVisualChap.getSelectionText());
		}
		// -- TO FINISH!!! - write container overflow check
	    });
	    
	    /* window scroll */
	    window.onscroll = function(){
		var wvcWindowObjCheck;
		/* if window scroll is NOT in hold by the main switch animation */
		if ( ! jQ('body').hasClass('wvc-stop-body-scrolling')){
		    if (wikipediaVisualChap.pageYMode.standard){
			wvcWindowObjCheck = window.pageY;
		    }
		    else {
			wvcWindowObjCheck = window.pageYOffset;
		    }
		    wikipediaVisualChap.autoScroll(wvcWindowObjCheck);
		}
	    };
	    
	    /* window resize */
	    window.onresize = function(){
		wikipediaVisualChap.resized();
		setTimeout(function(){
		    var wvcWindowObjCheck;
		    /* if window scroll is NOT in hold by the main switch animation */
		    if ( ! jQ('body').hasClass('wvc-stop-body-scrolling')){
			if (wikipediaVisualChap.pageYMode.standard){
			    wvcWindowObjCheck = window.pageY;
			}
			else {
			    wvcWindowObjCheck = window.pageYOffset;
			}
			wikipediaVisualChap.autoScroll(wvcWindowObjCheck);
		    }
		}, 1200);
	    };
	    
	};
	

	// CONFIGURATION

	/* if screen is suitable */
	if ( wikipediaVisualChap.disabled === false ){
	    wikipediaVisualChap.configure();
	}

	/* check if screen is suitable on window resize */
	jQ(window).on('resize', function(){

	    // re-check extended availability
	    wikipediaVisualChap.available = ( jQ('div#wikipedia-visual-chap-box').parent('div').width() > 700 && jQ('div#wikipedia-visual-chap-box').parent('div').height() > 750 ) ? true : false;
	    wikipediaVisualChap.disabled = ( jQ(window).width() < 700 || jQ(window).height() < 600 || jQ('div#wikipedia-visual-chap-box').parent('div').height() < 450 ) ? true : false;
	    
	    /* if resized from an unsuitable size into a suitable one and NEEDS first run */
	    if ( wikipediaVisualChap.disabled === false && wikipediaVisualChap.firstRun === false && wikipediaVisualChap.div.css('opacity') === '0' ){
		wikipediaVisualChap.configure();
	    }
	    /* if resized from a suitable size into an unsuitable one */
	    else if ( wikipediaVisualChap.disabled === true && wikipediaVisualChap.firstRun === true && wikipediaVisualChap.div.css('opacity') === '1' ){
		wikipediaVisualChap.div.css('opacity', '0');
		/* close panel after resizing if active */
		if (wikipediaVisualChap.switchedOn){
		    setTimeout(function(){
			jQ('div#wikipedia-visual-chap-box-switch').click();
		    }, 900);
		}
	    }
	    /* if resized from an unsuitable size into a suitable one and DOES NOT NEED first run */
	    else if ( wikipediaVisualChap.disabled === false && wikipediaVisualChap.firstRun === true && wikipediaVisualChap.div.css('opacity') === '0' ){
		wikipediaVisualChap.div.animate({
		    opacity: '1'
		}, 250);
		/* close panel after resizing if active */
		if (wikipediaVisualChap.switchedOn){
		    setTimeout(function(){
			jQ('div#wikipedia-visual-chap-box-switch').click();
		    }, 1100);
		}
	    }
	    else {
		/* throw debug error */
		//console.log('Visual Chap resize debug\nAvailable: ', wikipediaVisualChap.available, 'Disabled: ', wikipediaVisualChap.disabled, 'First run: ', wikipediaVisualChap.firstRun, 'Box opacity', wikipediaVisualChap.div.css('opacity'));
		/* close panel after resizing if active */
		if (wikipediaVisualChap.switchedOn){
		    setTimeout(function(){
			jQ('div#wikipedia-visual-chap-box-switch').click();
		    }, 1100);
		}
	    }

	});
	
    });
    /* document ready END */

})();

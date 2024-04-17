/**
Kaizo.js
Forked from simplewiki's version of Kaizo and de-Wikipedia-fied by Naleksuh
 */
 
mw.loader.load("https://dev.miraheze.org/w/index.php?title=MediaWiki:Jquerymigrate-3.3.2.js&action=raw&ctype=text/javascript");

//<nowiki>

( function ( window, document, $, undefined ) { // Wrap with anonymous function

var Kaizo = {};
window.Kaizo = Kaizo;  // allow global access

// for use by custom modules (normally empty)
Kaizo.initCallbacks = [];
Kaizo.addInitCallback = function KaizoAddInitCallback( func ) {
	Kaizo.initCallbacks.push( func );
};

Kaizo.defaultConfig = {};
/**
 * Kaizo.defaultConfig.Kaizo and Kaizo.defaultConfig.friendly
 *
 * This holds the default set of preferences used by Kaizo. (The |friendly| object holds preferences stored in the FriendlyConfig object.)
 * It is important that all new preferences added here, especially admin-only ones, are also added to
 * |Kaizo.config.sections| in Kaizoconfig.js, so they are configurable via the Kaizo preferences panel.
 * For help on the actual preferences, see the comments in Kaizoconfig.js.
 */
Kaizo.defaultConfig.Kaizo = {
	 // General
	summaryAd: " ([[Meta:Kaizo|TW]])",
	deletionSummaryAd: " ([[Meta:Kaizo|TW]])",
	protectionSummaryAd: " ([[Meta:Kaizo|TW]])",
	userTalkPageMode: "window",
	dialogLargeFont: false,
	 // Fluff (revert and rollback)
	openTalkPage: [ "agf", "norm", "vand" ],
	openTalkPageOnAutoRevert: false,
	markRevertedPagesAsMinor: [ "vand" ],
	watchRevertedPages: [ "agf", "norm", "vand", "torev" ],
	offerReasonOnNormalRevert: true,
	confirmOnFluff: false,
	showRollbackLinks: [ "diff", "others" ],
	 // CSD
	speedySelectionStyle: "buttonClick",
	speedyPromptOnG7: false,
	watchSpeedyPages: [  ],
	markSpeedyPagesAsPatrolled: true,
	// these next two should probably be identical by default
	notifyUserOnSpeedyDeletionNomination:    [ "db"],
	welcomeUserOnSpeedyDeletionNotification: [ "db" ],
	promptForSpeedyDeletionSummary: [ "db" ],
	openUserTalkPageOnSpeedyDelete: [ "db" ],
	deleteTalkPageOnDelete: false,
	deleteSysopDefaultToTag: false,
	speedyWindowHeight: 500,
	speedyWindowWidth: 800,
	logSpeedyNominations: false,
	speedyLogPageName: "QD log",
	noLogOnSpeedyNomination: [ "u1" ],
	 // Unlink
	unlinkNamespaces: [ "0" ],
	 // Warn
	defaultWarningGroup: "1",
	showSharedIPNotice: true,
	watchWarnings: true,
	blankTalkpageOnIndefBlock: false,
	 // XfD
	xfdWatchDiscussion: "default",
	xfdWatchList: "no",
	xfdWatchPage: "default",
	xfdWatchUser: "default",
	 // Hidden preferences
	revertMaxRevisions: 50,
	batchdeleteChunks: 50,
	batchDeleteMinCutOff: 5,
	batchMax: 5000,
	batchProtectChunks: 50,
	batchProtectMinCutOff: 5,
	batchundeleteChunks: 50,
	batchUndeleteMinCutOff: 5
};

// now some skin dependent config.
if ( mw.config.get( "skin" ) === "vector" || mw.config.get( "skin" ) === "vector-2022") {
	Kaizo.defaultConfig.Kaizo.portletArea = "right-navigation";
	Kaizo.defaultConfig.Kaizo.portletId   = "p-Kaizo";
	Kaizo.defaultConfig.Kaizo.portletName = "KZ";
	Kaizo.defaultConfig.Kaizo.portletType = "menu";
	Kaizo.defaultConfig.Kaizo.portletNext = "p-search";
} else {
	Kaizo.defaultConfig.Kaizo.portletArea =  null;
	Kaizo.defaultConfig.Kaizo.portletId   = "p-cactions";
	Kaizo.defaultConfig.Kaizo.portletName = null;
	Kaizo.defaultConfig.Kaizo.portletType = null;
	Kaizo.defaultConfig.Kaizo.portletNext = null;
}

Kaizo.defaultConfig.friendly = {
	 // Tag
	groupByDefault: true,
	watchTaggedPages: true,
	markTaggedPagesAsMinor: false,
	markTaggedPagesAsPatrolled: true,
	tagArticleSortOrder: "cat",
	customTagList: [],
	// Stub
	watchStubbedPages: true,
	markStubbedPagesAsMinor: false,
	markStubbedPagesAsPatrolled: true,
	stubArticleSortOrder: "cat",
	 // Welcome
	topWelcomes: false,
	watchWelcomes: true,
	welcomeHeading: "Welcome",
	insertHeadings: true,
	insertUsername: true,
	insertSignature: true,  // sign welcome templates, where appropriate
	quickWelcomeMode: "norm",
	quickWelcomeTemplate: "welcome",
	customWelcomeList: [],
	 // Talkback
	markTalkbackAsMinor: true,
	insertTalkbackSignature: true,  // always sign talkback templates
	talkbackHeading: "Talkback",
	adminNoticeHeading: "Notice",
	mailHeading: "You've got mail!",
	 // Shared
	markSharedIPAsMinor: true
};

Kaizo.getPref = function KaizoGetPref( name ) {
	var result;
	if ( typeof Kaizo.prefs === "object" && typeof Kaizo.prefs.Kaizo === "object" ) {
		// look in Kaizo.prefs (Kaizooptions.js)
		result = Kaizo.prefs.Kaizo[name];
	} else if ( typeof window.KaizoConfig === "object" ) {
		// look in KaizoConfig
		result = window.KaizoConfig[name];
	}

	if ( result === undefined ) {
		return Kaizo.defaultConfig.Kaizo[name];
	}
	return result;
};

Kaizo.getFriendlyPref = function KaizoGetFriendlyPref(name) {
	var result;
	if ( typeof Kaizo.prefs === "object" && typeof Kaizo.prefs.friendly === "object" ) {
		// look in Kaizo.prefs (Kaizooptions.js)
		result = Kaizo.prefs.friendly[ name ];
	} else if ( typeof window.FriendlyConfig === "object" ) {
		// look in FriendlyConfig
		result = window.FriendlyConfig[ name ];
	}

	if ( result === undefined ) {
		return Kaizo.defaultConfig.friendly[ name ];
	}
	return result;
};



/**
 * **************** twAddPortlet() ****************
 *
 * Adds a portlet menu to one of the navigation areas on the page.
 * This is necessarily quite a hack since skins, navigation areas, and
 * portlet menu types all work slightly different.
 *
 * Available navigation areas depend on the skin used.
 * Vector:
 *  For each option, the outer div class contains "vector-menu", the inner div class is "vector-menu-content", and the ul is "vector-menu-content-list"
 *  "mw-panel", outer div class contains "vector-menu-portal". Existing portlets/elements: "p-logo", "p-navigation", "p-interaction", "p-tb", "p-coll-print_export"
 *  "left-navigation", outer div class contains "vector-menu-tabs" or "vector-menu-dropdown". Existing portlets: "p-namespaces", "p-variants" (menu)
 *  "right-navigation", outer div class contains "vector-menu-tabs" or "vector-menu-dropdown". Existing portlets: "p-views", "p-cactions" (menu), "p-search"
 *  Special layout of p-personal portlet (part of "head") through specialized styles.
 * Monobook:
 *  "column-one", outer div class "portlet", inner div class "pBody". Existing portlets: "p-cactions", "p-personal", "p-logo", "p-navigation", "p-search", "p-interaction", "p-tb", "p-coll-print_export"
 *  Special layout of p-cactions and p-personal through specialized styles.
 * Modern:
 *  "mw_contentwrapper" (top nav), outer div class "portlet", inner div class "pBody". Existing portlets or elements: "p-cactions", "mw_content"
 *  "mw_portlets" (sidebar), outer div class "portlet", inner div class "pBody". Existing portlets: "p-navigation", "p-search", "p-interaction", "p-tb", "p-coll-print_export"
 *
 * @param String navigation -- id of the target navigation area (skin dependant, on vector either of "left-navigation", "right-navigation", or "mw-panel")
 * @param String id -- id of the portlet menu to create, preferably start with "p-".
 * @param String text -- name of the portlet menu to create. Visibility depends on the class used.
 * @param String type -- type of portlet. Currently only used for the vector non-sidebar portlets, pass "menu" to make this portlet a drop down menu.
 * @param Node nextnodeid -- the id of the node before which the new item should be added, should be another item in the same list, or undefined to place it at the end.
 *
 * @return Node -- the DOM node of the new item (a DIV element) or null
 */
function twAddPortlet( navigation, id, text, type, nextnodeid )
{
	//sanity checks, and get required DOM nodes
	var root = document.getElementById( navigation );
	if ( !root ) {
		return null;
	}

	var item = document.getElementById( id );
	if ( item ) {
		if ( item.parentNode && item.parentNode === root ) {
			return item;
		}
		return null;
	}

	var nextnode;
	if ( nextnodeid ) {
		nextnode = document.getElementById(nextnodeid);
	}

	if ((mw.config.get('skin') !== 'vector' && mw.config.get('skin') !== 'vector-2022') || (navigation !== 'left-navigation' && navigation !== 'right-navigation')) {
		type = null; // menu supported only in vector's #left-navigation & #right-navigation
	}
	var outerDivClass;
	var innerDivClass;
	switch (mw.config.get('skin'))
	{
		case "vector":
		case 'vector-2022':
			if ( navigation !== "portal" && navigation !== "left-navigation" && navigation !== "right-navigation" ) {
				navigation = "mw-panel";
			}
			outerDivClass = 'vector-menu vector-menu-' + (navigation === 'mw-panel' ? 'portal' : type === 'menu' ? 'dropdown  vector-menu-dropdown-noicon' : 'tabs');
			innerDivClass = 'vector-menu-content';
			break;
		case "modern":
			if ( navigation !== "mw_portlets" && navigation !== "mw_contentwrapper" ) {
				navigation = "mw_portlets";
			}
			outerDivClass = "portlet";
			innerDivClass = "pBody";
			break;
		default:
			navigation = "column-one";
			outerDivClass = "portlet";
			innerDivClass = "pBody";
			break;
	}

	// Build the DOM elements.
	var outerDiv = document.createElement('nav');
	outerDiv.setAttribute('aria-labelledby', id + '-label');
	// Vector getting vector-menu-empty FIXME TODO
	outerDiv.className = outerDivClass + ' emptyPortlet';
	outerDiv.id = id;
	if (nextnode && nextnode.parentNode === root) {
		root.insertBefore(outerDiv, nextnode);
	} else {
		root.appendChild(outerDiv);
	}

	var h3 = document.createElement('h3');
	h3.id = id + '-label';
	var ul = document.createElement('ul');

	if (mw.config.get( "skin" ) === 'vector' || mw.config.get( "skin" ) === 'vector-2022') {
		h3.className = "vector-menu-heading";
		// add invisible checkbox to keep menu open when clicked
		// similar to the p-cactions ("More") menu
		if (outerDivClass.indexOf('vector-menu-dropdown') !== -1) {
			var chkbox = document.createElement('input');
			chkbox.className = 'vectorMenuCheckbox vector-menu-checkbox'; // remove vectorMenuCheckbox after 1.35-wmf.37 goes live
			chkbox.setAttribute('type', 'checkbox');
			chkbox.setAttribute('aria-labelledby', id + '-label');
			outerDiv.appendChild(chkbox);

			var span = document.createElement('span');
			span.appendChild(document.createTextNode(text));
			h3.appendChild(span);

			var a = document.createElement('a');
			a.href = '#';

			$(a).click(function(e) {
				e.preventDefault();
			});

			h3.appendChild(a);
		}

		outerDiv.appendChild(h3);
		ul.className = 'menu vector-menu-content-list';  // remove menu after 1.35-wmf.37 goes live
	} else {
		h3.appendChild(document.createTextNode(text));
		outerDiv.appendChild(h3);
	}

	if (innerDivClass) {
		var innerDiv = document.createElement('div');
		innerDiv.className = innerDivClass;
		innerDiv.appendChild(ul);
		outerDiv.appendChild(innerDiv);
	} else {
		outerDiv.appendChild(ul);
	}


	return outerDiv;
}


/**
 * **************** twAddPortletLink() ****************
 * Builds a portlet menu if it doesn't exist yet, and add the portlet link.
 * @param task: Either a URL for the portlet link or a function to execute.
 */
function twAddPortletLink( task, text, id, tooltip )
{
	if ( Kaizo.getPref("portletArea") !== null ) {
		twAddPortlet( Kaizo.getPref( "portletArea" ), Kaizo.getPref( "portletId" ), Kaizo.getPref( "portletName" ), Kaizo.getPref( "portletType" ), Kaizo.getPref( "portletNext" ));
	}
	var link = mw.util.addPortletLink( Kaizo.getPref( "portletId" ), typeof task === "string" ? task : "#", text, id, tooltip );
	$('.client-js .skin-vector #p-cactions').css('margin-right', 'initial');
	if ( $.isFunction( task ) ) {
		$( link ).click(function ( ev ) {
			task();
			ev.preventDefault();
		});
	}
	if ($.collapsibleTabs) {
		$.collapsibleTabs.handleResize();
	}
	return link;
}

// Check if account is experienced enough to use Kaizo
var KaizoUserAuthorized = Morebits.userIsInGroup( "autoconfirmed" ) || Morebits.userIsInGroup( "confirmed" );
/*
 ****************************************
 *** friendlyshared.js: Shared IP tagging module
 ****************************************
 * Mode of invocation:     Tab ("Shared")
 * Active on:              Existing IP user talk pages
 * Config directives in:   FriendlyConfig
 */

Kaizo.shared = function friendlyshared() {
	if( mw.config.get('wgNamespaceNumber') === 3 && Morebits.isIPAddress(mw.config.get('wgTitle')) ) {
		var username = mw.config.get('wgTitle').split( '/' )[0].replace( /\"/, "\\\""); // only first part before any slashes
		twAddPortletLink( function(){ Kaizo.shared.callback(username); }, "Shared IP", "friendly-shared", "Shared IP tagging" );
	}
};

Kaizo.shared.callback = function friendlysharedCallback( uid ) {
	var Window = new Morebits.simpleWindow( 600, 400 );
	Window.setTitle( "Shared IP address tagging" );
	Window.setScriptName( "Kaizo" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#shared" );

	var form = new Morebits.quickForm( Kaizo.shared.callback.evaluate );

	var div = form.append( { type: 'div', id: 'sharedip-templatelist' } );
	div.append( { type: 'header', label: 'Shared IP address templates' } );
	div.append( { type: 'radio', name: 'shared', list: Kaizo.shared.standardList,
		event: function( e ) {
			Kaizo.shared.callback.change_shared( e );
			e.stopPropagation();
		}
	} );

	var org = form.append( { type:'field', label:'Fill in other details (optional) and click \"Submit\"' } );
	org.append( {
			type: 'input',
			name: 'organization',
			label: 'IP address owner/operator',
			disabled: true,
			tooltip: 'You can optionally enter the name of the organization that owns/operates the IP address.  You can use wikimarkup if necessary.'
		}
	);
	org.append( {
			type: 'input',
			name: 'host',
			label: 'Host name (optional)',
			disabled: true,
			tooltip: 'The host name (for example, proxy.example.com) can be optionally entered here and will be linked by the template.'
		}
	);
	org.append( {
			type: 'input',
			name: 'contact',
			label: 'Contact information (only if requested)',
			disabled: true,
			tooltip: 'You can optionally enter some contact details for the organization.  Use this parameter only if the organization has specifically requested that it be added.  You can use wikimarkup if necessary.'
		}
	);
	
	form.append( { type:'submit' } );

	var result = form.render();
	Window.setContent( result );
	Window.display();

	$(result).find('div#sharedip-templatelist').addClass('quickform-scrollbox');
};

Kaizo.shared.standardList = [
	{
		label: '{{SharedIP}}: standard shared IP address template',
		value: 'Shared IP',
		tooltip: 'IP user talk page template that shows helpful information to IP users and those wishing to warn, block or ban them'
	},
	{ 
		label: '{{SchoolIP}}: shared IP address template modified for educational institutions',
		value: 'SchoolIP'
	},
	{
		label: '{{SharedIPCORP}}: shared IP address template modified for businesses',
		value: 'SharedIPCORP'
	},
	{ 
		label: '{{ISP}}: shared IP address template modified for ISP organizations (specifically proxies)',
		value: 'ISP'
	}
];

Kaizo.shared.callback.change_shared = function friendlysharedCallbackChangeShared(e) {
	if( e.target.value === 'Shared IP edu' ) {
		e.target.form.contact.disabled = false;
	} else {
		e.target.form.contact.disabled = true;
	}
	e.target.form.organization.disabled=false;
	e.target.form.host.disabled=false;
};

Kaizo.shared.callbacks = {
	main: function( pageobj ) {
		var params = pageobj.getCallbackParameters();
		var pageText = pageobj.getPageText();
		var found = false;
		var text = '{{';

		for( var i=0; i < Kaizo.shared.standardList.length; i++ ) {
			var tagRe = new RegExp( '(\\{\\{' + Kaizo.shared.standardList[i].value + '(\\||\\}\\}))', 'im' );
			if( tagRe.exec( pageText ) ) {
				Morebits.status.warn( 'Info', 'Found {{' + Kaizo.shared.standardList[i].value + '}} on the user\'s talk page already...aborting' );
				found = true;
			}
		}

		if( found ) {
			return;
		}

		Morebits.status.info( 'Info', 'Will add the shared IP address template to the top of the user\'s talk page.' );
		text += params.value + '|' + params.organization;
		if( params.value === 'shared IP edu' && params.contact !== '') {
			text += '|' + params.contact;
		}
		if( params.host !== '' ) {
			text += '|host=' + params.host;
		}
		text += '}}\n\n';

		var summaryText = 'Added {{[[Template:' + params.value + '|' + params.value + ']]}} template.';
		pageobj.setPageText(text + pageText);
		pageobj.setEditSummary(summaryText + Kaizo.getPref('summaryAd'));
		pageobj.setMinorEdit(Kaizo.getFriendlyPref('markSharedIPAsMinor'));
		pageobj.setCreateOption('recreate');
		pageobj.save();
	}
};

Kaizo.shared.callback.evaluate = function friendlysharedCallbackEvaluate(e) {
	var shared = e.target.getChecked( 'shared' );
	if( !shared || shared.length <= 0 ) {
		alert( 'You must select a shared IP address template to use!' );
		return;
	}
	
	var value = shared[0];
	
	if( e.target.organization.value === '') {
		alert( 'You must input an organization for the {{' + value + '}} template!' );
		return;
	}
	
	var params = {
		value: value,
		organization: e.target.organization.value,
		host: e.target.host.value,
		contact: e.target.contact.value
	};

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( e.target );

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = "Tagging complete, reloading talk page in a few seconds";

	var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), "User talk page modification");
	wikipedia_page.setFollowRedirect(true);
	wikipedia_page.setCallbackParameters(params);
	wikipedia_page.load(Kaizo.shared.callbacks.main);
};
/*
 ****************************************
 *** friendlytag.js: Tag module
 ****************************************
 * Mode of invocation:     Tab ("Tag")
 * Active on:              Existing articles; file pages with a corresponding file
 *                         which is local (not on Commons); existing subpages of
 *                         {Wikipedia|Wikipedia talk}:Articles for creation;
 *                         all redirects
 * Config directives in:   FriendlyConfig
 */

Kaizo.tag = function friendlytag() {
	// redirect tagging
	if( Morebits.wiki.isPageRedirect() ) {
		Kaizo.tag.mode = 'redirect';
		//twAddPortletLink( Kaizo.tag.callback, "Tag", "friendly-tag", "Tag redirect" );
	}
	// file tagging
	else if( mw.config.get('wgNamespaceNumber') === 6 && !document.getElementById("mw-sharedupload") && document.getElementById("mw-imagepage-section-filehistory") ) {
		Kaizo.tag.mode = 'file';
	}
	// article/draft article tagging
	else if( ( mw.config.get('wgNamespaceNumber') === 0 || /^Wikipedia([ _]talk)?\:Requested[ _]pages\//.exec(mw.config.get('wgPageName')) ) && mw.config.get('wgCurRevisionId') ) {
		Kaizo.tag.mode = 'article';
		//twAddPortletLink( Kaizo.tag.callback, "Tag", "friendly-tag", "Add maintenance tags to article" );
	}
};

Kaizo.tag.callback = function friendlytagCallback( uid ) {
	var Window = new Morebits.simpleWindow( 630, (Kaizo.tag.mode === "article") ? 450 : 400 );
	Window.setScriptName( "Kaizo" );
	// anyone got a good policy/guideline/info page/instructional page link??
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#tag" );

	var form = new Morebits.quickForm( Kaizo.tag.callback.evaluate );

	switch( Kaizo.tag.mode ) {
		case 'article':
			Window.setTitle( "Article maintenance tagging" );

			form.append( {
					type: 'checkbox',
					list: [
						{
							label: 'Group inside {{multiple issues}} if possible',
							value: 'group',
							name: 'group',
							tooltip: 'If applying three or more templates supported by {{multiple issues}} and this box is checked, all supported templates will be grouped inside a {{multiple issues}} template.',
							checked: Kaizo.getFriendlyPref('groupByDefault')
						}
					]
				}
			);

			form.append({
				type: 'select',
				name: 'sortorder',
				label: 'View this list:',
				tooltip: 'You can change the default view order in your Kaizo preferences (Meta:Kaizo/Preferences).',
				event: Kaizo.tag.updateSortOrder,
				list: [
					{ type: 'option', value: 'cat', label: 'By categories', selected: Kaizo.getFriendlyPref('tagArticleSortOrder') === 'cat' },
					{ type: 'option', value: 'alpha', label: 'In alphabetical order', selected: Kaizo.getFriendlyPref('tagArticleSortOrder') === 'alpha' }
				]
			});

			form.append( { type: 'div', id: 'tagWorkArea' } );

			if( Kaizo.getFriendlyPref('customTagList').length ) {
				form.append( { type: 'header', label: 'Custom tags' } );
				form.append( { type: 'checkbox', name: 'articleTags', list: Kaizo.getFriendlyPref('customTagList') } );
			}
			break;

		case 'redirect':
			Window.setTitle( "Redirect tagging" );
	//Spelling, misspelling, tense and capitalization templates
			form.append({ type: 'header', label:'All templates' });
			form.append({ type: 'checkbox', name: 'redirectTags', list: Kaizo.tag.spellingList });
			break;

		default:
			alert("Kaizo.tag: unknown mode " + Kaizo.tag.mode);
			break;
	}

	form.append( { type:'submit' } );

	var result = form.render();
	Window.setContent( result );
	Window.display();

	if (Kaizo.tag.mode === "article") {
		// fake a change event on the sort dropdown, to initialize the tag list
		var evt = document.createEvent("Event");
		evt.initEvent("change", true, true);
		result.sortorder.dispatchEvent(evt);
	}
};

Kaizo.tag.checkedTags = [];

Kaizo.tag.updateSortOrder = function(e) {
	var sortorder = e.target.value;
	var $workarea = $(e.target.form).find("div#tagWorkArea");

	Kaizo.tag.checkedTags = e.target.form.getChecked("articleTags");
	if (!Kaizo.tag.checkedTags) {
		Kaizo.tag.checkedTags = [];
	}

	// function to generate a checkbox, with appropriate subgroup if needed
	var makeCheckbox = function(tag, description) {
		var checkbox = { value: tag, label: "{{" + tag + "}}: " + description };
		if (Kaizo.tag.checkedTags.indexOf(tag) !== -1) {
			checkbox.checked = true;
		}
		
		if (tag === "notability") {
			checkbox.subgroup = {
				name: 'notability',
				type: 'select',
				list: [
					{ label: "{{notability}}: article\'s subject may not meet the general notability guideline", value: "none" },
					{ label: "{{notability|Academics}}: notability guideline for academics", value: "Academics" },
					{ label: "{{notability|Biographies}}: notability guideline for biographies", value: "Biographies" },
					{ label: "{{notability|Books}}: notability guideline for books", value: "Books" },
					{ label: "{{notability|Companies}}: notability guidelines for companies and organizations", value: "Companies" },
					{ label: "{{notability|Events}}: notability guideline for events", value: "Events" },
					{ label: "{{notability|Films}}: notability guideline for films", value: "Films" },
					{ label: "{{notability|Music}}: notability guideline for music", value: "Music" },
					{ label: "{{notability|Neologisms}}: notability guideline for neologisms", value: "Neologisms" },
					{ label: "{{notability|Numbers}}: notability guideline for numbers", value: "Numbers" },
					{ label: "{{notability|Products}}: notability guideline for products and services", value: "Products" },
					{ label: "{{notability|Sport}}: notability guideline for sports and athletics", value: "Sport" },
					{ label: "{{notability|Web}}: notability guideline for web content", value: "Web" }
				]
			};
		}
		return checkbox;
	};

	// categorical sort order
	if (sortorder === "cat") {
		var div = new Morebits.quickForm.element({
			type: "div",
			id: "tagWorkArea"
		});

		// function to iterate through the tags and create a checkbox for each one
		var doCategoryCheckboxes = function(subdiv, array) {
			var checkboxes = [];
			$.each(array, function(k, tag) {
				var description = Kaizo.tag.article.tags[tag];
				checkboxes.push(makeCheckbox(tag, description));
			});
			subdiv.append({
				type: "checkbox",
				name: "articleTags",
				list: checkboxes
			});
		};

		var i = 0;
		// go through each category and sub-category and append lists of checkboxes
		$.each(Kaizo.tag.article.tagCategories, function(title, content) {
			div.append({ type: "header", id: "tagHeader" + i, label: title });
			var subdiv = div.append({ type: "div", id: "tagSubdiv" + i++ });
			if ($.isArray(content)) {
				doCategoryCheckboxes(subdiv, content);
			} else {
				$.each(content, function(subtitle, subcontent) {
					subdiv.append({ type: "div", label: [ Morebits.htmlNode("b", subtitle) ] });
					doCategoryCheckboxes(subdiv, subcontent);
				});
			}
		});

		var rendered = div.render();
		$workarea.replaceWith(rendered);
		var $rendered = $(rendered);
		$rendered.find("h5").css({ 'font-size': '110%', 'margin-top': '1em' });
		$rendered.find("div").filter(":has(span.quickformDescription)").css({ 'margin-top': '0.4em' });
	}
	// alphabetical sort order
	else {
		var checkboxes = [];
		$.each(Kaizo.tag.article.tags, function(tag, description) {
			checkboxes.push(makeCheckbox(tag, description));
		});
		var tags = new Morebits.quickForm.element({
			type: "checkbox",
			name: "articleTags",
			list: checkboxes
		});
		$workarea.empty().append(tags.render());
	}
};


// Tags for ARTICLES start here

Kaizo.tag.article = {};

// A list of all article tags, in alphabetical order
// To ensure tags appear in the default "categorized" view, add them to the tagCategories hash below.

Kaizo.tag.article.tags = {
	"advertisement": "article is written like an advertisement",
	"autobiography": "article is an autobiography and may not be written neutrally",
	"BLP sources": "BLP article needs more sources for verification",
	"BLP unsourced": "BLP article has no sources at all",
	"citation style": "article has unclear or inconsistent inline citations",
	"cleanup": "article may require cleanup",
	"COI": "article creator or major contributor may have a conflict of interest",
	"complex": "the English used in this article or section may not be easy for everybody to understand",
	"confusing": "article may be confusing or unclear",
	"context": "article provides insufficient context",
	"copyedit": "article needs copy editing for grammar, style, cohesion, tone, and/or spelling",
	"dead end": "article has few or no links to other articles",
	"disputed": "article has questionable factual accuracy",
	"expert-subject": "article needs attention from an expert on the subject",
	"external links": "article's external links may not follow content policies or guidelines",
	"fansite": "article resembles a fansite",
	"fiction": "article fails to distinguish between fact and fiction",
	"globalise": "article may not represent a worldwide view of the subject",
	"hoax": "article may be a complete hoax",
	"in-universe": "article subject is fictional and needs rewriting from a non-fictional perspective",
	"in use": "article is undergoing a major edit for a short while",
	"intro-missing": "article has no lead section and one should be written",
	"intro-rewrite": "article lead section needs to be rewritten",
	"intro-tooshort": "article lead section is too short and should be expanded",
	"jargon": "article uses technical words that not everybody will know",
	"link rot": "article uses bare URLs for references, which are prone to link rot",
	"merge": "article should be merged with another given article",
	"metricate": "article exclusively uses non-SI units of measurement",
	"more footnotes": "article has some references, but insufficient in-text citations",
	"more sources": "article needs more sources for verification",
	"no footnotes": "article has references, but no in-text citations",
	"no sources": "article has no references at all",
	"notability": "article's subject may not meet the notability guideline",
	"NPOV": "article does not maintain a neutral point of view",
	"one source": "article relies largely or entirely upon a single source",
	"original research": "article has original research or unverified claims",
	"orphan": "article is linked to from no other articles",
	"plot": "plot summary in article is too long",
	"primary sources": "article relies too heavily on first-hand sources, and needs third-party sources",
	"prose": "article is in a list format that may be better presented using prose",
	"redlinks": "article may have too many red links",
	"restructure": "article may be in need of reorganization to comply with Wikipedia's layout guidelines",
	"rough translation": "article is poorly translated and needs cleanup",
	"sections": "article needs to be broken into sections",
	"self-published": "article may contain improper references to self-published sources",
	"tone": "tone of article is not appropriate",
	"uncat": "article is uncategorized",
	"under construction": "article is currently in the middle of an expansion or major revamping",
	"unreliable sources": "article's references may not be reliable sources",
	"update": "article needs additional up-to-date information added",
	"very long": "article is too long",
	"weasel": "article neutrality is compromised by the use of weasel words",
	"wikify": "article needs to be wikified"
};

// A list of tags in order of category
// Tags should be in alphabetical order within the categories
// Add new categories with discretion - the list is long enough as is!

Kaizo.tag.article.tagCategories = {
	"Cleanup and maintenance tags": {
		"General maintenance tags": [
			"cleanup",
			"complex",
			"copyedit",
			"wikify"
		],
		"Potentially unwanted content": [
			"external links"
		],
		"Structure, formatting, and lead section": [
			"intro-missing",
			"intro-rewrite",
			"intro-tooshort",
			"restructure",
			"sections",
			"very long"
		],
		"Fiction-related cleanup": [
			"fiction",
			"in-universe",
			"plot"
		]
	},
	"General content issues": {
		"Importance and notability": [
			"notability"  // has subcategories and special-cased code
		],
		"Style of writing": [
			"advertisement",
			"fansite",
			"jargon",
			"prose",
			"redlinks",
			"tone"
		],
		"Sense (or lack thereof)": [
			"confusing"
		],
		"Information and detail": [
			"context",
			"expert-subject",
			"metricate"
		],
		"Timeliness": [
			"update"
		],
		"Neutrality, bias, and factual accuracy": [
			"autobiography",
			"COI",
			"disputed",
			"hoax",
			"globalise",
			"NPOV",
			"weasel"
		],
		"Verifiability and sources": [
			"BLP sources",
			"BLP unsourced",
			"more sources",
			"no sources",
			"one source",
			"original research",
			"primary sources",
			"self-published",
			"unreliable sources"
		]
	},
	"Specific content issues": {
		"Language": [
			"complex"			
		],
		"Links": [
			"dead end",
			"orphan",
			"wikify"  // this tag is listed twice because it used to focus mainly on links, but now it's a more general cleanup tag
		],
		"Referencing technique": [
			"citation style",
                        "link rot",
			"more footnotes",
			"no footnotes"
		],
		"Categories": [
			"uncat"
		]
	},
	"Merging": [
		"merge",
	],
	"Informational": [
		"in use",
		"under construction"
	]
};

// Tags for REDIRECTS start here

Kaizo.tag.spellingList = [
	{
		label: '{{R from capitalization}}: redirect from a from a capitalized title',
		value: 'R from capitalization' 
	},
	{
		label: '{{R with other capitalizations}}: redirect from a title with a different capitalization',
		value: 'R with other capitalizations' 
	},
	{
		label: '{{R from other name}}: redirect from a title with a different name',
		value: 'R from other name' 
	},
	{
		label: '{{R from other spelling}}: redirect from a title with a different spelling',
		value: 'R from other spelling' 
	},
	{
		label: '{{R from plural}}: redirect from a plural title',
		value: 'R from plural' 
	},
	{
		label: '{{R from related things}}: redirect related title',
		value: 'R from related things' 
	},
	{
		label: '{{R to section}}: redirect from a title for a "minor topic or title" to a comprehensive-type article section which covers the subject',
		value: 'R to section' 
	},
	{
		label: '{{R from shortcut}}: redirect to a Wikipedia "shortcut"',
		value: 'R from shortcut' 
	},
	{
		label: '{{R from title without diacritics}}: redirect to the article title with diacritical marks (accents, umlauts, etc.)',
		value: 'R from title without diacritics' 
	}
];


// Contains those article tags that *do not* work inside {{multiple issues}}.
Kaizo.tag.multipleIssuesExceptions = [
	'cat improve',
	'in use',
	'merge',
	'merge from',
	'merge to',
	'not English',
	'rough translation',
	'uncat',
	'under construction',
];


Kaizo.tag.callbacks = {
	main: function( pageobj ) {
		var params = pageobj.getCallbackParameters(),
		    tagRe, tagText = '', summaryText = 'Added',
		    tags = [], groupableTags = [], i, totalTags
			
		var pageText = pageobj.getPageText();

		var addTag = function friendlytagAddTag( tagIndex, tagName ) {
			var currentTag = "";
			if( tagName === 'globalize' ) {
				currentTag += '{{' + params.globalizeSubcategory;
			} else {
				currentTag += ( Kaizo.tag.mode === 'redirect' ? '\n' : '' ) + '{{' + tagName;
			}

			if( tagName === 'notability' && params.notabilitySubcategory !== 'none' ) {
				currentTag += '|' + params.notabilitySubcategory;
			}

			// prompt for other parameters, based on the tag
			switch( tagName ) {
				case 'cleanup':
					var reason = prompt('"The specific problem is: "  \n' +
						"This information is optional. Just click OK if you don't wish to enter this.", "");
					if (reason === null) {
						Morebits.status.warn("Notice", "{{cleanup}} tag skipped by user");
						return true;  // continue to next tag
					} else {
						currentTag += '|reason=' + reason;
					}
					break;
				case 'complex':
					var cpreason = prompt('"An editor’s reason for this is:"  (e.g. "words like XX")  \n' +
						"Just click OK if you don't wish to enter this.  To skip the {{complex}} tag, click Cancel.", "");
					if (cpreason === null) {
						return true;  // continue to next tag
					} else if (cpreason !== "") {
						currentTag += '|2=' + cpreason;
					}
					break;
				case 'copyedit':
					var cereason = prompt('"This article may require copy editing for..."  (e.g. "consistent spelling")  \n' +
						"Just click OK if you don't wish to enter this.  To skip the {{copyedit}} tag, click Cancel.", "");
					if (cereason === null) {
						return true;  // continue to next tag
					} else if (cereason !== "") {
						currentTag += '|for=' + cereason;
					}
					break;	
				case 'expert-subject':
					var esreason = prompt('"This is because..."  \n' +
						"This information is optional.  To skip the {{expert-subject}} tag, click Cancel.", "");
					if (esreason === null) {
						return true;  // continue to next tag
					} else if (esreason !== "") {
						currentTag += '|1=' + esreason;
					}
					break;
				case 'not English':
					var langname = prompt('Please enter the name of the language the article is thought to be written in.  \n' +
						"Just click OK if you don't know.  To skip the {{not English}} tag, click Cancel.", "");
					if (langname === null) {
						return true;  // continue to next tag
					} else if (langname !== "") {
						currentTag += '|1=' + langname;
					}
					break;
				case 'rough translation':
					var roughlang = prompt('Please enter the name of the language the article is thought to have been translated from.  \n' +
						"Just click OK if you don't know.  To skip the {{rough translation}} tag, click Cancel.", "");
					if (roughlang === null) {
						return true;  // continue to next tag
					} else if (roughlang !== "") {
						currentTag += '|1=' + roughlang;
					}
					break;
				case 'wikify':
					var wreason = prompt('You can optionally enter a more specific reason why the article needs to be wikified: This article needs to be wikified. {{{Your reason here}}}  \n' +
						"Just click OK if you don't wish to enter this.  To skip the {{wikify}} tag, click Cancel.", "");
					if (wreason === null) {
						return true;  // continue to next tag
					} else if (wreason !== "") {
						currentTag += '|reason=' + wreason;
					}
					break;
				case 'merge':
				case 'merge to':
				case 'merge from':
					var param = prompt('Please enter the name of the other article(s) involved in the merge.  \n' +
						"To specify multiple articles, separate them with a vertical pipe (|) character.  \n" +
						"This information is required.  Click OK when done, or click Cancel to skip the merge tag.", "");
					if (param === null) {
						return true;  // continue to next tag
					} else if (param !== "") {
						currentTag += '|' + param;
					}
					break;
				default:
					break;
			}

				currentTag += (Kaizo.tag.mode === 'redirect') ? '}}' : '|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}\n';
				tagText += currentTag;

			if ( tagIndex > 0 ) {
				if( tagIndex === (totalTags - 1) ) {
					summaryText += ' and';
				} else if ( tagIndex < (totalTags - 1) ) {
					summaryText += ',';
				}
			}

			summaryText += ' {{[[';
			summaryText += (tagName.indexOf(":") !== -1 ? tagName : ("Template:" + tagName + "|" + tagName));
			summaryText += ']]}}';
		};

		if( Kaizo.tag.mode !== 'redirect' ) {
			// Check for preexisting tags and separate tags into groupable and non-groupable arrays
			for( i = 0; i < params.tags.length; i++ ) {
				tagRe = new RegExp( '(\\{\\{' + params.tags[i] + '(\\||\\}\\}))', 'im' );
				if( !tagRe.exec( pageText ) ) {
					if( Kaizo.tag.multipleIssuesExceptions.indexOf(params.tags[i]) === -1 ) {
						groupableTags = groupableTags.concat( params.tags[i] );
					} else {
						tags = tags.concat( params.tags[i] );
					}
				} else {
					Morebits.status.info( 'Info', 'Found {{' + params.tags[i] +
						'}} on the article already...excluding' );
				}
			}

			if( params.group && groupableTags.length >= 3 ) {
				Morebits.status.info( 'Info', 'Grouping supported tags inside {{multiple issues}}' );

				groupableTags.sort();
				tagText += '{{multiple issues|\n';

				totalTags = groupableTags.length;
				$.each(groupableTags, addTag);

				summaryText += ' tags (within {{[[Template:multiple issues|multiple issues]]}})';
				if( tags.length > 0 ) {
					summaryText += ', and';
				}
				tagText += '}}\n';
			} else {
				tags = tags.concat( groupableTags );
			}
		} else {
			// Redirect tagging: Check for pre-existing tags
			for( i = 0; i < params.tags.length; i++ ) {
				tagRe = new RegExp( '(\\{\\{' + params.tags[i] + '(\\||\\}\\}))', 'im' );
				if( !tagRe.exec( pageText ) ) {
					tags = tags.concat( params.tags[i] );
				} else {
					Morebits.status.info( 'Info', 'Found {{' + params.tags[i] +
						'}} on the redirect already...excluding' );
				}
			}
		}

		tags.sort();
		totalTags = tags.length;
		$.each(tags, addTag);

		if( Kaizo.tag.mode === 'redirect' ) {
			pageText += tagText;
		} else {
			// smartly insert the new tags after any hatnotes. Regex is a bit more
			// complicated than it'd need to be, to allow templates as parameters,
			// and to handle whitespace properly.
			pageText = pageText.replace(/^\s*(?:((?:\s*\{\{\s*(?:about|correct title|dablink|distinguish|for|other\s?(?:hurricaneuses|people|persons|places|uses(?:of)?)|redirect(?:-acronym)?|see\s?(?:also|wiktionary)|selfref|the)\d*\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\})+(?:\s*\n)?)\s*)?/i,
				"$1" + tagText);
		}
		summaryText += ( tags.length > 0 ? ' tag' + ( tags.length > 1 ? 's' : '' ) : '' ) +
			' to ' + Kaizo.tag.mode + Kaizo.getPref('summaryAd');

		pageobj.setPageText(pageText);
		pageobj.setEditSummary(summaryText);
		pageobj.setWatchlist(Kaizo.getFriendlyPref('watchTaggedPages'));
		pageobj.setMinorEdit(Kaizo.getFriendlyPref('markTaggedPagesAsMinor'));
		pageobj.setCreateOption('nocreate');
		pageobj.save();

		if( Kaizo.getFriendlyPref('markTaggedPagesAsPatrolled') ) {
			pageobj.patrol();
		}
	},

	file: function friendlytagCallbacksFile(pageobj) {
		var text = pageobj.getPageText();
		var params = pageobj.getCallbackParameters();
		var summary = "Adding ";

		// Add maintenance tags
		if (params.tags.length) {

			var tagtext = "", currentTag;
			$.each(params.tags, function(k, tag) {

				currentTag += "}}\n";

				tagtext += currentTag;
				summary += "{{" + tag + "}}, ";

				return true;  // continue
			});

			if (!tagtext) {
				pageobj.getStatusElement().warn("User canceled operation; nothing to do");
				return;
			}

			text = tagtext + text;
		}

		pageobj.setPageText(text);
		pageobj.setEditSummary(summary.substring(0, summary.length - 2) + Kaizo.getPref('summaryAd'));
		pageobj.setWatchlist(Kaizo.getFriendlyPref('watchTaggedPages'));
		pageobj.setMinorEdit(Kaizo.getFriendlyPref('markTaggedPagesAsMinor'));
		pageobj.setCreateOption('nocreate');
		pageobj.save();

		if( Kaizo.getFriendlyPref('markTaggedPagesAsPatrolled') ) {
			pageobj.patrol();
		}
	}
};

Kaizo.tag.callback.evaluate = function friendlytagCallbackEvaluate(e) {
	var form = e.target;
	var params = {};

	switch (Kaizo.tag.mode) {
		case 'article':
			params.tags = form.getChecked( 'articleTags' );
			params.group = form.group.checked;
			params.notabilitySubcategory = form["articleTags.notability"] ? form["articleTags.notability"].value : null;
			break;
		case 'file':
			params.svgSubcategory = form["imageTags.svgCategory"] ? form["imageTags.svgCategory"].value : null;
			params.tags = form.getChecked( 'imageTags' );
			break;
		case 'redirect':
			params.tags = form.getChecked( 'redirectTags' );
			break;
		default:
			alert("Kaizo.tag: unknown mode " + Kaizo.tag.mode);
			break;
	}

	if( !params.tags.length ) {
		alert( 'You must select at least one tag!' );
		return;
	}

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( form );

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = "Tagging complete, reloading article in a few seconds";
	if (Kaizo.tag.mode === 'redirect') {
		Morebits.wiki.actionCompleted.followRedirect = false;
	}

	var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), "Tagging " + Kaizo.tag.mode);
	wikipedia_page.setCallbackParameters(params);
	switch (Kaizo.tag.mode) {
		case 'article':
			/* falls through */
		case 'redirect':
			wikipedia_page.load(Kaizo.tag.callbacks.main);
			return;
		case 'file':
			wikipedia_page.load(Kaizo.tag.callbacks.file);
			return;
		default:
			alert("Kaizo.tag: unknown mode " + Kaizo.tag.mode);
			break;
	}
};

/*
 ****************************************
 *** Kaizostub.js: Tag module
 ****************************************
 * Mode of invocation:     Tab ("Stub")
 * Active on:              Existing articles
 * Config directives in:   FriendlyConfig
 * Note:				   customised friendlytag module (for SEWP)
 */

Kaizo.stub = function friendlytag() {
	// redirect tagging
	if( Morebits.wiki.isPageRedirect() ) {
		Kaizo.stub.mode = 'redirect';
	}
	// file tagging
	else if( mw.config.get('wgNamespaceNumber') === 6 && !document.getElementById("mw-sharedupload") && document.getElementById("mw-imagepage-section-filehistory") ) {
		Kaizo.stub.mode = 'file';
	}
	// article/draft article tagging
	else if( ( mw.config.get('wgNamespaceNumber') === 0 || /^Wikipedia([ _]talk)?\:Requested[ _]pages\//.exec(mw.config.get('wgPageName')) ) && mw.config.get('wgCurRevisionId') ) {
		Kaizo.stub.mode = 'article';
		//twAddPortletLink( Kaizo.stub.callback, "Stub", "friendly-tag", "Add stub tags to article" );
	}
};

Kaizo.stub.callback = function friendlytagCallback( uid ) {
	var Window = new Morebits.simpleWindow( 630, (Kaizo.stub.mode === "article") ? 450 : 400 );
	Window.setScriptName( "Kaizo" );
	Window.addFooterLink( "Simple Stub project", "Wikipedia:Simple Stub Project" );
	Window.addFooterLink( "Stub guideline", "Wikipedia:Stub" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#stub" );

	var form = new Morebits.quickForm( Kaizo.stub.callback.evaluate );

	switch( Kaizo.stub.mode ) {
		case 'article':
			Window.setTitle( "Article stub tagging" );

			form.append({
				type: 'select',
				name: 'sortorder',
				label: 'View this list:',
				tooltip: 'You can change the default view order in your Kaizo preferences (Meta:Kaizo/Preferences).',
				event: Kaizo.stub.updateSortOrder,
				list: [
					{ type: 'option', value: 'cat', label: 'By categories', selected: Kaizo.getFriendlyPref('stubArticleSortOrder') === 'cat' },
					{ type: 'option', value: 'alpha', label: 'In alphabetical order', selected: Kaizo.getFriendlyPref('stubArticleSortOrder') === 'alpha' }
				]
			});

			form.append( { type: 'div', id: 'tagWorkArea' } );
	}

	form.append( { type:'submit' } );

	var result = form.render();
	Window.setContent( result );
	Window.display();

	if (Kaizo.stub.mode === "article") {
		// fake a change event on the sort dropdown, to initialize the tag list
		var evt = document.createEvent("Event");
		evt.initEvent("change", true, true);
		result.sortorder.dispatchEvent(evt);
	}
};

Kaizo.stub.checkedTags = [];

Kaizo.stub.updateSortOrder = function(e) {
	var sortorder = e.target.value;
	var $workarea = $(e.target.form).find("div#tagWorkArea");

	Kaizo.stub.checkedTags = e.target.form.getChecked("articleTags");
	if (!Kaizo.stub.checkedTags) {
		Kaizo.stub.checkedTags = [];
	}

	// function to generate a checkbox, with appropriate subgroup if needed
	var makeCheckbox = function(tag, description) {
		var checkbox = { value: tag, label: "{{" + tag + "}}: " + description };
		if (Kaizo.stub.checkedTags.indexOf(tag) !== -1) {
			checkbox.checked = true;
		}

		return checkbox;
	};

	// categorical sort order
	if (sortorder === "cat") {
		var div = new Morebits.quickForm.element({
			type: "div",
			id: "tagWorkArea"
		});

		// function to iterate through the tags and create a checkbox for each one
		var doCategoryCheckboxes = function(subdiv, array) {
			var checkboxes = [];
			$.each(array, function(k, tag) {
				var description = Kaizo.stub.article.tags[tag];
				checkboxes.push(makeCheckbox(tag, description));
			});
			subdiv.append({
				type: "checkbox",
				name: "articleTags",
				list: checkboxes
			});
		};

		var i = 0;
		// go through each category and sub-category and append lists of checkboxes
		$.each(Kaizo.stub.article.tagCategories, function(title, content) {
			div.append({ type: "header", id: "tagHeader" + i, label: title });
			var subdiv = div.append({ type: "div", id: "tagSubdiv" + i++ });
			if ($.isArray(content)) {
				doCategoryCheckboxes(subdiv, content);
			} else {
				$.each(content, function(subtitle, subcontent) {
					subdiv.append({ type: "div", label: [ Morebits.htmlNode("b", subtitle) ] });
					doCategoryCheckboxes(subdiv, subcontent);
				});
			}
		});

		var rendered = div.render();
		$workarea.replaceWith(rendered);
		var $rendered = $(rendered);
		$rendered.find("h5").css({ 'font-size': '110%', 'margin-top': '1em' });
		$rendered.find("div").filter(":has(span.quickformDescription)").css({ 'margin-top': '0.4em' });
	}
	// alphabetical sort order
	else {
		var checkboxes = [];
		$.each(Kaizo.stub.article.tags, function(tag, description) {
			checkboxes.push(makeCheckbox(tag, description));
		});
		var tags = new Morebits.quickForm.element({
			type: "checkbox",
			name: "articleTags",
			list: checkboxes
		});
		$workarea.empty().append(tags.render());
	}
};


// Tags for ARTICLES start here

Kaizo.stub.article = {};

// A list of all article tags, in alphabetical order
// To ensure tags appear in the default "categorized" view, add them to the tagCategories hash below.

Kaizo.stub.article.tags = {
	"actor-stub": "for use with articles about actors",
	"asia-stub": "for use with anything about Asia, except people",
	"bio-stub": "for use with all people, no matter who or what profession",
	"biology-stub": "for use with topics related to biology",
	"chem-stub": "for use with topics related to chemistry",
	"europe-stub": "for use with anything about Europe, except people",
	"france-geo-stub": "for use with France geography topics",
	"food-stub": "for use with anything about food",
	"geo-stub": "for use with all geographical locations (places, towns, cities, etc)",
	"history-stub": "for use with history topics",
	"japan-stub": "for use with anything about Japan, except people",
	"japan-sports-bio-stub": "for use with Japanese sport biographies",
	"list-stub": "for use with lists only",
	"lit-stub": "for use with  all literature articles except people",
	"math-stub": "for use with topics related to mathematics",
	"med-stub": "for use with topics related to medicine",
	"military-stub": "for use with military related topics",
	"movie-stub": "for use with all movie articles except people",
	"music-stub": "for use with all music articles except people",
	"north-America-stub": "for use with anything about North America, except people",
	"performing-arts-stub": "general stub for the performing arts",
	"physics-stub": "for use with topics related to physics",
	"politics-stub": "for use with politics related topics",
	"religion-stub": "for use with religion related topics",
	"sci-stub": "anything science related (all branches and their tools)",
	"sport-stub": "general stub for all sports and sports items, not people",
	"sports-bio-stub": "for use with people who have sport as profession",
	"stub": "for all stubs that can not fit into any stub we have",
	"switzerland-stub": "for use with everything about Switzerland, except people",
	"tech-stub": "for use with technology related articles",
	"transport-stub": "for use with articles about any moving object (cars, bikes, ships, crafts, planes, rail, buses, trains, etc)",
	"tv-stub": "for use with all television articles except people",
	"UK-stub": "for use with anything about the United Kingdom, except people",
	"US-actor-stub": "for use with United States actor biographies",
	"US-bio-stub": "for use with United States biographies",
	"US-geo-stub": "for use with United States geography topics",
	"US-stub": "for use with anything about the United States, except people and geography",
	"video-game-stub": "for use with stubs related to video games",
	"weather-stub": "for articles about weather"
};

// A list of tags in order of category
// Tags should be in alphabetical order within the categories
// Add new categories with discretion - the list is long enough as is!

Kaizo.stub.article.tagCategories = {
		"Stub templates": [
			"stub",
			"list-stub"
		],
		"Countries & Geography": [
			"asia-stub",
			"europe-stub",
			"france-geo-stub",
			"geo-stub",
			"japan-stub",
			"japan-sports-bio-stub",
			"north-America-stub",
			"switzerland-stub",
			"UK-stub",
			"US-bio-stub",
			"US-geo-stub",
			"US-stub"
		],
		"Miscellaneous": [
			"food-stub",
			"history-stub",
			"military-stub",
			"politics-stub",
			"religion-stub",
			"transport-stub"
		],
		"People": [
			"actor-stub",
			"bio-stub",
			"japan-sports-bio-stub",
			"sports-bio-stub",
			"US-actor-stub",
			"US-bio-stub"
		],
		"Science": [
			"biology-stub",
			"chem-stub",
			"math-stub",
			"med-stub",
			"physics-stub",
			"sci-stub",
			"weather-stub"
		],
		"Sports": [
			"japan-sports-bio-stub",
			"sport-stub",
			"sports-bio-stub"

		],
		"Technology": [
			"tech-stub",
			"video-game-stub"
		],
		"Arts": [
			"actor-stub",
			"lit-stub",
			"movie-stub",
			"music-stub",
			"performing-arts-stub",
			"tv-stub",
			"US-actor-stub"
		]
}

// Tags for REDIRECTS start here



// Contains those article tags that *do not* work inside {{multiple issues}}.
Kaizo.stub.multipleIssuesExceptions = [
	'cat improve',
	'in use',
	'merge',
	'merge from',
	'merge to',
	'not English',
	'rough translation',
	'uncat',
	'under construction',
	'update'
];


Kaizo.stub.callbacks = {
	main: function( pageobj ) {
		var params = pageobj.getCallbackParameters(),
		    tagRe, tagText = '', summaryText = 'Added',
		    tags = [], groupableTags = [], i, totalTags;

		// Remove tags that become superfluous with this action
		var pageText = pageobj.getPageText();

		var addTag = function friendlytagAddTag( tagIndex, tagName ) {
			var currentTag = "";
			
			pageText += '\n\n{{' + tagName + '}}';

			if ( tagIndex > 0 ) {
				if( tagIndex === (totalTags - 1) ) {
					summaryText += ' and';
				} else if ( tagIndex < (totalTags - 1) ) {
					summaryText += ',';
				}
			}

			summaryText += ' {{[[';
			summaryText += (tagName.indexOf(":") !== -1 ? tagName : ("Template:" + tagName + "|" + tagName));
			summaryText += ']]}}';
		};

			// Check for preexisting tags and separate tags into groupable and non-groupable arrays
			for( i = 0; i < params.tags.length; i++ ) {
				tagRe = new RegExp( '(\\{\\{' + params.tags[i] + '(\\||\\}\\}))', 'im' );
				if( !tagRe.exec( pageText ) ) {
					if( Kaizo.stub.multipleIssuesExceptions.indexOf(params.tags[i]) === -1 ) {
						groupableTags = groupableTags.concat( params.tags[i] );
					} else {
						tags = tags.concat( params.tags[i] );
					}
				} else {
					Morebits.status.info( 'Info', 'Found {{' + params.tags[i] +
						'}} on the article already...excluding' );
				}
			}

				tags = tags.concat( groupableTags );

		tags.sort();
		totalTags = tags.length;
		$.each(tags, addTag);

		summaryText += ( tags.length > 0 ? ' tag' + ( tags.length > 1 ? 's' : '' ) : '' ) +
			' to ' + Kaizo.stub.mode + Kaizo.getPref('summaryAd');

		pageobj.setPageText(pageText);
		pageobj.setEditSummary(summaryText);
		pageobj.setWatchlist(Kaizo.getFriendlyPref('watchStubbedPages'));
		pageobj.setMinorEdit(Kaizo.getFriendlyPref('markStubbedPagesAsMinor'));
		pageobj.setCreateOption('nocreate');
		pageobj.save();

		if( Kaizo.getFriendlyPref('markStubbedPagesAsPatrolled') ) {
			pageobj.patrol();
		}
	}
};

Kaizo.stub.callback.evaluate = function friendlytagCallbackEvaluate(e) {
	var form = e.target;
	var params = {};

	switch (Kaizo.stub.mode) {
		case 'article':
			params.tags = form.getChecked( 'articleTags' );
			params.group = false;
			params.notabilitySubcategory = form["articleTags.notability"] ? form["articleTags.notability"].value : null;
			break;
		case 'file':
			params.svgSubcategory = form["imageTags.svgCategory"] ? form["imageTags.svgCategory"].value : null;
			params.tags = form.getChecked( 'imageTags' );
			break;
		case 'redirect':
			params.tags = form.getChecked( 'redirectTags' );
			break;
	}

	if( !params.tags.length ) {
		alert( 'You must select at least one tag!' );
		return;
	}

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( form );

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = "Tagging complete, reloading article in a few seconds";
	if (Kaizo.stub.mode === 'redirect') {
		Morebits.wiki.actionCompleted.followRedirect = false;
	}

	var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), "Tagging " + Kaizo.stub.mode);
	wikipedia_page.setCallbackParameters(params);
	switch (Kaizo.stub.mode) {
		case 'article':
			/* falls through */
		case 'redirect':
			wikipedia_page.load(Kaizo.stub.callbacks.main);
			return;
		case 'file':
			wikipedia_page.load(Kaizo.stub.callbacks.file);
			return;
	}
};

/*
 ****************************************
 *** friendlytalkback.js: Talkback module
 ****************************************
 * Mode of invocation:     Tab ("TB")
 * Active on:              Existing user talk pages
 * Config directives in:   FriendlyConfig
 */
;(function(){

	Kaizo.talkback = function() {
	
		if ( Morebits.getPageAssociatedUser() === false ) {
			return;
		}
	
		twAddPortletLink( callback, "TB", "friendly-talkback", "Easy talkback" );
	};
	
	var callback = function( ) {
		if( Morebits.getPageAssociatedUser() === mw.config.get("wgUserName") && !confirm("Is it really so bad that you're talking back to yourself?") ){
			return;
		}
	
		var Window = new Morebits.simpleWindow( 600, 350 );
		Window.setTitle("Talkback");
		Window.setScriptName("Kaizo");
		Window.addFooterLink( "About {{talkback}}", "Template:Talkback" );
		Window.addFooterLink( "Kaizo help", "WP:TW/DOC#talkback" );
	
		var form = new Morebits.quickForm( callback_evaluate );
	
		form.append({ type: "radio", name: "tbtarget",
					list: [
						{
							label: "Talkback: my talk page",
							value: "mytalk",
							checked: "true" 
						},
						{
							label: "Talkback: other user talk page",
							value: "usertalk"
						},
						{
							label: "Talkback: other page",
							value: "other"
						},
						{
							label: "Noticeboard notification",
							value: "notice"
						},
						{
							label: "\"You've got mail\"",
							value: "mail"
						},
						{
							label: "Whisperback",
							value: "wb"
						}
					],
					event: callback_change_target
				});
	
		form.append({
				type: "field",
				label: "Work area",
				name: "work_area"
			});
	
		form.append({ type: "submit" });
	
		var result = form.render();
		Window.setContent( result );
		Window.display();
	
		// We must init the
		var evt = document.createEvent("Event");
		evt.initEvent( "change", true, true );
		result.tbtarget[0].dispatchEvent( evt );
	};
	
	var prev_page = "";
	var prev_section = "";
	var prev_message = "";
	
	var callback_change_target = function( e ) {
		var value = e.target.values;
		var root = e.target.form;
		var old_area = Morebits.quickForm.getElements(root, "work_area")[0];
	
		if(root.section) {
			prev_section = root.section.value;
		}
		if(root.message) {
			prev_message = root.message.value;
		}
		if(root.page) {
			prev_page = root.page.value;
		}

		var work_area = new Morebits.quickForm.element({
				type: "field",
				label: "Talkback information",
				name: "work_area"
			});
	
		switch( value ) {
			case "mytalk":
				/* falls through */
			default:
				work_area.append({
						type:"input",
						name:"section",
						label:"Linked section (optional)",
						tooltip:"The section heading on your talk page where you left a message. Leave empty for no section to be linked.",
						value: prev_section
					});
				break;
			case "usertalk":
				work_area.append({
						type:"input",
						name:"page",
						label:"User",
						tooltip:"The username of the user on whose talk page you left a message.",
						value: prev_page
					});
				
				work_area.append({
						type:"input",
						name:"section",
						label:"Linked section (optional)",
						tooltip:"The section heading on the page where you left a message. Leave empty for no section to be linked.",
						value: prev_section
					});
				break;
			case "notice":
				var noticeboard = work_area.append({
						type: "select",
						name: "noticeboard",
						label: "Noticeboard:"
					});
				noticeboard.append({
						type: "option",
						label: "WP:AN (Administrators' noticeboard)",
						value: "an"
					});
				work_area.append({
						type:"input",
						name:"section",
						label:"Linked thread",
						tooltip:"The heading of the relevant thread on the noticeboard page.",
						value: prev_section
					});
				break;
			case "other":
				work_area.append({
						type:"input",
						name:"page",
						label:"Full page name",
						tooltip:"The full page name where you left the message. For example: 'Wikipedia talk:Kaizo'.",
						value: prev_page
					});
				
				work_area.append({
						type:"input",
						name:"section",
						label:"Linked section (optional)",
						tooltip:"The section heading on the page where you left a message. Leave empty for no section to be linked.",
						value: prev_section
					});
				break;
			case "mail":
				work_area.append({
						type:"input",
						name:"section",
						label:"Subject of e-mail (optional)",
						tooltip:"The subject line of the e-mail you sent."
					});
				break;
			case "wb":
				work_area.append({
						type:"input",
						name:"page",
						label:"User",
						tooltip:"The username of the user on whose talk page you left a message.",
						value: prev_page
					});
				
				work_area.append({
						type:"input",
						name:"section",
						label:"Linked section (optional)",
						tooltip:"The section heading on the page where you left a message. Leave empty for no section to be linked.",
						value: prev_section
					});
				break;
		}
	
		if (value !== "notice") {
			work_area.append({ type:"textarea", label:"Additional message (optional):", name:"message", tooltip:"An additional message that you would like to leave below the talkback template. Your signature will be added to the end of the message if you leave one." });
		}
	
		work_area = work_area.render();
		root.replaceChild( work_area, old_area );
		if (root.message) {
			root.message.value = prev_message;
		}
	};
	
	var callback_evaluate = function( e ) {
	
		var tbtarget = e.target.getChecked( "tbtarget" )[0];
		var page = null;
		var section = e.target.section.value;
		var fullUserTalkPageName = mw.config.get("wgFormattedNamespaces")[ mw.config.get("wgNamespaceIds").user_talk ] + ":" + Morebits.getPageAssociatedUser();
	
		if( tbtarget === "usertalk" || tbtarget === "other" || tbtarget === "wb" ) {
			page = e.target.page.value;
			
			if( tbtarget === "usertalk" ) {
				if( !page ) {
					alert("You must specify the username of the user whose talk page you left a message on.");
					return;
				}
			} else {
				if( !page ) {
					alert("You must specify the full page name when your message is not on a user talk page.");
					return;
				}
			}
		} else if (tbtarget === "notice") {
			page = e.target.noticeboard.value;
		}
	
		var message;
		if (e.target.message) {
			message = e.target.message.value;
		}
	
		Morebits.simpleWindow.setButtonsEnabled( false );
		Morebits.status.init( e.target );
	
		Morebits.wiki.actionCompleted.redirect = fullUserTalkPageName;
		Morebits.wiki.actionCompleted.notice = "Talkback complete; reloading talk page in a few seconds";
	
		var talkpage = new Morebits.wiki.page(fullUserTalkPageName, "Adding talkback");
		var tbPageName = (tbtarget === "mytalk") ? mw.config.get("wgUserName") : page;
	
		var text;
		if ( tbtarget === "notice" ) {
				text = "\n\n== " + Kaizo.getFriendlyPref("adminNoticeHeading") + " ==\n";
				text += "{{subst:AN-notice|thread=" + section + "|noticeboard=Wikipedia:Administrators' noticeboard}} ~~~~";
				talkpage.setEditSummary( "Notice of discussion at [[Wikipedia:Administrators' noticeboard]]" + Kaizo.getPref("summaryAd") );

		} else if ( tbtarget === "mail" ) {
			text = "\n\n==" + Kaizo.getFriendlyPref("mailHeading") + "==\n{{you've got mail|subject=";
			text += section + "|ts=~~~~~}}";

			if( message ) {
				text += "\n" + message + "  ~~~~";
			} else if( Kaizo.getFriendlyPref("insertTalkbackSignature") ) {
				text += "\n~~~~";
			}

			talkpage.setEditSummary("Notification: You've got mail" + Kaizo.getPref("summaryAd"));

		} else 	if ( tbtarget === "wb" ) {
			text = "\n\n==" + Kaizo.getFriendlyPref("talkbackHeading").replace( /^\s*=+\s*(.*?)\s*=+$\s*/, "$1" ) + "==\n{{wb|";
			text += tbPageName;

			if( section ) {
				text += "|" + section;
			}

			text += "|ts=~~~~~}}";

			if( message ) {
				text += "\n" + message + "  ~~~~";
			} else if( Kaizo.getFriendlyPref("insertTalkbackSignature") ) {
				text += "\n~~~~";
			}
 
			talkpage.setEditSummary("Whisperback" + Kaizo.getPref("summaryAd"));
				
			} else {

			//clean talkback heading: strip section header markers, were erroneously suggested in the documentation
			text = "\n\n==" + Kaizo.getFriendlyPref("talkbackHeading").replace( /^\s*=+\s*(.*?)\s*=+$\s*/, "$1" ) + "==\n{{tb|";
			text += tbPageName;

			if( section ) {
				text += "|" + section;
			}

			text += "|ts=~~~~~}}";

			if( message ) {
				text += "\n" + message + "  ~~~~";
			} else if( Kaizo.getFriendlyPref("insertTalkbackSignature") ) {
				text += "\n~~~~";
			}
 
			talkpage.setEditSummary("Talkback ([[" + (tbtarget === "other" ? "" : "User talk:") + tbPageName +
				(section ? ("#" + section) : "") + "]])" + Kaizo.getPref("summaryAd"));
		}
	
		talkpage.setAppendText( text );
		talkpage.setCreateOption("recreate");
		talkpage.setMinorEdit(Kaizo.getFriendlyPref("markTalkbackAsMinor"));
		talkpage.setFollowRedirect( true );
		talkpage.append();
	};

}());
/*
 ****************************************
 *** friendlywelcome.js: Welcome module
 ****************************************
 * Mode of invocation:     Tab ("Wel"), or from links on diff pages
 * Active on:              Existing user talk pages, diff pages
 * Config directives in:   FriendlyConfig
 */

Kaizo.welcome = function friendlywelcome() {
	if( Morebits.queryString.exists( 'friendlywelcome' ) ) {
		if( Morebits.queryString.get( 'friendlywelcome' ) === 'auto' ) {
			Kaizo.welcome.auto();
		} else {
			Kaizo.welcome.semiauto();
		}
	} else {
		Kaizo.welcome.normal();
	}
};

Kaizo.welcome.auto = function() {
	if( Morebits.queryString.get( 'action' ) !== 'edit' ) {
		// userpage not empty, aborting auto-welcome
		return;
	}

	Kaizo.welcome.welcomeUser();
};

Kaizo.welcome.semiauto = function() {
	Kaizo.welcome.callback( mw.config.get( 'wgTitle' ).split( '/' )[0].replace( /\"/, "\\\"") );
};

Kaizo.welcome.normal = function() {
	if( Morebits.queryString.exists( 'diff' ) ) {
		// check whether the contributors' talk pages exist yet
		var $oList = $("#mw-diff-otitle2").find("span.mw-usertoollinks a.new:contains(talk)").first();
		var $nList = $("#mw-diff-ntitle2").find("span.mw-usertoollinks a.new:contains(talk)").first();

		if( $oList.length > 0 || $nList.length > 0 ) {
			var spanTag = function( color, content ) {
				var span = document.createElement( 'span' );
				span.style.color = color;
				span.appendChild( document.createTextNode( content ) );
				return span;
			};

			var welcomeNode = document.createElement('strong');
			var welcomeLink = document.createElement('a');
			welcomeLink.appendChild( spanTag( 'Black', '[' ) );
			welcomeLink.appendChild( spanTag( 'Goldenrod', 'welcome' ) );
			welcomeLink.appendChild( spanTag( 'Black', ']' ) );
			welcomeNode.appendChild(welcomeLink);

			if( $oList.length > 0 ) {
				var oHref = $oList.attr("href");

				var oWelcomeNode = welcomeNode.cloneNode( true );
				oWelcomeNode.firstChild.setAttribute( 'href', oHref + '&' + Morebits.queryString.create( { 'friendlywelcome': Kaizo.getFriendlyPref('quickWelcomeMode')==='auto'?'auto':'norm' } ) + '&' + Morebits.queryString.create( { 'vanarticle': mw.config.get( 'wgPageName' ).replace(/_/g, ' ') } ) );
				$oList[0].parentNode.parentNode.appendChild( document.createTextNode( ' ' ) );
				$oList[0].parentNode.parentNode.appendChild( oWelcomeNode );
			}

			if( $nList.length > 0 ) {
				var nHref = $nList.attr("href");

				var nWelcomeNode = welcomeNode.cloneNode( true );
				nWelcomeNode.firstChild.setAttribute( 'href', nHref + '&' + Morebits.queryString.create( { 'friendlywelcome': Kaizo.getFriendlyPref('quickWelcomeMode')==='auto'?'auto':'norm' } ) + '&' + Morebits.queryString.create( { 'vanarticle': mw.config.get( 'wgPageName' ).replace(/_/g, ' ') } ) );
				$nList[0].parentNode.parentNode.appendChild( document.createTextNode( ' ' ) );
				$nList[0].parentNode.parentNode.appendChild( nWelcomeNode );
			}
		}
	}
	if( mw.config.get( 'wgNamespaceNumber' ) === 3 ) {
		var username = mw.config.get( 'wgTitle' ).split( '/' )[0].replace( /\"/, "\\\""); // only first part before any slashes
		twAddPortletLink( function(){ Kaizo.welcome.callback(username); }, "Wel", "friendly-welcome", "Welcome user" );
	}
};

Kaizo.welcome.welcomeUser = function welcomeUser() {
	Morebits.status.init( document.getElementById('bodyContent') );

	var params = {
		value: Kaizo.getFriendlyPref('quickWelcomeTemplate'),
		article: Morebits.queryString.exists( 'vanarticle' ) ? Morebits.queryString.get( 'vanarticle' ) : '',
		mode: 'auto'
	};

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = "Welcoming complete, reloading talk page in a few seconds";

	var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), "User talk page modification");
	wikipedia_page.setFollowRedirect(true);
	wikipedia_page.setCallbackParameters(params);
	wikipedia_page.load(Kaizo.welcome.callbacks.main);
};

Kaizo.welcome.callback = function friendlywelcomeCallback( uid ) {
	if( uid === mw.config.get('wgUserName') && !confirm( 'Are you really sure you want to welcome yourself?...' ) ){
		return;
	}

	var Window = new Morebits.simpleWindow( 600, 420 );
	Window.setTitle( "Welcome user" );
	Window.setScriptName( "Kaizo" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#welcome" );

	var form = new Morebits.quickForm( Kaizo.welcome.callback.evaluate );

	form.append({
			type: 'select',
			name: 'type',
			label: 'Type of welcome: ',
			event: Kaizo.welcome.populateWelcomeList,
			list: [
				{ type: 'option', value: 'standard', label: 'Standard welcomes', selected: !Morebits.isIPAddress(mw.config.get('wgTitle')) },
				{ type: 'option', value: 'anonymous', label: 'Problem user welcomes', selected: Morebits.isIPAddress(mw.config.get('wgTitle')) }
			]
		});

	form.append( { type: 'div', id: 'welcomeWorkArea' } );

	form.append( {
			type: 'input',
			name: 'article',
			label: '* Linked article (if supported by template):',
			value:( Morebits.queryString.exists( 'vanarticle' ) ? Morebits.queryString.get( 'vanarticle' ) : '' ),
			tooltip: 'An article might be linked from within the welcome if the template supports it. Leave empty for no article to be linked.  Templates that support a linked article are marked with an asterisk.'
		} );

	var previewlink = document.createElement( 'a' );
	$(previewlink).click(function(){
		Kaizo.welcome.callbacks.preview(result);  // |result| is defined below
	});
	previewlink.style.cursor = "pointer";
	previewlink.textContent = 'Preview';
	form.append( { type: 'div', name: 'welcomepreview', label: [ previewlink ] } );

	form.append( { type: 'submit' } );

	var result = form.render();
	Window.setContent( result );
	Window.display();

	// initialize the welcome list
	var evt = document.createEvent( "Event" );
	evt.initEvent( 'change', true, true );
	result.type.dispatchEvent( evt );
};

Kaizo.welcome.populateWelcomeList = function(e) {
	var type = e.target.value;
	var $workarea = $(e.target.form).find("div#welcomeWorkArea");

	var div = new Morebits.quickForm.element({
		type: "div",
		id: "welcomeWorkArea"
	});

	if ((type === "standard" || type === "anonymous") && Kaizo.getFriendlyPref("customWelcomeList").length) {
		div.append({ type: 'header', label: 'Custom welcome templates' });
		div.append({ 
			type: 'radio',
			name: 'template',
			list: Kaizo.getFriendlyPref("customWelcomeList"),
			event: Kaizo.welcome.selectTemplate
		});
	}

	var appendTemplates = function(list) {
		div.append({ 
			type: 'radio',
			name: 'template',
			list: list.map(function(obj) {
				var properties = Kaizo.welcome.templates[obj];
				var result = (properties ? { 
					value: obj,
					label: "{{" + obj + "}}: " + properties.description + (properties.linkedArticle ? "\u00A0*" : ""),  // U+00A0 NO-BREAK SPACE
					tooltip: properties.tooltip  // may be undefined
				} : {
					value: obj,
					label: "{{" + obj + "}}"
				});
				return result;
			}),
			event: Kaizo.welcome.selectTemplate
		});
	};

	switch (type) {
		case "standard":
			div.append({ type: 'header', label: 'General welcome templates' });
			appendTemplates([
				"welcome"/*,
				"welcome2",
				"welcome-anon",
				"welcome-anon2",
				"welcome-en",
				"welcome-iw",
				"welcomeg",
				"welcomeq",
				"welcome-personal",
				"welcome-school"*/
			]);
			break;
		case "anonymous":
			div.append({ type: 'header', label: 'Problem user welcome templates' });
			appendTemplates([
				/*"firstarticle",
				"welcomespam",
				"welcomenpov",
				"welcomevandal"*/
			]);
			break;
		default:
			div.append({ type: 'div', label: 'Kaizo.welcome.populateWelcomeList: something went wrong' });
			break;
	}

	var rendered = div.render();
	rendered.className = "quickform-scrollbox";
	$workarea.replaceWith(rendered);

	var firstRadio = e.target.form.template[0];
	firstRadio.checked = true;
	Kaizo.welcome.selectTemplate({ target: firstRadio });
};

Kaizo.welcome.selectTemplate = function(e) {
	var properties = Kaizo.welcome.templates[e.target.values];
	e.target.form.article.disabled = (properties ? !properties.linkedArticle : false);
};


// A list of welcome templates and their properties and syntax

// The four fields that are available are "description", "linkedArticle", "syntax", and "tooltip".
// The three magic words that can be used in the "syntax" field are:
//   - $USERNAME$  - replaced by the welcomer's username, depending on user's preferences
//   - $ARTICLE$   - replaced by an article name, if "linkedArticle" is true
//   - $HEADER$    - adds a level 2 header (most templates already include this)

Kaizo.welcome.templates = {
	"welcome": {
		description: "standard plain text welcome",
		linkedArticle: true,
		syntax: "$HEADER$ {{subst:welcome|$USERNAME$|art=$ARTICLE$}} ~~~~"
	},
	"welcome2": {
		description: "welcome with graphic and orange color sheme",
		linkedArticle: true,
		syntax: "$HEADER$ {{subst:welcome2|~~~~|art=$ARTICLE$}}"
	},
	"welcome-anon": {
		description: "welcome anonymous user and suggest getting a username",
		linkedArticle: true,
		syntax: "$HEADER$ {{subst:welcome-anon|$USERNAME$|art=$ARTICLE$}} ~~~~"
	},
	"welcome-anon2": {
		description: "like welcome-anon, but with table and colors",
		linkedArticle: true,
		syntax: "$HEADER$ {{subst:welcome-anon2|$USERNAME$|art=$ARTICLE$}}"
	},
	"welcome-en": {
		description: "welcome for users from main English Wikipedia",
		linkedArticle: false,
		syntax: "$HEADER$ {{subst:welcome-en}} ~~~~"
	},
	"welcome-iw": {
		description: "welcome users from another Wikipedia",
		linkedArticle: false,
		syntax: "$HEADER$ {{subst:welcome-iw}} ~~~~"
	},
	"welcomeg": {
		description: "welcome with blue background",
		linkedArticle: true,
		syntax: "{{subst:welcomeg|$USERNAME$|art=$ARTICLE$}} ~~~~"
	},
	"welcomeq": {
		description: "like welcomeg but a bit shorter",
		linkedArticle: true,
		syntax: "{{subst:welcomeq|$USERNAME$|art=$ARTICLE$}} ~~~~"
	},
	"welcome-personal": {
		description: "a more personal welcome with a plate of cookies",
		linkedArticle: true,
		syntax: "{{subst:welcome-personal|$USERNAME$|art=$ARTICLE$}} ~~~~"
	},
	"welcome-school": {
		description: "for welcoming students participating in a class project",
		linkedArticle: false,
		syntax: "{{subst:welcome-school}} ~~~~"
	},

	// second group

	"firstarticle": {
		description: "welcome with note that created page may get deleted",
		linkedArticle: true,
		syntax: "$HEADER$ {{subst:firstarticle|1=$ARTICLE$}} ~~~~"
	},
	"welcomespam": {
		description: "welcome users which did spam changes",
		linkedArticle: true,
		syntax: "$HEADER$ {{subst:welcomespam|art=$ARTICLE$}} ~~~~"
	},
	"welcomenpov": {
		description: "welcome with warning to make changes that fit the NPOV requirements",
		linkedArticle: true,
		syntax: "$HEADER$ {{subst:welcomenpov|$ARTICLE$}} ~~~~"
	},
	"welcomevandal": {
		description: "welcome user which performed vandalism",
		linkedArticle: true,
		syntax: "$HEADER$ {{subst:welcomevandal|$ARTICLE$}} ~~~~"
	}
};

Kaizo.welcome.getTemplateWikitext = function(template, article) {
	var properties = Kaizo.welcome.templates[template];
	if (properties) {
		return properties.syntax.
			replace("$USERNAME$", Kaizo.getFriendlyPref("insertUsername") ? mw.config.get("wgUserName") : "").
			replace("$ARTICLE$", article ? article : "").
			replace(/\$HEADER\$\s*/, "== Welcome ==\n\n").
			replace("$EXTRA$", "");  // EXTRA is not implemented yet
	} else {
		return "{{subst:" + template + (article ? ("|art=" + article) : "") + "}} ~~~~";
	}
};

Kaizo.welcome.callbacks = {
	preview: function(form) {
		var previewDialog = new Morebits.simpleWindow(750, 400);
		previewDialog.setTitle("Welcome template preview");
		previewDialog.setScriptName("Welcome user");
		previewDialog.setModality(true);

		var previewdiv = document.createElement("div");
		previewdiv.style.marginLeft = previewdiv.style.marginRight = "0.5em";
		previewdiv.style.fontSize = "small";
		previewDialog.setContent(previewdiv);

		var previewer = new Morebits.wiki.preview(previewdiv);
		previewer.beginRender(Kaizo.welcome.getTemplateWikitext(form.getChecked("template"), form.article.value));

		var submit = document.createElement("input");
		submit.setAttribute("type", "submit");
		submit.setAttribute("value", "Close");
		previewDialog.addContent(submit);

		previewDialog.display();

		$(submit).click(function(e) {
			previewDialog.close();
		});
	},
	main: function( pageobj ) {
		var params = pageobj.getCallbackParameters();
		var text = pageobj.getPageText();

		// abort if mode is auto and form is not empty
		if( pageobj.exists() && params.mode === 'auto' ) {
			Morebits.status.info( 'Warning', 'User talk page not empty; aborting automatic welcome' );
			Morebits.wiki.actionCompleted.event();
			return;
		}

		var welcomeText = Kaizo.welcome.getTemplateWikitext(params.value, params.article);

		if( Kaizo.getFriendlyPref('topWelcomes') ) {
			text = welcomeText + '\n\n' + text;
		} else {
			text += "\n" + welcomeText;
		}

		var summaryText = "Welcome to Miraheze!";
		pageobj.setPageText(text);
		pageobj.setEditSummary(summaryText + Kaizo.getPref('summaryAd'));
		pageobj.setWatchlist(Kaizo.getFriendlyPref('watchWelcomes'));
		pageobj.setCreateOption('recreate');
		pageobj.save();
	}
};

Kaizo.welcome.callback.evaluate = function friendlywelcomeCallbackEvaluate(e) {
	var form = e.target;

	var params = {
		value: form.getChecked("template"),
		article: form.article.value,
		mode: 'manual'
	};

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( form );

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = "Welcoming complete, reloading talk page in a few seconds";

	var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), "User talk page modification");
	wikipedia_page.setFollowRedirect(true);
	wikipedia_page.setCallbackParameters(params);
	wikipedia_page.load(Kaizo.welcome.callbacks.main);
};

/*
 ****************************************
 *** Kaizoarv.js: ARV module
 ****************************************
 * Mode of invocation:     Tab ("ARV")
 * Active on:              Existing and non-existing user pages, user talk pages, contributions pages
 * Config directives in:   KaizoConfig
 */

Kaizo.arv = function Kaizoarv() {

	var username = Morebits.getPageAssociatedUser();
	if ( username === false ) {
		return;
	}

	var title = Morebits.isIPAddress( username ) ? 'Report IP to administrators' : 'Report user to administrators';

	//twAddPortletLink( function(){ Kaizo.arv.callback(username); }, "VIP", "tw-arv", title );
};

Kaizo.arv.callback = function ( uid ) {
	if ( !KaizoUserAuthorized ) {
		alert("Your account is too new to use Kaizo.");
		return;
	}
	if ( uid === mw.config.get('wgUserName') ) {
		alert( 'You don\'t want to report yourself, do you?' );
		return;
	}

	var Window = new Morebits.simpleWindow( 600, 500 );
	Window.setTitle( "Vandalism in progress" ); //changed title
	Window.setScriptName( "Kaizo" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#arv" );

	var form = new Morebits.quickForm( Kaizo.arv.callback.evaluate );
	var categories = form.append( {
			type: 'select',
			name: 'category',
			label: 'Select report type: ',
			event: Kaizo.arv.callback.changeCategory
		} );
	categories.append( {
			type: 'option',
			label: 'Vandalism (WP:VIP)',
			value: 'aiv'
		} );
	form.append( {
			type: 'field',
			label:'Work area',
			name: 'work_area'
		} );
	form.append( { type:'submit' } );
	form.append( {
			type: 'hidden',
			name: 'uid',
			value: uid
		} );
	
	var result = form.render();
	Window.setContent( result );
	Window.display();

	// We must init the
	var evt = document.createEvent( "Event" );
	evt.initEvent( 'change', true, true );
	result.category.dispatchEvent( evt );
};

Kaizo.arv.callback.changeCategory = function (e) {
	var value = e.target.value;
	var root = e.target.form;
	var old_area = Morebits.quickForm.getElements(root, "work_area")[0];
	var work_area = null;

	switch( value ) {
	case 'aiv':
		/* falls through */
	default:
		work_area = new Morebits.quickForm.element( { 
				type: 'field',
				label: 'Report user for vandalism',
				name: 'work_area'
			} );
		work_area.append( {
				type: 'input',
				name: 'page',
				label: 'Primary linked page: ',
				tooltip: 'Leave blank to not link to the page in the report',
				value: Morebits.queryString.exists( 'vanarticle' ) ? Morebits.queryString.get( 'vanarticle' ) : '',
				event: function(e) {
					var value = e.target.value;
					var root = e.target.form;
					if( value === '' ) {
						root.badid.disabled = root.goodid.disabled = true;
					} else {
						root.badid.disabled = false;
						root.goodid.disabled = root.badid.value === '';
					}
				}
			} );
		work_area.append( {
				type: 'input',
				name: 'badid',
				label: 'Revision ID for target page when vandalised: ',
				tooltip: 'Leave blank for no diff link',
				value: Morebits.queryString.exists( 'vanarticlerevid' ) ? Morebits.queryString.get( 'vanarticlerevid' ) : '',
				disabled: !Morebits.queryString.exists( 'vanarticle' ),
				event: function(e) {
					var value = e.target.value;
					var root = e.target.form;
					root.goodid.disabled = value === '';
				}
			} );
		work_area.append( {
				type: 'input',
				name: 'goodid',
				label: 'Last good revision ID before vandalism of target page: ',
				tooltip: 'Leave blank for diff link to previous revision',
				value: Morebits.queryString.exists( 'vanarticlegoodrevid' ) ? Morebits.queryString.get( 'vanarticlegoodrevid' ) : '',
				disabled: !Morebits.queryString.exists( 'vanarticle' ) || Morebits.queryString.exists( 'vanarticlerevid' )
			} );
		work_area.append( {
				type: 'checkbox',
				name: 'arvtype',
				list: [
					{ 
						label: 'Vandalism after final (level 4 or 4im) warning given',
						value: 'final'
					},
					{ 
						label: 'Vandalism after recent (within 1 day) release of block',
						value: 'postblock'
					},
					{ 
						label: 'Evidently a vandalism-only account',
						value: 'vandalonly',
						disabled: Morebits.isIPAddress( root.uid.value )
					},
					{ 
						label: 'Account is evidently a spambot or a compromised account',
						value: 'spambot'
					},
					{ 
						label: 'Account is a promotion-only account',
						value: 'promoonly'
					}
				]
			} );
		work_area.append( {
				type: 'textarea',
				name: 'reason',
				label: 'Comment: '
			} );
		work_area = work_area.render();
		old_area.parentNode.replaceChild( work_area, old_area );
		break;
	}
};

Kaizo.arv.callback.evaluate = function(e) {

	var form = e.target;
	var reason = "";
	var comment = "";
	if ( form.reason ) {
		comment = form.reason.value;
	}
	var uid = form.uid.value;

	var types;
	switch( form.category.value ) {

		// Report user for vandalism
		case 'aiv':
			/* falls through */
		default:
			types = form.getChecked( 'arvtype' );
			if( !types.length && comment === '' ) {
				alert( 'You must specify some reason' );
				return;
			}

			types = types.map( function(v) {
					switch(v) {
						case 'final':
							return 'vandalism after final warning';
						case 'postblock':
							return 'vandalism after recent release of block';
						case 'spambot':
							return 'account is evidently a spambot or a compromised account';
						case 'vandalonly':
							return 'actions evidently indicate a vandalism-only account';
						case 'promoonly':
							return 'account is being used only for promotional purposes';
						default:
							return 'unknown reason';
					}
				} ).join( '; ' );


			if ( form.page.value !== '' ) {
			
				// add a leading : on linked page namespace to prevent transclusion
				reason = 'On [[' + form.page.value.replace( /^(Image|Category|File):/i, ':$1:' ) + ']]';

				if ( form.badid.value !== '' ) {
					var query = {
						'title': form.page.value,
						'diff': form.badid.value,
						'oldid': form.goodid.value
					};
					reason += ' ({{diff|' + form.page.value + '|' + form.badid.value + '|' + form.goodid.value + '|diff}})';
				}
				reason += ':';
			}

			if ( types ) {
				reason += " " + types;
			}
			if (comment !== "" ) {
				reason += (reason === "" ? "" : ". ") + comment;
			}
			reason += ". ~~~~";
			reason = reason.replace(/\r?\n/g, "\n*:");  // indent newlines

			Morebits.simpleWindow.setButtonsEnabled( false );
			Morebits.status.init( form );

			Morebits.wiki.actionCompleted.redirect = "Wikipedia:Vandalism in progress";
			Morebits.wiki.actionCompleted.notice = "Reporting complete";

			var aivPage = new Morebits.wiki.page( 'Wikipedia:Vandalism in progress', 'Processing VIP request' );
			aivPage.setPageSection( 3 );
			aivPage.setFollowRedirect( true );
			
			aivPage.load( function() {
				var text = aivPage.getPageText();

				// check if user has already been reported
				if (new RegExp( "\\{\\{\\s*(?:(?:[Ii][Pp])?[Vv]andal|[Uu]serlinks)\\s*\\|\\s*(?:1=)?\\s*" + RegExp.escape( uid, true ) + "\\s*\\}\\}" ).test(text)) {
					aivPage.getStatusElement().info( 'Report already present, will not add a new one' );
					return;
				}
				aivPage.getStatusElement().status( 'Adding new report...' );
				aivPage.setEditSummary( 'Reporting [[Special:Contributions/' + uid + '|' + uid + ']].' + Kaizo.getPref('summaryAd') );
				aivPage.setAppendText( '\n*{{' + ( Morebits.isIPAddress( uid ) ? 'IPvandal' : 'vandal' ) + '|' + (/\=/.test( uid ) ? '1=' : '' ) + uid + '}} &ndash; ' + reason );
				aivPage.append();
			} );
			break;
	}
};
/*
 ****************************************
 *** Kaizobatchdelete.js: Batch delete module (sysops only)
 ****************************************
 * Mode of invocation:     Tab ("D-batch")
 * Active on:              Existing and non-existing non-articles, and Special:PrefixIndex
 * Config directives in:   KaizoConfig
 */


Kaizo.batchdelete = function Kaizobatchdelete() {
	if( Morebits.userIsInGroup( 'sysop' ) && (mw.config.get( 'wgNamespaceNumber' ) > 0 || mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Prefixindex') ) {
		twAddPortletLink( Kaizo.batchdelete.callback, "D-batch", "tw-batch", "Delete pages found in this category/on this page" );
	}
};

Kaizo.batchdelete.unlinkCache = {};
Kaizo.batchdelete.callback = function KaizobatchdeleteCallback() {
	var Window = new Morebits.simpleWindow( 800, 400 );
	Window.setTitle( "Batch deletion" );
	Window.setScriptName( "Kaizo" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#batchdelete" );

	var form = new Morebits.quickForm( Kaizo.batchdelete.callback.evaluate );
	form.append( {
			type: 'checkbox',
			list: [
				{ 
					label: 'Delete pages',
					name: 'delete_page',
					value: 'delete',
					checked: true
				},
				{
					label: 'Remove backlinks to the page',
					name: 'unlink_page',
					value: 'unlink',
					checked: false
				},
				{
					label: 'Delete redirects to deleted pages',
					name: 'delete_redirects',
					value: 'delete_redirects',
					checked: true
				}
			]
		} );
	form.append( {
			type: 'textarea',
			name: 'reason',
			label: 'Reason: '
		} );

	var query;
	if( mw.config.get( 'wgNamespaceNumber' ) === 14 ) {  // Category:

		query = {
			'action': 'query',
			'generator': 'categorymembers',
			'gcmtitle': mw.config.get( 'wgPageName' ),
			'gcmlimit' : Kaizo.getPref('batchMax'), // the max for sysops
			'prop': [ 'categories', 'revisions' ],
			'rvprop': [ 'size' ]
		};
	} else if( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Prefixindex' ) {

		var gapnamespace, gapprefix;
		if(Morebits.queryString.exists( 'from' ) )
		{
			gapnamespace = Morebits.queryString.get( 'namespace' );
			gapprefix = Morebits.string.toUpperCaseFirstChar( Morebits.queryString.get( 'from' ) );
		}
		else
		{
			var pathSplit = location.pathname.split('/');
			if (pathSplit.length < 3 || pathSplit[2] !== "Special:PrefixIndex") {
				return;
			}
			var titleSplit = pathSplit[3].split(':');
			gapnamespace = mw.config.get("wgNamespaceIds")[titleSplit[0].toLowerCase()];
			if ( titleSplit.length < 2 || typeof gapnamespace === 'undefined' )
			{
				gapnamespace = 0;  // article namespace
				gapprefix = pathSplit.splice(3).join('/');
			}
			else
			{
				pathSplit = pathSplit.splice(4);
				pathSplit.splice(0,0,titleSplit.splice(1).join(':'));
				gapprefix = pathSplit.join('/');
			}
		}

		query = {
			'action': 'query',
			'generator': 'allpages',
			'gapnamespace': gapnamespace ,
			'gapprefix': gapprefix,
			'gaplimit' : Kaizo.getPref('batchMax'), // the max for sysops
			'prop' : ['categories', 'revisions' ],
			'rvprop': [ 'size' ]
		};
	} else {
		query = {
			'action': 'query',
			'generator': 'links',
			'titles': mw.config.get( 'wgPageName' ),
			'gpllimit' : Kaizo.getPref('batchMax'), // the max for sysops
			'prop': [ 'categories', 'revisions' ],
			'rvprop': [ 'size' ]
		};
	}

	var wikipedia_api = new Morebits.wiki.api( 'Grabbing pages', query, function( self ) {
			var xmlDoc = self.responseXML;
			var snapshot = xmlDoc.evaluate('//page[@ns != "6" and not(@missing)]', xmlDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null );  // 6 = File: namespace
			var list = [];
			for ( var i = 0; i < snapshot.snapshotLength; ++i ) {
				var object = snapshot.snapshotItem(i);
				var page = xmlDoc.evaluate( '@title', object, null, XPathResult.STRING_TYPE, null ).stringValue;
				var size = xmlDoc.evaluate( 'revisions/rev/@size', object, null, XPathResult.NUMBER_TYPE, null ).numberValue;

				var disputed = xmlDoc.evaluate( 'boolean(categories/cl[@title="Category:Contested candidates for speedy deletion"])', object, null, XPathResult.BOOLEAN_TYPE, null ).booleanValue;
				list.push( {label:page + ' (' + size + ' bytes)' + ( disputed ? ' (DISPUTED CSD)' : '' ), value:page, checked:!disputed });
			}
			self.params.form.append( {
					type: 'checkbox',
					name: 'pages',
					list: list
				} );
			self.params.form.append( { type:'submit' } );

			var result = self.params.form.render();
			self.params.Window.setContent( result );
		} );

	wikipedia_api.params = { form:form, Window:Window };
	wikipedia_api.post();
	var root = document.createElement( 'div' );
	Morebits.status.init( root );
	Window.setContent( root );
	Window.display();
};

Kaizo.batchdelete.currentDeleteCounter = 0;
Kaizo.batchdelete.currentUnlinkCounter = 0;
Kaizo.batchdelete.currentdeletor = 0;
Kaizo.batchdelete.callback.evaluate = function KaizobatchdeleteCallbackEvaluate(event) {
	Morebits.wiki.actionCompleted.notice = 'Status';
	Morebits.wiki.actionCompleted.postfix = 'batch deletion is now complete';
	mw.config.set('wgPageName', mw.config.get('wgPageName').replace(/_/g, ' '));  // for queen/king/whatever and country!
	var pages = event.target.getChecked( 'pages' );
	var reason = event.target.reason.value;
	var delete_page = event.target.delete_page.checked;
	var unlink_page = event.target.unlink_page.checked;
	var delete_redirects = event.target.delete_redirects.checked;
	if( ! reason ) {
		return;
	}
	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( event.target );
	if( !pages ) {
		Morebits.status.error( 'Error', 'nothing to delete, aborting' );
		return;
	}

	function toCall( work ) {
		if( work.length === 0 &&  Kaizo.batchdelete.currentDeleteCounter <= 0 && Kaizo.batchdelete.currentUnlinkCounter <= 0 ) {
			window.clearInterval( Kaizo.batchdelete.currentdeletor );
			Morebits.wiki.removeCheckpoint();
			return;
		} else if( work.length !== 0 && ( Kaizo.batchdelete.currentDeleteCounter <= Kaizo.getPref('batchDeleteMinCutOff') || Kaizo.batchdelete.currentUnlinkCounter <= Kaizo.getPref('batchDeleteMinCutOff')  ) ) {
			Kaizo.batchdelete.unlinkCache = []; // Clear the cache
			var pages = work.shift();
			Kaizo.batchdelete.currentDeleteCounter += pages.length;
			Kaizo.batchdelete.currentUnlinkCounter += pages.length;
			for( var i = 0; i < pages.length; ++i ) {
				var page = pages[i];
				var query = {
					'action': 'query',
					'titles': page
				};
				var wikipedia_api = new Morebits.wiki.api( 'Checking if page ' + page + ' exists', query, Kaizo.batchdelete.callbacks.main );
				wikipedia_api.params = { page:page, reason:reason, unlink_page:unlink_page, delete_page:delete_page, delete_redirects:delete_redirects };
				wikipedia_api.post();
			}
		}
	}
	var work = Morebits.array.chunk( pages, Kaizo.getPref('batchdeleteChunks') );
	Morebits.wiki.addCheckpoint();
	Kaizo.batchdelete.currentdeletor = window.setInterval( toCall, 1000, work );
};

Kaizo.batchdelete.callbacks = {
	main: function( self ) {
		var xmlDoc = self.responseXML;
		var normal = xmlDoc.evaluate( '//normalized/n/@to', xmlDoc, null, XPathResult.STRING_TYPE, null ).stringValue;
		if( normal ) {
			self.params.page = normal;
		}
		var exists = xmlDoc.evaluate( 'boolean(//pages/page[not(@missing)])', xmlDoc, null, XPathResult.BOOLEAN_TYPE, null ).booleanValue;

		if( ! exists ) {
			self.statelem.error( "It seems that the page doesn't exist, perhaps it has already been deleted" );
			return;
		}

		var query, wikipedia_api;
		if( self.params.unlink_page ) {
			query = {
				'action': 'query',
				'list': 'backlinks',
				'blfilterredir': 'nonredirects',
				'blnamespace': [0, 100], // main space and portal space only
				'bltitle': self.params.page,
				'bllimit': Morebits.userIsInGroup( 'sysop' ) ? 5000 : 500 // 500 is max for normal users, 5000 for bots and sysops
			};
			wikipedia_api = new Morebits.wiki.api( 'Grabbing backlinks', query, Kaizo.batchdelete.callbacks.unlinkBacklinksMain );
			wikipedia_api.params = self.params;
			wikipedia_api.post();
		} else {
			--Kaizo.batchdelete.currentUnlinkCounter;
		}
		if( self.params.delete_page ) {
			if (self.params.delete_redirects)
			{
				query = {
					'action': 'query',
					'list': 'backlinks',
					'blfilterredir': 'redirects',
					'bltitle': self.params.page,
					'bllimit': Morebits.userIsInGroup( 'sysop' ) ? 5000 : 500 // 500 is max for normal users, 5000 for bots and sysops
				};
				wikipedia_api = new Morebits.wiki.api( 'Grabbing redirects', query, Kaizo.batchdelete.callbacks.deleteRedirectsMain );
				wikipedia_api.params = self.params;
				wikipedia_api.post();
			}

			var wikipedia_page = new Morebits.wiki.page( self.params.page, 'Deleting page ' + self.params.page );
			wikipedia_page.setEditSummary(self.params.reason + Kaizo.getPref('deletionSummaryAd'));
			wikipedia_page.deletePage(function( apiobj ) { 
					--Kaizo.batchdelete.currentDeleteCounter;
					var link = document.createElement( 'a' );
					link.setAttribute( 'href', mw.util.getUrl(self.params.page) );
					link.setAttribute( 'title', self.params.page );
					link.appendChild( document.createTextNode( self.params.page ) );
					apiobj.statelem.info( [ 'completed (' , link , ')' ] );
				} );	
		} else {
			--Kaizo.batchdelete.currentDeleteCounter;
		}
	},
	deleteRedirectsMain: function( self ) {
		var xmlDoc = self.responseXML;
		var snapshot = xmlDoc.evaluate('//backlinks/bl/@title', xmlDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null );

		var total = snapshot.snapshotLength;

		if( snapshot.snapshotLength === 0 ) {
			return;
		}

		var statusIndicator = new Morebits.status('Deleting redirects for ' + self.params.page, '0%');

		var onsuccess = function( self ) {
			var obj = self.params.obj;
			var total = self.params.total;
			var now = parseInt( 100 * ++(self.params.current)/total, 10 ) + '%';
			obj.update( now );
			self.statelem.unlink();
			if( self.params.current >= total ) {
				obj.info( now + ' (completed)' );
				Morebits.wiki.removeCheckpoint();
			}
		};


		Morebits.wiki.addCheckpoint();
		if( snapshot.snapshotLength === 0 ) {
			statusIndicator.info( '100% (completed)' );
			Morebits.wiki.removeCheckpoint();
			return;
		}

		var params = $.extend({}, self.params);
		params.current = 0;
		params.total = total;
		params.obj = statusIndicator;


		for ( var i = 0; i < snapshot.snapshotLength; ++i ) {
			var title = snapshot.snapshotItem(i).value;
			var wikipedia_page = new Morebits.wiki.page( title, "Deleting " + title );
			wikipedia_page.setEditSummary('Redirect to deleted page "' + self.params.page + '"' + Kaizo.getPref('deletionSummaryAd'));
			wikipedia_page.setCallbackParameters(params);
			wikipedia_page.deletePage(onsuccess);
		}
	},
	unlinkBacklinksMain: function( self ) {
		var xmlDoc = self.responseXML;
		var snapshot = xmlDoc.evaluate('//backlinks/bl/@title', xmlDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null );

		if( snapshot.snapshotLength === 0 ) {
			--Kaizo.batchdelete.currentUnlinkCounter;
			return;
		}

		var statusIndicator = new Morebits.status('Unlinking backlinks to ' + self.params.page, '0%');

		var total = snapshot.snapshotLength * 2;

		var onsuccess = function( self ) {
			var obj = self.params.obj;
			var total = self.params.total;
			var now = parseInt( 100 * ++(self.params.current)/total, 10 ) + '%';
			obj.update( now );
			self.statelem.unlink();
			if( self.params.current >= total ) {
				obj.info( now + ' (completed)' );
				--Kaizo.batchdelete.currentUnlinkCounter;
				Morebits.wiki.removeCheckpoint();
			}
		};

		Morebits.wiki.addCheckpoint();
		if( snapshot.snapshotLength === 0 ) {
			statusIndicator.info( '100% (completed)' );
			--Kaizo.batchdelete.currentUnlinkCounter;
			Morebits.wiki.removeCheckpoint();
			return;
		}
		self.params.total = total;
		self.params.obj = statusIndicator;
		self.params.current =   0;

		for ( var i = 0; i < snapshot.snapshotLength; ++i ) {
			var title = snapshot.snapshotItem(i).value;
			var wikipedia_page = new Morebits.wiki.page( title, "Unlinking on " + title );
			var params = $.extend( {}, self.params );
			params.title = title;
			params.onsuccess = onsuccess;
			wikipedia_page.setCallbackParameters(params);
			wikipedia_page.load(Kaizo.batchdelete.callbacks.unlinkBacklinks);
		}
	},
	unlinkBacklinks: function( pageobj ) {
		var params = pageobj.getCallbackParameters();
		if( ! pageobj.exists() ) {
			// we probably just deleted it, as a recursive backlink
			params.onsuccess( { params: params, statelem: pageobj.getStatusElement() } );
			Morebits.wiki.actionCompleted();
			return;
		}
		var text;

		if( params.title in Kaizo.batchdelete.unlinkCache ) {
			text = Kaizo.batchdelete.unlinkCache[ params.title ];
		} else {
			text = pageobj.getPageText();
		}
		var old_text = text;
		var wikiPage = new Morebits.wikitext.page( text );
		wikiPage.removeLink( params.page );

		text = wikiPage.getText();
		Kaizo.batchdelete.unlinkCache[ params.title ] = text;
		if( text === old_text ) {
			// Nothing to do, return
			params.onsuccess( { params: params, statelem: pageobj.getStatusElement() } );
			Morebits.wiki.actionCompleted();
			return;
		}
		pageobj.setEditSummary('Removing link(s) to deleted page ' + self.params.page + Kaizo.getPref('deletionSummaryAd'));
		pageobj.setPageText(text);
		pageobj.setCreateOption('nocreate');
		pageobj.save(params.onsuccess);
	}
};
/*
 ****************************************
 *** Kaizobatchprotect.js: Batch protect module (sysops only)
 ****************************************
 * Mode of invocation:     Tab ("P-batch")
 * Active on:              Existing project pages and user pages; existing and
 *                         non-existing categories; Special:PrefixIndex
 * Config directives in:   KaizoConfig
 */


Kaizo.batchprotect = function Kaizobatchprotect() {
	if( Morebits.userIsInGroup( 'sysop' ) && ((mw.config.get( 'wgArticleId' ) > 0 && (mw.config.get( 'wgNamespaceNumber' ) === 2 ||
		mw.config.get( 'wgNamespaceNumber' ) === 4)) || mw.config.get( 'wgNamespaceNumber' ) === 14 ||
		mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Prefixindex') ) {
		twAddPortletLink( Kaizo.batchprotect.callback, "P-batch", "tw-pbatch", "Protect pages linked from this page" );
	}
};

Kaizo.batchprotect.unlinkCache = {};
Kaizo.batchprotect.callback = function KaizobatchprotectCallback() {
	var Window = new Morebits.simpleWindow( 800, 400 );
	Window.setTitle( "Batch protection" );
	Window.setScriptName( "Kaizo" );
	//Window.addFooterLink( "Protection templates", "Template:Protection templates" );
	Window.addFooterLink( "Protection policy", "WP:PROT" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#protect" );

	var form = new Morebits.quickForm( Kaizo.batchprotect.callback.evaluate );
	form.append({
			type: 'checkbox',
			name: 'editmodify',
			event: Kaizo.protect.formevents.editmodify,
			list: [
				{
					label: 'Modify edit protection',
					value: 'editmodify',
					tooltip: 'Only for existing pages.',
					checked: true
				}
			]
		});
	var editlevel = form.append({
			type: 'select',
			name: 'editlevel',
			label: 'Edit protection:',
			event: Kaizo.protect.formevents.editlevel
		});
	editlevel.append({
			type: 'option',
			label: 'All',
			value: 'all'
		});
	editlevel.append({
			type: 'option',
			label: 'Autoconfirmed',
			value: 'autoconfirmed'
		});
	editlevel.append({
			type: 'option',
			label: 'Sysop',
			value: 'sysop',
			selected: true
		});
	form.append({
			type: 'select',
			name: 'editexpiry',
			label: 'Expires:',
			event: function(e) {
				if (e.target.value === 'custom') {
					Kaizo.protect.doCustomExpiry(e.target);
				}
			},
			list: [
				{ label: '1 hour', value: '1 hour' },
				{ label: '2 hours', value: '2 hours' },
				{ label: '3 hours', value: '3 hours' },
				{ label: '6 hours', value: '6 hours' },
				{ label: '12 hours', value: '12 hours' },
				{ label: '1 day', value: '1 day' },
				{ label: '2 days', selected: true, value: '2 days' },
				{ label: '3 days', value: '3 days' },
				{ label: '4 days', value: '4 days' },
				{ label: '1 week', value: '1 week' },
				{ label: '2 weeks', value: '2 weeks' },
				{ label: '1 month', value: '1 month' },
				{ label: '2 months', value: '2 months' },
				{ label: '3 months', value: '3 months' },
				{ label: '1 year', value: '1 year' },
				{ label: 'indefinite', value:'indefinite' },
				{ label: 'Custom...', value: 'custom' }
			]
		});

	form.append({
			type: 'checkbox',
			name: 'movemodify',
			event: Kaizo.protect.formevents.movemodify,
			list: [
				{
					label: 'Modify move protection',
					value: 'movemodify',
					tooltip: 'Only for existing pages.',
					checked: true
				}
			]
		});
	var movelevel = form.append({
			type: 'select',
			name: 'movelevel',
			label: 'Move protection:',
			event: Kaizo.protect.formevents.movelevel
		});
	movelevel.append({
			type: 'option',
			label: 'All',
			value: 'all'
		});
	movelevel.append({
			type: 'option',
			label: 'Autoconfirmed',
			value: 'autoconfirmed'
		});
	movelevel.append({
			type: 'option',
			label: 'Sysop',
			value: 'sysop',
			selected: true
		});
	form.append({
			type: 'select',
			name: 'moveexpiry',
			label: 'Expires:',
			event: function(e) {
				if (e.target.value === 'custom') {
					Kaizo.protect.doCustomExpiry(e.target);
				}
			},
			list: [
				{ label: '1 hour', value: '1 hour' },
				{ label: '2 hours', value: '2 hours' },
				{ label: '3 hours', value: '3 hours' },
				{ label: '6 hours', value: '6 hours' },
				{ label: '12 hours', value: '12 hours' },
				{ label: '1 day', value: '1 day' },
				{ label: '2 days', selected: true, value: '2 days' },
				{ label: '3 days', value: '3 days' },
				{ label: '4 days', value: '4 days' },
				{ label: '1 week', value: '1 week' },
				{ label: '2 weeks', value: '2 weeks' },
				{ label: '1 month', value: '1 month' },
				{ label: '2 months', value: '2 months' },
				{ label: '3 months', value: '3 months' },
				{ label: '1 year', value: '1 year' },
				{ label: 'indefinite', value:'indefinite' },
				{ label: 'Custom...', value: 'custom' }
			]
		});

	form.append({
			type: 'checkbox',
			name: 'createmodify',
			event: function KaizobatchprotectFormCreatemodifyEvent(e) {
				e.target.form.createlevel.disabled = !e.target.checked;
				e.target.form.createexpiry.disabled = !e.target.checked || (e.target.form.createlevel.value === 'all');
				e.target.form.createlevel.style.color = e.target.form.createexpiry.style.color = (e.target.checked ? "" : "transparent");
			},
			list: [
				{
					label: 'Modify create protection',
					value: 'createmodify',
					tooltip: 'Only for pages that do not exist.',
					checked: true
				}
			]
		});
	var createlevel = form.append({
			type: 'select',
			name: 'createlevel',
			label: 'Create protection:',
			event: Kaizo.protect.formevents.createlevel
		});
	createlevel.append({
			type: 'option',
			label: 'All',
			value: 'all'
		});
	createlevel.append({
			type: 'option',
			label: 'Autoconfirmed',
			value: 'autoconfirmed'
		});
	createlevel.append({
			type: 'option',
			label: 'Sysop',
			value: 'sysop',
			selected: true
		});
	form.append({
			type: 'select',
			name: 'createexpiry',
			label: 'Expires:',
			event: function(e) {
				if (e.target.value === 'custom') {
					Kaizo.protect.doCustomExpiry(e.target);
				}
			},
			list: [
				{ label: '1 hour', value: '1 hour' },
				{ label: '2 hours', value: '2 hours' },
				{ label: '3 hours', value: '3 hours' },
				{ label: '6 hours', value: '6 hours' },
				{ label: '12 hours', value: '12 hours' },
				{ label: '1 day', value: '1 day' },
				{ label: '2 days', value: '2 days' },
				{ label: '3 days', value: '3 days' },
				{ label: '4 days', value: '4 days' },
				{ label: '1 week', value: '1 week' },
				{ label: '2 weeks', value: '2 weeks' },
				{ label: '1 month', value: '1 month' },
				{ label: '2 months', value: '2 months' },
				{ label: '3 months', value: '3 months' },
				{ label: '1 year', value: '1 year' },
				{ label: 'indefinite', selected: true, value: 'indefinite' },
				{ label: 'Custom...', value: 'custom' }
			]
		});

	form.append( {
			type: 'textarea',
			name: 'reason',
			label: 'Reason (for protection log): '
		} );

	var query;

	if( mw.config.get( 'wgNamespaceNumber' ) === 14 ) {  // categories
		query = {
			'action': 'query',
			'generator': 'categorymembers',
			'gcmtitle': mw.config.get( 'wgPageName' ),
			'gcmlimit' : Kaizo.getPref('batchMax'), // the max for sysops
			'prop': 'revisions',
			'rvprop': 'size'
		};
	} else if( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Prefixindex' ) {
		query = {
			'action': 'query',
			'generator': 'allpages',
			'gapnamespace': Morebits.queryString.exists('namespace') ? Morebits.queryString.get( 'namespace' ) : document.getElementById('namespace').value,
			'gapprefix': Morebits.queryString.exists('from') ? Morebits.string.toUpperCaseFirstChar(Morebits.queryString.get( 'from' ).replace('+', ' ')) :
				Morebits.string.toUpperCaseFirstChar(document.getElementById('nsfrom').value),
			'gaplimit' : Kaizo.getPref('batchMax'), // the max for sysops
			'prop': 'revisions',
			'rvprop': 'size'
		};
	} else {
		query = {
			'action': 'query',
			'gpllimit' : Kaizo.getPref('batchMax'), // the max for sysops
			'generator': 'links',
			'titles': mw.config.get( 'wgPageName' ),
			'prop': 'revisions',
			'rvprop': 'size'
		};
	}

	var statusdiv = document.createElement("div");
	statusdiv.style.padding = '15px';  // just so it doesn't look broken
	Window.setContent(statusdiv);
	Morebits.status.init(statusdiv);
	Window.display();

	var statelem = new Morebits.status("Grabbing list of pages");

	var wikipedia_api = new Morebits.wiki.api( 'loading...', query, function(apiobj) {
			var xml = apiobj.responseXML;
			var $pages = $(xml).find('page');
			var list = [];
			$pages.each(function(index, page) {
				var $page = $(page);
				var title = $page.attr('title');
				var isRedir = $page.attr('redirect') === ""; // XXX ??
				var missing = $page.attr('missing') === ""; // XXX ??
				var size = $page.find('rev').attr('size');

				var metadata = [];
				if (missing) {
					metadata.push("page does not exist");
				} else {
					if (isRedir) {
						metadata.push("redirect");
					}
					metadata.push(size + " bytes");
				}
				list.push( { label: title + (metadata.length ? (' (' + metadata.join('; ') + ')') : '' ), value: title, checked: true });
			});
			form.append({ type: 'header', label: 'Pages to protect' });
			form.append( {
					type: 'checkbox',
					name: 'pages',
					list: list
				} );
			form.append( { type:'submit' } );

			var result = form.render();
			Window.setContent( result );
		}, statelem );

	wikipedia_api.post();
};

Kaizo.batchprotect.currentProtectCounter = 0;
Kaizo.batchprotect.currentprotector = 0;
Kaizo.batchprotect.callback.evaluate = function KaizobatchprotectCallbackEvaluate(event) {
	var pages = event.target.getChecked( 'pages' );
	var reason = event.target.reason.value;
	var editmodify = event.target.editmodify.checked;
	var editlevel = event.target.editlevel.value;
	var editexpiry = event.target.editexpiry.value;
	var movemodify = event.target.movemodify.checked;
	var movelevel = event.target.movelevel.value;
	var moveexpiry = event.target.moveexpiry.value;
	var createmodify = event.target.createmodify.checked;
	var createlevel = event.target.createlevel.value;
	var createexpiry = event.target.createexpiry.value;

	if( ! reason ) {
		alert("You've got to give a reason, you rouge admin!");
		return;
	}

	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init( event.target );

	if( !pages ) {
		Morebits.status.error( 'Error', 'Nothing to protect, aborting' );
		return;
	}

	var toCall = function KaizobatchprotectToCall( work ) {
		if( work.length === 0 && Kaizo.batchprotect.currentProtectCounter <= 0 ) {
			Morebits.status.info( 'work done' );
			window.clearInterval( Kaizo.batchprotect.currentprotector );
			Kaizo.batchprotect.currentprotector = Kaizo.batchprotect.currentProtectCounter = 0;
			Morebits.wiki.removeCheckpoint();
			return;
		} else if( work.length !== 0 && Kaizo.batchprotect.currentProtectCounter <= Kaizo.getPref('batchProtectMinCutOff') ) {
			var pages = work.shift();
			Kaizo.batchprotect.currentProtectCounter += pages.length;
			for( var i = 0; i < pages.length; ++i ) {
				var page = pages[i];
				var query = {
					'action': 'query',
					'titles': page
				};
				var wikipedia_api = new Morebits.wiki.api( 'Checking if page ' + page + ' exists', query, Kaizo.batchprotect.callbacks.main );
				wikipedia_api.params = {
					page: page,
					reason: reason,
					editmodify: editmodify,
					editlevel: editlevel,
					editexpiry: editexpiry,
					movemodify: movemodify,
					movelevel: movelevel,
					moveexpiry: moveexpiry,
					createmodify: createmodify,
					createlevel: createlevel,
					createexpiry: createexpiry
				};
				wikipedia_api.post();
			}
		}
	};
	var work = Morebits.array.chunk( pages, Kaizo.getPref('batchProtectChunks') );
	Morebits.wiki.addCheckpoint();
	Kaizo.batchprotect.currentprotector = window.setInterval( toCall, 1000, work );
};

Kaizo.batchprotect.callbacks = {
	main: function( apiobj ) {
		var xml = apiobj.responseXML;
		var normal = $(xml).find('normalized n').attr('to');
		if( normal ) {
			apiobj.params.page = normal;
		}

		var exists = ($(xml).find('page').attr('missing') !== "");

		var page = new Morebits.wiki.page(apiobj.params.page, "Protecting " + apiobj.params.page);
		var takenAction = false;
		if (exists && apiobj.params.editmodify) {
			page.setEditProtection(apiobj.params.editlevel, apiobj.params.editexpiry);
			takenAction = true;
		}
		if (exists && apiobj.params.movemodify) {
			page.setMoveProtection(apiobj.params.movelevel, apiobj.params.moveexpiry);
			takenAction = true;
		}
		if (!exists && apiobj.params.createmodify) {
			page.setCreateProtection(apiobj.params.createlevel, apiobj.params.createexpiry);
			takenAction = true;
		}
		if (!takenAction) {
			Morebits.status.warn("Protecting " + apiobj.params.page, "page " + (exists ? "exists" : "does not exist") + "; nothing to do, skipping");
			return;
		}

		page.setEditSummary(apiobj.params.reason);

		page.protect(function(pageobj) {
			--Kaizo.batchprotect.currentProtectCounter;
			var link = document.createElement( 'a' );
			link.setAttribute( 'href', mw.util.getUrl( apiobj.params.page ) );
			link.appendChild( document.createTextNode( apiobj.params.page ) );
			pageobj.getStatusElement().info( [ 'completed (' , link , ')' ] );
		} );
	}
};
/*
 ****************************************
 *** Kaizobatchundelete.js: Batch undelete module
 ****************************************
 * Mode of invocation:     Tab ("Und-batch")
 * Active on:              Existing and non-existing user pages (??? why?)
 * Config directives in:   KaizoConfig
 */

// XXX TODO this module needs to be overhauled to use Morebits.wiki.page


Kaizo.batchundelete = function Kaizobatchundelete() {
	if( mw.config.get("wgNamespaceNumber") !== mw.config.get("wgNamespaceIds").user ) {
		return;
	}
	if( Morebits.userIsInGroup( 'sysop' ) ) {
		twAddPortletLink( Kaizo.batchundelete.callback, "Und-batch", "tw-batch-undel", "Undelete 'em all" );
	}
};

Kaizo.batchundelete.callback = function KaizobatchundeleteCallback() {
	var Window = new Morebits.simpleWindow( 800, 400 );
	Window.setScriptName("Kaizo");
	Window.setTitle("Batch undelete")
	var form = new Morebits.quickForm( Kaizo.batchundelete.callback.evaluate );
	form.append( {
			type: 'textarea',
			name: 'reason',
			label: 'Reason: '
		} );

	var query = {
		'action': 'query',
		'generator': 'links',
		'titles': mw.config.get("wgPageName"),
		'gpllimit' : Kaizo.getPref('batchMax') // the max for sysops
	};
	var wikipedia_api = new Morebits.wiki.api( 'Grabbing pages', query, function( self ) {
			var xmlDoc = self.responseXML;
			var snapshot = xmlDoc.evaluate('//page[@missing]', xmlDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null );
			var list = [];
			for ( var i = 0; i < snapshot.snapshotLength; ++i ) {
				var object = snapshot.snapshotItem(i);
				var page = xmlDoc.evaluate( '@title', object, null, XPathResult.STRING_TYPE, null ).stringValue;
				list.push( {label:page, value:page, checked: true });
			}
			self.params.form.append( {
					type: 'checkbox',
					name: 'pages',
					list: list
				}
			);
			self.params.form.append( { type:'submit' } );

			var result = self.params.form.render();
			self.params.Window.setContent( result );


		}  );
	wikipedia_api.params = { form:form, Window:Window };
	wikipedia_api.post();
	var root = document.createElement( 'div' );
	Morebits.status.init( root );
	Window.setContent( root );
	Window.display();
};
Kaizo.batchundelete.currentUndeleteCounter = 0;
Kaizo.batchundelete.currentundeletor = 0;
Kaizo.batchundelete.callback.evaluate = function( event ) {
	Morebits.wiki.actionCompleted.notice = 'Status';
	Morebits.wiki.actionCompleted.postfix = 'batch undeletion is now completed';

	var pages = event.target.getChecked( 'pages' );
	var reason = event.target.reason.value;
	if( ! reason ) {
		alert("You need to give a reason, you cabal crony!");
		return;
	}
	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init( event.target );

	if( !pages ) {
		Morebits.status.error( 'Error', 'nothing to undelete, aborting' );
		return;
	}

	var work = Morebits.array.chunk( pages, Kaizo.getPref('batchUndeleteChunks') );
	Morebits.wiki.addCheckpoint();
	Kaizo.batchundelete.currentundeletor = window.setInterval( Kaizo.batchundelete.callbacks.main, 1000, work, reason );
};

Kaizo.batchundelete.callbacks = {
	main: function( work, reason ) {
		if( work.length === 0 && Kaizo.batchundelete.currentUndeleteCounter <= 0 ) {
			Morebits.status.info( 'work done' );
			window.clearInterval( Kaizo.batchundelete.currentundeletor );
			Morebits.wiki.removeCheckpoint();
			return;
		} else if( work.length !== 0 && Kaizo.batchundelete.currentUndeleteCounter <= Kaizo.getPref('batchUndeleteMinCutOff') ) {
			var pages = work.shift();
			Kaizo.batchundelete.currentUndeleteCounter += pages.length;
			for( var i = 0; i < pages.length; ++i ) {
				var title = pages[i];
				var query = { 
					'token': mw.user.tokens.get().editToken,
					'title': title,
					'action': 'undelete',
					'reason': reason + Kaizo.getPref('deletionSummaryAd')
				};
				var wikipedia_api = new Morebits.wiki.api( "Undeleting " + title, query, function( self ) { 
						--Kaizo.batchundelete.currentUndeleteCounter;
						var link = document.createElement( 'a' );
						link.setAttribute( 'href', mw.util.getUrl(self.itsTitle) );
						link.setAttribute( 'title', self.itsTitle );
						link.appendChild( document.createTextNode(self.itsTitle) );
						self.statelem.info( ['completed (',link,')'] );

					});
				wikipedia_api.itsTitle = title;
				wikipedia_api.post();

			}
		}
	}
};
/*
 ****************************************
 *** Kaizoconfig.js: Preferences module
 ****************************************
 * Mode of invocation:     Adds configuration form to Wikipedia:Kaizo/Preferences and user 
                           subpages named "/Kaizo preferences", and adds ad box to the top of user 
                           subpages belonging to the currently logged-in user which end in '.js'
 * Active on:              What I just said.  Yeah.
 * Config directives in:   KaizoConfig

 I, [[User:This, that and the other]], originally wrote this.  If the code is misbehaving, or you have any
 questions, don't hesitate to ask me.  (This doesn't at all imply [[WP:OWN]]ership - it's just meant to
 point you in the right direction.)  -- TTO
 */


Kaizo.config = {};

Kaizo.config.commonEnums = {
	watchlist: { yes: "Add to watchlist", no: "Don't add to watchlist", "default": "Follow your site preferences" },
	talkPageMode: { window: "In a window, replacing other user talks", tab: "In a new tab", blank: "In a totally new window" }
};

Kaizo.config.commonSets = {
	csdCriteria: {
		db: "Custom rationale",
		g1: "G1", g2: "G2", g3: "G3", g4: "G4", g6: "G6", g7: "G7", g8: "G8", g10: "G10", g11: "G11", g12: "G12",
		a1: "A1", a2: "A2", a3: "A3", a4: "A4", a5: "A5", a6: "A6",
		u1: "U1", u2: "U2",
		f1: "F1",
		c1: "C1",
		t2: "T2",
		r2: "R2", r3: "R3"
	},
	csdCriteriaDisplayOrder: [
		"db",
		"g1", "g2", "g3", "g4", "g6", "g7", "g8", "g10", "g11", "g12",
		"a1", "a2", "a3", "a4", "a5", "a6",
		"u1", "u2",
		"f1",
		"c1",
		"t2",
		"r2", "r3"
	],
	csdCriteriaNotificationDisplayOrder: [
		"db",
		"g1", "g2", "g3", "g4", "g10", "g11", "g12",
		"a1", "a2", "a3", "a4", "a5", "a6",
		"f1",
		"c1",
		"t2",
		"r2", "r3"
	],
	csdAndDICriteria: {
		db: "Custom rationale",
		g1: "G1", g2: "G2", g3: "G3", g4: "G4", g6: "G6", g7: "G7", g8: "G8", g10: "G10", g11: "G11", g12: "G12",
		a1: "A1", a2: "A2", a3: "A3", a4: "A4", a5: "A5", a6: "A6",
		u1: "U1", u2: "U2",
		f1: "F1",
		c1: "C1",
		t2: "T2",
		r2: "R2", r3: "R3"
	},
	csdAndDICriteriaDisplayOrder: [
		"db",
		"g1", "g2", "g3", "g4", "g6", "g7", "g8", "g10", "g11", "g12",
		"a1", "a2", "a3", "a4", "a5", "a6",
		"u1", "u2",
		"f1",
		"c1",
		"t2",
		"r2", "r3"
	],
	namespacesNoSpecial: {
		"0": "Article",
		"1": "Talk (article)",
		"2": "User",
		"3": "User talk",
		"4": "Wikipedia",
		"5": "Wikipedia talk",
		"6": "File",
		"7": "File talk",
		"8": "MediaWiki",
		"9": "MediaWiki talk",
		"10": "Template",
		"11": "Template talk",
		"12": "Help",
		"13": "Help talk",
		"14": "Category",
		"15": "Category talk"
	}
};

/**
 * Section entry format:
 *
 * {
 *   title: <human-readable section title>,
 *   adminOnly: <true for admin-only sections>,
 *   hidden: <true for advanced preferences that rarely need to be changed - they can still be modified by manually editing Kaizooptions.js>,
 *   inFriendlyConfig: <true for preferences located under FriendlyConfig rather than KaizoConfig>,
 *   preferences: [
 *     {
 *       name: <KaizoConfig property name>,
 *       label: <human-readable short description - used as a form label>,
 *       helptip: <(optional) human-readable text (using valid HTML) that complements the description, like limits, warnings, etc.>
 *       adminOnly: <true for admin-only preferences>,
 *       type: <string|boolean|integer|enum|set|customList> (customList stores an array of JSON objects { value, label }),
 *       enumValues: <for type = "enum": a JSON object where the keys are the internal names and the values are human-readable strings>,
 *       setValues: <for type = "set": a JSON object where the keys are the internal names and the values are human-readable strings>,
 *       setDisplayOrder: <(optional) for type = "set": an array containing the keys of setValues (as strings) in the order that they are displayed>,
 *       customListValueTitle: <for type = "customList": the heading for the left "value" column in the custom list editor>,
 *       customListLabelTitle: <for type = "customList": the heading for the right "label" column in the custom list editor>
 *     },
 *     . . .
 *   ]
 * },
 * . . .
 *
 */

Kaizo.config.sections = [
{
	title: "General",
	preferences: [
		// KaizoConfig.summaryAd (string)
		// Text to be appended to the edit summary of edits made using Kaizo
		{
			name: "summaryAd",
			label: "\"Ad\" to be appended to Kaizo's edit summaries",
			helptip: "The summary ad should start with a space, and be kept short.",
			type: "string"
		},

		// KaizoConfig.deletionSummaryAd (string)
		// Text to be appended to the edit summary of deletions made using Kaizo
		{
			name: "deletionSummaryAd",
			label: "Summary ad to use for deletion summaries",
			helptip: "Normally the same as the edit summary ad above.",
			adminOnly: true,
			type: "string"
		},

		// KaizoConfig.protectionSummaryAd (string)
		// Text to be appended to the edit summary of page protections made using Kaizo
		{
			name: "protectionSummaryAd",
			label: "Summary ad to use for page protections",
			helptip: "Normally the same as the edit summary ad above.",
			adminOnly: true,
			type: "string"
		},

		// KaizoConfig.userTalkPageMode may take arguments:
		// 'window': open a new window, remember the opened window
		// 'tab': opens in a new tab, if possible.
		// 'blank': force open in a new window, even if such a window exists
		{
			name: "userTalkPageMode",
			label: "When opening a user talk page, open it",
			type: "enum",
			enumValues: Kaizo.config.commonEnums.talkPageMode
		},

		// KaizoConfig.dialogLargeFont (boolean)
		{
			name: "dialogLargeFont",
			label: "Use larger text in Kaizo dialogs",
			type: "boolean"
		}
	]
},

{
	title: "Revert and rollback",  // Kaizofluff module
	preferences: [
		// KaizoConfig.openTalkPage (array)
		// What types of actions that should result in opening of talk page
		{
			name: "openTalkPage",
			label: "Open user talk page after these types of reversions",
			type: "set",
			setValues: { agf: "AGF rollback", norm: "Normal rollback", vand: "Vandalism rollback", torev: "\"Restore this version\"" }
		},

		// KaizoConfig.openTalkPageOnAutoRevert (bool)
		// Defines if talk page should be opened when calling revert from contrib page, because from there, actions may be multiple, and opening talk page not suitable. If set to true, openTalkPage defines then if talk page will be opened.
		{
			name: "openTalkPageOnAutoRevert",
			label: "Open user talk page when invoking rollback from user contributions",
			helptip: "Often, you may be rolling back many pages at a time from a vandal's contributions page, so it would be unsuitable to open the user talk page. Hence, this option is off by default. When this is on, the desired options must be enabled in the previous setting for this to work.",
			type: "boolean"
		},

		// KaizoConfig.markRevertedPagesAsMinor (array)
		// What types of actions that should result in marking edit as minor
		{
			name: "markRevertedPagesAsMinor",
			label: "Mark as minor edit for these types of reversions",
			type: "set",
			setValues: { agf: "AGF rollback", norm: "Normal rollback", vand: "Vandalism rollback", torev: "\"Restore this version\"" }
		},

		// KaizoConfig.watchRevertedPages (array)
		// What types of actions that should result in forced addition to watchlist
		{
			name: "watchRevertedPages",
			label: "Add pages to watchlist for these types of reversions",
			type: "set",
			setValues: { agf: "AGF rollback", norm: "Normal rollback", vand: "Vandalism rollback", torev: "\"Restore this version\"" }
		},

		// KaizoConfig.offerReasonOnNormalRevert (boolean)
		// If to offer a prompt for extra summary reason for normal reverts, default to true
		{
			name: "offerReasonOnNormalRevert",
			label: "Prompt for reason for normal rollbacks",
			helptip: "\"Normal\" rollbacks are the ones that are invoked from the middle [rollback] link.",
			type: "boolean"
		},

		{
			name: "confirmOnFluff",
			label: "Provide a confirmation message before reverting",
			helptip: "For users of pen or touch devices, and chronically indecisive people.",
			type: "boolean"
		},

		// KaizoConfig.showRollbackLinks (array)
		// Where Kaizo should show rollback links (diff, others, mine, contribs)
		// Note from TTO: |contribs| seems to be equal to |others| + |mine|, i.e. redundant, so I left it out heres
		{
			name: "showRollbackLinks",
			label: "Show rollback links on these pages",
			type: "set",
			setValues: { diff: "Diff pages", others: "Contributions pages of other users", mine: "My contributions page" }
		}
	]
},

{
	title: "Shared IP tagging",
	inFriendlyConfig: true,
	preferences: [
		{
			name: "markSharedIPAsMinor",
			label: "Mark shared IP tagging as a minor edit",
			type: "boolean"
		}
	]
},

{
	title: "Deletion",
	preferences: [
		{
			name: "speedySelectionStyle",
			label: "When to go ahead and tag/delete the page",
			type: "enum",
			enumValues: { "buttonClick": 'When I click "Submit"', "radioClick": "As soon as I click an option" }
		},




		// KaizoConfig.markSpeedyPagesAsPatrolled (boolean)
		// If, when applying speedy template to page, to mark the page as patrolled (if the page was reached from NewPages)
		{
			name: "markSpeedyPagesAsPatrolled",
			label: "Mark page as patrolled when tagging (if possible)",
			helptip: "Due to technical limitations, pages are only marked as patrolled when they are reached via Special:NewPages.",
			type: "boolean"
		},

		// KaizoConfig.notifyUserOnSpeedyDeletionNomination (array)
		// What types of actions should result that the author of the page being notified of nomination
		


		// KaizoConfig.deleteTalkPageOnDelete (boolean)
		// If talk page if exists should also be deleted (CSD G8) when spedying a page (admin only)
		{
			name: "deleteTalkPageOnDelete",
			label: "Check the \"also delete talk page\" box by default",
			adminOnly: true,
			type: "boolean"
		},


		// KaizoConfig.speedyWindowWidth (integer)
		// Defines the width of the Kaizo SD window in pixels
		{
			name: "speedyWindowWidth",
			label: "Width of deletion window (pixels)",
			type: "integer"
		},

		// KaizoConfig.speedyWindowWidth (integer)
		// Defines the width of the Kaizo SD window in pixels
		{
			name: "speedyWindowHeight",
			label: "Height of deletion window (pixels)",
			helptip: "If you have a big monitor, you might like to increase this.",
			type: "integer"
		},

		{
			name: "logSpeedyNominations",
			label: "Keep a log in userspace of all deletion nominations",
			helptip: "Since non-admins do not have access to their deleted contributions, the userspace log offers a good way to keep track of all pages you nominate for QD using Kaizo. Files tagged using DI are also added to this log.",
			type: "boolean"
		},
		{
			name: "speedyLogPageName",
			label: "Keep the deletion userspace log at this user subpage",
			helptip: "i.e. User:<i>username</i>/<i>subpage name</i>. Only works if you turn on the QD userspace log.",
			type: "string"
		}
	]
},


{
	title: "Talkback",
	inFriendlyConfig: true,
	preferences: [
		{
			name: "markTalkbackAsMinor",
			label: "Mark talkbacks as minor edits",
			type: "boolean"
		},
		{
			name: "insertTalkbackSignature",
			label: "Insert signature within talkbacks",
			type: "boolean"
		},
		{
			name: "talkbackHeading",
			label: "Section heading to use for talkbacks",
			type: "string"
		},
		{
			name: "adminNoticeHeading",
			label: "Section heading to use for administrators' noticeboard notices",
			helptip: "Only relevant for AN and ANI.",
			type: "string"
		},
		{
			name: "mailHeading",
			label: "Section heading to use for \"you've got mail\" notices",
			type: "string"
		}
	]
},

{
	title: "Unlink",
	preferences: [
		// KaizoConfig.unlinkNamespaces (array)
		// In what namespaces unlink should happen, default in 0 (article) and 100 (portal)
		{
			name: "unlinkNamespaces",
			label: "Remove links from pages in these namespaces",
			helptip: "Avoid selecting any talk namespaces, as Kaizo might end up unlinking on talk archives (a big no-no).",
			type: "set",
			setValues: Kaizo.config.commonSets.namespacesNoSpecial
		}
	]
},

{
	title: "Warn user",
	preferences: [
		// KaizoConfig.defaultWarningGroup (int)
		// if true, watch the page which has been dispatched an warning or notice, if false, default applies
		{
			name: "defaultWarningGroup",
			label: "Default warning level",
			type: "enum",
			enumValues: { "1": "Level 1", "2": "Level 2", "3": "Level 3", "4": "Level 4", "5": "Level 4im", "6": "Single-issue notices", "7": "Single-issue warnings", "8": "Block (admin only)" }
		},

		// KaizoConfig.showSharedIPNotice may take arguments:
		// true: to show shared ip notice if an IP address
		// false: to not print the notice
		{
			name: "showSharedIPNotice",
			label: "Add extra notice on shared IP talk pages",
			helptip: "Notice used is {{<a href='" + mw.util.getUrl("Template:SharedIPAdvice") + "'>SharedIPAdvice</a>}}",
			type: "boolean"
		},

		// KaizoConfig.watchWarnings (boolean)
		// if true, watch the page which has been dispatched an warning or notice, if false, default applies
		{
			name: "watchWarnings",
			label: "Add user talk page to watchlist when notifying",
			type: "boolean"
		},

		// KaizoConfig.blankTalkpageOnIndefBlock (boolean)
		// if true, blank the talk page when issuing an indef block notice (per [[WP:UW#Indefinitely blocked users]])
		{
			name: "blankTalkpageOnIndefBlock",
			label: "Blank the talk page when indefinitely blocking users",
			helptip: "See <a href=\"" + mw.util.getUrl("WP:UW#Indefinitely blocked users") + "\">WP:UW</a> for more information.",
			adminOnly: true,
			type: "boolean"
		}
	]
},

{
	title: "Welcome user",
	inFriendlyConfig: true,
	preferences: [
		{
			name: "topWelcomes",
			label: "Place welcomes above existing content on user talk pages",
			type: "boolean"
		},
		{
			name: "watchWelcomes",
			label: "Add user talk pages to watchlist when welcoming",
			helptip: "Doing so adds to the personal element of welcoming a user - you will be able to see how they are coping as a newbie, and possibly help them.",
			type: "boolean"
		},
		{
			name: "insertUsername",
			label: "Add your username to the template (where applicable)",
			helptip: "Some welcome templates have an opening sentence like \"Hi, I'm &lt;username&gt;. Welcome\" etc. If you turn off this option, these templates will not display your username in that way.",
			type: "boolean"
		},
		{
			name: "quickWelcomeMode",
			label: "Clicking the \"welcome\" link on a diff page will",
			helptip: "If you choose to welcome automatically, the template you specify below will be used.",
			type: "enum",
			enumValues: { auto: "welcome automatically", norm: "prompt you to select a template" }
		},
		{
			name: "quickWelcomeTemplate",
			label: "Template to use when welcoming automatically",
			helptip: "Enter the name of a welcome template, without the curly brackets. A link to the given article will be added.",
			type: "string"
		},
		{
			name: "customWelcomeList",
			label: "Custom welcome templates to display",
			helptip: "You can add other welcome templates, or user subpages that are welcome templates (prefixed with \"User:\"). Don't forget that these templates are substituted onto user talk pages.",
			type: "customList",
			customListValueTitle: "Template name (no curly brackets)",
			customListLabelTitle: "Text to show in Welcome dialog"
		}
	]
},


{
	title: "Hidden",
	hidden: true,
	preferences: [
		// Kaizo.header.js: portlet setup
		{
			name: "portletArea",
			type: "string"
		},
		{
			name: "portletId",
			type: "string"
		},
		{
			name: "portletName",
			type: "string"
		},
		{
			name: "portletType",
			type: "string"
		},
		{
			name: "portletNext",
			type: "string"
		},
		// Kaizofluff.js: defines how many revision to query maximum, maximum possible is 50, default is 50
		{
			name: "revertMaxRevisions",
			type: "integer"
		},
		// Kaizobatchdelete.js: How many pages should be processed at a time
		{
			name: "batchdeleteChunks",
			type: "integer"
		},
		// Kaizobatchdelete.js: How many pages left in the process of being completed should allow a new batch to be initialized
		{
			name: "batchDeleteMinCutOff",
			type: "integer"
		},
		// Kaizobatchdelete.js: How many pages should be processed maximum
		{
			name: "batchMax",
			type: "integer"
		},
		// Kaizobatchprotect.js: How many pages should be processed at a time
		{
			name: "batchProtectChunks",
			type: "integer"
		},
		// Kaizobatchprotect.js: How many pages left in the process of being completed should allow a new batch to be initialized
		{
			name: "batchProtectMinCutOff",
			type: "integer"
		},
		// Kaizobatchundelete.js: How many pages should be processed at a time
		{
			name: "batchundeleteChunks",
			type: "integer"
		},
		// Kaizobatchundelete.js: How many pages left in the process of being completed should allow a new batch to be initialized
		{
			name: "batchUndeleteMinCutOff",
			type: "integer"
		}
	]
}

]; // end of Kaizo.config.sections

//{
//			name: "",
//			label: "",
//			type: ""
//		},


Kaizo.config.init = function KaizoconfigInit() {

	if ((mw.config.get("wgNamespaceNumber") === mw.config.get("wgNamespaceIds").project && mw.config.get("wgTitle") === "Kaizo/Preferences" ||
	    (mw.config.get("wgNamespaceNumber") === mw.config.get("wgNamespaceIds").user && mw.config.get("wgTitle").lastIndexOf("/Kaizo preferences") === (mw.config.get("wgTitle").length - 20))) &&
	    mw.config.get("wgAction") === "view") {
		// create the config page at Wikipedia:Kaizo/Preferences, and at user subpages (for testing purposes)

		if (!document.getElementById("Kaizo-config")) {
			return;  // maybe the page is misconfigured, or something - but any attempt to modify it will be pointless
		}

		// set style (the url() CSS function doesn't seem to work from wikicode - ?!)
		document.getElementById("Kaizo-config-titlebar").style.backgroundImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAkCAMAAAB%2FqqA%2BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEhQTFRFr73ZobTPusjdsMHZp7nVwtDhzNbnwM3fu8jdq7vUt8nbxtDkw9DhpbfSvMrfssPZqLvVztbno7bRrr7W1d%2Fs1N7qydXk0NjpkW7Q%2BgAAADVJREFUeNoMwgESQCAAAMGLkEIi%2FP%2BnbnbpdB59app5Vdg0sXAoMZCpGoFbK6ciuy6FX4ABAEyoAef0BXOXAAAAAElFTkSuQmCC)";

		var contentdiv = document.getElementById("Kaizo-config-content");
		contentdiv.textContent = "";  // clear children

		// let user know about possible conflict with monobook.js/vector.js file
		// (settings in that file will still work, but they will be overwritten by Kaizooptions.js settings)
		var contentnotice = document.createElement("p");
		// I hate innerHTML, but this is one thing it *is* good for...
		contentnotice.innerHTML = "<b>Before modifying your preferences here,</b> make sure you have removed any old <code>KaizoConfig</code> and <code>FriendlyConfig</code> settings from your <a href=\"" + mw.util.getUrl("Special:MyPage/skin.js") + "\" title=\"Special:MyPage/skin.js\">user JavaScript file</a>.";
		contentdiv.appendChild(contentnotice);

		// look and see if the user does in fact have any old settings in their skin JS file
		var skinjs = new Morebits.wiki.page("User:" + mw.config.get("wgUserName") + "/" + mw.config.get("skin") + ".js");
		skinjs.setCallbackParameters(contentnotice);
		skinjs.load(Kaizo.config.legacyPrefsNotice);

		// start a table of contents
		var toctable = document.createElement("table");
		toctable.className = "toc";
		toctable.style.marginLeft = "0.4em";
		var toctr = document.createElement("tr");
		var toctd = document.createElement("td");
		// create TOC title
		var toctitle = document.createElement("div");
		toctitle.id = "toctitle";
		var toch2 = document.createElement("h2");
		toch2.textContent = "Contents ";
		toctitle.appendChild(toch2);
		// add TOC show/hide link
		var toctoggle = document.createElement("span");
		toctoggle.className = "toctoggle";
		toctoggle.appendChild(document.createTextNode("["));
		var toctogglelink = document.createElement("a");
		toctogglelink.className = "internal";
		toctogglelink.setAttribute("href", "#tw-tocshowhide");
		toctogglelink.textContent = "hide";
		toctoggle.appendChild(toctogglelink);
		toctoggle.appendChild(document.createTextNode("]"));
		toctitle.appendChild(toctoggle);
		toctd.appendChild(toctitle);
		// create item container: this is what we add stuff to
		var tocul = document.createElement("ul");
		toctogglelink.addEventListener("click", function KaizoconfigTocToggle() {
			var $tocul = $(tocul);
			$tocul.toggle();
			if ($tocul.find(":visible").length) {
				toctogglelink.textContent = "hide";
			} else {
				toctogglelink.textContent = "show";
			}
		}, false);
		toctd.appendChild(tocul);
		toctr.appendChild(toctd);
		toctable.appendChild(toctr);
		contentdiv.appendChild(toctable);

		var tocnumber = 1;

		var contentform = document.createElement("form");
		contentform.setAttribute("action", "javascript:void(0)");  // was #tw-save - changed to void(0) to work around Chrome issue
		contentform.addEventListener("submit", Kaizo.config.save, true);
		contentdiv.appendChild(contentform);

		var container = document.createElement("table");
		container.style.width = "100%";
		contentform.appendChild(container);

		$(Kaizo.config.sections).each(function(sectionkey, section) {
			if (section.hidden || (section.adminOnly && !Morebits.userIsInGroup("sysop"))) {
				return true;  // i.e. "continue" in this context
			}

			var configgetter;  // retrieve the live config values
			if (section.inFriendlyConfig) {
				configgetter = Kaizo.getFriendlyPref;
			} else {
				configgetter = Kaizo.getPref;
			}

			// add to TOC
			var tocli = document.createElement("li");
			tocli.className = "toclevel-1";
			var toca = document.createElement("a");
			toca.setAttribute("href", "#Kaizo-config-section-" + tocnumber.toString());
			toca.appendChild(document.createTextNode(section.title));
			tocli.appendChild(toca);
			tocul.appendChild(tocli);

			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.setAttribute("colspan", "3");
			var heading = document.createElement("h4");
			heading.style.borderBottom = "1px solid gray";
			heading.style.marginTop = "0.2em";
			heading.id = "Kaizo-config-section-" + (tocnumber++).toString();
			heading.appendChild(document.createTextNode(section.title));
			cell.appendChild(heading);
			row.appendChild(cell);
			container.appendChild(row);

			var rowcount = 1;  // for row banding

			// add each of the preferences to the form
			$(section.preferences).each(function(prefkey, pref) {
				if (pref.adminOnly && !Morebits.userIsInGroup("sysop")) {
					return true;  // i.e. "continue" in this context
				}

				row = document.createElement("tr");
				row.style.marginBottom = "0.2em";
				// create odd row banding
				if (rowcount++ % 2 === 0) {
					row.style.backgroundColor = "rgba(128, 128, 128, 0.1)";
				}
				cell = document.createElement("td");

				var label, input;
				switch (pref.type) {

					case "boolean":  // create a checkbox
						cell.setAttribute("colspan", "2");

						label = document.createElement("label");
						input = document.createElement("input");
						input.setAttribute("type", "checkbox");
						input.setAttribute("id", pref.name);
						input.setAttribute("name", pref.name);
						if (configgetter(pref.name) === true) {
							input.setAttribute("checked", "checked");
						}
						label.appendChild(input);
						label.appendChild(document.createTextNode(" " + pref.label));
						cell.appendChild(label);
						break;

					case "string":  // create an input box
					case "integer":
						// add label to first column
						cell.style.textAlign = "right";
						cell.style.paddingRight = "0.5em";
						label = document.createElement("label");
						label.setAttribute("for", pref.name);
						label.appendChild(document.createTextNode(pref.label + ":"));
						cell.appendChild(label);
						row.appendChild(cell);

						// add input box to second column
						cell = document.createElement("td");
						cell.style.paddingRight = "1em";
						input = document.createElement("input");
						input.setAttribute("type", "text");
						input.setAttribute("id", pref.name);
						input.setAttribute("name", pref.name);
						if (pref.type === "integer") {
							input.setAttribute("size", 6);
							input.setAttribute("type", "number");
							input.setAttribute("step", "1");  // integers only
						}
						if (configgetter(pref.name)) {
							input.setAttribute("value", configgetter(pref.name));
						}
						cell.appendChild(input);
						break;

					case "enum":  // create a combo box
						// add label to first column
						// note: duplicates the code above, under string/integer
						cell.style.textAlign = "right";
						cell.style.paddingRight = "0.5em";
						label = document.createElement("label");
						label.setAttribute("for", pref.name);
						label.appendChild(document.createTextNode(pref.label + ":"));
						cell.appendChild(label);
						row.appendChild(cell);

						// add input box to second column
						cell = document.createElement("td");
						cell.style.paddingRight = "1em";
						input = document.createElement("select");
						input.setAttribute("id", pref.name);
						input.setAttribute("name", pref.name);
						$.each(pref.enumValues, function(enumvalue, enumdisplay) {
							var option = document.createElement("option");
							option.setAttribute("value", enumvalue);
							if (configgetter(pref.name) === enumvalue) {
								option.setAttribute("selected", "selected");
							}
							option.appendChild(document.createTextNode(enumdisplay));
							input.appendChild(option);
						});
						cell.appendChild(input);
						break;

					case "set":  // create a set of check boxes
						// add label first of all
						cell.setAttribute("colspan", "2");
						label = document.createElement("label");  // not really necessary to use a label element here, but we do it for consistency of styling
						label.appendChild(document.createTextNode(pref.label + ":"));
						cell.appendChild(label);

						var checkdiv = document.createElement("div");
						checkdiv.style.paddingLeft = "1em";
						var worker = function(itemkey, itemvalue) {
							var checklabel = document.createElement("label");
							checklabel.style.marginRight = "0.7em";
							checklabel.style.display = "inline-block";
							var check = document.createElement("input");
							check.setAttribute("type", "checkbox");
							check.setAttribute("id", pref.name + "_" + itemkey);
							check.setAttribute("name", pref.name + "_" + itemkey);
							if (configgetter(pref.name) && configgetter(pref.name).indexOf(itemkey) !== -1) {
								check.setAttribute("checked", "checked");
							}
							// cater for legacy integer array values for unlinkNamespaces (this can be removed a few years down the track...)
							if (pref.name === "unlinkNamespaces") {
								if (configgetter(pref.name) && configgetter(pref.name).indexOf(parseInt(itemkey, 10)) !== -1) {
									check.setAttribute("checked", "checked");
								}
							}
							checklabel.appendChild(check);
							checklabel.appendChild(document.createTextNode(itemvalue));
							checkdiv.appendChild(checklabel);
						};
						if (pref.setDisplayOrder) {
							// add check boxes according to the given display order
							$.each(pref.setDisplayOrder, function(itemkey, item) {
								worker(item, pref.setValues[item]);
							});
						} else {
							// add check boxes according to the order it gets fed to us (probably strict alphabetical)
							$.each(pref.setValues, worker);
						}
						cell.appendChild(checkdiv);
						break;

					case "customList":
						// add label to first column
						cell.style.textAlign = "right";
						cell.style.paddingRight = "0.5em";
						label = document.createElement("label");
						label.setAttribute("for", pref.name);
						label.appendChild(document.createTextNode(pref.label + ":"));
						cell.appendChild(label);
						row.appendChild(cell);

						// add button to second column
						cell = document.createElement("td");
						cell.style.paddingRight = "1em";
						var button = document.createElement("button");
						button.setAttribute("id", pref.name);
						button.setAttribute("name", pref.name);
						button.setAttribute("type", "button");
						button.addEventListener("click", Kaizo.config.listDialog.display, false);
						// use jQuery data on the button to store the current config value
						$(button).data({
							value: configgetter(pref.name),
							pref: pref,
							inFriendlyConfig: section.inFriendlyConfig
						});
						button.appendChild(document.createTextNode("Edit items"));
						cell.appendChild(button);
						break;

					default:
						alert("Kaizoconfig: unknown data type for preference " + pref.name);
						break;
				}
				row.appendChild(cell);

				// add help tip
				cell = document.createElement("td");
				cell.style.fontSize = "90%";

				cell.style.color = "gray";
				if (pref.helptip) {
					cell.innerHTML = pref.helptip;
				}
				// add reset link (custom lists don't need this, as their config value isn't displayed on the form)
				if (pref.type !== "customList") {
					var resetlink = document.createElement("a");
					resetlink.setAttribute("href", "#tw-reset");
					resetlink.setAttribute("id", "Kaizo-config-reset-" + pref.name);
					resetlink.addEventListener("click", Kaizo.config.resetPrefLink, false);
					if (resetlink.style.styleFloat) {  // IE (inc. IE9)
						resetlink.style.styleFloat = "right";
					} else {  // standards
						resetlink.style.cssFloat = "right";
					}
					resetlink.style.margin = "0 0.6em";
					resetlink.appendChild(document.createTextNode("Reset"));
					cell.appendChild(resetlink);
				}
				row.appendChild(cell);

				container.appendChild(row);
				return true;
			});
			return true;
		});

		var footerbox = document.createElement("div");
		footerbox.setAttribute("id", "Kaizo-config-buttonpane");
		footerbox.style.backgroundColor = "#BCCADF";
		footerbox.style.padding = "0.5em";
		var button = document.createElement("button");
		button.setAttribute("id", "Kaizo-config-submit");
		button.setAttribute("type", "submit");
		button.appendChild(document.createTextNode("Save changes"));
		footerbox.appendChild(button);
		var footerspan = document.createElement("span");
		footerspan.className = "plainlinks";
		footerspan.style.marginLeft = "2.4em";
		footerspan.style.fontSize = "90%";
		var footera = document.createElement("a");
		footera.setAttribute("href", "#tw-reset-all");
		footera.setAttribute("id", "Kaizo-config-resetall");
		footera.addEventListener("click", Kaizo.config.resetAllPrefs, false);
		footera.appendChild(document.createTextNode("Restore defaults"));
		footerspan.appendChild(footera);
		footerbox.appendChild(footerspan);
		contentform.appendChild(footerbox);

		// since all the section headers exist now, we can try going to the requested anchor
		if (location.hash) {
			location.hash = location.hash;
		}

	} else if (mw.config.get("wgNamespaceNumber") === mw.config.get("wgNamespaceIds").user) {

		var box = document.createElement("div");
		box.setAttribute("id", "Kaizo-config-headerbox");
		box.style.border = "1px #f60 solid";
		box.style.background = "#fed";
		box.style.padding = "0.6em";
		box.style.margin = "0.5em auto";
		box.style.textAlign = "center";

		var link;
		if (mw.config.get("wgTitle") === mw.config.get("wgUserName") + "/Kaizooptions.js") {
			// place "why not try the preference panel" notice
			box.style.fontWeight = "bold";
			box.style.width = "80%";
			box.style.borderWidth = "2px";

			if (mw.config.get("wgArticleId") > 0) {  // page exists
				box.appendChild(document.createTextNode("This page contains your Kaizo preferences. You can change them using the "));
			} else {  // page does not exist
				box.appendChild(document.createTextNode("You can customize Kaizo to suit your preferences by using the "));
			}
			link = document.createElement("a");
			link.setAttribute("href", mw.util.getUrl(mw.config.get("wgFormattedNamespaces")[mw.config.get("wgNamespaceIds").project] + ":Kaizo/Preferences") );
			link.appendChild(document.createTextNode("Kaizo preferences panel"));
			box.appendChild(link);
			box.appendChild(document.createTextNode(", or by editing this page."));
			$(box).insertAfter($("#contentSub"));

		} else if (mw.config.get("wgTitle").indexOf(mw.config.get("wgUserName")) === 0 &&
				mw.config.get("wgPageName").lastIndexOf(".js") === mw.config.get("wgPageName").length - 3) {
			// place "Looking for Kaizo options?" notice
			box.style.width = "60%";

			box.appendChild(document.createTextNode("If you want to set Kaizo preferences, you can use the "));
			link = document.createElement("a");
			link.setAttribute("href", mw.util.getUrl(mw.config.get("wgFormattedNamespaces")[mw.config.get("wgNamespaceIds").project] + ":Kaizo/Preferences") );
			link.appendChild(document.createTextNode("Kaizo preferences panel"));
			box.appendChild(link);
			box.appendChild(document.createTextNode("."));
			$(box).insertAfter($("#contentSub"));
		}
	}
};

// Morebits.wiki.page callback from init code
Kaizo.config.legacyPrefsNotice = function KaizoconfigLegacyPrefsNotice(pageobj) {
	var text = pageobj.getPageText();
	var contentnotice = pageobj.getCallbackParameters();
	if (text.indexOf("KaizoConfig") !== -1 || text.indexOf("FriendlyConfig") !== -1) {
		contentnotice.innerHTML = '<table class="plainlinks ombox ombox-content"><tr><td class="mbox-image">' +
			'<img alt="" src="http://upload.wikimedia.org/wikipedia/en/3/38/Imbox_content.png" /></td>' +
			'<td class="mbox-text"><p><big><b>Before modifying your settings here,</b> you must remove your old Kaizo and Friendly settings from your personal skin JavaScript.</big></p>' +
			'<p>To do this, you can <a href="' + mw.config.get("wgScript") + '?title=User:' + encodeURIComponent(mw.config.get("wgUserName")) + '/' + mw.config.get("skin") + '.js&action=edit" target="_tab"><b>edit your personal JavaScript</b></a>, removing all lines of code that refer to <code>KaizoConfig</code> and <code>FriendlyConfig</code>.</p>' +
			'</td></tr></table>';
	} else {
		$(contentnotice).remove();
	}
};

// custom list-related stuff

Kaizo.config.listDialog = {};

Kaizo.config.listDialog.addRow = function KaizoconfigListDialogAddRow(dlgtable, value, label) {
	var contenttr = document.createElement("tr");
	// "remove" button
	var contenttd = document.createElement("td");
	var removeButton = document.createElement("button");
	removeButton.setAttribute("type", "button");
	removeButton.addEventListener("click", function() { $(contenttr).remove(); }, false);
	removeButton.textContent = "Remove";
	contenttd.appendChild(removeButton);
	contenttr.appendChild(contenttd);

	// value input box
	contenttd = document.createElement("td");
	var input = document.createElement("input");
	input.setAttribute("type", "text");
	input.className = "Kaizo-config-customlist-value";
	input.style.width = "97%";
	if (value) {
		input.setAttribute("value", value);
	}
	contenttd.appendChild(input);
	contenttr.appendChild(contenttd);

	// label input box
	contenttd = document.createElement("td");
	input = document.createElement("input");
	input.setAttribute("type", "text");
	input.className = "Kaizo-config-customlist-label";
	input.style.width = "98%";
	if (label) {
		input.setAttribute("value", label);
	}
	contenttd.appendChild(input);
	contenttr.appendChild(contenttd);

	dlgtable.appendChild(contenttr);
};

Kaizo.config.listDialog.display = function KaizoconfigListDialogDisplay(e) {
	var $prefbutton = $(e.target);
	var curvalue = $prefbutton.data("value");
	var curpref = $prefbutton.data("pref");

	var dialog = new Morebits.simpleWindow(720, 400);
	dialog.setTitle(curpref.label);
	dialog.setScriptName("Kaizo preferences");

	var dialogcontent = document.createElement("div");
	var dlgtable = document.createElement("table");
	dlgtable.className = "wikitable";
	dlgtable.style.margin = "1.4em 1em";
	dlgtable.style.width = "auto";

	var dlgtbody = document.createElement("tbody");

	// header row
	var dlgtr = document.createElement("tr");
	// top-left cell
	var dlgth = document.createElement("th");
	dlgth.style.width = "5%";
	dlgtr.appendChild(dlgth);
	// value column header
	dlgth = document.createElement("th");
	dlgth.style.width = "35%";
	dlgth.textContent = (curpref.customListValueTitle ? curpref.customListValueTitle : "Value");
	dlgtr.appendChild(dlgth);
	// label column header
	dlgth = document.createElement("th");
	dlgth.style.width = "60%";
	dlgth.textContent = (curpref.customListLabelTitle ? curpref.customListLabelTitle : "Label");
	dlgtr.appendChild(dlgth);
	dlgtbody.appendChild(dlgtr);

	// content rows
	var gotRow = false;
	$.each(curvalue, function(k, v) {
		gotRow = true;
		Kaizo.config.listDialog.addRow(dlgtbody, v.value, v.label);
	});
	// if there are no values present, add a blank row to start the user off
	if (!gotRow) {
		Kaizo.config.listDialog.addRow(dlgtbody);
	}

	// final "add" button
	var dlgtfoot = document.createElement("tfoot");
	dlgtr = document.createElement("tr");
	var dlgtd = document.createElement("td");
	dlgtd.setAttribute("colspan", "3");
	var addButton = document.createElement("button");
	addButton.style.minWidth = "8em";
	addButton.setAttribute("type", "button");
	addButton.addEventListener("click", function(e) {
		Kaizo.config.listDialog.addRow(dlgtbody);
	}, false);
	addButton.textContent = "Add";
	dlgtd.appendChild(addButton);
	dlgtr.appendChild(dlgtd);
	dlgtfoot.appendChild(dlgtr);

	dlgtable.appendChild(dlgtbody);
	dlgtable.appendChild(dlgtfoot);
	dialogcontent.appendChild(dlgtable);

	// buttonpane buttons: [Save changes] [Reset] [Cancel]
	var button = document.createElement("button");
	button.setAttribute("type", "submit");  // so Morebits.simpleWindow puts the button in the button pane
	button.addEventListener("click", function(e) {
		Kaizo.config.listDialog.save($prefbutton, dlgtbody);
		dialog.close();
	}, false);
	button.textContent = "Save changes";
	dialogcontent.appendChild(button);
	button = document.createElement("button");
	button.setAttribute("type", "submit");  // so Morebits.simpleWindow puts the button in the button pane
	button.addEventListener("click", function(e) {
		Kaizo.config.listDialog.reset($prefbutton, dlgtbody);
	}, false);
	button.textContent = "Reset";
	dialogcontent.appendChild(button);
	button = document.createElement("button");
	button.setAttribute("type", "submit");  // so Morebits.simpleWindow puts the button in the button pane
	button.addEventListener("click", function(e) {
		dialog.close();  // the event parameter on this function seems to be broken
	}, false);
	button.textContent = "Cancel";
	dialogcontent.appendChild(button);

	dialog.setContent(dialogcontent);
	dialog.display();
};

// Resets the data value, re-populates based on the new (default) value, then saves the
// old data value again (less surprising behaviour)
Kaizo.config.listDialog.reset = function KaizoconfigListDialogReset(button, tbody) {
	// reset value on button
	var $button = $(button);
	var curpref = $button.data("pref");
	var oldvalue = $button.data("value");
	Kaizo.config.resetPref(curpref, $button.data("inFriendlyConfig"));

	// reset form
	var $tbody = $(tbody);
	$tbody.find("tr").slice(1).remove();  // all rows except the first (header) row
	// add the new values
	var curvalue = $button.data("value");
	$.each(curvalue, function(k, v) {
		Kaizo.config.listDialog.addRow(tbody, v.value, v.label);
	});

	// save the old value
	$button.data("value", oldvalue);
};

Kaizo.config.listDialog.save = function KaizoconfigListDialogSave(button, tbody) {
	var result = [];
	var current = {};
	$(tbody).find('input[type="text"]').each(function(inputkey, input) {
		if ($(input).hasClass("Kaizo-config-customlist-value")) {
			current = { value: input.value };
		} else {
			current.label = input.value;
			// exclude totally empty rows
			if (current.value || current.label) {
				result.push(current);
			}
		}
	});
	$(button).data("value", result);
};

// reset/restore defaults

Kaizo.config.resetPrefLink = function KaizoconfigResetPrefLink(e) {
	var wantedpref = e.target.id.substring(21); // "Kaizo-config-reset-" prefix is stripped

	// search tactics
	$(Kaizo.config.sections).each(function(sectionkey, section) {
		if (section.hidden || (section.adminOnly && !Morebits.userIsInGroup("sysop"))) {
			return true;  // continue: skip impossibilities
		}

		var foundit = false;

		$(section.preferences).each(function(prefkey, pref) {
			if (pref.name !== wantedpref) {
				return true;  // continue
			}
			Kaizo.config.resetPref(pref, section.inFriendlyConfig);
			foundit = true;
			return false;  // break
		});

		if (foundit) {
			return false;  // break
		}
	});
	return false;  // stop link from scrolling page
};

Kaizo.config.resetPref = function KaizoconfigResetPref(pref, inFriendlyConfig) {
	switch (pref.type) {

		case "boolean":
			document.getElementById(pref.name).checked = (inFriendlyConfig ?
				Kaizo.defaultConfig.friendly[pref.name] : Kaizo.defaultConfig.Kaizo[pref.name]);
			break;

		case "string":
		case "integer":
		case "enum":
			document.getElementById(pref.name).value = (inFriendlyConfig ?
				Kaizo.defaultConfig.friendly[pref.name] : Kaizo.defaultConfig.Kaizo[pref.name]);
			break;

		case "set":
			$.each(pref.setValues, function(itemkey, itemvalue) {
				if (document.getElementById(pref.name + "_" + itemkey)) {
					document.getElementById(pref.name + "_" + itemkey).checked = ((inFriendlyConfig ?
						Kaizo.defaultConfig.friendly[pref.name] : Kaizo.defaultConfig.Kaizo[pref.name]).indexOf(itemkey) !== -1);
				}
			});
			break;

		case "customList":
			$(document.getElementById(pref.name)).data("value", (inFriendlyConfig ?
				Kaizo.defaultConfig.friendly[pref.name] : Kaizo.defaultConfig.Kaizo[pref.name]));
			break;

		default:
			alert("Kaizoconfig: unknown data type for preference " + pref.name);
			break;
	}
};

Kaizo.config.resetAllPrefs = function KaizoconfigResetAllPrefs() {
	// no confirmation message - the user can just refresh/close the page to abort
	$(Kaizo.config.sections).each(function(sectionkey, section) {
		if (section.hidden || (section.adminOnly && !Morebits.userIsInGroup("sysop"))) {
			return true;  // continue: skip impossibilities
		}
		$(section.preferences).each(function(prefkey, pref) {
			if (!pref.adminOnly || Morebits.userIsInGroup("sysop")) {
				Kaizo.config.resetPref(pref, section.inFriendlyConfig);
			}
		});
		return true;
	});
	return false;  // stop link from scrolling page
};

Kaizo.config.save = function KaizoconfigSave(e) {
	Morebits.status.init( document.getElementById("Kaizo-config-content") );

	Morebits.wiki.actionCompleted.notice = "Save";

	var userjs = mw.config.get("wgFormattedNamespaces")[mw.config.get("wgNamespaceIds").user] + ":" + mw.config.get("wgUserName") + "/Kaizooptions.js";
	var wikipedia_page = new Morebits.wiki.page(userjs, "Saving preferences to " + userjs);
	wikipedia_page.setCallbackParameters(e.target);
	wikipedia_page.load(Kaizo.config.writePrefs);

	return false;
};

Kaizo.config.writePrefs = function KaizoconfigWritePrefs(pageobj) {
	var form = pageobj.getCallbackParameters();
	var statelem = pageobj.getStatusElement();

	// this is the object which gets serialized into JSON
	var newConfig = {
		Kaizo: {},
		friendly: {}
	};

	// keeping track of all preferences that we encounter
	// any others that are set in the user's current config are kept
	// this way, preferences that this script doesn't know about are not lost
	// (it does mean obsolete prefs will never go away, but... ah well...)
	var foundKaizoPrefs = [], foundFriendlyPrefs = [];

	// a comparison function is needed later on
	// it is just enough for our purposes (i.e. comparing strings, numbers, booleans,
	// arrays of strings, and arrays of { value, label })
	// and it is not very robust: e.g. compare([2], ["2"]) === true, and
	// compare({}, {}) === false, but it's good enough for our purposes here
	var compare = function(a, b) {
		if ($.isArray(a)) {
			if (a.length !== b.length) {
				return false;
			}
			var asort = a.sort(), bsort = b.sort();
			for (var i = 0; asort[i]; ++i) {
				// comparison of the two properties of custom lists
				if ((typeof asort[i] === "object") && (asort[i].label !== bsort[i].label ||
					asort[i].value !== bsort[i].value)) {
					return false;
				} else if (asort[i].toString() !== bsort[i].toString()) { 
					return false;
				}
			}
			return true;
		} else {
			return a === b;
		}
	};

	$(Kaizo.config.sections).each(function(sectionkey, section) {
		if (section.adminOnly && !Morebits.userIsInGroup("sysop")) {
			return;  // i.e. "continue" in this context
		}

		// reach each of the preferences from the form
		$(section.preferences).each(function(prefkey, pref) {
			var userValue;  // = undefined

			// only read form values for those prefs that have them
			if (!section.hidden && (!pref.adminOnly || Morebits.userIsInGroup("sysop"))) {
				switch (pref.type) {

					case "boolean":  // read from the checkbox
						userValue = form[pref.name].checked;
						break;

					case "string":  // read from the input box or combo box
					case "enum":
						userValue = form[pref.name].value;
						break;

					case "integer":  // read from the input box
						userValue = parseInt(form[pref.name].value, 10);
						if (isNaN(userValue)) {
							Morebits.status.warn("Saving", "The value you specified for " + pref.name + " (" + pref.value + ") was invalid.  The save will continue, but the invalid data value will be skipped.");
							userValue = null;
						}
						break;

					case "set":  // read from the set of check boxes
						userValue = [];
						if (pref.setDisplayOrder) {
							// read only those keys specified in the display order
							$.each(pref.setDisplayOrder, function(itemkey, item) {
								if (form[pref.name + "_" + item].checked) {
									userValue.push(item);
								}
							});
						} else {
							// read all the keys in the list of values
							$.each(pref.setValues, function(itemkey, itemvalue) {
								if (form[pref.name + "_" + itemkey].checked) {
									userValue.push(itemkey);
								}
							});
						}
						break;

					case "customList":  // read from the jQuery data stored on the button object
						userValue = $(form[pref.name]).data("value");
						break;

					default:
						alert("Kaizoconfig: unknown data type for preference " + pref.name);
						break;
				}
			}

			// only save those preferences that are *different* from the default
			if (section.inFriendlyConfig) {
				if (userValue !== undefined && !compare(userValue, Kaizo.defaultConfig.friendly[pref.name])) {
					newConfig.friendly[pref.name] = userValue;
				}
				foundFriendlyPrefs.push(pref.name);
			} else {
				if (userValue !== undefined && !compare(userValue, Kaizo.defaultConfig.Kaizo[pref.name])) {
					newConfig.Kaizo[pref.name] = userValue;
				}
				foundKaizoPrefs.push(pref.name);
			}
		});
	});

	if (Kaizo.prefs) {
		$.each(Kaizo.prefs.Kaizo, function(tkey, tvalue) {
			if (foundKaizoPrefs.indexOf(tkey) === -1) {
				newConfig.Kaizo[tkey] = tvalue;
			}
		});
		$.each(Kaizo.prefs.friendly, function(fkey, fvalue) {
			if (foundFriendlyPrefs.indexOf(fkey) === -1) {
				newConfig.friendly[fkey] = fvalue;
			}
		});
	}

	var text =
		"// Kaizooptions.js: personal Kaizo preferences file\n" +
		"//\n" +
		"// NOTE: The easiest way to change your Kaizo preferences is by using the\n" +
		"// Kaizo preferences panel, at [[" + mw.config.get("wgPageName") + "]].\n" +
		"//\n" +
		"// This file is AUTOMATICALLY GENERATED.  Any changes you make (aside from\n" +
		"// changing the configuration parameters in a valid-JavaScript way) will be\n" +
		"// overwritten the next time you click \"save\" in the Kaizo preferences\n" +
		"// panel.  If modifying this file, make sure to use correct JavaScript.\n" +
		"\n" +
		"window.Kaizo.prefs = ";
	text += JSON.stringify(newConfig, null, 2);
	text +=
		";\n" +
		"\n" +
		"// End of Kaizooptions.js\n";

	pageobj.setPageText(text);
	pageobj.setEditSummary("Saving Kaizo preferences: automatic edit from [[" + mw.config.get("wgPageName") + "]] ([[mh:dev:Kaizo|TW]])");
	pageobj.setCreateOption("recreate");
	pageobj.save(Kaizo.config.saveSuccess);
};

Kaizo.config.saveSuccess = function KaizoconfigSaveSuccess(pageobj) {
	pageobj.getStatusElement().info("successful");

	var noticebox = document.createElement("div");
	noticebox.className = "successbox";
	noticebox.style.fontSize = "100%";
	noticebox.style.marginTop = "2em";
	noticebox.innerHTML = "<p><b>Your Kaizo preferences have been saved.</b></p><p>To see the changes, you will need to <b>clear your browser cache entirely</b> (see <a href=\"" + mw.util.getUrl("WP:BYPASS") + "\" title=\"WP:BYPASS\">WP:BYPASS</a> for instructions).</p>";
	Morebits.status.root.appendChild(noticebox);
	var noticeclear = document.createElement("br");
	noticeclear.style.clear = "both";
	Morebits.status.root.appendChild(noticeclear);
};


/*
 ****************************************
 *** Kaizodiff.js: Diff module
 ****************************************
 * Mode of invocation:     Tab on non-diff pages ("Last"); tabs on diff pages ("Since", "Since mine", "Current")
 * Active on:              Existing non-special pages
 * Config directives in:   KaizoConfig
 */

Kaizo.diff = function Kaizodiff() { 
	if( mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId') ) {
		return;
	}

	var query = {
		'title': mw.config.get('wgPageName'),
		'diff': 'cur',
		'oldid': 'prev'
	};

	twAddPortletLink( mw.util.wikiScript("index")+ "?" + $.param( query ), 'Last', 'tw-lastdiff', 'Show most recent diff' );

	// Show additional tabs only on diff pages
	if (Morebits.queryString.exists('diff')) {
		twAddPortletLink(function(){ Kaizo.diff.evaluate(false); }, 'Since', 'tw-since', 'Show difference between last diff and the revision made by previous user' );
		twAddPortletLink( function(){ Kaizo.diff.evaluate(true); }, 'Since mine', 'tw-sincemine', 'Show difference between last diff and my last revision' );

		var oldid = /oldid=(.+)/.exec($('#mw-diff-ntitle1').find('strong a').first().attr("href"))[1];
		query = {
			'title': mw.config.get('wgPageName'),
			'diff': 'cur',
			'oldid' : oldid
		};
		twAddPortletLink( mw.util.wikiScript("index")+ "?" + $.param( query ), 'Current', 'tw-curdiff', 'Show difference to current revision' );
	}
};

Kaizo.diff.evaluate = function KaizodiffEvaluate(me) {

	var user;
	if( me ) {
		user = mw.config.get('wgUserName');
	} else {
		var node = document.getElementById( 'mw-diff-ntitle2' );
		if( ! node ) {
			// nothing to do?
			return;
		}
		user = $(node).find('a').first().text();
	}
	var query = {
		'prop': 'revisions',
		'action': 'query',
		'titles': mw.config.get('wgPageName'),
		'rvlimit': 1, 
		'rvprop': [ 'ids', 'user' ],
		'rvstartid': mw.config.get('wgCurRevisionId') - 1, // i.e. not the current one
		'rvuser': user
	};
	Morebits.status.init( document.getElementById('bodyContent') );
	var wikipedia_api = new Morebits.wiki.api( 'Grabbing data of initial contributor', query, Kaizo.diff.callbacks.main );
	wikipedia_api.params = { user: user };
	wikipedia_api.post();
};

Kaizo.diff.callbacks = {
	main: function( self ) {
		var xmlDoc = self.responseXML;
		var revid = $(xmlDoc).find('rev').attr('revid');

		if( ! revid ) {
			self.statelem.error( 'no suitable earlier revision found, or ' + self.params.user + ' is the only contributor. Aborting.' );
			return;
		}
		var query = {
			'title': mw.config.get('wgPageName'),
			'oldid': revid,
			'diff': mw.config.get('wgCurRevisionId')
		};
		window.location = mw.util.wikiScript('index') + '?' + Morebits.queryString.create( query );
	}
};
/*
 ****************************************
 *** Kaizofluff.js: Revert/rollback module
 ****************************************
 * Mode of invocation:     Links on history, contributions, and diff pages
 * Active on:              Diff pages, history pages, contributions pages
 * Config directives in:   KaizoConfig
 */

/**
 Kaizofluff revert and antivandalism utility
 */

Kaizo.fluff = {
	auto: function() {
		if( parseInt( Morebits.queryString.get('oldid'), 10) !== mw.config.get('wgCurRevisionId') ) {
			// not latest revision
			alert("Can't rollback, page has changed in the meantime.");
			return;
		}

		var vandal = $("#mw-diff-ntitle2").find("a.mw-userlink").text();

		Kaizo.fluff.revert( Morebits.queryString.get( 'Kaizorevert' ), vandal, true );
	},
	normal: function() {

		var spanTag = function( color, content ) {
			var span = document.createElement( 'span' );
			span.style.color = color;
			span.appendChild( document.createTextNode( content ) );
			return span;
		};

		if( mw.config.get('wgNamespaceNumber') === -1 && mw.config.get('wgCanonicalSpecialPageName') === "Contributions" ) {
			//Get the username these contributions are for
			var lastLogNode = $('#contentSub').find('a[title^="Special:Log"]').last();
			if(!lastLogNode) return;
			var logMatch = /wiki\/Special:Log\/(.+)$/.exec(
				lastLogNode ? lastLogNode.attr("href").replace(/_/g, "%20") : ''
			);
			if(!logMatch) return;
			username = decodeURIComponent(logMatch[1]);
			if( Kaizo.getPref('showRollbackLinks').indexOf('contribs') !== -1 || 
				( mw.config.get('wgUserName') !== username && Kaizo.getPref('showRollbackLinks').indexOf('others') !== -1 ) || 
				( mw.config.get('wgUserName') === username && Kaizo.getPref('showRollbackLinks').indexOf('mine') !== -1 ) ) {
				var list = $("#bodyContent").find("ul li:has(span.mw-uctop)");

				var revNode = document.createElement('strong');
				var revLink = document.createElement('a');
				revLink.appendChild( spanTag( 'Black', '[' ) );
				revLink.appendChild( spanTag( 'SteelBlue', 'rollback' ) );
				revLink.appendChild( spanTag( 'Black', ']' ) );
				revNode.appendChild(revLink);

				var revVandNode = document.createElement('strong');
				var revVandLink = document.createElement('a');
				revVandLink.appendChild( spanTag( 'Black', '[' ) );
				revVandLink.appendChild( spanTag( 'Red', 'vandalism' ) );
				revVandLink.appendChild( spanTag( 'Black', ']' ) );
				revVandNode.appendChild(revVandLink);

				list.each(function(key, current) {
					var href = $(current).children("a:eq(1)").attr("href");
					current.appendChild( document.createTextNode(' ') );
					var tmpNode = revNode.cloneNode( true );
					tmpNode.firstChild.setAttribute( 'href', href + '&' + Morebits.queryString.create( { 'Kaizorevert': 'norm' } ) );
					current.appendChild( tmpNode );
					current.appendChild( document.createTextNode(' ') );
					tmpNode = revVandNode.cloneNode( true );
					tmpNode.firstChild.setAttribute( 'href', href + '&' + Morebits.queryString.create( { 'Kaizorevert': 'vand' } ) );
					current.appendChild( tmpNode );
				});
			}
		} else {
                        
			if( mw.config.get('wgCanonicalSpecialPageName') === "Undelete" ) {
				//You can't rollback deleted pages!
				return;
			}

			var body = document.getElementById('bodyContent');

			var firstRev = $("div.firstrevisionheader").length;
			if( firstRev ) {
				// we have first revision here, nothing to do.
				return;
			}

			var otitle, ntitle;
			try {
				var otitle1 = document.getElementById('mw-diff-otitle1'); 
				var ntitle1 = document.getElementById('mw-diff-ntitle1'); 
				if (!otitle1 || !ntitle1) {
					return;
				}
				otitle = otitle1.parentNode;
				ntitle = ntitle1.parentNode;
			} catch( e ) {
				// no old, nor new title, nothing to do really, return;
				return;
			}

			var old_rev_url = $("#mw-diff-otitle1").find("strong a").attr("href");

			// Lets first add a [edit this revision] link
			var query = new Morebits.queryString( old_rev_url.split( '?', 2 )[1] );

			var oldrev = query.get('oldid');

			var revertToRevision = document.createElement('div');
			revertToRevision.setAttribute( 'id', 'tw-revert-to-orevision' );
			revertToRevision.style.fontWeight = 'bold';

			var revertToRevisionLink = revertToRevision.appendChild( document.createElement('a') );
			revertToRevisionLink.href = "#";
			$(revertToRevisionLink).click(function(){
				Kaizo.fluff.revertToRevision(oldrev);
			});
			revertToRevisionLink.appendChild( spanTag( 'Black', '[' ) );
			revertToRevisionLink.appendChild( spanTag( 'SaddleBrown', 'restore this version' ) );
			revertToRevisionLink.appendChild( spanTag( 'Black', ']' ) );

			otitle.insertBefore( revertToRevision, otitle.firstChild );

			if( document.getElementById('differences-nextlink') ) {
				// Not latest revision
				curVersion = false;

				var new_rev_url = $("#mw-diff-ntitle1").find("strong a").attr("href");
				query = new Morebits.queryString( new_rev_url.split( '?', 2 )[1] );
				var newrev = query.get('oldid');
				revertToRevision = document.createElement('div');
				revertToRevision.setAttribute( 'id', 'tw-revert-to-nrevision' );
				revertToRevision.style.fontWeight = 'bold';
				revertToRevisionLink = revertToRevision.appendChild( document.createElement('a') );
				revertToRevisionLink.href = "#";
				$(revertToRevisionLink).click(function(){
					Kaizo.fluff.revertToRevision(newrev);
				});
				revertToRevisionLink.appendChild( spanTag( 'Black', '[' ) );
				revertToRevisionLink.appendChild( spanTag( 'SaddleBrown', 'restore this version' ) );
				revertToRevisionLink.appendChild( spanTag( 'Black', ']' ) );
				ntitle.insertBefore( revertToRevision, ntitle.firstChild );

				return;
			}
			if( Kaizo.getPref('showRollbackLinks').indexOf('diff') !== -1 ) {
				var vandal = $("#mw-diff-ntitle2").find("a").first().text();

				var revertNode = document.createElement('div');
				revertNode.setAttribute( 'id', 'tw-revert' );

				var agfNode = document.createElement('strong');
				var vandNode = document.createElement('strong');
				var normNode = document.createElement('strong');

				var agfLink = document.createElement('a');
				var vandLink = document.createElement('a');
				var normLink = document.createElement('a');

				agfLink.href = "#"; 
				vandLink.href = "#"; 
				normLink.href = "#"; 
				$(agfLink).click(function(){
					Kaizo.fluff.revert('agf', vandal);
				});
				$(vandLink).click(function(){
					Kaizo.fluff.revert('vand', vandal);
				});
				$(normLink).click(function(){
					Kaizo.fluff.revert('norm', vandal);
				});

				agfLink.appendChild( spanTag( 'Black', '[' ) );
				agfLink.appendChild( spanTag( 'DarkOliveGreen', 'rollback (AGF)' ) );
				agfLink.appendChild( spanTag( 'Black', ']' ) );

				vandLink.appendChild( spanTag( 'Black', '[' ) );
				vandLink.appendChild( spanTag( 'Red', 'rollback (VANDAL)' ) );
				vandLink.appendChild( spanTag( 'Black', ']' ) );

				normLink.appendChild( spanTag( 'Black', '[' ) );
				normLink.appendChild( spanTag( 'SteelBlue', 'rollback' ) );
				normLink.appendChild( spanTag( 'Black', ']' ) );

				agfNode.appendChild(agfLink);
				vandNode.appendChild(vandLink);
				normNode.appendChild(normLink);

				revertNode.appendChild( agfNode );
				revertNode.appendChild( document.createTextNode(' || ') );
				revertNode.appendChild( normNode );
				revertNode.appendChild( document.createTextNode(' || ') );
				revertNode.appendChild( vandNode );

				ntitle.insertBefore( revertNode, ntitle.firstChild );
			}
		}
	}
};

Kaizo.fluff.revert = function revertPage( type, vandal, autoRevert, rev, page ) {
	if (mw.util.isIPv6Address(vandal)) {
		vandal = Morebits.sanitizeIPv6(vandal);
	}

	var pagename = page || mw.config.get('wgPageName');
	var revid = rev || mw.config.get('wgCurRevisionId');

	Morebits.status.init( document.getElementById('bodyContent') );
	var params = {
		type: type,
		user: vandal,
		pagename: pagename,
		revid: revid,
		autoRevert: !!autoRevert
	};
	var query = {
		'action': 'query',
		'prop': ['info', 'revisions'],
		'titles': pagename,
		'rvlimit': 50, // max possible
		'rvprop': [ 'ids', 'timestamp', 'user', 'comment' ],
		'curtimestamp': '',
		'meta': 'tokens',
		'type': 'csrf'
	};
	var wikipedia_api = new Morebits.wiki.api( 'Grabbing data of earlier revisions', query, Kaizo.fluff.callbacks.main );
	wikipedia_api.params = params;
	wikipedia_api.post();
};

Kaizo.fluff.revertToRevision = function revertToRevision( oldrev ) {

	Morebits.status.init( document.getElementById('bodyContent') );

	var query = {
		'action': 'query',
		'prop': ['info',  'revisions'],
		'titles': mw.config.get('wgPageName'),
		'rvlimit': 1,
		'rvstartid': oldrev,
		'rvprop': [ 'ids', 'timestamp', 'user', 'comment' ],
		'curtimestamp': '',
		'meta': 'tokens',
		'type': 'csrf',
		'format': 'xml'
	};
	var wikipedia_api = new Morebits.wiki.api( 'Grabbing data of the earlier revision', query, Kaizo.fluff.callbacks.toRevision.main );
	wikipedia_api.params = { rev: oldrev };
	wikipedia_api.post();
};

Kaizo.fluff.userIpLink = function( user ) {
	return (Morebits.isIPAddress(user) ? "[[Special:Contributions/" : "[[User:" ) + user + "|" + user + "]]";
};

Kaizo.fluff.callbacks = {
	toRevision: {
		main: function( self ) {
			var xmlDoc = self.responseXML;

			var lastrevid = parseInt( $(xmlDoc).find('page').attr('lastrevid'), 10);
			var touched = $(xmlDoc).find('page').attr('touched');
			var starttimestamp = $(xmlDoc).find('api').attr('curtimestamp');
			var edittoken = $(xmlDoc).find('tokens').attr('csrftoken');
			var revertToRevID = $(xmlDoc).find('rev').attr('revid');
			var revertToUser = $(xmlDoc).find('rev').attr('user');

			if (revertToRevID !== self.params.rev) {
				self.statitem.error( 'The retrieved revision does not match the requested revision.  Aborting.' );
				return;
			}

			var optional_summary = prompt( "Please specify a reason for the revert:                                ", "" );  // padded out to widen prompt in Firefox
			if (optional_summary === null)
			{
				self.statelem.error( 'Aborted by user.' );
				return;
			}
			var summary = "Reverted to revision " + revertToRevID + " by " + revertToUser + (optional_summary ? ": " + optional_summary : '') + "." +
				Kaizo.getPref('summaryAd');
		
			var query = { 
				'action': 'edit',
				'title': mw.config.get('wgPageName'),
				'summary': summary,
				'token': edittoken,
				'undo': lastrevid,
				'undoafter': revertToRevID,
				'basetimestamp': touched,
				'starttimestamp': starttimestamp,
				'watchlist': Kaizo.getPref('watchRevertedPages').indexOf( self.params.type ) !== -1 ? 'watch' : undefined,
				'minor': Kaizo.getPref('markRevertedPagesAsMinor').indexOf( self.params.type ) !== -1  ? true : undefined
			};

			Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
			Morebits.wiki.actionCompleted.notice = "Reversion completed";

			var wikipedia_api = new Morebits.wiki.api( 'Saving reverted contents', query, null/*Kaizo.fluff.callbacks.toRevision.complete*/, self.statelem);
			wikipedia_api.params = self.params;
			wikipedia_api.post();

		},
		complete: function (self) {
		}
	},
	main: function( self ) {
		var xmlDoc = self.responseXML;

		var lastrevid = parseInt( $(xmlDoc).find('page').attr('lastrevid'), 10);
		var touched = $(xmlDoc).find('page').attr('touched');
		var starttimestamp = $(xmlDoc).find('api').attr('curtimestamp');
		var edittoken = $(xmlDoc).find('tokens').attr('csrftoken');
		var lastuser = $(xmlDoc).find('rev').attr('user');

		var revs = $(xmlDoc).find('rev');

		if( revs.length < 1 ) {
			self.statelem.error( 'We have less than one additional revision, thus impossible to revert' );
			return;
		}
		var top = revs[0];
		if( lastrevid < self.params.revid ) {
			Morebits.status.error( 'Error', [ 'The most recent revision ID received from the server, ', Morebits.htmlNode( 'strong', lastrevid ), ', is less than the ID of the displayed revision. This could indicate that the current revision has been deleted, the server is lagging, or that bad data has been received. Will stop proceeding at this point.' ] );
			return;
		}
		var index = 1;
		if( self.params.revid !== lastrevid  ) {
			Morebits.status.warn( 'Warning', [ 'Latest revision ', Morebits.htmlNode( 'strong', lastrevid ), ' doesn\'t equal our revision ', Morebits.htmlNode( 'strong', self.params.revid ) ] );
			if( lastuser === self.params.user ) {
				switch( self.params.type ) {
				case 'vand':
					Morebits.status.info( 'Info', [ 'Latest revision was made by ', Morebits.htmlNode( 'strong', self.params.user ) , '. As we assume vandalism, we continue to revert' ]);
					break;
				case 'agf':
					Morebits.status.warn( 'Warning', [ 'Latest revision was made by ', Morebits.htmlNode( 'strong', self.params.user ) , '. As we assume good faith, we stop reverting, as the problem might have been fixed.' ]);
					return;
				default:
					Morebits.status.warn( 'Notice', [ 'Latest revision was made by ', Morebits.htmlNode( 'strong', self.params.user ) , ', but we will stop reverting anyway.' ] );
					return;
				}
			}
			else if(self.params.type === 'vand' && 
					Kaizo.fluff.whiteList.indexOf( top.getAttribute( 'user' ) ) !== -1 && revs.length > 1 &&
					revs[1].getAttribute( 'pageId' ) === self.params.revid) {
				Morebits.status.info( 'Info', [ 'Latest revision was made by ', Morebits.htmlNode( 'strong', lastuser ), ', a trusted bot, and the revision before was made by our vandal, so we proceed with the revert.' ] );
				index = 2;
			} else {
				Morebits.status.error( 'Error', [ 'Latest revision was made by ', Morebits.htmlNode( 'strong', lastuser ), ', so it might have already been reverted, stopping  reverting.'] );
				return;
			}

		}

		if( Kaizo.fluff.whiteList.indexOf( self.params.user ) !== -1  ) {
			switch( self.params.type ) {
			case 'vand':
				Morebits.status.info( 'Info', [ 'Vandalism revert was chosen on ', Morebits.htmlNode( 'strong', self.params.user ), '. As this is a whitelisted bot, we assume you wanted to revert vandalism made by the previous user instead.' ] );
				index = 2;
				vandal = revs[1].getAttribute( 'user' );
				self.params.user = revs[1].getAttribute( 'user' );
				break;
			case 'agf':
				Morebits.status.warn( 'Notice', [ 'Good faith revert was chosen on ', Morebits.htmlNode( 'strong', self.params.user ), '. This is a whitelisted bot, it makes no sense at all to revert it as a good faith edit, will stop reverting.' ] );
				return;
			case 'norm':
				/* falls through */
			default:
				var cont = confirm( 'Normal revert was chosen, but the most recent edit was made by a whitelisted bot (' + self.params.user + '). Do you want to revert the revision before instead?' );
				if( cont ) {
					Morebits.status.info( 'Info', [ 'Normal revert was chosen on ', Morebits.htmlNode( 'strong', self.params.user ), '. This is a whitelisted bot, and per confirmation, we\'ll revert the previous revision instead.' ] );
					index = 2;
					self.params.user = revs[1].getAttribute( 'user' );
				} else {
					Morebits.status.warn( 'Notice', [ 'Normal revert was chosen on ', Morebits.htmlNode( 'strong', self.params.user ), '. This is a whitelisted bot, but per confirmation, revert on top revision will proceed.' ] );
				}
				break;
			}
		}
		var found = false;
		var count = 0;

		for( var i = index; i < revs.length; ++i ) {
			++count;
			if( revs[i].getAttribute( 'user' ) !== self.params.user ) {
				found = i;
				break;
			}
		}

		if( ! found ) {
			self.statelem.error( [ 'No previous revision found. Perhaps ', Morebits.htmlNode( 'strong', self.params.user ), ' is the only contributor, or that the user has made more than ' + Kaizo.getPref('revertMaxRevisions') + ' edits in a row.' ] );
			return;
		}

		if( ! count ) {
			Morebits.status.error( 'Error', "We were to revert zero revisions. As that makes no sense, we'll stop reverting this time. It could be that the edit has already been reverted, but the revision ID was still the same." );
			return;
		}

		var good_revision = revs[ found ];
		var userHasAlreadyConfirmedAction = false;
		if (self.params.type !== 'vand' && count > 1) {
			if ( !confirm( self.params.user + ' has made ' + count + ' edits in a row. Are you sure you want to revert them all?') ) {
				Morebits.status.info( 'Notice', 'Stopping reverting per user input' );
				return;
			}
			userHasAlreadyConfirmedAction = true;
		}

		self.params.count = count;

		self.params.goodid = good_revision.getAttribute( 'revid' );
		self.params.gooduser = good_revision.getAttribute( 'user' );

		self.statelem.status( [ ' revision ', Morebits.htmlNode( 'strong', self.params.goodid ), ' that was made ', Morebits.htmlNode( 'strong', count ), ' revisions ago by ', Morebits.htmlNode( 'strong', self.params.gooduser ) ] );

		var summary, extra_summary, userstr, gooduserstr;
		switch( self.params.type ) {
		case 'agf':
			extra_summary = prompt( "An optional comment for the edit summary:                              ", "" );  // padded out to widen prompt in Firefox
			if (extra_summary === null)
			{
				self.statelem.error( 'Aborted by user.' );
				return;
			}
			userHasAlreadyConfirmedAction = true;

			userstr = self.params.user;
			summary = "Reverted good faith edits by [[Special:Contributions/" + userstr + "|" + userstr + "]] ([[User talk:" + 
				userstr + "|talk]])" + Kaizo.fluff.formatSummaryPostfix(extra_summary) + Kaizo.getPref('summaryAd');
			break;

		case 'vand':

			userstr = self.params.user;
			gooduserstr = self.params.gooduser;
			summary = "Reverted " + self.params.count + (self.params.count > 1 ? ' edits' : ' edit') + " by [[Special:Contributions/" +
				userstr + "|" + userstr + "]] ([[User talk:" + userstr + "|talk]]) to last revision by " +
				gooduserstr + "." + Kaizo.getPref('summaryAd');
			break;

		case 'norm':
			/* falls through */
		default:
			if( Kaizo.getPref('offerReasonOnNormalRevert') ) {
				extra_summary = prompt( "An optional comment for the edit summary:                              ", "" );  // padded out to widen prompt in Firefox
				if (extra_summary === null)
				{
					self.statelem.error( 'Aborted by user.' );
					return;
				}
				userHasAlreadyConfirmedAction = true;
			}

			userstr = self.params.user;
			summary = "Reverted " + self.params.count + (self.params.count > 1 ? ' edits' : ' edit') + " by [[Special:Contributions/" + 
				userstr + "|" + userstr + "]] ([[User talk:" + userstr + "|talk]])" + Kaizo.fluff.formatSummaryPostfix(extra_summary) +
				Kaizo.getPref('summaryAd');
			break;
		}

		if (Kaizo.getPref('confirmOnFluff') && !userHasAlreadyConfirmedAction && !confirm("Reverting page: are you sure?")) {
			self.statelem.error( 'Aborted by user.' );
			return;
		}

		var query;
		if( (!self.params.autoRevert || Kaizo.getPref('openTalkPageOnAutoRevert')) && 
				Kaizo.getPref('openTalkPage').indexOf( self.params.type ) !== -1 &&
				mw.config.get('wgUserName') !== self.params.user ) {
			Morebits.status.info( 'Info', [ 'Opening user talk page edit form for user ', Morebits.htmlNode( 'strong', self.params.user ) ] );
			
			query = {
				'title': 'User talk:' + self.params.user,
				'action': 'edit',
				'preview': 'yes',
				'vanarticle': self.params.pagename.replace(/_/g, ' '),
				'vanarticlerevid': self.params.revid,
				'vanarticlegoodrevid': self.params.goodid,
				'type': self.params.type,
				'count': self.params.count
			};

			switch( Kaizo.getPref('userTalkPageMode') ) {
			case 'tab':
				window.open( mw.util.wikiScript('index') + '?' + Morebits.queryString.create( query ), '_tab' );
				break;
			case 'blank':
				window.open( mw.util.wikiScript('index') + '?' + Morebits.queryString.create( query ), '_blank', 'location=no,toolbar=no,status=no,directories=no,scrollbars=yes,width=1200,height=800' );
				break;
			case 'window':
				/* falls through */
			default:
				window.open( mw.util.wikiScript('index') + '?' + Morebits.queryString.create( query ), 'Kaizowarnwindow', 'location=no,toolbar=no,status=no,directories=no,scrollbars=yes,width=1200,height=800' );
				break;
			}
		}
		
		query = {
			'action': 'edit',
			'title': self.params.pagename,
			'summary': summary,
			'token': edittoken,
			'undo': lastrevid,
			'undoafter': self.params.goodid,
			'basetimestamp': touched,
			'starttimestamp': starttimestamp,
			'watchlist' :  Kaizo.getPref('watchRevertedPages').indexOf( self.params.type ) !== -1 ? 'watch' : undefined,
			'minor': Kaizo.getPref('markRevertedPagesAsMinor').indexOf( self.params.type ) !== -1 ? true : undefined
		};

		Morebits.wiki.actionCompleted.redirect = self.params.pagename;
		Morebits.wiki.actionCompleted.notice = "Reversion completed";

		var wikipedia_api = new Morebits.wiki.api( 'Saving reverted contents', query, Kaizo.fluff.callbacks.complete, self.statelem);
		wikipedia_api.params = self.params;
		wikipedia_api.post();

	},
	complete: function (self) {
		self.statelem.info("done");
	}
};

Kaizo.fluff.formatSummaryPostfix = function(stringToAdd) {
	if (stringToAdd) {
		stringToAdd = ': ' + Morebits.string.toUpperCaseFirstChar(stringToAdd);
		if (stringToAdd.search(/[.?!;]$/) === -1) {
			stringToAdd = stringToAdd + '.';
		}
		return stringToAdd;
	}
	else {
		return '.';
	}
};

Kaizo.fluff.init = function Kaizofluffinit() {
	if (KaizoUserAuthorized)
	{
		// a list of usernames, usually only bots, that vandalism revert is jumped over, that is
		// if vandalism revert was chosen on such username, then it's target is on the revision before.
		// This is for handeling quick bots that makes edits seconds after the original edit is made.
		// This only affect vandalism rollback, for good faith rollback, it will stop, indicating a bot 
		// has no faith, and for normal rollback, it will rollback that edit.
		Kaizo.fluff.whiteList = [
			'AnomieBOT',
			'ClueBot NG',
			'SineBot'
		];

		if ( Morebits.queryString.exists( 'Kaizorevert' ) ) {
			Kaizo.fluff.auto();
		} else {
			Kaizo.fluff.normal();
		}
	}
};

/*
 ****************************************
 *** Kaizospeedy.js: CSD module
 ****************************************
 * Mode of invocation:     Tab ("CSD")
 * Active on:              Non-special, existing pages
 * Config directives in:   KaizoConfig
 *
 * NOTE FOR DEVELOPERS:
 *   If adding a new criterion, check out the default values of the CSD preferences
 *   in Kaizo.header.js, and add your new criterion to those if you think it would
 *   be good. 
 */

Kaizo.speedy = function Kaizospeedy() {
	// Disable on:
	// * special pages
	// * non-existent pages
	if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
		return;
	}
	twAddPortletLink( Kaizo.speedy.callback, "Del", "tw-csd", Morebits.userIsInGroup('sysop') ? "Delete page" : "Request deletion" );
};

// This function is run when the CSD tab/header link is clicked
Kaizo.speedy.callback = function KaizospeedyCallback() {
	if ( !KaizoUserAuthorized ) {
		alert("Your account is too new to use Kaizo.");
		return;
	}

	Kaizo.speedy.initDialog(Morebits.userIsInGroup( 'sysop' ) ? Kaizo.speedy.callback.evaluateSysop : Kaizo.speedy.callback.evaluateUser, true);
};

Kaizo.speedy.dialog = null;  // used by unlink feature

// Prepares the speedy deletion dialog and displays it
Kaizo.speedy.initDialog = function KaizospeedyInitDialog(callbackfunc) {
	var dialog;
	Kaizo.speedy.dialog = new Morebits.simpleWindow( Kaizo.getPref('speedyWindowWidth'), Kaizo.getPref('speedyWindowHeight') );
	dialog = Kaizo.speedy.dialog;
	dialog.setTitle( "Choose criteria for deletion" );
	dialog.setScriptName( "Kaizo" );
	dialog.addFooterLink( "Common deletion reasons", "MediaWiki:Deletereason-dropdown" );
	dialog.addFooterLink( "Kaizo help", "WP:TW/DOC#speedy" );

	var form = new Morebits.quickForm( callbackfunc, (Kaizo.getPref('speedySelectionStyle') === 'radioClick' ? 'change' : null) );
	if( Morebits.userIsInGroup( 'sysop' ) ) {
		form.append( {
				type: 'checkbox',
				list: [
					{
						label: 'Tag page only, don\'t delete',
						value: 'tag_only',
						name: 'tag_only',
						tooltip: 'If you just want to tag the page, instead of deleting it now',
						checked : Kaizo.getPref('deleteSysopDefaultToTag'),
						event: function( event ) {
							var cForm = event.target.form;
							var cChecked = event.target.checked;
							// enable/disable talk page checkbox
							if (cForm.talkpage) {
								cForm.talkpage.disabled = cChecked;
								cForm.talkpage.checked = !cChecked && Kaizo.getPref('deleteTalkPageOnDelete');
							}
							// enable/disable redirects checkbox
							cForm.redirects.disabled = cChecked;
							cForm.redirects.checked = !cChecked;

							// enable/disable notify checkbox
							cForm.notify.disabled = !cChecked;
							cForm.notify.checked = cChecked;
							// enable/disable multiple
							cForm.multiple.disabled = !cChecked;
							cForm.multiple.checked = false;

							Kaizo.speedy.callback.dbMultipleChanged(cForm, false);

							event.stopPropagation();
						}
					}
				]
			} );
		form.append( { type: 'header', label: 'Delete-related options' } );
		if (mw.config.get('wgNamespaceNumber') % 2 === 0 && (mw.config.get('wgNamespaceNumber') !== 2 || (/\//).test(mw.config.get('wgTitle')))) {  // hide option for user pages, to avoid accidentally deleting user talk page
			form.append( {
				type: 'checkbox',
				list: [
					{
						label: 'Also delete talk page',
						value: 'talkpage',
						name: 'talkpage',
						tooltip: "This option deletes the page's talk page in addition. If you choose the F8 (moved to Commons) criterion, this option is ignored and the talk page is *not* deleted.",
						checked: Kaizo.getPref('deleteTalkPageOnDelete'),
						disabled: Kaizo.getPref('deleteSysopDefaultToTag'),
						event: function( event ) {
							event.stopPropagation();
						}
					}
				]
			} );
		}
		form.append( {
				type: 'checkbox',
				list: [
					{
						label: 'Also delete all redirects',
						value: 'redirects',
						name: 'redirects',
						tooltip: "This option deletes all incoming redirects in addition. Avoid this option for procedural (e.g. move/merge) deletions.",
						checked: true,
						disabled: Kaizo.getPref('deleteSysopDefaultToTag'),
						event: function( event ) {
							event.stopPropagation();
						}
					}
				]
			} );
		form.append( { type: 'header', label: 'Tag-related options' } );
	}

	form.append( {
			type: 'checkbox',
			list: [
				{
					label: 'Notify page creator if possible',
					value: 'notify',
					name: 'notify',
					tooltip: "A notification template will be placed on the talk page of the creator, IF you have a notification enabled in your Kaizo preferences " +
						"for the criterion you choose AND this box is checked. The creator may be welcomed as well.",
					checked: !Morebits.userIsInGroup( 'sysop' ) || Kaizo.getPref('deleteSysopDefaultToTag'),
					disabled: Morebits.userIsInGroup( 'sysop' ) && !Kaizo.getPref('deleteSysopDefaultToTag'),
					event: function( event ) {
						event.stopPropagation();
					}
				}
			]
		} );

	form.append( {
			type: 'div',
			name: 'work_area',
			label: 'Failed to initialize the CSD module. Please try again, or tell the Kaizo developers about the issue.'
		} );

	if( Kaizo.getPref( 'speedySelectionStyle' ) !== 'radioClick' ) {
		form.append( { type: 'submit' } );
	}

	var result = form.render();
	dialog.setContent( result );
	dialog.display();

	Kaizo.speedy.callback.dbMultipleChanged( result, false );
};

Kaizo.speedy.callback.dbMultipleChanged = function KaizospeedyCallbackDbMultipleChanged(form, checked) {
	var namespace = mw.config.get('wgNamespaceNumber');
	var value = checked;

	var work_area = new Morebits.quickForm.element( {
			type: 'div',
			name: 'work_area'
		} );

	if (checked && Kaizo.getPref('speedySelectionStyle') === 'radioClick') {
		work_area.append( {
				type: 'div',
				label: 'When finished choosing criteria, click:'
			} );
		work_area.append( {
				type: 'button',
				name: 'submit-multiple',
				label: 'Submit Query',
				event: function( event ) {
					Kaizo.speedy.callback.evaluateUser( event );
					event.stopPropagation();
				}
			} );
	}

	var radioOrCheckbox = (value ? 'checkbox' : 'radio');
	/*
	if (namespace % 2 === 1 && namespace !== 3) {  // talk pages, but not user talk pages
		work_area.append( { type: 'header', label: 'Talk pages' } );
		work_area.append( { type: radioOrCheckbox, name: 'csd', list: Kaizo.speedy.talkList } );
	}

	switch (namespace) {
		case 0:  // article
		case 1:  // talk
			work_area.append( { type: 'header', label: 'Articles' } );
			work_area.append( { type: radioOrCheckbox, name: 'csd', list: Kaizo.speedy.getArticleList(value) } );
			break;

		case 2:  // user
		case 3:  // user talk
			work_area.append( { type: 'header', label: 'User pages' } );
			work_area.append( { type: radioOrCheckbox, name: 'csd', list: Kaizo.speedy.userList } );
			break;

		case 6:  // file
		case 7:  // file talk
			work_area.append( { type: 'header', label: 'Files' } );
			work_area.append( { type: radioOrCheckbox, name: 'csd', list: Kaizo.speedy.getFileList(value) } );
			break;

		case 10:  // template
		case 11:  // template talk
			work_area.append( { type: 'header', label: 'Templates' } );
			work_area.append( { type: radioOrCheckbox, name: 'csd', list: Kaizo.speedy.templateList } );
			break;

		case 14:  // category
		case 15:  // category talk
			work_area.append( { type: 'header', label: 'Categories' } );
			work_area.append( { type: radioOrCheckbox, name: 'csd', list: Kaizo.speedy.categoryList } );
			break;
			
		default:
			break;
	}
	*/
	work_area.append( { type: 'header', label: 'General criteria' } );
	work_area.append( { type: radioOrCheckbox, name: 'csd', list: Kaizo.speedy.getGeneralList(value) });
	/*
	work_area.append( { type: 'header', label: 'Redirects' } );
	work_area.append( { type: radioOrCheckbox, name: 'csd', list: Kaizo.speedy.redirectList } );
	*/
	var old_area = Morebits.quickForm.getElements(form, "work_area")[0];
	form.replaceChild(work_area.render(), old_area);
};

Kaizo.speedy.talkList = [
	/*{
		label: 'G8: Talk pages with no page belonging to it',
		value: 'talk',
		tooltip: 'This does not include any page that is useful to the project - for example user talk pages, talk page archives, and talk pages for files that exist on Wikimedia Commons.'
	}*/
];

// this is a function to allow for db-multiple filtering
Kaizo.speedy.getFileList = function KaizospeedyGetFileList(multiple) {
	var result = [];
	/*result.push({
		label: 'F1: Not allowed',
		value: 'prohibitedimage',
		tooltip: 'Most media uploads are not allowed on Simple English Wikipedia. They should be uploaded to Wikimedia Commons instead. There are a few exceptions to this rule. Firstly, all spoken articles should be uploaded here, as they are for local use. Secondly, there are some logos that Commons does not accept, but are needed here, for example Image:Wiki.png, which is used as the Wikipedia logo.'
	});*/
	return result;
};

Kaizo.speedy.getArticleList = function KaizospeedyGetArticleList(multiple) {
	var result = [];
	/*result.push({
		label: 'A1: Little or no meaning',
		value: 'nocontext',
		tooltip: 'Is very short and providing little or no meaning (e.g., "He is a funny man that has created Factory and the Hacienda. And, by the way, his wife is great."). Having a small amount of content is not a reason to delete if it has useful information.'
	});
	result.push({
		label: 'A2: No content',
		value: 'nocontent',
		tooltip: 'Has no content. This includes any article consisting only of links (including hyperlinks, category tags and "see also" sections), a rephrasing of the title, and/or attempts to correspond with the person or group named by its title. This does not include disambiguation pages.'
	});
	result.push({
		label: 'A3: Article that exists on another Wikimedia project',
		value: 'transwiki',
		tooltip: 'Has been copied and pasted from another Wikipedia: Any article or section from an article that has been copied and pasted with little or no change.'
	});
	result.push({
		label: 'A4: People, groups, companies, products, services or websites that do not claim to be notable.',
		value: 'notability',
		tooltip: 'An article about a real person, group of people, band, club, company, product, service or or web content that does not say why it is important. If not everyone agrees that the subject is not notable or there has been a previous RfD, the article may not be quickly deleted, and should be discussed at RfD instead.'
	});
	result.push({
		label: 'A5: Not written in English',
		value: 'foreign',
		tooltip: 'Any article that is not written in English. An article that is written in any other languages but English.'
	});
	result.push({
		label: 'A6: Obvious hoax',
		value: 'hoax',
		tooltip: 'Is an obvious hoax. An article that is surely fake or impossible.'
	});*/
	return result;
};

Kaizo.speedy.categoryList = [
	/*{
		label: 'C1: Empty categories',
		value: 'catempty',
		tooltip: '(with no articles or subcategories for at least four days) whose only content includes links to parent categories. However, this can not be used on categories still being discussed on WP:RfD, or disambiguation categories. If the category wasn\'t newly made, it is possible that it used to have articles, and more inspection is needed.'
	},
	{
		label: 'C2: Quick renaming',
		value: 'catqr',
		tooltip: 'Empty categories that have already been renamed.'
	},
	{
		label: 'C3: Template categories',
		value: 'catfd',
		tooltip: 'If a category contains articles from only one template (such as Category:Cleanup needed from \{\{cleanup\}\}) and the template is deleted after being discussed, the category can also be deleted without being discussed.'
	}*/
];

Kaizo.speedy.userList = [
	/*{
		label: 'U1: User request',
		value: 'userreq',
		tooltip: 'User pages can be deleted if its user wants to, but there are some exceptions.'
	},
	{
		label: 'U2: Nonexistent user',
		value: 'nouser',
		tooltip: 'User pages of users that do not exist. Administrators should check Special:Contributions and Special:DeletedContributions.'
	}*/
];

Kaizo.speedy.templateList = [
		/*{
		label: 'T2: They are deprecated or replaced by a newer template and are completely unused and not linked to.',
		value: 'replaced',
		tooltip: 'For any template that should not be deleted quickly, use Wikipedia:Requests for deletion.'
		}*/
	//});
	//	return result;
];

Kaizo.speedy.getGeneralList = function KaizospeedyGetGeneralList(multiple) {
	var result = [];
	if (!multiple) {
		result.push({
			label: 'Custom rationale' + (Morebits.userIsInGroup('sysop') ? ' (custom deletion reason)' : ' using {'+'{delete|reason}}'),
			value: 'reason',
			tooltip: 'You can enter an custom reason.'
		});
	}
	/*result.push({
		label: 'G1: Nonsense',
		value: 'nonsense', 
		tooltip: 'All of the text is nonsense. Nonsense includes content that does not make sense or is not meaningful. However, this does not include bad writing, bad words, vandalism, things that are fake or impossible, or parts which are not in English. '
	});
	result.push({
		label: 'G2: Test page',
		value: 'test',
		tooltip: 'It is a test page, such as "Can I really create a page here?".' 
	});
	result.push({
		label: 'G3: Complete vandalism',
		value: 'vandalism',
		tooltip: 'The content is completely vandalism.'
	});
	result.push({
		label: 'G4: Recreation of deleted material already deleted at RfD',
		value: 'repost',
		tooltip: 'Creation of content that is already deleted. It includes an identical or similar copy, with any title, of a page that was deleted, after being discussed in Requests for deletion, unless it was undeleted due to another discussion or was recreated in the user space. Before deleting again, the Administrator should be sure that the content is similar and not just a new article on the same subject. This rule cannot be used if the content had already been quickly deleted before.'
	});
	if (!multiple) {
		result.push({
			label: 'G6: History merge',
			value: 'histmerge',
			tooltip: 'Temporarily deleting a page in order to merge page histories'
		});
		result.push({
			label: 'G6: Move',
			value: 'move',
			tooltip: 'Making way for a noncontroversial move like reversing a redirect'
		});
		result.push({
			label: 'G6: RfD',
			value: 'afd',
			tooltip: 'An admin has closed a RfD as "delete".'
		});
		}
	result.push({
		label: 'G6: Housekeeping',
		value: 'g6',
		tooltip: 'Other non-controversial "housekeeping" tasks'
	});
	result.push({
		label: 'G7: Author requests deletion, or author blanked',
		value: 'author',
		tooltip: 'Any page whose original author wants deletion, can be quickly deleted, but only if most of the page was written by that author and was created as a mistake. If the author blanks the page, this can mean that he or she wants it deleted.'
	});
	result.push({
		label: 'G8: Pages dependent on a non-existent or deleted page',
		value: 'talk',
		tooltip: '... can be deleted, unless they contain discussion on deletion that can\'t be found anywhere else. Subpages of a talk page can only be deleted under this rule if their top-level page does not exist. This also applies to broken redirects. However, this cannot be used on user talk pages or talk pages of images on Commons.'
	});
	if (!multiple) {
		result.push({
			label: 'G8: Subpages with no parent page',
			value: 'subpage',
			tooltip: 'This excludes any page that is useful to the project, and in particular: deletion discussions that are not logged elsewhere, user and user talk pages, talk page archives, plausible redirects that can be changed to valid targets, and file pages or talk pages for files that exist on Wikimedia Commons.'
		});
	}
	result.push({
		label: 'G10: Attack page',
		value: 'attack',
		tooltip: 'Pages that were only created to insult a person or thing (such as "John Q. Doe is dumb"). This includes articles on a living person that is insult and without sources, where there is no NPOV version in the edit history to revert to.'
	});
	result.push({
		label: 'G11: Obvious advertising',
		value: 'spam',
		tooltip: 'Pages which were created only to say good things about a company, item, group or service and which would need to be written again so that they can sound like an encyclopedia. However, simply having a company, item, group or service as its subject does not mean that an article can be deleted because of this rule: an article that is obvious advertising should have content that shouldn\'t be in an encyclopedia. If a page has already gone through RfD or QD and was not deleted, it should not be quickly deleted using this rule.'
	});
	result.push({
		label: 'G12: Obviously breaking copyright law',
		value: 'copyvio',
		tooltip: 'Obviously breaking copyright law like a page which is 1) Copied from another website which does not have a license that can be used with Wikipedia; 2) Containing no content in the page history that is worth being saved. 3) Made by one person instead of being created on wiki and then copied by another website such as one of the many Wikipedia mirror websites. 4) Added by someone who doesn\'t tell if he got permission to do so or not, or if his claim has a large chance of not being true;'
	});*/
	return result;
};

Kaizo.speedy.redirectList = [
	/*{ 
		label: 'R1: Redirects to a non-existent page.', 
		value: 'redirnone', 
		tooltip: 'Redirects to a non-existent page.'
	},
	{ 
		label: 'R2: Redirects from mainspace to any other namespace except the Category:, Template:, Wikipedia:, Help: and Portal: namespaces', 
		value: 'rediruser', 
		tooltip: '(this does not include the Wikipedia shortcut pseudo-namespaces). If this was the result of a page move, consider waiting a day or two before deleting the redirect'
	},
	{ 
		label: 'R3: Redirects as a result of an implausible typo that were recently created', 
		value: 'redirtypo', 
		tooltip: 'However, redirects from common misspellings or misnomers are generally useful, as are redirects in other languages'
	}*/
];

Kaizo.speedy.normalizeHash = {
	'reason': 'db',
	'nonsense': 'g1',
	'test': 'g2',
	'vandalism': 'g3',
	'hoax': 'g3',
	'repost': 'g4',
	'histmerge': 'g6',
	'move': 'g6',
	'afd': 'g6',
	'g6': 'g6',
	'author': 'g7',
	'talk': 'g8',
	'subpage': 'g8',
	'attack': 'g10',
	'spam': 'g11',
	'copyvio': 'g12',
	'nocontext': 'a1',
	'nocontent': 'a2',
	'transwiki': 'a3',
	'notability': 'a4',
	'foreign': 'a5',
	'hoax': 'a6',
	'redirnone': 'r1',
	'rediruser': 'r2',
	'redirtypo': 'r3',
	'prohibitedimage': 'f1',
	'catempty': 'c1',
	'catqr': 'c2',
	'catfd': 'c3',
	'userreq': 'u1',
	'nouser': 'u2',
	'replaced':'t2'
};

// keep this synched with [[MediaWiki:Deletereason-dropdown]]
Kaizo.speedy.reasonHash = {
	'reason': '',
		'nonsense': 'was all nonsense',
		'test': 'was a test page',
		'vandalism': 'was vandalism',
		'pagemove': 'was a redirect created during cleanup of page move vandalism',
		'repost': 'was a copy of a page that was deleted by RfD',
		'histmerge': 'was in the way of trying to fix or clean up something',
		'move': 'was in the way of making a move',
		'afd': 'was closed as delete in a RfD',
		'g6': 'was housekeeping',
		'author': 'was asked to be deleted by the author',
		'blanked': 'was implied to be deleted by the author',
		'talk': 'was a talk page of a page that does not exist',
		'attack': 'was an attack page',
		'spam': 'was advertising',
		'copyvio': 'was breaking copyright law',
		'nocontext': 'was a page that had little or no meaning',
		'nocontent': 'was a page that had no content', 
		'transwiki': 'was copied from another Wikipedia',
		'notability': 'was a page that didn\'t say why the subject was notable',
		'foreign': 'was not written in English',
		'hoax': 'was obviously a hoax (not true)',
		'redirnone': 'was a redirect to a page that does not exist',
		'rediruser': 'was a redirect to the Talk:, User: or User talk: space',
		'redirtypo': 'was a redirect with an uncommon typo',
		'prohibitedimage': 'was an image/media that is not allowed on Wikipedia',
		'catempty': 'was an empty category',
		'catqr': 'was a renamed category',
		'catfd': 'was a category containing articles from a now deleted template',
		'userreq': 'was a user page whose user requested deletion',
		'nouser': 'was a user page of a user that did not exist',
		'replaced': 'was deprecated or replaced by a newer template and are completely unused and not linked to'
};

Kaizo.speedy.callbacks = {
	sysop: {
		main: function( params ) {
			var thispage = new Morebits.wiki.page( mw.config.get('wgPageName'), "Deleting page" );

			// delete page
			var reason;
			if (params.normalized === 'db') {
				reason = prompt("Enter the deletion summary to use, which will be entered into the deletion log:", "");
			} else {
				var presetReason = params.normalized.toUpperCase(); // should be never called on meta miraheze
				if (Kaizo.getPref("promptForSpeedyDeletionSummary").indexOf(params.normalized) !== -1) {
					reason = prompt("Enter the deletion summary to use, or press OK to accept the automatically generated one.", presetReason);
				} else {
					reason = presetReason;
				}
			}
			if (!reason || !reason.replace(/^\s*/, "").replace(/\s*$/, "")) {
				Morebits.status.error("Asking for reason", "you didn't give one.  I don't know... what with admins and their apathetic antics... I give up...");
				return;
			}
			thispage.setEditSummary( reason + Kaizo.getPref('deletionSummaryAd') );
			thispage.deletePage();

			// delete talk page
			if (params.deleteTalkPage &&
			    params.normalized !== 'f8' &&
			    document.getElementById( 'ca-talk' ).className !== 'new') {
				var talkpage = new Morebits.wiki.page( Morebits.wikipedia.namespaces[ mw.config.get('wgNamespaceNumber') + 1 ] + ':' + mw.config.get('wgTitle'), "Deleting talk page" );
				talkpage.setEditSummary('[[WP:QD#G8|G8]]: Talk page of deleted page "' + mw.config.get('wgPageName') + '"' + Kaizo.getPref('deletionSummaryAd'));
				talkpage.deletePage();
			}

			// promote Unlink tool
			var $link, $bigtext;
			if( mw.config.get('wgNamespaceNumber') === 6 && params.normalized !== 'f8' ) {
				$link = $('<a/>', {
					'href': '#',
					'text': 'click here to go to the Unlink tool',
					'css': { 'fontSize': '130%', 'fontWeight': 'bold' },
					'click': function(){
						Morebits.wiki.actionCompleted.redirect = null;
						Kaizo.speedy.dialog.close();
						Kaizo.unlink.callback("Removing usages of and/or links to deleted file " + mw.config.get('wgPageName'));
					}
				});
				$bigtext = $('<span/>', {
					'text': 'To orphan backlinks and remove instances of file usage',
					'css': { 'fontSize': '130%', 'fontWeight': 'bold' }
				});
				Morebits.status.info($bigtext[0], $link[0]);
			} else if (params.normalized !== 'f8') {
				$link = $('<a/>', {
					'href': '#',
					'text': 'click here to go to the Unlink tool',
					'css': { 'fontSize': '130%', 'fontWeight': 'bold' },
					'click': function(){
						Morebits.wiki.actionCompleted.redirect = null;
						Kaizo.speedy.dialog.close();
						Kaizo.unlink.callback("Removing links to deleted page " + mw.config.get('wgPageName'));
					}
				});
				$bigtext = $('<span/>', {
					'text': 'To orphan backlinks',
					'css': { 'fontSize': '130%', 'fontWeight': 'bold' }
				});
				Morebits.status.info($bigtext[0], $link[0]);
			}

			// open talk page of first contributor
			if( params.openusertalk ) {
				thispage = new Morebits.wiki.page( mw.config.get('wgPageName') );  // a necessary evil, in order to clear incorrect status text
				thispage.setCallbackParameters( params );
				thispage.lookupCreator( Kaizo.speedy.callbacks.sysop.openUserTalkPage );
			}

			// delete redirects
			if (params.deleteRedirects) {
				var query = {
					'action': 'query',
					'list': 'backlinks',
					'blfilterredir': 'redirects',
					'bltitle': mw.config.get('wgPageName'),
					'bllimit': 5000  // 500 is max for normal users, 5000 for bots and sysops
				};
				var wikipedia_api = new Morebits.wiki.api( 'getting list of redirects...', query, Kaizo.speedy.callbacks.sysop.deleteRedirectsMain,
					new Morebits.status( 'Deleting redirects' ) );
				wikipedia_api.params = params;
				wikipedia_api.post();
			}
		},
		openUserTalkPage: function( pageobj ) {
			pageobj.getStatusElement().unlink();  // don't need it anymore
			var user = pageobj.getCreator();
			var statusIndicator = new Morebits.status('Opening user talk page edit form for ' + user, 'opening...');

			var query = {
				'title': 'User talk:' + user,
				'action': 'edit',
				'preview': 'yes',
				'vanarticle': mw.config.get('wgPageName').replace(/_/g, ' ')
			};
			switch( Kaizo.getPref('userTalkPageMode') ) {
			case 'tab':
				window.open( mw.util.wikiScript('index') + '?' + Morebits.queryString.create( query ), '_tab' );
				break;
			case 'blank':
				window.open( mw.util.wikiScript('index') + '?' + Morebits.queryString.create( query ), '_blank', 'location=no,toolbar=no,status=no,directories=no,scrollbars=yes,width=1200,height=800' );
				break;
			case 'window':
				/* falls through */
				default :
				window.open( mw.util.wikiScript('index') + '?' + Morebits.queryString.create( query ), 'Kaizowarnwindow', 'location=no,toolbar=no,status=no,directories=no,scrollbars=yes,width=1200,height=800' );
				break;
			}

			statusIndicator.info( 'complete' );
		},
		deleteRedirectsMain: function( apiobj ) {
			var xmlDoc = apiobj.getXML();
			var $snapshot = $(xmlDoc).find('backlinks bl');

			var total = $snapshot.length;

			if( !total ) {
				return;
			}

			var statusIndicator = apiobj.statelem;
			statusIndicator.status("0%");

			var onsuccess = function( apiobj ) {
				var obj = apiobj.params.obj;
				var total = apiobj.params.total;
				var now = parseInt( 100 * ++(apiobj.params.current)/total, 10 ) + '%';
				obj.update( now );
				apiobj.statelem.unlink();
				if( apiobj.params.current >= total ) {
					obj.info( now + ' (completed)' );
					Morebits.wiki.removeCheckpoint();
				}
			};

			Morebits.wiki.addCheckpoint();

			var params = $.extend( {}, apiobj.params );
			params.current = 0;
			params.total = total;
			params.obj = statusIndicator;

			$snapshot.each(function(key, value) {
				var title = $(value).attr('title');
				var page = new Morebits.wiki.page(title, 'Deleting redirect "' + title + '"');
				page.setEditSummary('Redirect to deleted page "' + mw.config.get('wgPageName') + '"' + Kaizo.getPref('deletionSummaryAd'));
				page.deletePage(onsuccess);
			});
		}
	},

	user: {
		main: function(pageobj) {
			var statelem = pageobj.getStatusElement();

			if (!pageobj.exists()) {
				statelem.error( "It seems that the page doesn't exist; perhaps it has already been deleted" );
				return;
			}

			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();

			statelem.status( 'Checking for tags on the page...' );

			// check for existing deletion tags
			var tag = /(?:\{\{\s*(qd|qd-multiple|db|delete|db-.*?)(?:\s*\||\s*\}\}))/.exec( text );
			if( tag ) {
				statelem.error( [ Morebits.htmlNode( 'strong', tag[1] ) , " is already placed on the page." ] );
				return;
			}

			var xfd = /(?:\{\{([rsaiftcm]fd|md1|proposed deletion)[^{}]*?\}\})/i.exec( text );
			if( xfd && !confirm( "The deletion-related template {{" + xfd[1] + "}} was found on the page. Do you still want to add a CSD template?" ) ) {
				return;
			}

			var code, parameters, i;
			if (params.normalizeds.length > 1)
			{
				code = "{{QD-multiple";
				var breakFlag = false;
				$.each(params.normalizeds, function(index, norm) {
					code += "|" + norm.toUpperCase();
					parameters = Kaizo.speedy.getParameters(params.values[index], norm, statelem);
					if (!parameters) {
						breakFlag = true;
						return false;  // the user aborted
					}
					for (i in parameters) {
						if (typeof parameters[i] === 'string' && !parseInt(i, 10)) {  // skip numeric parameters - {{db-multiple}} doesn't understand them
							code += "|" + i + "=" + parameters[i];
						}
					}
				});
				if (breakFlag) {
					return;
				}
				code += "}}";
				params.utparams = [];
			}
			else
			{
				parameters = Kaizo.speedy.getParameters(params.values[0], params.normalizeds[0], statelem);
				if (!parameters) {
					return;  // the user aborted
				}
				code = "{{delete|" + params.normalizeds;
				for (i in parameters) {
					if (typeof parameters[i] === 'string') {
						code += "|" + i + "=" + parameters[i];
					}
				}
				code += "|editor=" + mw.config.get("wgUserName") + "|date=~~~~~";
				code += "}}";
				params.utparams = Kaizo.speedy.getUserTalkParameters(params.normalizeds[0], parameters);
			}

			var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'));
			// patrol the page, if reached from Special:NewPages
			if( Kaizo.getPref('markSpeedyPagesAsPatrolled') ) {
				thispage.patrol();
			}

			// Wrap SD template in noinclude tags if we are in template space.
			// Won't work with userboxes in userspace, or any other transcluded page outside template space
			if (mw.config.get('wgNamespaceNumber') === 10) {  // Template:
				code = "<noinclude>" + code + "</noinclude>";
			}

			// Remove tags that become superfluous with this action
			if (mw.config.get('wgNamespaceNumber') === 6) {
				// remove "move to Commons" tag - deletion-tagged files cannot be moved to Commons
				text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi, "");
			}

			// Generate edit summary for edit
			var editsummary;
			if (params.normalizeds.length > 1) {
				editsummary = 'Requesting quick deletion (';
				$.each(params.normalizeds, function(index, norm) {
					editsummary += '[[WP:QD#' + norm.toUpperCase() + '|QD ' + norm.toUpperCase() + ']], ';
				});
				editsummary = editsummary.substr(0, editsummary.length - 2); // remove trailing comma
				editsummary += ').';
			} else if (params.normalizeds[0] === "db") {
				editsummary = 'Requesting deletion with criteria \"' + parameters["1"] + '\".';
			} else if (params.values[0] === "histmerge") {
				editsummary = "Requesting history merge with [[" + parameters["1"] + "]]";
			} else {
				editsummary = "Requesting quick deletion " + params.normalizeds[0].toUpperCase();
			}

			pageobj.setPageText(code + ((params.normalizeds.indexOf('g10') !== -1) ? '' : ("\n" + text) )); // cause attack pages to be blanked
			pageobj.setEditSummary(editsummary + Kaizo.getPref('summaryAd'));
			pageobj.setWatchlist(params.watch);
			pageobj.setCreateOption('nocreate');
			pageobj.save(Kaizo.speedy.callbacks.user.tagComplete);
		},

		tagComplete: function(pageobj) {
			var params = pageobj.getCallbackParameters();

			// Notification to first contributor
			if (params.usertalk) {
				var callback = function(pageobj) {
					var initialContrib = pageobj.getCreator();

					// don't notify users when their user talk page is nominated
					if (initialContrib === mw.config.get('wgTitle') && mw.config.get('wgNamespaceNumber') === 3) {
						Morebits.status.warn("Notifying initial contributor: this user created their own user talk page; skipping notification");
						return;
					}

					var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, "Notifying initial contributor (" + initialContrib + ")"),
					    notifytext, i;

					// specialcase "db" and "db-multiple"
					if (params.normalizeds.length > 1) {
						notifytext = "\n{{subst:QD-notice-multiple|page=" + mw.config.get('wgPageName');
						var count = 2;
						$.each(params.normalizeds, function(index, norm) {
							notifytext += "|" + (count++) + "=" + norm.toUpperCase();
						});
					} else if (params.normalizeds[0] === "db") {
						notifytext = "\n{{subst:QD-notice|page=" + mw.config.get('wgPageName') + "|cat=" + params.normalizeds;
					} else {
						notifytext = "\n{{subst:QD-notice|page=" + mw.config.get('wgPageName') + "|cat=" + params.normalizeds;
					}

					for (i in params.utparams) {
						if (typeof params.utparams[i] === 'string') {
							notifytext += "|" + i + "=" + params.utparams[i];
						}
					}
					notifytext += (params.welcomeuser ? "" : "|nowelcome=yes") + "}} ~~~~";

					usertalkpage.setAppendText(notifytext);
					usertalkpage.setEditSummary("Notification: quick deletion nomination of [[" + mw.config.get('wgPageName') + "]]." + Kaizo.getPref('summaryAd'));
					usertalkpage.setCreateOption('recreate');
					usertalkpage.setFollowRedirect(true);
					usertalkpage.append();

					// add this nomination to the user's userspace log, if the user has enabled it
					if (params.lognomination) {
						Kaizo.speedy.callbacks.user.addToLog(params, initialContrib);
					}
				};
				var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'));
				thispage.lookupCreator(callback);
			}
			// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
			else if (params.lognomination) {
				Kaizo.speedy.callbacks.user.addToLog(params, null);
			}
		},

		// note: this code is also invoked from Kaizoimage
		// the params used are:
		//   for CSD: params.values, params.normalizeds  (note: normalizeds is an array)
		//   for DI: params.fromDI = true, params.type, params.normalized  (note: normalized is a string)
		addToLog: function(params, initialContrib) {
			var wikipedia_page = new Morebits.wiki.page("User:" + mw.config.get('wgUserName') + "/" + Kaizo.getPref('speedyLogPageName'), "Adding entry to userspace log");
			params.logInitialContrib = initialContrib;
			wikipedia_page.setCallbackParameters(params);
			wikipedia_page.load(Kaizo.speedy.callbacks.user.saveLog);
		},

		saveLog: function(pageobj) {
			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();

			// add blurb if log page doesn't exist
			if (!pageobj.exists()) {
				text =
					"This is a log of all deletion requests made by this user using [[mh:dev:Kaizo|Kaizo]]'s QD module.\n\n" +
					"If you no longer wish to keep this log, you can turn it off using the [[Wikipedia:Kaizo/Preferences|preferences panel]], and " +
					"nominate this page for speedy deletion as your own userspace.\n";
				if (Morebits.userIsInGroup("sysop")) {
					text += "\nThis log does not track outright speedy deletions made using Kaizo.\n";
				}
			}

			// create monthly header
			var date = new Date();
			var headerRe = new RegExp("^==+\\s*" + date.getUTCMonthName() + "\\s+" + date.getUTCFullYear() + "\\s*==+", "m");
			if (!headerRe.exec(text)) {
				text += "\n\n=== " + date.getUTCMonthName() + " " + date.getUTCFullYear() + " ===";
			}

			text += "\n# [[:" + mw.config.get('wgPageName') + "]]: ";
			if (params.fromDI) {
				text += "DI [[WP:QD#" + params.normalized.toUpperCase() + "|QD " + params.normalized.toUpperCase() + "]] (" + params.type + ")";
			} else {
				if (params.normalizeds.length > 1) {
					text += "multiple criteria (";
					$.each(params.normalizeds, function(index, norm) {
						text += "[[WP:QD#" + norm.toUpperCase() + "|" + norm.toUpperCase() + ']], ';
					});
					text = text.substr(0, text.length - 2);  // remove trailing comma
					text += ')';
				} else if (params.normalizeds[0] === "db") {
					text += "{{tl|QD}}";
				} else {
					text += "[[WP:QD#" + params.normalizeds[0].toUpperCase() + "|CSD " + params.normalizeds[0].toUpperCase() + "]] ({{tl|db-" + params.values[0] + "}})";
				}
			}

			if (params.logInitialContrib) {
				text += "; notified {{user|" + params.logInitialContrib + "}}";
			}
			text += " ~~~~~\n";

			pageobj.setPageText(text);
			pageobj.setEditSummary("Logging quick deletion nomination of [[" + mw.config.get('wgPageName') + "]]." + Kaizo.getPref('summaryAd'));
			pageobj.setCreateOption("recreate");
			pageobj.save();
		}
	}
};

// prompts user for parameters to be passed into the speedy deletion tag
Kaizo.speedy.getParameters = function KaizospeedyGetParameters(value, normalized, statelem)
{
	var parameters = [];
	switch( normalized ) {
		case 'db':
			var dbrationale = prompt('Please enter a custom reason.   \n\"This page can be quickly deleted because:\"', "");
			if (!dbrationale || !dbrationale.replace(/^\s*/, "").replace(/\s*$/, ""))
			{
				statelem.error( 'You must specify a reason. Aborted by user.' );
				return null;
			}
			parameters["1"] = dbrationale;
			break;
		case 'g12':
			var url = prompt( '[QD G12] Please enter the URL if available, including the "http://":', "" );
			if (url === null)
			{
				statelem.error( 'Aborted by user.' );
				return null;
			}
			parameters.url = url;
			break;
		default:
			var defaultreason = prompt('You can enter more details here.  \n' +
				"Just click OK if you don't want or need to.", "");
			if (defaultreason === null) {
				return true;  // continue to next tag
			} else if (defaultreason !== "") {
				parameters["2"] = defaultreason;
			}
			break;
	}
	return parameters;
};

// function for processing talk page notification template parameters
Kaizo.speedy.getUserTalkParameters = function KaizospeedyGetUserTalkParameters(normalized, parameters)
{
	var utparams = [];
	switch (normalized)
	{
		case 'db':
			utparams["2"] = parameters["1"];
			break;
		case 'a10':
			utparams.key1 = "article";
			utparams.value1 = parameters.article;
			break;
		default:
			break;
	}
	return utparams;
};


Kaizo.speedy.resolveCsdValues = function KaizospeedyResolveCsdValues(e) {
	var values = (e.target.form ? e.target.form : e.target).getChecked('csd');
	if (values.length === 0) {
		alert( "Please select a criterion!" );
		return null;
	}
	return values;
};

Kaizo.speedy.callback.evaluateSysop = function KaizospeedyCallbackEvaluateSysop(e)
{
	mw.config.set('wgPageName', mw.config.get('wgPageName').replace(/_/g, ' ')); // for queen/king/whatever and country!
	var form = (e.target.form ? e.target.form : e.target);

	var tag_only = form.tag_only;
	if( tag_only && tag_only.checked ) {
		Kaizo.speedy.callback.evaluateUser(e);
		return;
	}

	var value = Kaizo.speedy.resolveCsdValues(e)[0];
	if (!value) {
		return;
	}
	var normalized = Kaizo.speedy.normalizeHash[ value ];

	var params = {
		value: value,
		normalized: normalized,
		watch: Kaizo.getPref('watchSpeedyPages').indexOf( normalized ) !== -1,
		reason: Kaizo.speedy.reasonHash[ value ],
		openusertalk: Kaizo.getPref('openUserTalkPageOnSpeedyDelete').indexOf( normalized ) !== -1,
		deleteTalkPage: form.talkpage && form.talkpage.checked,
		deleteRedirects: form.redirects.checked
	};

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( form );

	Kaizo.speedy.callbacks.sysop.main( params );
};

Kaizo.speedy.callback.evaluateUser = function KaizospeedyCallbackEvaluateUser(e) {
	mw.config.set('wgPageName', mw.config.get('wgPageName').replace(/_/g, ' '));  // for queen/king/whatever and country!
	var form = (e.target.form ? e.target.form : e.target);

	if (e.target.type === "checkbox") {
		return;
	}

	var values = Kaizo.speedy.resolveCsdValues(e);
	if (!values) {
		return;
	}
	//var multiple = form.multiple.checked;
	var normalizeds = [];
	$.each(values, function(index, value) {
		var norm = Kaizo.speedy.normalizeHash[ value ];

		// for sysops only
		if (['f4', 'f5', 'f6', 'f11'].indexOf(norm) !== -1) {
			alert("Tagging with F4, F5, F6, and F11 is not possible using the CSD module.  Try using DI instead, or unchecking \"Tag page only\" if you meant to delete the page.");
			return;
		}

		normalizeds.push(norm);
	});

	// analyse each criterion to determine whether to watch the page/notify the creator
	var watchPage = false;
	$.each(normalizeds, function(index, norm) {
		if (Kaizo.getPref('watchSpeedyPages').indexOf(norm) !== -1) {
			watchPage = true;
			return false;  // break
		}
	});

	var notifyuser = false;
	if (form.notify.checked) {
		$.each(normalizeds, function(index, norm) {
			if (Kaizo.getPref('notifyUserOnSpeedyDeletionNomination').indexOf(norm) !== -1) {
				notifyuser = true;
				return false;  // break
			}
		});
	}

	var welcomeuser = false;
	if (notifyuser) {
		$.each(normalizeds, function(index, norm) {
			if (Kaizo.getPref('welcomeUserOnSpeedyDeletionNotification').indexOf(norm) !== -1) {
				welcomeuser = true;
				return false;  // break
			}
		});
	}

	var csdlog = false;
	if (Kaizo.getPref('logSpeedyNominations')) {
		$.each(normalizeds, function(index, norm) {
			if (Kaizo.getPref('noLogOnSpeedyNomination').indexOf(norm) === -1) {
				csdlog = true;
				return false;  // break
			}
		});
	}

	var params = {
		values: values,
		normalizeds: normalizeds,
		watch: watchPage,
		usertalk: notifyuser,
		welcomeuser: welcomeuser,
		lognomination: csdlog
	};

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( form );

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = "Tagging complete";

	var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), "Tagging page");
	wikipedia_page.setCallbackParameters(params);
	wikipedia_page.load(Kaizo.speedy.callbacks.user.main);
};
/*
 ****************************************
 *** Kaizounlink.js: Unlink module
 ****************************************
 * Mode of invocation:     Tab ("Unlink")
 * Active on:              Non-special pages
 * Config directives in:   KaizoConfig
 */

Kaizo.unlink = function Kaizounlink() {
	if( mw.config.get('wgNamespaceNumber') < 0 ) {
		return;
	}
	twAddPortletLink( Kaizo.unlink.callback, "Unlink", "tw-unlink", "Unlink backlinks" );
};

Kaizo.unlink.getChecked2 = function KaizounlinkGetChecked2( nodelist ) {
	if( !( nodelist instanceof NodeList ) && !( nodelist instanceof HTMLCollection ) ) {
		return nodelist.checked ? [ nodelist.values ] : [];
	}
	var result = [];
	for(var i  = 0; i < nodelist.length; ++i ) {
		if( nodelist[i].checked ) {
			result.push( nodelist[i].values );
		}
	}
	return result;
};

// the parameter is used when invoking unlink from admin speedy
Kaizo.unlink.callback = function(presetReason) {
	var Window = new Morebits.simpleWindow( 800, 400 );
	Window.setTitle( "Unlink backlinks" );
	Window.setScriptName( "Kaizo" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#unlink" );

	var form = new Morebits.quickForm( Kaizo.unlink.callback.evaluate );
	form.append( {
		type: 'textarea',
		name: 'reason',
		label: 'Reason: ',
		value: (presetReason ? presetReason : '')
	} );

	var query;
	if(mw.config.get('wgNamespaceNumber') === 6) {  // File:
		query = {
			'action': 'query',
			'list': [ 'backlinks', 'imageusage' ],
			'bltitle': mw.config.get('wgPageName'),
			'iutitle': mw.config.get('wgPageName'),
			'bllimit': Morebits.userIsInGroup( 'sysop' ) ? 5000 : 500, // 500 is max for normal users, 5000 for bots and sysops
			'iulimit': Morebits.userIsInGroup( 'sysop' ) ? 5000 : 500, // 500 is max for normal users, 5000 for bots and sysops
			'blnamespace': Kaizo.getPref('unlinkNamespaces') // Main namespace and portal namespace only, keep on talk pages.
		};
	} else {
		query = {
			'action': 'query',
			'list': 'backlinks',
			'bltitle': mw.config.get('wgPageName'),
			'blfilterredir': 'nonredirects',
			'bllimit': Morebits.userIsInGroup( 'sysop' ) ? 5000 : 500, // 500 is max for normal users, 5000 for bots and sysops
			'blnamespace': Kaizo.getPref('unlinkNamespaces') // Main namespace and portal namespace only, keep on talk pages.
		};
	}
	var wikipedia_api = new Morebits.wiki.api( 'Grabbing backlinks', query, Kaizo.unlink.callbacks.display.backlinks );
	wikipedia_api.params = { form: form, Window: Window, image: mw.config.get('wgNamespaceNumber') === 6 };
	wikipedia_api.post();

	var root = document.createElement( 'div' );
	root.style.padding = '15px';  // just so it doesn't look broken
	Morebits.status.init( root );
	wikipedia_api.statelem.status( "loading..." );
	Window.setContent( root );
	Window.display();
};

Kaizo.unlink.callback.evaluate = function KaizounlinkCallbackEvaluate(event) {
	mw.config.set('wgPageName', mw.config.get('wgPageName').replace(/_/g, ' '));  // for queen/king/whatever and country!

	Kaizo.unlink.backlinksdone = 0;
	Kaizo.unlink.imageusagedone = 0;

	function processunlink(pages, imageusage) {
		var statusIndicator = new Morebits.status((imageusage ? 'Unlinking instances of file usage' : 'Unlinking backlinks'), '0%');
		var total = pages.length;  // removing doubling of this number - no apparent reason for it

		Morebits.wiki.addCheckpoint();

		if( !pages.length ) {
			statusIndicator.info( '100% (completed)' );
			Morebits.wiki.removeCheckpoint();
			return;
		}

		// get an edit token
		var params = { reason: reason, imageusage: imageusage, globalstatus: statusIndicator, current: 0, total: total };
		for (var i = 0; i < pages.length; ++i)
		{
			var myparams = $.extend({}, params);
			var articlepage = new Morebits.wiki.page(pages[i], 'Unlinking in article "' + pages[i] + '"');
			articlepage.setCallbackParameters(myparams);
			articlepage.load(imageusage ? Kaizo.unlink.callbacks.unlinkImageInstances : Kaizo.unlink.callbacks.unlinkBacklinks);
		}
	}

	var reason = event.target.reason.value;
	var backlinks, imageusage;
	if( event.target.backlinks ) {
		backlinks = Kaizo.unlink.getChecked2(event.target.backlinks);
	}
	if( event.target.imageusage ) {
		imageusage = Kaizo.unlink.getChecked2(event.target.imageusage);
	}

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( event.target );
	Morebits.wiki.addCheckpoint();
	if (backlinks) {
		processunlink(backlinks, false);
	}
	if (imageusage) {
		processunlink(imageusage, true);
	}
	Morebits.wiki.removeCheckpoint();
};

Kaizo.unlink.backlinksdone = 0;
Kaizo.unlink.imageusagedone = 0;

Kaizo.unlink.callbacks = {
	display: {
		backlinks: function KaizounlinkCallbackDisplayBacklinks(apiobj) {
			var xmlDoc = apiobj.responseXML;
			var havecontent = false;
			var list, namespaces, i;

			if( apiobj.params.image ) {
				var imageusage = $(xmlDoc).find('query imageusage iu');
				list = [];
				for ( i = 0; i < imageusage.length; ++i ) {
					var usagetitle = imageusage[i].getAttribute('title');
					list.push( { label: usagetitle, value: usagetitle, checked: true } );
				}
				if (!list.length)
				{
					apiobj.params.form.append( { type: 'div', label: 'No instances of file usage found.' } );
				}
				else
				{
					apiobj.params.form.append( { type:'header', label: 'File usage' } );
					namespaces = [];
					$.each(Kaizo.getPref('unlinkNamespaces'), function(k, v) {
						namespaces.push(Morebits.wikipedia.namespacesFriendly[v]);
					});
					apiobj.params.form.append( {
						type: 'div',
						label: "Selected namespaces: " + namespaces.join(', '),
						tooltip: "You can change this with your Kaizo preferences, at [[Meta:Kaizo/Preferences]]"
					});
					if ($(xmlDoc).find('query-continue').length) {
						apiobj.params.form.append( {
							type: 'div',
							label: "First " + list.length.toString() + " file usages shown."
						});
					}
					apiobj.params.form.append( {
						type: 'checkbox',
						name: 'imageusage',
						list: list
					} );
					havecontent = true;
				}
			}

			var backlinks = $(xmlDoc).find('query backlinks bl');
			if( backlinks.length > 0 ) {
				list = [];
				for ( i = 0; i < backlinks.length; ++i ) {
					var title = backlinks[i].getAttribute('title');
					list.push( { label: title, value: title, checked: true } );
				}
				apiobj.params.form.append( { type:'header', label: 'Backlinks' } );
				namespaces = [];
				$.each(Kaizo.getPref('unlinkNamespaces'), function(k, v) {
					namespaces.push(Morebits.wikipedia.namespacesFriendly[v]);
				});
				apiobj.params.form.append( {
					type: 'div',
					label: "Selected namespaces: " + namespaces.join(', '),
					tooltip: "You can change this with your Kaizo preferences, at [[WP:TWPREFS]]"
				});
				if ($(xmlDoc).find('query-continue').length) {
					apiobj.params.form.append( {
						type: 'div',
						label: "First " + list.length.toString() + " backlinks shown."
					});
				}
				apiobj.params.form.append( {
					type: 'checkbox',
					name: 'backlinks',
					list: list
				});
				havecontent = true;
			}
			else
			{
				apiobj.params.form.append( { type: 'div', label: 'No backlinks found.' } );
			}

			if (havecontent) {
				apiobj.params.form.append( { type:'submit' } );
			}

			var result = apiobj.params.form.render();
			apiobj.params.Window.setContent( result );
		}
	},
	unlinkBacklinks: function KaizounlinkCallbackUnlinkBacklinks(pageobj) {
		var text, oldtext;
		text = oldtext = pageobj.getPageText();
		var params = pageobj.getCallbackParameters();

		var wikiPage = new Morebits.wikitext.page(text);
		wikiPage.removeLink(mw.config.get('wgPageName'));
		text = wikiPage.getText();
		if (text === oldtext) {
			// Nothing to do, return
			Kaizo.unlink.callbacks.success(pageobj);
			Morebits.wiki.actionCompleted();
			return;
		}

		pageobj.setPageText(text);
		pageobj.setEditSummary("Removing link(s) to \"" + mw.config.get('wgPageName') + "\": " + params.reason + "." + Kaizo.getPref('summaryAd'));
		pageobj.setCreateOption('nocreate');
		pageobj.save(Kaizo.unlink.callbacks.success);
	},
	unlinkImageInstances: function KaizounlinkCallbackUnlinkImageInstances(pageobj) {
		var text, oldtext;
		text = oldtext = pageobj.getPageText();
		var params = pageobj.getCallbackParameters();

		var wikiPage = new Morebits.wikitext.page(text);
		wikiPage.commentOutImage(mw.config.get('wgTitle'), 'Commented out');
		text = wikiPage.getText();
		if (text === oldtext) {
			// Nothing to do, return
			Kaizo.unlink.callbacks.success(pageobj);
			Morebits.wiki.actionCompleted();
			return;
		}

		pageobj.setPageText(text);
		pageobj.setEditSummary("Commenting out use(s) of file \"" + mw.config.get('wgPageName') + "\": " + params.reason + "." + Kaizo.getPref('summaryAd'));
		pageobj.setCreateOption('nocreate');
		pageobj.save(Kaizo.unlink.callbacks.success);
	},
	success: function KaizounlinkCallbackSuccess(pageobj) {
		var params = pageobj.getCallbackParameters();
		var total = params.total;
		var now = parseInt( 100 * (params.imageusage ? ++(Kaizo.unlink.imageusagedone) : ++(Kaizo.unlink.backlinksdone))/total, 10 ) + '%';
		params.globalstatus.update( now );
		if((params.imageusage ? Kaizo.unlink.imageusagedone : Kaizo.unlink.backlinksdone) >= total) {
			params.globalstatus.info( now + ' (completed)' );
			Morebits.wiki.removeCheckpoint();
		}
	}
};
/*
 ****************************************
 *** Kaizowarn.js: Warn module
 ****************************************
 * Mode of invocation:     Tab ("Warn")
 * Active on:              User talk pages
 * Config directives in:   KaizoConfig
 */

Kaizo.warn = function Kaizowarn() {
	if( mw.config.get('wgNamespaceNumber') === 3 ) {
			twAddPortletLink( Kaizo.warn.callback, "Warn", "tw-warn", "Warn/notify user" );
	}

	// modify URL of talk page on rollback success pages
	if( mw.config.get('wgAction') === 'rollback' ) {
		var $vandalTalkLink = $("#mw-rollback-success").find(".mw-usertoollinks a").first();
		$vandalTalkLink.css("font-weight", "bold");
		$vandalTalkLink.wrapInner($("<span/>").attr("title", "If appropriate, you can use Kaizo to warn the user about their edits to this page."));

		var extraParam = "vanarticle=" + mw.util.rawurlencode(mw.config.get("wgPageName").replace(/_/g, " "));
		var href = $vandalTalkLink.attr("href");
		if (href.indexOf("?") === -1) {
			$vandalTalkLink.attr("href", href + "?" + extraParam);
		} else {
			$vandalTalkLink.attr("href", href + "&" + extraParam);
		}
	}
};

Kaizo.warn.callback = function KaizowarnCallback() {
	if ( !KaizoUserAuthorized ) {
		alert("Your account is too new to use Kaizo.");
		return;
	}
	if( mw.config.get('wgTitle').split( '/' )[0] === mw.config.get('wgUserName') &&
			!confirm( 'Warning yourself can be seen as a sign of mental instability! Are you sure you want to proceed?' ) ) {
		return;
	}
	
	var Window = new Morebits.simpleWindow( 600, 440 );
	Window.setTitle( "Warn/notify user" );
	Window.setScriptName( "Kaizo" );
	Window.addFooterLink( "User talk page warnings", "Template:User_talk_page_warnings#Warnings_and_notices" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#warn" );

	var form = new Morebits.quickForm( Kaizo.warn.callback.evaluate );
	var main_select = form.append( {
			type:'field',
			label:'Choose type of warning/notice to issue',
			tooltip:'First choose a main warning group, then the specific warning to issue.'
		} );

	var main_group = main_select.append( {
			type:'select',
			name:'main_group',
			event:Kaizo.warn.callback.change_category
		} );

	var defaultGroup = parseInt(Kaizo.getPref('defaultWarningGroup'), 10);
	main_group.append( { type:'option', label:'General note (1)', value:'level1', selected: ( defaultGroup === 1 || defaultGroup < 1 || ( Morebits.userIsInGroup( 'sysop' ) ? defaultGroup > 8 : defaultGroup > 7 ) ) } );
	main_group.append( { type:'option', label:'Caution (2)', value:'level2', selected: ( defaultGroup === 2 ) } );
	main_group.append( { type:'option', label:'Warning (3)', value:'level3', selected: ( defaultGroup === 3 ) } );
	main_group.append( { type:'option', label:'Final warning (4)', value:'level4', selected: ( defaultGroup === 4 ) } );
	//main_group.append( { type:'option', label:'Only warning (4im)', value:'level4im', selected: ( defaultGroup === 5 ) } );
	if(Morebits.userIsInGroup("wikicreator")){// Only use this when all of the single issue notices are for wiki creators-- remove this once there's at least one not for them
		main_group.append( { type:'option', label:'Single issue notices', value:'singlenotice', selected: ( defaultGroup === 6 ) } );
	}
	main_group.append( { type:'option', label:'Single issue warnings', value:'singlewarn', selected: ( defaultGroup === 7 ) } );
	if( Morebits.userIsInGroup( 'sysop' ) ) {
		main_group.append( { type:'option', label:'Blocking', value:'block', selected: ( defaultGroup === 8 ) } );
	}

	main_select.append( { type:'select', name:'sub_group', event:Kaizo.warn.callback.change_subcategory } ); //Will be empty to begin with.

	form.append( {
			type:'input',
			name:'article',
			label:'Linked article',
			value:( Morebits.queryString.exists( 'vanarticle' ) ? Morebits.queryString.get( 'vanarticle' ) : '' ),
			tooltip:'An article can be linked within the notice, perhaps because it was a revert to said article that dispatched this notice. Leave empty for no article to be linked.'
		} );

	var more = form.append( { type: 'field', name: 'reasonGroup', label: 'Warning information' } );
	more.append( { type:'textarea', label:'Optional message:', name:'reason', tooltip:'Perhaps a reason, or that a more detailed notice must be appended' } );

	var previewlink = document.createElement( 'a' );
	$(previewlink).click(function(){
		Kaizo.warn.callbacks.preview(result);  // |result| is defined below
	});
	previewlink.style.cursor = "pointer";
	previewlink.textContent = 'Preview';
	more.append( { type: 'div', id: 'warningpreview', label: [ previewlink ] } );
	more.append( { type: 'div', id: 'Kaizowarn-previewbox', style: 'display: none' } );

	more.append( { type:'submit', label:'Submit' } );

	var result = form.render();
	Window.setContent( result );
	Window.display();
	result.main_group.root = result;
	result.previewer = new Morebits.wiki.preview($(result).find('div#Kaizowarn-previewbox').last()[0]);

	// We must init the first choice (General Note);
	var evt = document.createEvent( "Event" );
	evt.initEvent( 'change', true, true );
	result.main_group.dispatchEvent( evt );
};

// This is all the messages that might be dispatched by the code
// Each of the individual templates require the following information:
//   label (required): A short description displayed in the dialog
//   summary (required): The edit summary used. If an article name is entered, the summary is postfixed with "on [[article]]", and it is always postfixed with ". $summaryAd"
//   suppressArticleInSummary (optional): Set to true to suppress showing the article name in the edit summary. Useful if the warning relates to attack pages, or some such.
Kaizo.warn.messages = {
	level1: {
		"uw-vandalism1": {
			label:"Vandalism",
			summary:"General note: Unhelpful changes"
		},
		"uw-test1": {
			label:"Editing tests",
			summary:"General note: Editing tests"
		},
		"uw-create1": { 
			label:"Creating inappropriate pages", 
			summary:"General note: Creating inappropriate pages" 
		},
		"uw-advert1": { 
			label:"Using Miraheze for advertising or promotion", 
			summary:"General note: Using Miraheze for advertising or promotion" 
		}
	},
	level2: {
		"uw-vandalism2": { 
			label:"Vandalism", 
			summary:"Caution: Vandalism" 
		},
		"uw-test2": { 
			label:"Editing tests", 
			summary:"Caution: Editing tests" 
		},
		"uw-create2": { 
			label:"Creating inappropriate pages", 
			summary:"Caution: Creating inappropriate pages" 
		},
		"uw-advert2": { 
			label:"Using Miraheze for advertising or promotion", 
			summary:"Caution: Using Miraheze for advertising or promotion" 
		}
	},
	level3: {
		"uw-vandalism3": { 
			label:"Vandalism", 
			summary:"Warning: Vandalism" 
		},
		"uw-test3": { 
			label:"Editing tests", 
			summary:"Warning: Editing tests" 
		},

		"uw-create3": { 
			label:"Creating inappropriate pages", 
			summary:"Warning: Creating inappropriate pages" 
		},
		"uw-advert3": { 
			label:"Using Miraheze for advertising or promotion", 
			summary:"Warning: Using Miraheze for advertising or promotion" 
		}

	},
	level4: {
		"uw-vandalism4": { 
			label:"Vandalism", 
			summary:"Final warning: Vandalism" 
		},
		"uw-test4": { 
			label:"Editing tests", 
			summary:"Final warning: Editing tests" 
		},
		"uw-create4": { 
			label:"Creating inappropriate pages", 
			summary:"Final warning: Creating inappropriate pages" 
		}

	},
	level4im: {},
	singlenotice: {
		"uw-dupewikireq": { 
			label:"Duplicate wiki request", 
			summary:"Notice: Duplicate wiki request"
		},
		"uw-invalidwikireq": { 
			label:"Invalid wiki request", 
			summary:"Notice: Invalid wiki request"
		},
	},
	singlewarn: {
		"uw-harass": { 
			label:"Creating attack pages", 
			summary:"Warning: Creating attack pages" 
		},
		"uw-npa": { 
			label:"Personal attack directed at another editor", 
			summary:"Warning: Personal attack directed at another editor" 
		},
		"uw-sock": { 
			label:"Sockpuppetry", 
			summary:"Warning: Sockpuppetry" 
		},
		"uw-sock": { 
			label:"Sockpuppetry", 
			summary:"Warning: Sockpuppetry" 
		},
		"uw-username": { 
			label:"Username Policy violation", 
			summary:"Warning: Username Policy violation" 
		}
	},
	block: {
		"blocked": {
			label: "Block level 1",
			summary: "You have been blocked",
			reasonParam: true 
		}
	}
};

if(!Morebits.userIsInGroup("steward") && !Morebits.userIsInGroup("globalsysop")){
	delete Kaizo.warn.messages.singlewarn["uw-username"];
}

if(!Morebits.userIsInGroup("wikicreator")){
	delete Kaizo.warn.messages.singlenotice["uw-dupewikireq"];
	delete Kaizo.warn.messages.singlenotice["uw-invalidwikireq"];
}

Kaizo.warn.prev_block_timer = null;
Kaizo.warn.prev_block_reason = null;
Kaizo.warn.prev_article = null;
Kaizo.warn.prev_reason = null;

Kaizo.warn.callback.change_category = function KaizowarnCallbackChangeCategory(e) {
	var value = e.target.value;
	var sub_group = e.target.root.sub_group;
	var messages = Kaizo.warn.messages[ value ];
	sub_group.main_group = value;
	var old_subvalue = sub_group.value;
	var old_subvalue_re;
	if( old_subvalue ) {
		old_subvalue = old_subvalue.replace(/\d*(im)?$/, '' );
		old_subvalue_re = new RegExp( RegExp.escape( old_subvalue ) + "(\\d*(?:im)?)$" );
	}

	while( sub_group.hasChildNodes() ){
		sub_group.removeChild( sub_group.firstChild );
	}

	for( var i in messages ) {
		var selected = false;
		if( old_subvalue && old_subvalue_re.test( i ) ) {
			selected = true;
		}
		var elem = new Morebits.quickForm.element( { type:'option', label:"{{" + i + "}}: " + messages[i].label, value:i, selected: selected } );
		
		sub_group.appendChild( elem.render() );
	}

	if( value === 'block' ) {
		// create the block-related fields
		var more = new Morebits.quickForm.element( { type: 'div', id: 'block_fields' } );
		more.append( {
			type: 'input',
			name: 'block_timer',
			label: 'Period of blocking / Host ',
			tooltip: 'The period the blocking is due for, for example 24 hours, 2 weeks, indefinite etc... If you selected "blocked proxy", this text box will append the host name of the server'
		} );
		more.append( {
			type: 'input',
			name: 'block_reason',
			label: '"You have been blocked for ..." ',
			tooltip: 'An optional reason, to replace the default generic reason. Only available for the generic block templates.'
		} );
		
		e.target.root.insertBefore( more.render(), e.target.root.lastChild );

		// restore saved values of fields
		if(Kaizo.warn.prev_block_timer !== null) {
			e.target.root.block_timer.value = Kaizo.warn.prev_block_timer;
			Kaizo.warn.prev_block_timer = null;
		}
		if(Kaizo.warn.prev_block_reason !== null) {
			e.target.root.block_reason.value = Kaizo.warn.prev_block_reason;
			Kaizo.warn.prev_block_reason = null;
		}
		if(Kaizo.warn.prev_article === null) {
			Kaizo.warn.prev_article = e.target.root.article.value;
		}
		e.target.root.article.disabled = false;

		$(e.target.root.reason).parent().hide();
		e.target.root.previewer.closePreview();
	} else if( e.target.root.block_timer ) {
		// hide the block-related fields
		if(!e.target.root.block_timer.disabled && Kaizo.warn.prev_block_timer === null) {
			Kaizo.warn.prev_block_timer = e.target.root.block_timer.value;
		}
		if(!e.target.root.block_reason.disabled && Kaizo.warn.prev_block_reason === null) {
			Kaizo.warn.prev_block_reason = e.target.root.block_reason.value;
		}
		$(e.target.root).find("#block_fields").remove();

		if(e.target.root.article.disabled && Kaizo.warn.prev_article !== null) {
			e.target.root.article.value = Kaizo.warn.prev_article;
			Kaizo.warn.prev_article = null;
		}
		e.target.root.article.disabled = false;

		$(e.target.root.reason).parent().show();
		e.target.root.previewer.closePreview();
	}

	// clear overridden label on article textbox
	Morebits.quickForm.setElementTooltipVisibility(e.target.root.article, true);
	Morebits.quickForm.resetElementLabel(e.target.root.article);
};

Kaizo.warn.callback.change_subcategory = function KaizowarnCallbackChangeSubcategory(e) {
	var main_group = e.target.form.main_group.value;
	var value = e.target.form.sub_group.value;

	if( main_group === 'singlewarn' ) {
		if( value === 'uw-username' ) {
			if(Kaizo.warn.prev_article === null) {
				Kaizo.warn.prev_article = e.target.form.article.value;
			}
			e.target.form.article.notArticle = true;
			e.target.form.article.value = '';
		} else if( e.target.form.article.notArticle ) {
			if(Kaizo.warn.prev_article !== null) {
				e.target.form.article.value = Kaizo.warn.prev_article;
				Kaizo.warn.prev_article = null;
			}
			e.target.form.article.notArticle = false;
		}
	} else if( main_group === 'block' ) {
		if( Kaizo.warn.messages.block[value].indefinite ) {
			if(Kaizo.warn.prev_block_timer === null) {
				Kaizo.warn.prev_block_timer = e.target.form.block_timer.value;
			}
			e.target.form.block_timer.disabled = true;
			e.target.form.block_timer.value = 'indefinite';
		} else if( e.target.form.block_timer.disabled ) {
			if(Kaizo.warn.prev_block_timer !== null) {
				e.target.form.block_timer.value = Kaizo.warn.prev_block_timer;
				Kaizo.warn.prev_block_timer = null;
			}
			e.target.form.block_timer.disabled = false;
		}

		if( Kaizo.warn.messages.block[value].pageParam ) {
			if(Kaizo.warn.prev_article !== null) {
				e.target.form.article.value = Kaizo.warn.prev_article;
				Kaizo.warn.prev_article = null;
			}
			e.target.form.article.disabled = false;
		} else if( !e.target.form.article.disabled ) {
			if(Kaizo.warn.prev_article === null) {
				Kaizo.warn.prev_article = e.target.form.article.value;
			}
			e.target.form.article.disabled = true;
			e.target.form.article.value = '';
		}

		if( Kaizo.warn.messages.block[value].reasonParam ) {
			if(Kaizo.warn.prev_block_reason !== null) {
				e.target.form.block_reason.value = Kaizo.warn.prev_block_reason;
				Kaizo.warn.prev_block_reason = null;
			}
			e.target.form.block_reason.disabled = false;
		} else if( !e.target.form.block_reason.disabled ) {
			if(Kaizo.warn.prev_block_reason === null) {
				Kaizo.warn.prev_block_reason = e.target.form.block_reason.value;
			}
			e.target.form.block_reason.disabled = true;
			e.target.form.block_reason.value = '';
		}
	}

	// change form labels according to the warning selected
	if (value === "uw-username") {
		Morebits.quickForm.setElementTooltipVisibility(e.target.form.article, false);
		Morebits.quickForm.overrideElementLabel(e.target.form.article, "Username violates policy because... ");
	} else {
		Morebits.quickForm.setElementTooltipVisibility(e.target.form.article, true);
		Morebits.quickForm.resetElementLabel(e.target.form.article);
	}
};

Kaizo.warn.callbacks = {
	preview: function(form) {
		var templatename = form.sub_group.value;
		
		var templatetext = '{{subst:' + templatename;
		var linkedarticle = form.article.value;
		if (templatename in Kaizo.warn.messages.block) {
			if( linkedarticle && Kaizo.warn.messages.block[templatename].pageParam ) {
				templatetext += '|page=' + linkedarticle;
			}

			var blocktime = form.block_timer.value;
			if( /te?mp|^\s*$|min/.exec( blocktime ) || Kaizo.warn.messages.block[templatename].indefinite ) {
				; // nothing
			} else if( /indef|\*|max/.exec( blocktime ) ) {
				templatetext += '|indef=yes';
			} else {
					templatetext += '|host=' + blocktime;
					templatetext += '|time=' + blocktime;
			}

			var blockreason = form.block_reason.value;
			if( blockreason ) {
				templatetext += '|reason=' + blockreason;
			}

			templatetext += "|sig=true}}";
		} else {
			if (linkedarticle) {
				// add linked article for user warnings (non-block templates)
				templatetext += '|1=' + linkedarticle;
			}
			templatetext += '}}';

			// add extra message for non-block templates
			var reason = form.reason.value;
			if (reason) {
				templatetext += " ''" + reason + "''";
			}
		}

		form.previewer.beginRender(templatetext);
	},
	main: function( pageobj ) {
		var text = pageobj.getPageText();
		var params = pageobj.getCallbackParameters();
		var messageData = Kaizo.warn.messages[params.main_group][params.sub_group];

		var history_re = /<!-- Template:(uw-.*?) -->.*?(\d{1,2}:\d{1,2}, \d{1,2} \w+ \d{4}) \(UTC\)/g;
		var history = {};
		var latest = { date:new Date( 0 ), type:'' };
		var current;

		while( ( current = history_re.exec( text ) ) ) {
			var current_date = new Date( current[2] + ' UTC' );
			if( !( current[1] in history ) ||  history[ current[1] ] < current_date ) {
				history[ current[1] ] = current_date;
			}
			if( current_date > latest.date ) {
				latest.date = current_date;
				latest.type = current[1];
			}
		}

		var date = new Date();

		if( params.sub_group in history ) {
			var temp_time = new Date( history[ params.sub_group ] );
			temp_time.setUTCHours( temp_time.getUTCHours() + 24 );

			if( temp_time > date ) {
				if( !confirm( "An identical " + params.sub_group + " has been issued in the last 24 hours.  \nWould you still like to add this warning/notice?" ) ) {
					pageobj.statelem.info( 'aborted per user request' );
					return;
				}
			}
		}

		latest.date.setUTCMinutes( latest.date.getUTCMinutes() + 1 ); // after long debate, one minute is max

		if( latest.date > date ) {
			if( !confirm( "A " + latest.type + " has been issued in the last minute.  \nWould you still like to add this warning/notice?" ) ) {
				pageobj.statelem.info( 'aborted per user request' );
				return;
			}
		}
		
		var mainheaderRe = new RegExp("==+\\s*Warnings\\s*==+");
		var headerRe = new RegExp( "^==+\\s*(?:" + date.getUTCMonthName() + '|' + date.getUTCMonthNameAbbrev() +  ")\\s+" + date.getUTCFullYear() + "\\s*==+", 'm' );

		if( text.length > 0 ) {
			text += "\n\n";
		}

		if( params.main_group === 'block' ) {
			var article = '', reason = '', host = '', time = null;
			
			if( Kaizo.getPref('blankTalkpageOnIndefBlock') && params.sub_group !== 'uw-lblock' && ( Kaizo.warn.messages.block[params.sub_group].indefinite || (/indef|\*|max/).exec( params.block_timer ) ) ) {
				Morebits.status.info( 'Info', 'Blanking talk page per preferences and creating a new level 2 heading for the date' );
				text = "== " + date.getUTCMonthName() + " " + date.getUTCFullYear() + " ==\n";
			} else if( !headerRe.exec( text ) ) {
				Morebits.status.info( 'Info', 'Will create a new level 2 heading for the date, as none was found for this month' );
				text += "== " + date.getUTCMonthName() + " " + date.getUTCFullYear() + " ==\n";
			}
			
			if( params.reason && Kaizo.warn.messages.block[params.sub_group].reasonParam ) {
				reason = '|reason=' + params.reason;
			}
			
			if( /te?mp|^\s*$|min/.exec( params.block_timer ) || Kaizo.warn.messages.block[params.sub_group].indefinite ) {
				time = '';
			} else if( /indef|\*|max/.exec( params.block_timer ) ) {
				time = '|indef=yes';
			} else {
				time = '|time=' + params.block_timer;
			}
			
			if ( params.sub_group === "Blocked proxy" )
			{
				text += "{{" + params.sub_group + "|host=" + params.block_timer + "}}";
				
			} else {
				text += "{{subst:" + params.sub_group + time + reason + "|sig=yes}}";
			}
		} else {
			if( !headerRe.exec( text ) ) {
				Morebits.status.info( 'Info', 'Will create a new level 2 heading for the date, as none was found for this month' );
				text += "== " + date.getUTCMonthName() + " " + date.getUTCFullYear() + " ==\n";
			}
			text += "{{subst:" + params.sub_group + ( params.article ? '|1=' + params.article : '' ) + "|subst=subst:}}" + (params.reason ? " ''" + params.reason + "'' ": ' ' ) + "~~~~";
		}
		
		if ( Kaizo.getPref('showSharedIPNotice') && Morebits.isIPAddress( mw.config.get('wgTitle') ) ) {
			Morebits.status.info( 'Info', 'Adding a shared IP notice' );
			text +=  "\n{{subst:SharedIPAdvice}}";
		}

		var summary = messageData.summary;
		if ( messageData.suppressArticleInSummary !== true && params.article ) {
			if(params.sub_group == "uw-username"){
				summary += " because \"" + params.article + "\"";
			}
			else{
				summary += " on [[" + params.article + "]]";
			}
		}
		summary += "." + Kaizo.getPref("summaryAd");

		pageobj.setPageText( text );
		pageobj.setEditSummary( summary );
		pageobj.setWatchlist( Kaizo.getPref('watchWarnings') );
		pageobj.save();
	}
};

Kaizo.warn.callback.evaluate = function KaizowarnCallbackEvaluate(e) {

	// First, check to make sure a reason was filled in if uw-username was selected
	
	if(e.target.sub_group.value === 'uw-username' && e.target.article.value.trim() === '') {
		alert("You must supply a reason for the {{uw-username}} template.");
		return;
	}

	// Then, grab all the values provided by the form
	
	var params = {
		reason: e.target.block_reason ? e.target.block_reason.value : e.target.reason.value,
		main_group: e.target.main_group.value,
		sub_group: e.target.sub_group.value,
		article: e.target.article.value,  // .replace( /^(Image|Category):/i, ':$1:' ),  -- apparently no longer needed...
		block_timer: e.target.block_timer ? e.target.block_timer.value : null
	};

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( e.target );

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = "Warning complete, reloading talk page in a few seconds";

	var wikipedia_page = new Morebits.wiki.page( mw.config.get('wgPageName'), 'User talk page modification' );
	wikipedia_page.setCallbackParameters( params );
	wikipedia_page.setFollowRedirect( true );
	wikipedia_page.load( Kaizo.warn.callbacks.main );
};

/*
 ****************************************
 *** Kaizoxfd.js: XFD module
 ****************************************
 * Mode of invocation:     Tab ("XFD")
 * Active on:              Existing, non-special pages, except for file pages with no local (non-Commons) file which are not redirects
 * Config directives in:   KaizoConfig
 */

Kaizo.xfd = function Kaizoxfd() {
	// Disable on:
	// * special pages
	// * non-existent pages
	// * files on Commons, whether there is a local page or not (unneeded local pages of files on Commons are eligible for CSD F2)
	// * file pages without actual files (these are eligible for CSD G8)
	if ( mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId') || (mw.config.get('wgNamespaceNumber') === 6 && (document.getElementById('mw-sharedupload') || (!document.getElementById('mw-imagepage-section-filehistory') && !Morebits.wiki.isPageRedirect()))) ) {
		return;
	}
	//twAddPortletLink( Kaizo.xfd.callback, "RfD", "tw-xfd", "Nominate for deletion" );
};

Kaizo.xfd.num2order = function KaizoxfdNum2order( num ) {
	switch( num ) {
	case 1: return '';
	case 2: return '2nd';
	case 3: return '3rd';
	default: return num + 'th';
	}
};

Kaizo.xfd.currentRationale = null;

// error callback on Morebits.status.object
Kaizo.xfd.printRationale = function KaizoxfdPrintRationale() {
	if (Kaizo.xfd.currentRationale) {
		var p = document.createElement("p");
		p.textContent = "Your deletion rationale is provided below, which you can copy and paste into a new XFD dialog if you wish to try again:";
		var pre = document.createElement("pre");
		pre.className = "toccolours";
		pre.style.marginTop = "0";
		pre.textContent = Kaizo.xfd.currentRationale;
		p.appendChild(pre);
		Morebits.status.root.appendChild(p);
		// only need to print the rationale once
		Kaizo.xfd.currentRationale = null;
	}
};

Kaizo.xfd.callback = function KaizoxfdCallback() {
	if (!KaizoUserAuthorized) {
		alert("Your account is too new to use Kaizo.");
		return;
	}

	var Window = new Morebits.simpleWindow( 600, 350 );
	Window.setTitle( "Nominate for deletion (RfD)" );
	Window.setScriptName( "Kaizo" );
	Window.addFooterLink( "Deletion policy", "Wikipedia:Deletion policy" );
	Window.addFooterLink( "About deletion discussions", "WP:RfD" );
	Window.addFooterLink( "Kaizo help", "WP:TW/DOC#xfd" );

	var form = new Morebits.quickForm( Kaizo.xfd.callback.evaluate );
	var categories = form.append( {
			type: 'select',
			name: 'category',
			label: 'Select wanted type of category: ',
			tooltip: 'This default should be the most appropriate, as no other deletion discussion pages exist here.',
			event: Kaizo.xfd.callback.change_category
		} );
	categories.append( {
			type: 'option',
			label: 'RfD (Requests for deletion)',
			selected: true,
			value: 'afd'
		} );
	form.append( {
			type: 'checkbox',
			list: [
				{
					label: 'Notify page creator if possible',
					value: 'notify',
					name: 'notify',
					tooltip: "A notification template will be placed on the creator's talk page if this is true.",
					checked: true
				}
			]
		}
	);
	form.append( {
			type: 'field',
			label:'Work area',
			name: 'work_area'
		} );
	form.append( { type:'submit' } );

	var result = form.render();
	Window.setContent( result );
	Window.display();

	// We must init the controls
	var evt = document.createEvent( "Event" );
	evt.initEvent( 'change', true, true );
	result.category.dispatchEvent( evt );
};

Kaizo.xfd.previousNotify = true;

Kaizo.xfd.callback.change_category = function KaizoxfdCallbackChangeCategory(e) {
	var value = e.target.value;
	var form = e.target.form;
	var old_area = Morebits.quickForm.getElements(e.target.form, "work_area")[0];
	var work_area = null;

	var oldreasontextbox = form.getElementsByTagName('textarea')[0];
	var oldreason = (oldreasontextbox ? oldreasontextbox.value : '');

		work_area = new Morebits.quickForm.element( {
				type: 'field',
				label: 'Requests for deletion',
				name: 'work_area'
			} );
		work_area.append( {
				type: 'checkbox',
				list: [
						{
							label: 'Wrap deletion tag with <noinclude>',
							value: 'noinclude',
							name: 'noinclude',
							tooltip: 'Will wrap the deletion tag in &lt;noinclude&gt; tags, so that it won\'t transclude. This option is not normally required.'
						}
					]
		} );

		work_area.append( {
				type: 'textarea',
				name: 'xfdreason',
				label: 'Reason: '
			} );
		work_area = work_area.render();
		old_area.parentNode.replaceChild( work_area, old_area );
	}

Kaizo.xfd.callbacks = {
	afd: {
		main: function(apiobj) {
			var xmlDoc = apiobj.responseXML;
			var titles = $(xmlDoc).find('allpages p');

			// There has been no earlier entries with this prefix, just go on.
			if( titles.length <= 0 ) {
				apiobj.params.numbering = apiobj.params.number = '';
			} else {
				var number = 0;
				for( var i = 0; i < titles.length; ++i ) {
					var title = titles[i].getAttribute('title');

					// First, simple test, is there an instance with this exact name?
					if( title === 'Wikipedia:Requests for deletion/Requests/' + ((new Date()).getUTCFullYear()) + '/' + mw.config.get('wgPageName') ) {
						number = Math.max( number, 1 );
						continue;
					}

					var order_re = new RegExp( '^' +
						RegExp.escape( 'Wikipedia:Requests for deletion/Requests/' + ((new Date()).getUTCFullYear()) + '/' + mw.config.get('wgPageName'), true ) +
						'\\s*\\(\\s*(\\d+)(?:(?:th|nd|rd|st) nom(?:ination)?)?\\s*\\)\\s*$');
					var match = order_re.exec( title );

					// No match; A non-good value
					if( !match ) {
						continue;
					}

					// A match, set number to the max of current
					number = Math.max( number, Number(match[1]) );
				}
				apiobj.params.number = Kaizo.xfd.num2order( parseInt( number, 10 ) + 1);
				apiobj.params.numbering = number > 0 ? ' (' + apiobj.params.number + ' nomination)' : '';
			}
			apiobj.params.discussionpage = 'Wikipedia:Requests for deletion/Requests/' + ((new Date()).getUTCFullYear()) + '/' + mw.config.get('wgPageName') + apiobj.params.numbering;

			Morebits.status.info( "Next discussion page", "[[" + apiobj.params.discussionpage + "]]" );

			// Updating data for the action completed event
			Morebits.wiki.actionCompleted.redirect = apiobj.params.discussionpage;
			Morebits.wiki.actionCompleted.notice = "Nomination completed, now redirecting to the discussion page";

			// Tagging article
			var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), "Adding deletion tag to article");
			if(window.location.search.includes("redirect=no")) {
				wikipedia_page.setFollowRedirect(false); // User's intention was probably to tag the redirect itself
			} else {
				wikipedia_page.setFollowRedirect(true);  // should never be needed, but if the article is moved, we would want to follow the redirect
			}
			wikipedia_page.setCallbackParameters(apiobj.params);
			wikipedia_page.load(Kaizo.xfd.callbacks.afd.taggingArticle);
		},
		// Tagging needs to happen before everything else: this means we can check if there is an AfD tag already on the page
		taggingArticle: function(pageobj) {
			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();
			var statelem = pageobj.getStatusElement();

			// Check for existing AfD tag, for the benefit of new page patrollers
			var textNoAfd = text.replace(/\{\{\s*(Requests for deletion\/dated|RfDM)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g, "");
			if (text !== textNoAfd) {
				if (confirm("An RfD tag was found on this article. Maybe someone beat you to it.  \nClick OK to replace the current RfD tag (not recommended), or Cancel to abandon your nomination.")) {
					text = textNoAfd;
				} else {
					statelem.error("Article already tagged with RfD tag, and you chose to abort");
					window.location.reload();
					return;
				}
			}

			// Now we know we want to go ahead with it, trigger the other AJAX requests

			// Starting discussion page
			var wikipedia_page = new Morebits.wiki.page(params.discussionpage, "Creating article deletion discussion page");
			wikipedia_page.setCallbackParameters(params);
			wikipedia_page.load(Kaizo.xfd.callbacks.afd.discussionPage);

			// Today's list
			var date = new Date();
			wikipedia_page = new Morebits.wiki.page('Wikipedia:Requests for deletion', "Adding discussion to today's list");
			wikipedia_page.setFollowRedirect(true);
			wikipedia_page.setCallbackParameters(params);
			wikipedia_page.load(Kaizo.xfd.callbacks.afd.todaysList);

			
			// Notification to first contributor
			if (params.usertalk) {
				var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'));
				thispage.setCallbackParameters(params);
				thispage.lookupCreator(Kaizo.xfd.callbacks.afd.userNotification);
			}

			// Then, test if there are speedy deletion-related templates on the article.
			var textNoSd = text.replace(/\{\{\s*(db(-\w*)?|qd|delete|(?:hang|hold)[\- ]?on)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/ig, "");
			if (text !== textNoSd && confirm("A quick deletion tag was found on this page. Should it be removed?")) {
				text = textNoSd;
			}

			pageobj.setPageText(( params.noinclude ? "<noinclude>" : "" ) + "\{\{RfD|" + params.reason + "\}\}\n" + ( params.noinclude ? "</noinclude>" : "" ) + text);
				
			pageobj.setEditSummary("Nominated for deletion; see [[" + params.discussionpage + "]]." + Kaizo.getPref('summaryAd'));
			switch (Kaizo.getPref('xfdWatchPage')) {
				case 'yes':
					pageobj.setWatchlist(true);
					break;
				case 'no':
					pageobj.setWatchlistFromPreferences(false);
					break;
				default:
					pageobj.setWatchlistFromPreferences(true);
					break;
			}
			pageobj.setCreateOption('nocreate');
			pageobj.save();
		},
		discussionPage: function(pageobj) {
			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();

			pageobj.setPageText("{{subst:RfD/Preload/Template|deletereason=" + params.reason + "}}\n");
			pageobj.setEditSummary("Creating deletion discussion page for [[" + mw.config.get('wgPageName') + "]]." + Kaizo.getPref('summaryAd'));
			switch (Kaizo.getPref('xfdWatchDiscussion')) {
				case 'yes':
					pageobj.setWatchlist(true);
					break;
				case 'no':
					pageobj.setWatchlistFromPreferences(false);
					break;
				default:
					pageobj.setWatchlistFromPreferences(true);
					break;
			}
			pageobj.setCreateOption('createonly');
			pageobj.save(function() {
				Kaizo.xfd.currentRationale = null;  // any errors from now on do not need to print the rationale, as it is safely saved on-wiki
			});
		},
		todaysList: function(pageobj) {
			var old_text = pageobj.getPageText() + "\n";  // MW strips trailing blanks, but we like them, so we add a fake one
			var params = pageobj.getCallbackParameters();
			var statelem = pageobj.getStatusElement();
 
			var text = old_text.replace( /(<\!-- Add new entries to the TOP of the following list -->\n+)/, "$1{{Wikipedia:Requests for deletion/Requests/" + ((new Date()).getUTCFullYear()) + '/' + mw.config.get('wgPageName') + params.numbering + "}}\n");
			if( text === old_text ) {
				statelem.error( 'failed to find target spot for the discussion' );
				return;
			}
			pageobj.setPageText(text);
			pageobj.setEditSummary("Adding [[" + params.discussionpage + "]]." + Kaizo.getPref('summaryAd'));
			switch (Kaizo.getPref('xfdWatchList')) {
				case 'yes':
					pageobj.setWatchlist(true);
					break;
				case 'no':
					pageobj.setWatchlistFromPreferences(false);
					break;
				default:
					pageobj.setWatchlistFromPreferences(true);
					break;
			}
			pageobj.setCreateOption('recreate');
			pageobj.save();
		},
		userNotification: function(pageobj) {
			var params = pageobj.getCallbackParameters();
			var initialContrib = pageobj.getCreator();
			var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, "Notifying initial contributor (" + initialContrib + ")");
			var notifytext = "\n{{subst:RFDNote|1=" + mw.config.get('wgPageName') + "|2=" + mw.config.get('wgPageName') + ( params.numbering !== '' ? '|order=&#32;' + params.numbering : '' ) + "}} ~~~~";
			usertalkpage.setAppendText(notifytext);
			usertalkpage.setEditSummary("Notification: listing at [[WP:RfD|requests for deletion]] of [[" + mw.config.get('wgPageName') + "]]." + Kaizo.getPref('summaryAd'));
			usertalkpage.setCreateOption('recreate');
			switch (Kaizo.getPref('xfdWatchUser')) {
				case 'yes':
					usertalkpage.setWatchlist(true);
					break;
				case 'no':
					usertalkpage.setWatchlistFromPreferences(false);
					break;
				default:
					usertalkpage.setWatchlistFromPreferences(true);
					break;
			}
			usertalkpage.setFollowRedirect(true);
			usertalkpage.append();
		}
	}
};



Kaizo.xfd.callback.evaluate = function(e) {
	mw.config.set('wgPageName', mw.config.get('wgPageName').replace(/_/g, ' '));  // for queen/king/whatever and country!

	var type =  e.target.category.value;
	var usertalk = e.target.notify.checked;
	var reason = e.target.xfdreason.value;
	var xfdtarget, xfdtarget2, puf, noinclude, tfdinline, notifyuserspace;

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( e.target );

	Kaizo.xfd.currentRationale = reason;
	Morebits.status.onError(Kaizo.xfd.printRationale);

	if( !type ) {
		Morebits.status.error( 'Error', 'no action given' );
		return;
	}

	var query, wikipedia_page, wikipedia_api, logpage, params;
	var date = new Date();
	query = {
			'action': 'query',
			'list': 'allpages',
			'apprefix': 'Requests for deletion/Requests/' + ((new Date()).getUTCFullYear()) + '/' + mw.config.get('wgPageName'),
			'apnamespace': 4,
			'apfilterredir': 'nonredirects',
			'aplimit': Morebits.userIsInGroup( 'sysop' ) ? 5000 : 500
		};
		wikipedia_api = new Morebits.wiki.api( 'Tagging article with deletion tag', query, Kaizo.xfd.callbacks.afd.main );
		wikipedia_api.params = { usertalk:usertalk, reason:reason, noinclude:noinclude };
		wikipedia_api.post();
};
/**
 * General initialization code
 */

var scriptpathbefore = mw.util.wikiScript( "index" ) + "?title=",
    scriptpathafter = "&action=raw&ctype=text/javascript&happy=yes";

// Retrieve the user's Kaizo preferences
$.ajax({
	url: scriptpathbefore + "User:" + encodeURIComponent( mw.config.get("wgUserName")) + "/Kaizooptions.js" + scriptpathafter,
	dataType: "text",
	error: function () { mw.notify( "Could not load Kaizooptions.js" ); },
	success: function ( optionsText ) {

		// Quick pass if user has no options
		if ( optionsText === "" ) {
			return;
		}

		// Kaizo options are basically a JSON object with some comments. Strip those:
		optionsText = optionsText.replace( /(?:^(?:\/\/[^\n]*\n)*\n*|(?:\/\/[^\n]*(?:\n|$))*$)/g, "" );

		// First version of options had some boilerplate code to make it eval-able -- strip that too. This part may become obsolete down the line.
		if ( optionsText.lastIndexOf( "window.Kaizo.prefs = ", 0 ) === 0 ) {
			optionsText = optionsText.replace( /(?:^window.Kaizo.prefs = |;\n*$)/g, "" );
		}

		try {
			var options = JSON.parse( optionsText );

			// Assuming that our options evolve, we will want to transform older versions:
			//if ( options.optionsVersion === undefined ) {
			// ...
			// options.optionsVersion = 1;
			//}
			//if ( options.optionsVersion === 1 ) {
			// ...
			// options.optionsVersion = 2;
			//}
			// At the same time, Kaizoconfig.js needs to be adapted to write a higher version number into the options.

			if ( options ) {
				Kaizo.prefs = options;
			}
		}
		catch ( e ) {
			mw.notify("Could not parse Kaizooptions.js");
		}
	},
	complete: function () {
		$( Kaizo.load );
	}
});

// Developers: you can import custom Kaizo modules here
// For example, mw.loader.load(scriptpathbefore + "User:UncleDouggie/morebits-test.js" + scriptpathafter);

Kaizo.load = function () {
	// Don't activate on special pages other than "Contributions" so that they load faster, especially the watchlist.
	// Also, Kaizo is incompatible with Internet Explorer versions 8 or lower, so don't load there either.
	var specialPageWhitelist = [ 'Block', 'Contributions', 'Recentchanges', 'Recentchangeslinked' ]; // wgRelevantUserName defined for non-sysops on Special:Block
	if (Morebits.userIsInGroup('sysop')) {
		specialPageWhitelist = specialPageWhitelist.concat([ 'DeletedContributions', 'Prefixindex' ]);
	}
	if (mw.config.get('wgNamespaceNumber') === -1 &&
		specialPageWhitelist.indexOf(mw.config.get('wgCanonicalSpecialPageName')) === -1) {
		return;
	}
	
	// Prevent clickjacking
	if (window.top !== window.self) {
		return;
	}
	
	if ($.client.profile().name === 'msie' && $.client.profile().versionNumber < 9) {
		return;
	}
	
	// Set custom Api-User-Agent header, for server-side logging purposes
	Morebits.wiki.api.setApiUserAgent('Kaizo/2.0 (' + mw.config.get('wgDBname') + ')');

	// Load the modules in the order that the tabs should appears
	// User/user talk-related
	Kaizo.arv();
	Kaizo.warn();
	Kaizo.welcome();
	Kaizo.shared();
	Kaizo.talkback();
	// Deletion
	Kaizo.speedy();
	Kaizo.xfd();
	// Maintenance
	Kaizo.tag();
	Kaizo.stub();
	// Misc. ones last
	Kaizo.diff();
	Kaizo.unlink();
	Kaizo.config.init();
	Kaizo.fluff.init();
	if ( Morebits.userIsInGroup('sysop') ) {
		Kaizo.batchdelete();
		Kaizo.batchprotect();
		Kaizo.batchundelete();
	}
	// Run the initialization callbacks for any custom modules
	$( Kaizo.initCallbacks ).each(function ( k, v ) { v(); });
	Kaizo.addInitCallback = function ( func ) { func(); };

	// Increases text size in Kaizo dialogs, if so configured
	if ( Kaizo.getPref( "dialogLargeFont" ) ) {
		mw.util.addCSS( ".morebits-dialog-content, .morebits-dialog-footerlinks { font-size: 100% !important; } " +
			".morebits-dialog input, .morebits-dialog select, .morebits-dialog-content button { font-size: inherit !important; }" );
	}
};

} ( window, document, jQuery )); // End wrap with anonymous function

// </nowiki>

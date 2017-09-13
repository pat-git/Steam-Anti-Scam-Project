
// STARTUP
$(document).ready(function () {
	startUp();
});

// unused Expressions:
// var loadingExp 	= /<div id="profileloading" style="display: none;">/g;
// var profileExp 	= /<span id="privacystate"><span class="a03">(.+)<\/span><\/span>/g;
// var csgoInvExp 	= /<span class="games_list_tab_name">Counter-Strike: Global Offensive<\/span>/g;
// var tradeBanExp = /<span id="tradebanstatus"><span class="a03">(.+)<\/span><\/span>/g;
// var communityBanExp 	= /<span id="communitybanstatus"><span class="a01">(.+)<\/span><\/span>/g;
// var failProfileIDExp = /<div class="error_ctn">/g;
// var vacBanExp = /<span id="vacbanned"><span class="a03">(.+)<\/span>/g;

/*--------------------------------------------------------------------------------------------------------------------*/
/* 													VARIABLES OF THIS SCRIPT		 							      */
/* Regex Vars */
var processURLExp = /var processURL = '(.+)';/;
var sessionIDExp = /<input type="hidden" name="sessionID" value="(.+)" id="sessionID">/;
var sessionIDJSExp = /g_sessionID = "(.+)";/;

// Steam Invite
var inviteLvlExp = /<a class="linkStandard" href="javascript:FriendAccept\( '(\d+)', 'block' \)">/g;

// Steam REP
var nameExp = /<span id="steamname" title="(.+)" class="steamname ">/g;
var scammerExp = /<span id="steamname" title="(.+)" class="steamname scammername">/g;

// Steam Profile
var privateProfileExp = /<div class="profile_private_info">/g;
var steamTradeBanExp = /<div class="profile_ban">(.+)<\/div>/g;
var steamNameExp = /<span class="actual_persona_name">(.+)<\/span>/g;
var steamVacBanExp = /<span class="profile_ban_info">| <a class="whiteLink" href="http:\/\/steamcommunity.com\/actions\/WhatIsVAC">Informationen<\/a><\/span>/g;
var blockedExp = /<span class="blockedText">/g;
var idExp = /<input type="hidden" name="abuseID" value="(.+)">/g;

// Steam Inv Empty/Private    false = steam inv not private/empty!

/* Storage Vars */
// PROFILES TO IGNORE
var ignorePrivateProfiles = false;
var ignoreByLevel = false;
var ignoreTradeBanned = false;
var ignorePrivateInventories = false;
var ignoreByName = false;
// Empty Inventory = no Inventory
var ignoreNoTF2Inventory = false;
var ignoreNoCSGOInventory = false;
var ignoreNoDota2Inventory = false;

// PROFILES TO BLOCK
var blockSteamRepBan = false;
var blockPrivateProfile = false;
var blockByLevel = false;
var blockTradeBanned = false;
var blockPrivateInventory = false;
var blockByName = false;
var blockNoTF2Inventory = false;
var blockNoCSGOInventory = false;
var blockNoDota2Inventory = false;

// Database Vars
var syncPrivateProfiles = false;
var syncPrivateInventory = false;
var syncCommunityBanned	= false;
var syncTradeBanned = false;
// FR = FriendRequest
var blockPrivateProfileAtFR	= false;
var blockPrivateInventoryAtFR = false;
var blockCommunityBannedAtFR = false;
var blockTradeBannedAtFR = false;
var ignorePrivateProfileAtFR = false;
var ignorePrivateInventoryAtFR = false;
var ignoreCommunityBannedAtFR = false;
var ignoreTradeBannedAtFR = false;


var variableNames = [
    "ignorePrivateProfiles",
    "ignoreByLevel",
    "ignoreTradeBanned",
    "ignorePrivateInventories",
    "ignoreByName",
    "ignoreNoCSGOInventory",
    "ignoreNoTF2Inventory",
    "ignoreNoDota2Inventory",
    "blockPrivateProfiles",
    "blockByLevel",
    "blockTradeBanned",
    "blockPrivateInventories",
    "blockByName",
    "blockNoCSGOInventory",
    "blockNoTF2Inventory",
    "blockNoDota2Inventory",
    "blockSteamRepBan",
    "syncPrivateProfiles",
    "syncPrivateInventory",
    "syncTradeBanned",
    "syncCommunityBanned",
    "blockPrivateProfileAtFR",
    "blockPrivateInventoryAtFR",
    "blockCommunityBannedAtFR",
    "blockTradeBannedAtFR",
    "ignorePrivateProfileAtFR",
    "ignorePrivateInventoryAtFR",
    "ignoreCommunityBannedAtFR",
    "ignoreTradeBannedAtFR"
];

// OVER BLOCKED USER LIMIT
var over = false;

// ID OF THE USER OF THIS EXTENSION
var id = "0";

var timeStarted = false;

var alreadyCheckedUsers = [];
/*----------------------------------------------------------------------------------------------------------------------------------*/


function startUp(){
	checkBlockedUsers();
	getScammer();
	refreshVars();
	checkFriendInvites();
	getID();
	console.log("finished Setup!");
	createTimers(0);
	chrome.alarms.create('120min', {
		delayInMinutes: 120,
		periodInMinutes: 120
	});
	chrome.alarms.create('5min', {
		delayInMinutes: 5,
		periodInMinutes: 5
	});
}


function refreshVars(){
	/*-------------------------------------------------------------*/
	//REFRESH Vars
	//
	blockSteamRepBan = JSON.parse(localStorage.getItem('blockSteamRepBan'));
	blockPrivateProfile = JSON.parse(localStorage.getItem('blockPrivateProfile'));
	blockByLevel = JSON.parse(localStorage.getItem('blockByLevel'));
	ignoreTradeBanned = JSON.parse(localStorage.getItem('blockTradeBanned'));
	blockPrivateInventory = JSON.parse(localStorage.getItem('blockPrivateInventory'));
	blockByName = JSON.parse(localStorage.getItem('blockByName'));
	blockNoTF2Inventory = JSON.parse(localStorage.getItem('blockNoTF2Inventory'));
	blockNoDota2Inventory = JSON.parse(localStorage.getItem('blockNoDota2Inventory'));
	blockNoCSGOInventory = JSON.parse(localStorage.getItem('blockNoCSGOInventory'));

	//
	ignorePrivateProfiles = JSON.parse(localStorage.getItem('ignorePrivateProfiles'));
	ignoreByLevel = JSON.parse(localStorage.getItem('ignoreByLevel'));
	ignoreTradeBanned = JSON.parse(localStorage.getItem('ignoreTradeBanned'));
	ignorePrivateInventories = JSON.parse(localStorage.getItem('ignorePrivateInventories'));
	ignoreByName = JSON.parse(localStorage.getItem('ignoreByName'));
	ignoreNoTF2Inventory = JSON.parse(localStorage.getItem('ignoreNoTF2Inventory'));
	ignoreNoDota2Inventory = JSON.parse(localStorage.getItem('ignoreNoDota2Inventory'));
	ignoreNoCSGOInventory = JSON.parse(localStorage.getItem('ignoreNoCSGOInventory'));

	//
	syncPrivateProfiles = JSON.parse(localStorage.getItem('syncPrivateProfiles'));
	syncPrivateInventory = JSON.parse(localStorage.getItem('syncPrivateInventory'));
	syncTradeBanned = JSON.parse(localStorage.getItem('syncTradeBanned'));
	syncCommunityBanned = JSON.parse(localStorage.getItem('syncCommunityBanned'));

	//
	blockPrivateProfileAtFR = JSON.parse(localStorage.getItem('blockPrivateProfileAtFR'));
	blockPrivateInventoryAtFR = JSON.parse(localStorage.getItem('blockPrivateInventoryAtFR'));
	blockTradeBannedAtFR = JSON.parse(localStorage.getItem('blockTradeBannedAtFR'));
	blockCommunityBannedAtFR = JSON.parse(localStorage.getItem('blockCommunityBannedAtFR'));

	//
	ignorePrivateProfileAtFR = JSON.parse(localStorage.getItem('ignorePrivateProfileAtFR'));
	ignorePrivateInventoryAtFR = JSON.parse(localStorage.getItem('ignorePrivateInventoryAtFR'));
	ignoreTradeBannedAtFR = JSON.parse(localStorage.getItem('ignoreTradeBannedAtFR'));
	ignoreCommunityBannedAtFR = JSON.parse(localStorage.getItem('ignoreCommunityBannedAtFR'));

	/*-------------------------------------------------------------*/
}

// TIMER SECTION

function createTimers(id){
	if(id < 30){
		chrome.alarms.create('thread' + id, {
			delayInMinutes: 1,
			periodInMinutes: 1
		});
		setTimeout(function() {
			createTimers(id+1);
		},2000);
	}
	//console.log("createTimer" + id);
}
//TIMER LISTENER
chrome.alarms.onAlarm.addListener(function (alarm) {
	refreshVars();
	checkFriendInvites();
	if(!over){
		checkBlockedUsers();
	}
	if(alarm.name === "120min"){
		proof();
	}
	if(alarm.name === "5min"){
		getScammer();
		getID();
	}
});

// GET SCAMMER OF DATABASE
function getScammer (){
	var counters = 0;
	var max = 100;
	$.ajax({
            method: "GET",
            url: 'http://steam-antiscam.eu/system/getEntries.php',
			success: function (response) {
				var split1 = response.split("|-|-|");
				split1.forEach(function (entry) {
					var split2 = entry.split(",");
					if(split2[1] === "support"){
						if (localStorage.getItem('blockedUsers') === 'undefined' || localStorage.getItem('blockedUsers') === null){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}else if(localStorage.getItem('blockedUsers').indexOf(split2[0]) === -1){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}
					}
					if(split2[1] === "Private Profile" && syncPrivateProfiles){
						if (localStorage.getItem('blockedUsers') === 'undefined' || localStorage.getItem('blockedUsers') === null){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}else if(localStorage.getItem('blockedUsers').indexOf(split2[0]) === -1){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}
					}
					if(split2[1] === "Community Banned" && syncCommunityBanned){
						if (localStorage.getItem('blockedUsers') === 'undefined' || localStorage.getItem('blockedUsers') === null){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}else if(localStorage.getItem('blockedUsers').indexOf(split2[0]) === -1){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}
					}
					if(split2[1] === "Trade Banned" && syncTradeBanned){
						if (localStorage.getItem('blockedUsers') === 'undefined' || localStorage.getItem('blockedUsers') === null){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}else if(localStorage.getItem('blockedUsers').indexOf(split2[0]) === -1){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}
					}
					if(split2[1] === "Private Inventory" && syncPrivateInventory){
						if (localStorage.getItem('blockedUsers') === 'undefined' || localStorage.getItem('blockedUsers') === null){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}else if(localStorage.getItem('blockedUsers').indexOf(split2[0]) === -1){
							counters++;
							if(counters < max){
								blockUser(split2[0]);
							}
						}
					}
					// Don't Spam AJAX Posts
					if(counters === max){
						//console.log(max +" Synced");
					}
				});
			}
	});
}


// CUSTOM BLOCK FUNCTION (BLOCKING WITH NEW SESSIONID)
function blockUser (id64) {
	// Security Reasons
	if (localStorage.getItem('blockedUsers') !== 'undefined' && localStorage.getItem('blockedUsers') !== null){
		if(!(localStorage.getItem('blockedUsers').indexOf(id64) === -1)){
			return;
		}
	}
	$.ajax({
            method: "GET",
            url: 'http://steamcommunity.com/profiles/' + id64,
            success: function (response) {
				var sessionID = sessionIDJSExp.exec(response);
				if (sessionID) sessionID = sessionID[1];
				block(id64,sessionID);
			}
	});		
}
function block (id64,sessionID){
	/*$.post('http://steamcommunity.com/actions/BlockUserAjax',{sessionID: sessionID, steamid: id64 }
			).done( function() {
				if (localStorage.blockedUsers == 'undefined'){
					localStorage.setItem('blockedUsers', id64+",");
				}else{
					localStorage.setItem('blockedUsers',localStorage.getItem('blockedUsers') + id64 + ",");
				}
			} ).fail( function() {
				console.log("Error could not block " +id64);
	});*/
	$.ajax({
		type: "POST",
		url: "http://steamcommunity.com/actions/BlockUserAjax",
		data: {sessionID: sessionID, steamid: id64 },
		success: function(){
			if (localStorage.getItem('blockedUsers') === 'undefined'){
				localStorage.setItem('blockedUsers', id64+",");
			}else{
				localStorage.setItem('blockedUsers',localStorage.getItem('blockedUsers') + id64 + ",");
			}
		},
		error: function(request, status, error) {
			if(error === "Bad Request"){
				if (localStorage.getItem('blockedUsers') === 'undefined'){
					localStorage.setItem('blockedUsers', id64+",");
				}else{
					localStorage.setItem('blockedUsers',localStorage.getItem('blockedUsers') + id64 + ",");
				}
				console.log("Already blocked user with id " +id64 +", ignore the error above (400 Bad Request)");
			}
		}
	});
}


function checkIfAlreadyChecked (id){
	if(alreadyCheckedUsers === null || alreadyCheckedUsers === [] || alreadyCheckedUsers === undefined){
		alreadyCheckedUsers[0] = id;
		console.log(alreadyCheckedUsers);
		return false;
	}else if ($.inArray(id,alreadyCheckedUsers) !== -1){
		console.log(alreadyCheckedUsers);
		return true;
	}else{
		var l = alreadyCheckedUsers.length;
		alreadyCheckedUsers[l] = id;
		console.log(alreadyCheckedUsers);
		return false;
	}
	

}


/* FUNCTIONS TO CHECK PROFILE/INVENTORY/BAN etc.*/
function checkFriendInvites () {
	//console.log("Bool: " +" "+ syncPrivateProfiles +" "+ syncPrivateInventory +" "+ syncTradeBanned +" "+ syncCommunityBanned);
    if (blockPrivateProfile || blockByName || blockTradeBanned || blockPrivateInventory || blockByLevel || ignorePrivateProfiles || ignoreByLevel || ignoreTradeBanned || ignorePrivateInventories || ignoreByName || blockNoDota2Inventory || blockNoCSGOInventory || blockNoTF2Inventory || ignoreNoDota2Inventory || ignoreNoCSGOInventory || ignoreNoTF2Inventory || blockSteamRepBan) {
        $.ajax({
            method: "GET",
            url: 'http://steamcommunity.com/my/home/invites',
            success: function (response) {
						var sessionID = sessionIDExp.exec(response);
						var processURL = processURLExp.exec(response);
						if (sessionID) sessionID = sessionID[1];
						if (processURL) processURL = processURL[1];
						var m;
						var counter = 0;
						while (m = inviteLvlExp.exec(response)) {
							if(counter < 2 && checkIfAlreadyChecked(m[1]) === false){
								checkFriendInvitesDelayed(m,sessionID,processURL,response);
								counter++;
							}
						}
						if(counter === 0){
							for(var i = 1 ; i < 30; i++)
							chrome.alarms.clear("thread" + i);
							//console.log("Stopping Timers because of No Load");
							timeStarted = true;
						}else{
							if(timeStarted){
								createTimers(0);
								timeStarted = false;
								//console.log("Recreating Timers because of High Load");
							}else{
								//console.log("Enough Timers there...");
							}
						}
            }
        });
    }
}
function checkFriendInvitesDelayed (m,sessionID,processURL,response){
	var friendID = m[1];
	sipbool = false;
	checkIfInDB(friendID,sessionID,processURL);
	if(blockPrivateProfile || blockTradeBanned || blockPrivateInventory || blockByName || ignorePrivateProfiles || ignoreTradeBanned || ignorePrivateInventories || ignoreByName || blockNoDota2Inventory || blockNoCSGOInventory || blockNoTF2Inventory || ignoreNoDota2Inventory || ignoreNoCSGOInventory || ignoreNoTF2Inventory){ checkProfiles(friendID,sessionID,processURL);}
	if(blockSteamRepBan){ checkProfile(friendID,sessionID,processURL);}
	if(blockByLevel || ignoreByLevel) {
		var idx = m.index;
		var idx2 = response.indexOf('<span class="friendPlayerLevelNum">', idx);
		idx2 += 35;
		var len = response.indexOf('</span>', idx2) - idx2;
		var lvl = parseInt(response.substr(idx2, len));
		if (JSON.parse(localStorage.blockLevel) > lvl) {
			if(blockByLevel){
				FriendAction(friendID, 'block', sessionID, processURL,false);
			}
			if(ignoreByLevel){
				FriendAction(friendID, 'ignore', sessionID, processURL,false);
			}
		}
	}
}
/* Using SteamREP */
function checkProfile (friendID2,sessionIDB,processURLB){
	 $.ajax({
            method: "GET",
            url: 'http://steamrep.com/profiles/' + friendID2,
			async: true,
            success: function (response) {
					var m;
					if(blockSteamRepBan){
						while(m = scammerExp.exec(response)){
							// var name = m[1];
							FriendAction(friendID2, 'block', sessionIDB, processURLB,true);
						}
					}
				}
        });
}
/* Using Steam */
function checkProfiles(friendID2,sessionIDB,processURLB){
	 $.ajax({
            method: "GET",
            url: 'http://steamcommunity.com/profiles/' + friendID2,
			async: true,
            success: function (response) {
					var m;
					if(blockByName || ignoreByName) {
							while (m = steamNameExp.exec(response)) {
								var name = m[1];
								if (typeof(localStorage.busers) !== 'undefined') {
									var array = JSON.parse(localStorage.busers);
									var equals = false;
									array.forEach(function(entry) {
										if(entry.toUpperCase() === name.toUpperCase()){
											equals = true;
										}
									});
									if(equals){
										if(ignoreByName){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB,false);
										}else{
											FriendAction(friendID2, 'block', sessionIDB, processURLB,false);
										}
										return;
								}
									
							}
						}
					}
					// Private Profile
					if(blockPrivateProfile || ignorePrivateProfiles){
						while(m = privateProfileExp.exec(response)){
							if(ignorePrivateProfiles){
								FriendAction(friendID2, 'ignore', sessionIDB, processURLB,true);
							}else{
								FriendAction(friendID2, 'block', sessionIDB, processURLB,true);
							}
							return;
						}
					}
					// Trade banned
					if(blockTradeBanned || ignoreTradeBanned){
						while(m = steamTradeBanExp.exec(response) && steamVacBanExp.exec(response) === null){
							if(ignoreTradeBanned){
								FriendAction(friendID2, 'ignore', sessionIDB, processURLB,true);
							}else{
								FriendAction(friendID2, 'block', sessionIDB, processURLB,true);
							}
							return;
						}
					}


					// Private Inventory & EMPTY/NO CSGO/DOTA/TF2 INV
					if((blockPrivateInventory && blockNoCSGOInventory) || (ignorePrivateInventories && ignoreNoCSGOInventory) || (blockNoCSGOInventory && ignorePrivateInventories) || (ignoreNoCSGOInventory && blockPrivateInventory)){
						$.ajax({
							method: "GET",
							url: 'http://steamcommunity.com/profiles/' + friendID2 + '/inventory/json/730/2',
							async: true,
							datatype: "json",
							success: function (response) {
									if(!response['success'] && response['Error'] !== undefined && response['Error'] !== null &&  response['Error'] !== ""){
										// Private INV
										if(ignorePrivateInventories){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB,true);
											return;
										}else if (blockPrivateInventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB,true);
											return;
										}
										if(ignoreNoCSGOInventory){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB,true);
										}else if (blockNoCSGOInventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB,true);
										}
										
									}else if (!response['success']){
										// NO CSGO INV
										if(ignoreNoCSGOInventory){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB,false);

										}else if (blockNoCSGOInventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB,false);
										}
										
									}
								}
							});
					}else if((blockPrivateInventory && blockNoDota2Inventory) || (ignorePrivateInventories && ignoreNoDota2Inventory) || (blockNoDota2Inventory && ignorePrivateInventories) || (ignoreNoDota2Inventory && blockPrivateInventory)){
						$.ajax({
							method: "GET",
							url: 'http://steamcommunity.com/profiles/' + friendID2 + '/inventory/json/570/2',
							async: true,
							datatype: "json",
							success: function (response) {
									if(!response['success'] && response['Error'] !== undefined && response['Error'] !== null &&  response['Error'] !== ""){
										// Private INV
										if(ignorePrivateInventories){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB, true);
											return;
										}else if (blockPrivateInventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB, true);
											return;
										}
										if(ignoreNoDota2Inventory){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB, true);
										}else if (blockNoDota2Inventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB, true);
										}
									}else if (!response['success']){
										// NO DOTA INV
										if(ignoreNoDota2Inventory){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false);
										}else if (blockNoDota2Inventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB, false);
										}
									}
								}
							});
					}else if((blockPrivateInventory && blockNoTF2Inventory) || (ignorePrivateInventories && ignoreNoTF2Inventory) || (blockNoCSGOInventory && ignorePrivateInventories) || (ignoreNoTF2Inventory && blockPrivateInventory)){
						$.ajax({
							method: "GET",
							url: 'http://steamcommunity.com/profiles/' + friendID2 + '/inventory/json/440/2',
							async: true,
							datatype: "json",
							success: function (response) {
									if(!response['success'] && response['Error'] !== undefined && response['Error'] !== null &&  response['Error'] !== ""){
										// Private Inventory
										if(ignorePrivateInventories){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB,true);
											return;
										}else if (blockPrivateInventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB,true);
											return;
										}
										if(ignoreNoTF2Inventory){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB,true);
										}else if (blockNoTF2Inventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB,true);
										}
									}else if (!response['success']){
										// NO TF2 Inventory
										if(ignoreNoTF2Inventory){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB,false);
										}else if (blockNoTF2Inventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB,false);
										}
										
									}
								}
							});
					}else if(blockPrivateInventory || ignorePrivateInventories){
						$.ajax({
							method: "GET",
							url: 'http://steamcommunity.com/profiles/' + friendID2 + '/inventory/json/570/2',
							async: true,
							datatype: "json",
							success: function (response) {
									if(!response['success'] && response['Error'] !== undefined && response['Error'] !== null &&  response['Error'] !== ""){
										// Private Profile
										if(ignorePrivateInventories){
											FriendAction(friendID2, 'ignore', sessionIDB, processURLB,true);
										}else if (blockPrivateInventory){
											FriendAction(friendID2, 'block', sessionIDB, processURLB,true);
									}
								}
							}
						});
					}
            	}
        	});
}




// DATABASE CHECKS
function checkIfInDB(friendID2, sessionIDB, processURLB) {
	// Database Checks
	$.ajax({
			method: "GET",
			url: 'http://steam-antiscam.eu/system/getUserInfo.php?ids=' + friendID2,
			async: true,
			datatype: "json",
			success: function (response) {
				if(response[0]['success'] && response[0]['special'] === "scammer"){
					if(response[0]['reason'] === "support"){
						FriendAction(friendID2, 'ignore', sessionIDB, processURLB,false);
						//console.log("USER has been banned by Support");
					}
					if(response[0]['reason'] === "Private Profile" && blockPrivateProfileAtFR){
						FriendAction(friendID2, 'block', sessionIDB, processURLB,false);
						//console.log("USER has been blocked because of Private Profile");
					}
					if(response[0]['reason'] === "Private Inventory" && blockPrivateInventoryAtFR){
						FriendAction(friendID2, 'block', sessionIDB, processURLB,false);
						//console.log("USER has been blocked because of Private Inventory");
					}
					if(response[0]['reason'] === "Trade Banned" && blockTradeBannedAtFR){
						FriendAction(friendID2, 'block', sessionIDB, processURLB,false);
						//console.log("USER has been blocked because of Trade Ban");
					}
					if(response[0]['reason'] === "Community Banned" && blockCommunityBannedAtFR){
						FriendAction(friendID2, 'block', sessionIDB, processURLB,false);
						//console.log("USER has been blocked because of Community Ban");
					}
					if(response[0]['reason'] === "Private Profile" && ignorePrivateProfileAtFR){
						FriendAction(friendID2, 'ignore', sessionIDB, processURLB,false);
						//console.log("USER has been ignored because of Private Profile");
					}
					if(response[0]['reason'] === "Private Inventory" && ignorePrivateInventoryAtFR){
						FriendAction(friendID2, 'ignore', sessionIDB, processURLB,false);
						//console.log("USER has been ignored because of Private Inventory");
					}
					if(response[0]['reason'] === "Trade Banned" && ignoreTradeBannedAtFR){
						FriendAction(friendID2, 'ignore', sessionIDB, processURLB,false);
						//console.log("USER has been ignored because of Trade Ban");
					}
					if(response[0]['reason'] === "Community Banned" && ignoreCommunityBannedAtFR){
						FriendAction(friendID2, 'ignore', sessionIDB, processURLB,false);
						//console.log("USER has been ignored because of Community Ban");
					}
				}
			}
	});
}




// BLOCKED USERS COUNTER
function checkBlockedUsers(){
	$.ajax({
            method: "POST",
            url: 'http://steamcommunity.com/my/friends/blocked',
			async: true,
            success: function (response) {
				var blockedUsers = 0;
				var m;
				while(m = blockedExp.exec(response)){
					blockedUsers++;
				}
				if(blockedExp.exec(response) === null){
					blockedUsers = "Either blocked too many or not logged in!";
				}
				localStorage.bucounter = JSON.stringify(blockedUsers);
				
			},
			error: function () {
				var blockedUsers = ">7500";
				over = true;
				localStorage.bucounter = blockedUsers;
			}
    });
}


// COMMON AJAX FUNCTIONS
function FriendAction (friendID64, action, sessionID, processURL, send) {
    var postData = {
        "json": 1,
        "xml": 1,
        "action": "approvePending",
        "itype": "friend",
        "perform": action,
        "id": friendID64,
        "sessionID": sessionID
    };
    $.ajax({
        method: 'POST',
        url: processURL,
        data: postData,
        success: function (response, textStatus, jqXHR) {
        }
    });
    if(send){
		$.ajax({
	            method: "GET",
	            url: 'http://steamcommunity.com/profiles/' + friendID64,
				async: true,
	            success: function (response) {
						var m;
						var name = "";
						while(m = steamNameExp.exec(response)){
							name = m[1];
						}
						sendEntry(friendID64,name);
					}
	    });
	}
	
}

function getID (){
	 $.ajax({
            method: "GET",
            url: 'http://steamcommunity.com/my/',
			async: true,
            success: function (response) {
					var m;
					if(m = idExp.exec(response)){
						id = m[1];
						if (typeof(localStorage.sessionID) === 'undefined') {
							register(id);
						}
					}
				}
        });
}

/*function getName (steamID){
	 $.ajax({
            method: "GET",
            url: 'http://steamcommunity.com/profiles/' + steamID,
			async: true,
            success: function (response) {
					var m;
					var name;
					while(m = nameExp.exec(response)){
						name = m[1];
					}
					return name;
				}
        });
}*/

function sendEntry(steamID64,steamname){
	$.post( "http://steam-antiscam.eu/system/post.php", { id: steamID64 , name: steamname }, function(data, textStatus)
    {
		//console.log("Data: " + data +   "\nsuccess");
    });
}

function proof (){
	$.post( "http://steam-antiscam.eu/system/checkProfiles.php", {}, function(data, textStatus)
    {
		//console.log("Proof: " + data);
    });
}

function register (steamID64){
	//console.log("registering");
	$.post( "http://steam-antiscam.eu/system/register.php", {id: steamID64}, function(data)
    {
		localStorage.sessionID = data;
    });
}
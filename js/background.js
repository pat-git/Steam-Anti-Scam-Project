// STARTUP
$(document).ready(function () {
    startUp();
});

/* Regex Vars */
var processURLExp = /var processURL = '(.+)';/;
var sessionIDExp = /<input type="hidden" name="sessionID" value="(.+)" id="sessionID">/;
var sessionIDJSExp = /g_sessionID = "(.+)";/;

// Steam Invite
var inviteLvlExp = /<a class="linkStandard" href="javascript:FriendAccept\( '(\d+)', 'block' \)">/g;

// Steam REP

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
// PROFILES TO BLOCK
var blockSteamRepBan = JSON.parse(localStorage.getItem('blockSteamRepBan'));
var blockPrivateProfiles = JSON.parse(localStorage.getItem('blockPrivateProfiles'));
var blockByLevel = JSON.parse(localStorage.getItem('blockByLevel'));
var blockTradeBanned = JSON.parse(localStorage.getItem('ignoreTradeBanned'));
var blockPrivateInventories = JSON.parse(localStorage.getItem('blockPrivateInventories'));
var blockByName = JSON.parse(localStorage.getItem('blockByName'));
var blockNoTF2Inventory = JSON.parse(localStorage.getItem('blockNoTF2Inventory'));
// Empty Inventory = no Inventory
var blockNoDota2Inventory = JSON.parse(localStorage.getItem('blockNoDota2Inventory'));
var blockNoCSGOInventory = JSON.parse(localStorage.getItem('blockNoCSGOInventory'));
// PROFILES TO IGNORE
var ignorePrivateProfiles = JSON.parse(localStorage.getItem('ignorePrivateProfiles'));
var ignoreByLevel = JSON.parse(localStorage.getItem('ignoreByLevel'));
var ignoreTradeBanned = JSON.parse(localStorage.getItem('ignoreTradeBanned'));
var ignorePrivateInventories = JSON.parse(localStorage.getItem('ignorePrivateInventories'));
var ignoreByName = JSON.parse(localStorage.getItem('ignoreByName'));
var ignoreNoTF2Inventory = JSON.parse(localStorage.getItem('ignoreNoTF2Inventory'));
var ignoreNoDota2Inventory = JSON.parse(localStorage.getItem('ignoreNoDota2Inventory'));
var ignoreNoCSGOInventory = JSON.parse(localStorage.getItem('ignoreNoCSGOInventory'));
// Database Vars
var syncPrivateProfiles = JSON.parse(localStorage.getItem('syncPrivateProfiles'));
var syncPrivateInventory = JSON.parse(localStorage.getItem('syncPrivateInventory'));
var syncTradeBanned = JSON.parse(localStorage.getItem('syncTradeBanned'));
var syncCommunityBanned = JSON.parse(localStorage.getItem('syncCommunityBanned'));
// FR = FriendRequest
var blockPrivateProfileAtFR = JSON.parse(localStorage.getItem('blockPrivateProfileAtFR'));
var blockPrivateInventoryAtFR = JSON.parse(localStorage.getItem('blockPrivateInventoryAtFR'));
var blockTradeBannedAtFR = JSON.parse(localStorage.getItem('blockTradeBannedAtFR'));
var blockCommunityBannedAtFR = JSON.parse(localStorage.getItem('blockCommunityBannedAtFR'));
var ignorePrivateProfileAtFR = JSON.parse(localStorage.getItem('ignorePrivateProfileAtFR'));
var ignorePrivateInventoryAtFR = JSON.parse(localStorage.getItem('ignorePrivateInventoryAtFR'));
var ignoreTradeBannedAtFR = JSON.parse(localStorage.getItem('ignoreTradeBannedAtFR'));
var ignoreCommunityBannedAtFR = JSON.parse(localStorage.getItem('ignoreCommunityBannedAtFR'));


var debugMode = JSON.parse(localStorage.getItem("debugMode"));
// OVER BLOCKED USER LIMIT
var over = false;

// ID OF THE USER OF THIS EXTENSION
var id = "0";

var timersOffline = false;
var alreadyCheckedUsers = [];
function startUp(){
    checkBlockedUsers();
    getScammer();
    checkFriendInvites();
    getID();
    if(debugMode) {
        console.log("finished Setup!");
    }
    createTimers(0);
    chrome.alarms.create('120min', {
        delayInMinutes: 120,
        periodInMinutes: 120
    });
    chrome.alarms.create('5min', {
        delayInMinutes: 5,
        periodInMinutes: 5
    });
    chrome.alarms.create('1min', {
        delayInMinutes: 1,
        periodInMinutes: 1
    });
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
    if(debugMode) {
        console.log("createTimer" + id);
    }
}
//TIMER LISTENER
chrome.alarms.onAlarm.addListener(function (alarm) {
    if(!over) {
        checkBlockedUsers();
        if (alarm.name === "120min") {
            proof();
        } else if (alarm.name === "5min") {
            getScammer();
            getID();
        } else if (alarm.name === "1min") {
            checkFriendInvites();
        }
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
                    // Don't spam to much Ajax Posts
                    if (counters < max) {
                        if (split2[1] === "support") {
                            blockUser(split2[0], split2[1]);
                        }else if (split2[1] === "Private Profile" && syncPrivateProfiles) {
                            blockUser(split2[0], split2[1]);
                        } else if (split2[1] === "Community Banned" && syncCommunityBanned) {
                            blockUser(split2[0], split2[1]);
                        } else if (split2[1] === "Trade Banned" && syncTradeBanned) {
                            blockUser(split2[0], split2[1]);
                        } else if (split2[1] === "Private Inventory" && syncPrivateInventory) {
                            blockUser(split2[0], split2[1]);
                        }
                    }else{
                        if(debugMode) {
                            console.log(max +" Synced");
                        }
                    }
                });
            }
    });
}


// CUSTOM BLOCK FUNCTION (BLOCKING WITH NEW SESSIONID)
function blockUser (id64, reason) {
    // Check if already blocked
    if (!alreadyBlocked(id64)){
        $.ajax({
            method: "GET",
            url: 'http://steamcommunity.com/profiles/' + id64,
            success: function (response) {
                var sessionID = sessionIDJSExp.exec(response);
                if (sessionID) sessionID = sessionID[1];
                block(id64,sessionID);
                console.log("Blocked user with id '" + id64 + "'. Reason: " + reason);
            }
        });
    }
}

function block (id64,sessionID){
    $.ajax({
        type: "POST",
        url: "http://steamcommunity.com/actions/BlockUserAjax",
        data: {sessionID: sessionID, steamid: id64 },
        success: function(){
            if (localStorage.getItem('blockedUsers') === null){
                localStorage.setItem('blockedUsers', id64+",");
            }else{
                localStorage.setItem('blockedUsers',localStorage.getItem('blockedUsers') + id64 + ",");
            }
        },
        error: function(request, status, error) {
            if(error === "Bad Request"){
                if (localStorage.getItem('blockedUsers') === null){
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
        return false;
    }else if ($.inArray(id,alreadyCheckedUsers) !== -1){
        if(debugMode) {
            console.log(id + " has already been checked!");
        }
        return true;
    }else{
        var l = alreadyCheckedUsers.length;
        alreadyCheckedUsers[l] = id;
        return false;
    }
}

function alreadyBlocked (id){
    return localStorage.getItem('blockedUsers') !== 'undefined' && localStorage.getItem('blockedUsers') !== null
           && localStorage.getItem('blockedUsers').indexOf(id) > -1;
}

/* FUNCTIONS TO CHECK PROFILE/INVENTORY/BAN etc.*/
function checkFriendInvites () {
    if (blockPrivateProfiles || blockByName || blockTradeBanned || blockPrivateInventories || blockByLevel
        || ignorePrivateProfiles || ignoreByLevel || ignoreTradeBanned || ignorePrivateInventories || ignoreByName
        || blockNoDota2Inventory || blockNoCSGOInventory || blockNoTF2Inventory || ignoreNoDota2Inventory
        || ignoreNoCSGOInventory || ignoreNoTF2Inventory || blockSteamRepBan) {
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
                                if(debugMode) {
                                    console.log("Checking profile with id: " + m[1]);
                                }
                                counter++;
                            }
                        }
                        if(counter === 0){
                            if(!timersOffline){
                                for(var i = 1 ; i < 30; i++) {
                                    chrome.alarms.clear("thread" + i);
                                }
                                if(debugMode) {
                                    console.log("Stopping Timers because of Friend Requests");
                                }
                                timersOffline = true;
                            }
                        }else{
                            if(debugMode) {
                                console.log("Found some Friend Requests, checking...");
                            }
                            if(timersOffline){
                                createTimers(0);
                                timersOffline = false;
                                if(debugMode) {
                                    console.log("Recreating Timers because of many Friend Requests");
                                }
                            }
                        }
            }
        });
    }
}

function checkFriendInvitesDelayed (m,sessionID,processURL,response){
    var friendID = m[1];
    checkIfInDB(friendID,sessionID,processURL);
    if(blockPrivateProfiles || blockTradeBanned || blockPrivateInventories || blockByName || ignorePrivateProfiles
        || ignoreTradeBanned || ignorePrivateInventories || ignoreByName || blockNoDota2Inventory
        || blockNoCSGOInventory || blockNoTF2Inventory || ignoreNoDota2Inventory || ignoreNoCSGOInventory
        || ignoreNoTF2Inventory){
        checkProfiles(friendID,sessionID,processURL);
    }
    if(blockSteamRepBan){
        checkProfile(friendID,sessionID,processURL);
    }
    if(blockByLevel || ignoreByLevel) {
        var idx = m.index;
        var idx2 = response.indexOf('<span class="friendPlayerLevelNum">', idx);
        idx2 += 35;
        var len = response.indexOf('</span>', idx2) - idx2;
        var lvl = parseInt(response.substr(idx2, len));
        if (JSON.parse(localStorage.getItem("blockLevel")) > lvl) {
            if(blockByLevel){
                FriendAction(friendID, 'block', sessionID, processURL, false, "Low level");
            }
            if(ignoreByLevel){
                FriendAction(friendID, 'ignore', sessionID, processURL, false, "Low level");
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
                            FriendAction(friendID2, 'block', sessionIDB, processURLB, true, "SteamRep ban");
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
                    // Bad name
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
                                        FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false,
                                                     "Bad name");
                                    }else{
                                        FriendAction(friendID2, 'block', sessionIDB, processURLB, false, "Bad name");
                                    }
                                    return;
                                }
                            }
                        }
                    // Private Profile Ignore
                    } else if(ignorePrivateProfiles || ignorePrivateInventories || ignoreNoDota2Inventory
                       || ignoreNoTF2Inventory || ignoreNoCSGOInventory){
                        if(privateProfileExp.exec(response)){
                            FriendAction(friendID2, 'ignore', sessionIDB, processURLB, true, "Private profile");
                        }
                    // Private Profile Block
                    } else if(blockPrivateProfiles || blockPrivateInventories || blockNoDota2Inventory || blockNoTF2Inventory
                       || blockNoCSGOInventory){
                        if(privateProfileExp.exec(response)){
                            FriendAction(friendID2, 'block', sessionIDB, processURLB, true, "Private profile");
                        }
                    // Trade banned
                    } else if(blockTradeBanned || ignoreTradeBanned){
                        if(steamTradeBanExp.exec(response) && steamVacBanExp.exec(response) === null){
                            if(ignoreTradeBanned){
                                FriendAction(friendID2, 'ignore', sessionIDB, processURLB, true, "Tradeban");
                            }else{
                                FriendAction(friendID2, 'block', sessionIDB, processURLB, true, "Tradeban");
                            }
                        }
                    // Private Inventory & EMPTY/NO CSGO/DOTA/TF2 INV
                    } else if(blockNoCSGOInventory || ignoreNoCSGOInventory){
                        $.ajax({
                            method: "GET",
                            url: 'http://steamcommunity.com/profiles/' + friendID2 + '/inventory/json/730/2',
                            async: true,
                            datatype: "json",
                            success: function (response) {
                                    if(!response['success'] && response['Error'] !== undefined
                                        && response['Error'] !== null &&  response['Error'] !== ""){
                                        // Private Inventory
                                        if(ignoreNoCSGOInventory){
                                            FriendAction(friendID2, 'ignore', sessionIDB, processURLB, true,
                                                         "Private CSGO Inventory");
                                        }else if (blockNoCSGOInventory){
                                            FriendAction(friendID2, 'block', sessionIDB, processURLB, true,
                                                         "Private CSGO Inventory");
                                        }
                                    }else if (!response['success']){
                                        // No CSGO Inventory
                                        if(ignoreNoCSGOInventory){
                                            FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false,
                                                         "Empty/No CSGO Inventory");
                                        }else if (blockNoCSGOInventory){
                                            FriendAction(friendID2, 'block', sessionIDB, processURLB, false,
                                                         "Empty/No CSGO Inventory");
                                        }

                                    }
                                }
                            });
                    }else if(blockNoDota2Inventory || ignoreNoDota2Inventory){
                        $.ajax({
                            method: "GET",
                            url: 'http://steamcommunity.com/profiles/' + friendID2 + '/inventory/json/570/2',
                            async: true,
                            datatype: "json",
                            success: function (response) {
                                    if(!response['success'] && response['Error'] !== undefined
                                        && response['Error'] !== null &&  response['Error'] !== ""){
                                        if(ignoreNoDota2Inventory){
                                            FriendAction(friendID2, 'ignore', sessionIDB, processURLB, true,
                                                         "Private Dota2 Inventory");
                                        }else if (blockNoDota2Inventory){
                                            FriendAction(friendID2, 'block', sessionIDB, processURLB, true,
                                                         "Private Dota2 Inventory");
                                        }
                                    }else if (!response['success']){
                                        // NO DOTA INV
                                        if(ignoreNoDota2Inventory){
                                            FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false,
                                                         "Empty/No Dota2 Inventory");
                                        }else if (blockNoDota2Inventory){
                                            FriendAction(friendID2, 'block', sessionIDB, processURLB, false,
                                                         "Empty/No Dota2 Inventory");
                                        }
                                    }
                                }
                            });
                    }else if(blockNoTF2Inventory || ignoreNoTF2Inventory){
                        $.ajax({
                            method: "GET",
                            url: 'http://steamcommunity.com/profiles/' + friendID2 + '/inventory/json/440/2',
                            async: true,
                            datatype: "json",
                            success: function (response) {
                                    if(!response['success'] && response['Error'] !== undefined
                                        && response['Error'] !== null &&  response['Error'] !== ""){
                                        if(ignoreNoTF2Inventory){
                                            FriendAction(friendID2, 'ignore', sessionIDB, processURLB, true,
                                                         "Private TF2 Inventory");
                                        }else if (blockNoTF2Inventory){
                                            FriendAction(friendID2, 'block', sessionIDB, processURLB, true,
                                                        "Private TF2 Inventory");
                                        }
                                    }else if (!response['success']){
                                        // NO TF2 Inventory
                                        if(ignoreNoTF2Inventory){
                                            FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false,
                                                         "Empty/No TF2 Inventory");
                                        }else if (blockNoTF2Inventory){
                                            FriendAction(friendID2, 'block', sessionIDB, processURLB, false,
                                                         "Empty/No TF2 Inventory");
                                        }

                                    }
                                }
                            });
                    }else if(blockPrivateInventories || ignorePrivateInventories){
                        $.ajax({
                            method: "GET",
                            url: 'http://steamcommunity.com/profiles/' + friendID2 + '/inventory/json/753/6',
                            async: true,
                            datatype: "json",
                            success: function (response) {
                                        if(!response['success'] && response['Error'] !== undefined
                                            && response['Error'] !== null &&  response['Error'] !== ""){
                                            // Private Profile
                                            if(ignorePrivateInventories){
                                                FriendAction(friendID2, 'ignore', sessionIDB, processURLB, true,
                                                             "Private Inventory");
                                            }else if (blockPrivateInventories){
                                                FriendAction(friendID2, 'block', sessionIDB, processURLB, true,
                                                             "Private Inventory");
                                        }else if(!response['success']){
                                            console.assert("ERROR: NO STEAM INVENTORY - STEAM SERVER DOWN? Please" +
                                                           "report the whole message to an admin! STEAMID: "
                                                           + friendID2 + " DATA: " + response);
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
                        FriendAction(friendID2, 'block', sessionIDB, processURLB, false, "DB support");
                    }
                    if(response[0]['reason'] === "Private Profile" && blockPrivateProfileAtFR){
                        FriendAction(friendID2, 'block', sessionIDB, processURLB, false, "DB Private Profile");
                    }
                    if(response[0]['reason'] === "Private Inventory" && blockPrivateInventoryAtFR){
                    }
                    if(response[0]['reason'] === "Trade Banned" && blockTradeBannedAtFR){
                        FriendAction(friendID2, 'block', sessionIDB, processURLB, false, "DB TradeBanned");
                    }
                    if(response[0]['reason'] === "Community Banned" && blockCommunityBannedAtFR){
                        FriendAction(friendID2, 'block', sessionIDB, processURLB, false, "DB CommunityBanned");
                    }
                    if(response[0]['reason'] === "Private Profile" && ignorePrivateProfileAtFR){
                        FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false, "DB Private Profile");
                    }
                    if(response[0]['reason'] === "Private Inventory" && ignorePrivateInventoryAtFR){
                        FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false, "DB Private Inventory");
                    }
                    if(response[0]['reason'] === "Trade Banned" && ignoreTradeBannedAtFR){
                        FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false, "DB TradeBanned");
                    }
                    if(response[0]['reason'] === "Community Banned" && ignoreCommunityBannedAtFR){
                        FriendAction(friendID2, 'ignore', sessionIDB, processURLB, false, "DB CommunityBanned");
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
function FriendAction (friendID64, action, sessionID, processURL, send, reason) {
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
    if(debugMode) {
        console.log("FriendAction: " + action + " reason: " + reason);
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

function sendEntry(steamID64,steamname){
    $.post( "http://steam-antiscam.eu/system/post.php", { id: steamID64 , name: steamname }, function(data)
    {
        if(debugMode) {
            console.log("Data: " + data + "\nsuccess");
        }
    });
}

function proof (){
    $.post( "http://steam-antiscam.eu/system/checkProfiles.php", {}, function(data)
    {
        if(debugMode) {
            console.log("Proof: " + data);
        }
    });
}

function register (steamID64){
    if(debugMode) {
        console.log("registering");
    }
    $.post( "http://steam-antiscam.eu/system/register.php", {id: steamID64}, function(data)
    {
        localStorage.sessionID = data;
    });
}
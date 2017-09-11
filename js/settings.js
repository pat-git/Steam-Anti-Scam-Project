var variablesIgnore = [
    "ignorePrivateProfiles",
    "ignoreByLevel",
    "ignoreTradeBanned",
    "ignorePrivateInventories",
    "ignoreByName",
    "ignoreNoCSGOInventory",
    "ignoreNoTF2Inventory",
    "ignoreNoDota2Inventory"
];
var variablesBlock = [
    "blockPrivateProfiles",
    "blockByLevel",
    "blockTradeBanned",
    "blockPrivateInventories",
    "blockByName",
    "blockNoCSGOInventory",
    "blockNoTF2Inventory",
    "blockNoDota2Inventory"
];
var variablesDBSync = [
    "syncPrivateProfiles",
    "syncPrivateInventory",
    "syncCommunityBanned",
    "syncTradeBanned"
];
var variablesDBBlock = [
    "blockPrivateProfileAtFR",
    "blockPrivateInventoryAtFR",
    "blockCommunityBannedAtFR",
    "blockTradeBannedAtFR"
];
var variablesDBIgnore = [
    "ignorePrivateProfileAtFR",
    "ignorePrivateInventoryAtFR",
    "ignoreCommunityBannedAtFR",
    "ignoreTradeBannedAtFR"
];
$(document).ready(function () {
    console.log("Ready ...");
    registerHandlers();
    loadOptions();
    loadUsers();
    setupCounter();
});

function registerHandlers() {
    //document.getElementById("update").onclick = updateUsers;

    // 1 Option Value
    $('#blockSteamRepBan').change(function() {
        if($(this).is(":checked")) {
            localStorage.setItem('blockSteamRepBan', "true");
        }else{
            localStorage.setItem('blockSteamRepBan', "false");
        }
    });
    $('#levelBox').change(function() {
        var level = $("#levelBox").val();
        localStorage.setItem('blockLevel', level);
    });

    // 2 Options Values
    variablesIgnore.forEach(function(variableName, index) {
        //console.log(variableName + " " + index);
        $('#' + variableName).change(function () {
            if ($(this).is(":checked")) {
                localStorage.setItem(variableName, "true");
                localStorage.setItem(variablesBlock[index], "false");
                document.getElementById(variablesBlock[index]).checked = false;
            }else{
                localStorage.setItem(variableName, "false");
            }
        });
    });
    variablesBlock.forEach(function(variableName, index) {
        $('#' + variableName).change(function () {
            if ($(this).is(":checked")) {
                localStorage.setItem(variableName, "true");
                localStorage.setItem(variablesIgnore[index], "false");
                document.getElementById(variablesIgnore[index]).checked = false;
            }else{
                localStorage.setItem(variableName, "false");
            }
        });
    });

    // 3 Options Value
    variablesDBBlock.forEach(function(variableName, index) {
        $('#' + variableName).change(function () {
            if ($(this).is(":checked")) {
                localStorage.setItem(variableName, "true");
                localStorage.setItem(variablesDBIgnore[index], "false");
                document.getElementById(variablesDBIgnore[index]).checked = false;
                localStorage.setItem(variablesDBSync[index], "false");
                document.getElementById(variablesDBSync[index]).checked = false;
            }else{
                localStorage.setItem(variableName, "false");
            }
        });
    });
    variablesDBIgnore.forEach(function(variableName, index) {
        $('#' + variableName).change(function () {
            if ($(this).is(":checked")) {
                localStorage.setItem(variableName, "true");
                localStorage.setItem(variablesDBBlock[index], "false");
                document.getElementById(variablesDBBlock[index]).checked = false;
                localStorage.setItem(variablesDBSync[index], "false");
                document.getElementById(variablesDBSync[index]).checked = false;
            }else{
                localStorage.setItem(variableName, "false");
            }
        });
    });
    variablesDBSync.forEach(function(variableName, index) {
        $('#' + variableName).change(function () {
            if ($(this).is(":checked")) {
                localStorage.setItem(variableName, "true");
                localStorage.setItem(variablesDBIgnore[index], "false");
                document.getElementById(variablesDBIgnore[index]).checked = false;
                localStorage.setItem(variablesDBBlock[index], "false");
                document.getElementById(variablesDBBlock[index]).checked = false;
            }else{
                localStorage.setItem(variableName, "false");
            }
        });
    });
}

function loadOptions () {

    var allVariableNames = variablesDBBlock.concat(variablesDBSync.concat(variablesDBIgnore.concat(
                                                                          variablesBlock.concat(variablesIgnore))));
    allVariableNames.push("blockSteamRepBan");
    allVariableNames.forEach(function (variableName) {
        if (localStorage.getItem(variableName) === "true") {

            // For some reason jQuery does not update the check box using this code:
            //$('#' + variableName).checked = true;

            document.getElementById(variableName).checked=true;
        } else {
            //console.log(variableName + " not checked");
        }
    });

	$("#levelBox").value = localStorage.getItem('blockLevel');
}
function loadUsers (){
    if (typeof(localStorage.busers) !== 'undefined') {
        var array = JSON.parse(localStorage.busers);
        var text = "";
        array.forEach(function(entry) {
            text = text + entry + ",";
        });
        $("#users").value = text;
    }
}
function updateUsers () {
		var unsplit = document.getElementById("users").value;
		var split = unsplit.split(",");
		localStorage.busers = JSON.stringify(split);
		console.log("Updating Users");
}
function setupCounter(){
		if (typeof(localStorage.bucounter) === 'undefined') {
			localStorage.bucounter = "0";
		}
		$('#counter').html(localStorage.bucounter);
}
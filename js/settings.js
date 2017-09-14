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
    // Level textbox
    $('#levelBox').on('change keyup paste',function() {
        if (isNumeric($(this).val()) && $(this).val().indexOf("e") === -1) {
            localStorage.setItem('blockLevel', $(this).val());
        } else if($(this).val() === "" || $(this).val() === " "){
            isNumeric($(this).val(0))
        } else {
            $(this).val(localStorage.getItem('blockLevel'));
        }
        valueChanged();
    });
    // 1 Option Value
    $('#syncOptionCheckbox').change(function() {
        if($(this).is(":checked")) {
            localStorage.setItem('syncOptionEnabled', "true");
            $(".hideSyncOption").show();
        }else{
            localStorage.setItem('syncOptionEnabled', "false");
            variablesDBSync.forEach(function(variableName) {
                localStorage.setItem(variableName, "false");
                document.getElementById(variableName).checked = false;
            });
            valueChanged();
            $(".hideSyncOption").hide();
        }
    });
    // 1 Option Value
    $('#blockSteamRepBan').change(function() {
        if($(this).is(":checked")) {
            localStorage.setItem('blockSteamRepBan', "true");
        }else{
            localStorage.setItem('blockSteamRepBan', "false");
        }
        valueChanged();
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
            valueChanged();
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
            valueChanged();
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
            valueChanged();
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
            valueChanged();
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
            valueChanged();
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

            document.getElementById(variableName).checked = true;
        } else {
            //console.log(variableName + " not checked");
        }
    });
    if(localStorage.getItem('syncOptionEnabled') === "true"){
        $(".hideSyncOption").show();
        document.getElementById("syncOptionCheckbox").checked = true;
    }
	$("#levelBox").val(localStorage.getItem('blockLevel'));
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
function setupCounter(){
		if (typeof(localStorage.bucounter) === 'undefined') {
			localStorage.bucounter = "0";
		}
		$('#counter').html(localStorage.bucounter);
}
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function valueChanged (){
    localStorage.setItem('alreadyCheckedUsers', null);
}
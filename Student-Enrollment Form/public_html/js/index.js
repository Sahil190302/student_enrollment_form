var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var stuDBName = "School";
var stuRelationName = "Student";
var connToken = "90934344|-31949198777338263|90957515";

$(document).ready(function () {
    // Add event listener to form inputs
    $("#enrform input").on("input", function () {
        validateForm();
    });

    // Initial validation to set Save button state
    validateForm();
});

function validateForm() {
    // Check if all required fields are filled
    if (
        $("#rollno").val() &&
        $("#fullname").val() &&
        $("#class").val() &&
        $("#bd").val() &&
        $("#enrd").val() &&
        $("#add").val()
    ) {
        $("#save").prop("disabled", false); // Enable Save button
    } else {
        $("#save").prop("disabled", true); // Disable Save button
    }
}

function getStuIdAsJsonObj() {
    var rollno = $("#rollno").val();
    return JSON.stringify({ "Roll-No": rollno });
}

function saveRecNo2LS(jsonObj) {
    var lvData = JSON.parse(jsonObj.data);
    localStorage.setItem("recno", lvData.rec_no);
}

function fillData(jsonObj) {
    var record = JSON.parse(jsonObj.data).record;
    $("#fullname").val(record["Full-Name"]);
    $("#class").val(record["Class"]);
    $("#bd").val(record["Birth-Date"]);
    $("#enrd").val(record["Enrollment-Date"]);
    $("#add").val(record["Address"]);
}

function getStudent() {
    var stuIdJsonObj = getStuIdAsJsonObj();
    var getRequest = createGET_BY_KEYRequest(connToken, stuDBName, stuRelationName, stuIdJsonObj);

    jQuery.ajaxSetup({ async: false });
    var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 400) {
        alert("No record found for the entered Roll No.");
        $("#save").prop("disabled", false);
        $("#update").prop("disabled", true);
        $("#reset").prop("disabled", false);
        $("#fullname").focus();
    } else if (resJsonObj.status === 200) {
        saveRecNo2LS(resJsonObj);
        fillData(resJsonObj);
        $("#rollno").prop("disabled", true);
        $("#save").prop("disabled", true);
        $("#update").prop("disabled", false);
        $("#reset").prop("disabled", false);
    }
}

function resetForm() {
    $("#rollno, #fullname, #class, #bd, #enrd, #add").val("");
    $("#rollno").prop("disabled", false);
    $("#save").prop("disabled", true);
    $("#update").prop("disabled", true);
    $("#reset").prop("disabled", false);
    $("#rollno").focus();
    localStorage.removeItem("recno");
}

function saveData() {
    var stuIdJsonObj = getStuIdAsJsonObj();
    var getRequest = createGET_BY_KEYRequest(connToken, stuDBName, stuRelationName, stuIdJsonObj);

    jQuery.ajaxSetup({ async: false });
    var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 200) {
        alert("Roll No already exists. Please enter a unique Roll No.");
        $("#rollno").focus();
        return;
    }

    var jsonStrObj = validateData();
    if (!jsonStrObj) return;

    var putRequest = createPUTRequest(connToken, jsonStrObj, stuDBName, stuRelationName);
    jQuery.ajaxSetup({ async: false });
    var resPutJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });

    if (resPutJsonObj.status === 200) {
        alert("Record saved successfully!");
        resetForm();
    } else {
        alert("Error saving data.");
    }
}

function updateData() {
    var jsonChg = validateData();
    if (!jsonChg) return;

    var recNo = localStorage.getItem("recno");
    if (!recNo) {
        alert("No record number found. Please search for the Student first.");
        return;
    }

    var updateRequest = createUPDATERecordRequest(connToken, jsonChg, stuDBName, stuRelationName, recNo);

    jQuery.ajaxSetup({ async: false });
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 200) {
        alert("Record updated successfully!");
        resetForm();
    } else {
        alert("Error updating data.");
    }
}

function validateData() {
    var rollno = $("#rollno").val();
    var fullname = $("#fullname").val();
    var class_ = $("#class").val();
    var add = $("#add").val();
    var bd = $("#bd").val();
    var enrd = $("#enrd").val();

    if (!rollno || !fullname || !class_ || !add || !bd || !enrd) {
        alert("All fields are required.");
        return null;
    }

    return JSON.stringify({
        "Roll-No": rollno,
        "Full-Name": fullname,
        "Class": class_,
        "Address": add,
        "Birth-Date": bd,
        "Enrollment-Date": enrd
    });
}

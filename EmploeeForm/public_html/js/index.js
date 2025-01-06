var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var empDBName = "Employee";
var empRelationName = "EmpData";
var connToken = "90934344|-31949198777338263|90957515";

$("#empid").focus();

function saveRecNo2LS(jsonObj) {
    if (!jsonObj || !jsonObj.data) {
        console.error("Invalid JSON object for saving record number.");
        return;
    }
    var lvData = JSON.parse(jsonObj.data);
    localStorage.setItem("recno", lvData.rec_no);
}

function getEmpIdAsJsonObj() {
    var empid = $("#empid").val();
    return JSON.stringify({ id: empid });
}



function fillData(jsonObj) {
    if (!jsonObj || !jsonObj.data) {
        console.error("Invalid JSON object for filling data.");
        return;
    }
    var record = JSON.parse(jsonObj.data).record;
    $("#empname").val(record.name);
    $("#empsal").val(record.salary);
    $("#da").val(record.da);
    $("#hra").val(record.hra);
    $("#deduct").val(record.deduction);
}

function getEmp() {
    var empIdJsonObj = getEmpIdAsJsonObj();

    var getRequest = createGET_BY_KEYRequest(connToken, empDBName, empRelationName, empIdJsonObj);

    jQuery.ajaxSetup({ async: false });
    var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 400) {
        alert("No record found for the entered Employee ID.");
        $("#save").prop("disabled", false);
        $("#change").prop("disabled", true);
        $("#reset").prop("disabled", false);
        $("#empname").focus();
    } else if (resJsonObj.status === 200) {
        var data = JSON.parse(resJsonObj.data);
        saveRecNo2LS(resJsonObj); // Save record number to local storage
        fillData(resJsonObj);
        $("#empid").prop("disabled", true);
        $("#save").prop("disabled", true);
        $("#change").prop("disabled", false);
        $("#reset").prop("disabled", false);
    } else {
        alert("Unexpected error occurred.");
    }
}





function resetForm() {
    $("#empid, #empname, #empsal, #hra, #da, #deduct").val("");
    $("#empid").prop("disabled", false);
    $("#save").prop("disabled", true);
    $("#change").prop("disabled", true);
    $("#reset").prop("disabled", false);
    $("#empid").focus();
    localStorage.removeItem("recno"); // Clear record number
}


function saveData() {
    var empIdJsonObj = getEmpIdAsJsonObj();
    var getRequest = createGET_BY_KEYRequest(connToken, empDBName, empRelationName, empIdJsonObj);

    jQuery.ajaxSetup({ async: false });
    var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 200) {
        alert("Employee ID already exists. Please enter a unique ID.");
        $("#empid").focus();
        return; // Stop the save process
    }

    var jsonStrObj = validateData();
    if (!jsonStrObj) return; // Validation failed

    var putRequest = createPUTRequest(connToken, jsonStrObj, empDBName, empRelationName);
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



function changeData() {
    var jsonChg = validateData();
    if (!jsonChg) return;

    var recNo = localStorage.getItem("recno");
    if (!recNo) {
        alert("No record number found. Please search for the employee first.");
        return;
    }

    var updateRequest = createUPDATERecordRequest(connToken, jsonChg, empDBName, empRelationName, recNo);

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
    var empid = $("#empid").val();
    var empname = $("#empname").val();
    var empsal = $("#empsal").val();
    var hra = $("#hra").val();
    var da = $("#da").val();
    var deduct = $("#deduct").val();

    if (!empid || !empname || !empsal || !hra || !da || !deduct) {
        alert("All fields are required.");
        return null;
    }

    return JSON.stringify({
        id: empid,
        name: empname,
        salary: empsal,
        hra: hra,
        da: da,
        deduction: deduct
    });
}

import config from "react-global-configuration";
import statesData from "./USstates.json";

// APPFUNCTIONS GLOBALS
let _dbtable = "MYJUNK",
    _pluralString = "junks",      // PLURAL NAME VALUE OF THE TABLE IN QUESTION
    _singularString = "junk",     // SINGULAR NAME VALUE OF THE TABLE IN QUESTION
    _idKey          = "junkId",
    _nameKey        = "junkName",
    _searchKey     = "searchJunk",
    positions      = 0,
    position       = 0,
    positionKey    = [],
    apiurl = "http://junkhost"
;

async function findrecordbyid() {
    _searchKey = _idKey;
    if(!validateinput()) {
        document.getElementById(_searchKey).focus();
        return;
    } ; // IF
    var seekval = document.getElementById(_idKey).value;
    let myReq = new Request(apiurl + _pluralString + "/find/id/" + seekval);
    if(config.get('debugseedsux')) console.log("Looking for " + _singularString + " id: " + seekval);
    await fetch(myReq)
        .then(response => {
            if(response.status !== 200) {
                resetForm();
                throw Error(_singularString + " Id " + seekval + " not found in database: " + response.status);
            } // IF
            return response.json();
        })
        .then(data => {
            resetMessageBoard();
            for(position = 0; position < positions; position++){
                if(document.getElementById(positionKey[position]) != null) document.getElementById(positionKey[position]).value = data.valueOf()[positionKey[position]];
            } // FOR
            document.getElementById("messageboard").value = "Found " + _singularString + " record for id: " + seekval;
        })
        .catch( function(error){
            if(config.get('debugseedsux')) console.log("FIND FAILURE:" + error);
            document.getElementById("messageboard").value = "FIND FAILURE:" + error;
        });
    resetFocus();
} // FINDRECORDBYID()

async function findrecordbyname() {
    _searchKey = _nameKey;
    if(!validateinput()) {
        document.getElementById(_searchKey).focus();
        return;
    } ; // IF
    var seekval = document.getElementById(_nameKey).value;
    let myReq = new Request(apiurl + _pluralString + "/find/name/" + seekval);
    if(config.get('debugseedsux')) console.log("Looking for " + _singularString + " name: " + seekval);
    await fetch(myReq)
        .then(response => {
            if(response.status !== 200) {
                resetForm();
                throw Error(_singularString + " Name " + seekval + " not found in database: " + response.status);
            } // IF
            return response.json();
        })
        .then(data => {
            resetMessageBoard();
            for(position = 0; position < positions; position++){
                if(document.getElementById(positionKey[position]) != null) document.getElementById(positionKey[position]).value = data.valueOf()[positionKey[position]];
            } // FOR
            document.getElementById("messageboard").value = "Found " + _singularString + " record for name: " + seekval;
        })
        .catch( function(error){
            if(config.get('debugseedsux')) console.log("FIND FAILURE:" + error);
            document.getElementById("messageboard").value = "FIND FAILURE:" + error;
        });
    resetFocus();
} // FINDRECORDBYID()

async function listAllRecordsById() {
    let myReq = new Request(apiurl + _pluralString + "/find/all");
    if(config.get('debugseedsux')) console.log("Finding all " + _pluralString + " by id.");
    await fetch(myReq)
        .then(response => {
            if(response.status !== 200) {
                throw Error(_pluralString + " list not found: " + response.status);
            } // IF
            return response.json();
        })
        .then(data => {
            resetForm();
            resetMessageBoard();
            data.forEach((myD) => {
                let num = String("      " + myD[_idKey]).slice(-6);  // FIXED WIDTH FORMAT UP TO 999999
                document.getElementById("messageboard").value += (`${num} | ${myD[positionKey[2]]}\n`);
            });
        })
        .catch( function(error) {
            if(config.get('debugseedsux')) console.log("FIND FAILURE:" + error);
            document.getElementById("messageboard").value = "FIND FAILURE:" + error;
        });
    resetFocus();
} // LISTALL()

async function listAllRecordsByName() {
    let myReq = new Request(apiurl + _pluralString + "/find/all");
    if(config.get('debugseedsux')) console.log("Finding all " + _pluralString + " by name.");
    let myHeaders = new Headers();
    myHeaders.append("Content-Type","application/json");
    const myInit = {method: 'GET',
        headers: myHeaders};
    await fetch(myReq,myInit)
        .then(response => {
            if(response.status !== 200) {
                throw Error(_pluralString + " list not found: " + response.status);
            } // IF
            return response.json();
        })
        .then(data => {
            resetMessageBoard();
            resetForm();
            data.sort((a,b) => {
                let ca = a[_nameKey].toLowerCase();
                let cb = b[_nameKey].toLowerCase();
                if(ca < cb){return -1;}
                if(ca > cb){return 1; }
                return 0;
            });
            data.forEach((myD) => {
                let num = String("      " + myD[_idKey]).slice(-6);  // FIXED WIDTH FORMAT UP TO 999999
                document.getElementById("messageboard").value += (`${num} | ${myD[positionKey[2]]}\n`);
            });
            // document.getElementById("messageboard").value = JSON.stringify(data,null,2);
        })
        .catch( function(error){
            if(config.get('debugseedsux')) console.log("FIND FAILURE:" + error);
            document.getElementById("messageboard").value = "FIND FAILURE:" + error;
        });
    resetFocus();
} // LISTALLBYNAME()

async function addRecord() {
    // VALIDATE DATA INPUTS
    if(_dbtable === "CROPS" && !validateicccode()) {
        document.getElementById("cropicccode").focus();
        return;
    } ; // IF1
    if (document.getElementById(_nameKey).value === "") {
        alert("Please enter text for the " + _singularString + " name.");
        document.getElementById(_nameKey).focus();
        return;
    } // IF2
    // _IDKEYS ARE AUTOINCREMENT. SET ENTRY VALUE TO NULL
    document.getElementById(_idKey).value = "";
    let myReq = new Request(apiurl + _pluralString + "/new");
    let myHeaders = new Headers();
    myHeaders.append("Content-Type","application/json");
    // HELPERS TO CREATE BODY ELEMENTS
    let addArr = [], myBody = "{ ", spacer = ", ", textOrNumber;
    // AQUIRE VALUES IN DATAFORM
    for(position = 1; position < positions; position++){  // START AT 1 BECAUSE RECORD ID IS PROVIDED BY DATABASE
        addArr[position] = document.getElementById(positionKey[position]).value;
    } // FOR 1
    // FORMAT FORM ENTRY VALUES INTO JSON FOR REQUEST BODY
    for(position = 1; position < positions; position++){
        if(position < (positions - 1)) spacer = ", "; else spacer = " ";
        if(document.getElementById(positionKey[position]).className === "datatext") textOrNumber = ` "${addArr[position]}" `;
        else textOrNumber = addArr[position];
        myBody = ` ${myBody} "${positionKey[position]}": ${textOrNumber} ${spacer}`;
    } // FOR 2
    myBody = myBody + " }"; // CLOSE THE JSON TEXT
    const myInit = {method: 'POST',
        headers: myHeaders,
        body: myBody};
    if(config.get('debugseedsux')) console.log("Adding new " + _singularString + " record: " + myBody);
    await fetch(myReq, myInit)
        .then(response => {
            if(response.status !== 200) {
                resetForm();
                throw new Error("Failed to add new " + _singularString + " record: " + response.body);
            } // IF
            return response.json();
        })
        .then(data => {
            document.getElementById("messageboard").value = "Successfully added new " + _singularString + " record: ==> " + data[_nameKey];
        })
        .catch( error => {
            if(config.get('debugseedsux')) console.log("NEW RECORD FAILURE:" + error);
            document.getElementById("messageboard").value = "NEW RECORD FAILURE:" + error;
        });
    resetFocus();
} // ADDDATA()

async function updateRecord() {
    _searchKey = _idKey;  // VALIDATE THIS FUNCTION USING THE ID KEY.
    if(!validateinput()) {
        document.getElementById(_searchKey).focus();
        return;
    } ; // IF
    if(_dbtable === "CROPS" && !validateicccode()) {
        document.getElementById("cropICCCode").focus();
        return;
    } ;
    var seekval = document.getElementById(_idKey).value;
    let myReq = new Request(apiurl + _pluralString + "/update/" + seekval);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type","application/json");
    // HELPERS TO CREATE BODY ELEMENTS
    let addArr = [], myBody = "{ ", spacer = ", ", textOrNumber;
    // AQUIRE VALUES IN DATAFORM
    for(position = 0; position < positions; position++){
        addArr[position] = document.getElementById(positionKey[position]).value;
    } // FOR 1
    // FORMAT FORM ENTRY VALUES INTO JSON FOR REQUEST BODY
    for(position = 0; position < positions; position++){
        if(position < (positions - 1)) spacer = ", "; else spacer = " ";
        if(document.getElementById(positionKey[position]).className === "datatext") textOrNumber = ` "${addArr[position]}" `;
        else textOrNumber = addArr[position];
        myBody = ` ${myBody} "${positionKey[position]}": ${textOrNumber} ${spacer}`;
    } // FOR 2
    myBody = myBody + " }";
    const myInit = {method: 'PUT',
        headers: myHeaders,
        body: myBody};
    if(config.get('debugseedsux')) console.log("Updating " + _singularString + " id: " + seekval);
    if(config.get('debugseedsux')) console.log("Updating " + _singularString + " with: " + myBody);
    await fetch(myReq, myInit)
        .then(response => {
            if(response.status !== 200) {
                resetForm();
                throw Error(_singularString + " id " + seekval + " not found in database: " + response.status);
            } // IF
            document.getElementById("messageboard").value = "Updated " + _singularString + " record for id: " + seekval;
            return response.json();
        })
        .catch( function(error){
            if(config.get('debugseedsux')) console.log("UPDATE FAILURE:" + error);
            document.getElementById("messageboard").value = "UPDATE FAILURE:" + error;
        });
    /** COMMENT OUT FOR DEBUG
     **/
    resetFocus();
} // UPDATEDATA()

async function deleteRecord() {
    _searchKey = _idKey;
    if(!validateinput()) {
        document.getElementById(_searchKey).focus();
        return;
    } ; // IF
    var seekval = document.getElementById(_idKey).value;
    var seekname = document.getElementById(_nameKey).value;
    let myReq = new Request(apiurl + _pluralString + "/delete/" + seekval);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const myInit = {
        method: 'DELETE',
        headers: myHeaders
    };
    if (config.get('debugseedsux')) console.log("Deleting " + _singularString + " id: " + seekval);
    await fetch(myReq, myInit)
        .then(response => {
            if (response.status !== 200) {
                resetForm();
                throw Error( _singularString + " id " + seekval + " not found in database: " + response.status);
            } // IF
            document.getElementById("messageboard").value = "Deleted " + _singularString + " record for id: " + seekval + " ==> " + _singularString + ": " + seekname;
            return response.json();
        })
        .catch(function (error) {
            if (config.get('debugseedsux')) console.log("DELETE FAILURE:" + error);
            document.getElementById("messageboard").value = "DELETE FAILURE:" + error;
        });
    resetFocus();
} // DELETEDATA()

async function countDbRecords() {
    resetForm();
    resetMessageBoard();
    let myReq = new Request(apiurl + _pluralString + "/rowcount");
    if(config.get('debugseedsux')) console.log("Retrieving record count for " + _pluralString + ".");
    await fetch(myReq)
        .then(response => {
            if (response.status !== 200) {
                resetForm();
                throw Error("Failed retrieving record count: " + response.status);
            } // IF
            return response.json();
        })
        .then(data => {
            document.getElementById("messageboard").value = "Count of records in " + _dbtable + " database: " + data;
        })
        .catch(function (error) {
            if (config.get('debugseedsux')) console.log("FIND FAILURE:" + error);
            document.getElementById("messageboard").value = "FIND FAILURE:" + error;
        });
    resetFocus();
}


/***
 * ============== BEGIN SUPPORT FUNCTION SECTION ====================
 */

function validateinput() {
    var theVal = document.getElementById(_searchKey).value;
    if(config.get('debugseedsux')) console.log("Validate " + _singularString + " id entry: " + theVal);
    if ("" === theVal || theVal < 0) {
        alert("Please enter a string or a value > 0 for the "+ _searchKey + ".");
        return false;
    } // IF
    return true;
} // VALIDATECROPID()

function validateicccode() {
    var theCode = document.getElementById("cropICCCode").value;
    if(config.get('debugseedsux')) console.log("Validate ICC Code: " + theCode);
    if ("" === theCode || theCode < 0) {
        alert("Please enter 0 or a number for the ICC Code.");
        return false;
    } // IF
    return true;
} // VALIDATEICCCODE()

function resetAll(){
    resetMessageBoard();
    resetForm();
    resetFocus();
} // RESETALL()

function resetForm(){
    if(config.get('debugseedsux')) console.log("Clear the form data.");
    let dataForm = document.getElementsByClassName("dataform");
    let inputTags = dataForm.item(0).getElementsByTagName("input");
    for(let indx = 0; indx < inputTags.length; indx++){
        inputTags.item(indx).value = "";
    } // FOR
}  // RESETFORM()

function resetMessageBoard() {
    if(config.get('debugseedsux')) console.log("Clear the message board.");
    document.getElementById("messageboard").value = "";
} // RESETMESSAGEBOARD()

function resetFocus() {
    // FOCUS ON THE FIRST INPUT ITEM ON THE PANEL
    document.getElementsByClassName("dataform").item(0).getElementsByTagName("input").item(0).focus();
} // RESETFOCUS()

function setDbTable(tableName) {
    _dbtable = tableName;
} // SETDBTABLE(TABLENAME)

async function getCropsDropdownList() {
    let myReq = new Request(apiurl + "/crops/find/all");
    let myHeaders = new Headers();
    myHeaders.append("Content-Type","application/json");
    const myInit = {method: 'GET',
        headers: myHeaders};
    await fetch(myReq,myInit)
        .then(response => {
            if(response.status !== 200) {
                throw Error("Crops select list not available: " + response.status);
            } // IF
            return response.json();
        })
        .then(data => {
            data.sort((a,b) => {
                let ca = a["cropName"].toLowerCase();
                let cb = b["cropName"].toLowerCase();
                if(ca < cb){return -1;}
                if(ca > cb){return 1; }
                return 0;
            });
            data.forEach((myD) => {
                document.getElementById("varietyCropId").appendChild(new Option(myD["cropName"],myD["cropId"]));
            });
        })
        .catch( function(error){
            if(config.get('debugseedsux')) console.log("FAILURE TO LOAD CROPS DROPDOWN: " + error);
            document.getElementById("messageboard").value = "FAILURE TO LOAD CROPS DROPDOWN: " + error;
        });
} // GETCROPSDROPDOWNLIST()

function getStatesDropdownList() {
    statesData.forEach((myD) => {
        document.getElementById("producerState").appendChild(new Option(myD["Code"],myD["Code"]));
    });
} // GETSTATESDROPDOWNLIST()

function initPane(tableName) {
    setDbTable(tableName);
    if(tableName === "CROPS"){
        _pluralString = "crops";
        _singularString = "crop";
        _idKey          = "cropId";
        _nameKey        = "cropName";
        positions       = 4;
        positionKey[0]  = "cropId";
        positionKey[1]  = "cropName";
        positionKey[2]  = "cropDescription";
        positionKey[3]  = "cropICCCode";
    } else if(tableName === "VARIETIES") {
        _pluralString = "varieties";
        _singularString = "variety";
        _idKey          = "varietyId";
        _nameKey        = "varietyName";
        positions       = 4;
        positionKey[0]  = "varietyId";
        positionKey[1]  = "varietyName";
        positionKey[2]  = "varietyDescription";
        positionKey[3]  = "varietyCropId";
    } else if(tableName === "PRODUCERS") {
        _pluralString   = "producers";
        _singularString = "producer";
        _idKey          = "producerId";
        _nameKey        = "producerShortName";
        positions       = 8;
        positionKey[0]  = "producerId";
        positionKey[1]  = "producerShortName";
        positionKey[2]  = "producerName";
        positionKey[3]  = "producerAddress1";
        positionKey[4]  = "producerAddress2";
        positionKey[5]  = "producerCity";
        positionKey[6]  = "producerState";
        positionKey[7]  = "producerZip";
    } // IF-ELSE
    apiurl = config.get('apiurl');
} // LOADPARAMS(STRING)

export {
    findrecordbyid,
    findrecordbyname,
    listAllRecordsById,
    listAllRecordsByName,
    addRecord,
    updateRecord,
    deleteRecord,
    countDbRecords,
    resetForm,
    resetFocus,
    resetAll,
    resetMessageBoard,
    initPane,
    getCropsDropdownList,
    getStatesDropdownList,
    apiurl
}

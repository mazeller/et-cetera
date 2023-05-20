//http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//Get LR
function getLastRecord(callback){
	//Request Data
        $.ajax({
                url: '/getdata.php',
                type: 'post',
                data: {'col': "lastrecord"},
                success: function(data, status) {
                        data = JSON.parse(data);
                        callback(data[0]['received_date']);
                },
                error: function(xhr, desc, err) {
                        console.log(xhr);
                        console.log("Details: " + desc + "\nError:" + err);
                }
        });
}

//Get Lineage data
function getLineages(callback) {
        //Request data
        $.ajax({
                url: '/getdata.php',
                type: 'post',
                data: {'col': "lineage"},
                success: function(data, status) {
                        data = JSON.parse(data);
                        callback(data);
                },
                error: function(xhr, desc, err) {
                        console.log(xhr);
                        console.log("Details: " + desc + "\nError:" + err);
                        $("#results").html("Server Error");
                }
        })
}

//Get all Lineages with date
function getAllLineages(callback) {
	//Request data
	$.ajax({
                url: '/getdata.php',
                type: 'post',
                data: {'col': "lineage,record"},
                success: function(data, status) {
                        data = JSON.parse(data);
                        lineagePreProcess(data, callback);
                },
                error: function(xhr, desc, err) {
                        console.log(xhr);
                        console.log("Details: " + desc + "\nError:" + err);
                        $("#results").html("Server Error");
                }
        })
}

//preprocess all lineage data
function lineagePreProcess(rData, callback) {

	callback(rData);
}

//Get all the RFLP cut sites
function getRFLPValues(callback,fasta) {
        //Request data
        $.ajax({
                url: '/getdata.php',
                type: 'post',
                data: {'col': "rflp"},
                success: function(data, status) {
                        data = JSON.parse(data);

                        var jsonData = {};

                        //Split out restriction enzyme lists. Function not optimized.
                        sitesMLU = data.filter(function(rflps) {return rflps.restriction_enzyme == "mlu1";});
                        sitesHINC = data.filter(function(rflps) {return rflps.restriction_enzyme == "hinc2";});
                        sitesSAC = data.filter(function(rflps) {return rflps.restriction_enzyme == "sac2";});

                        jsonData["sitesMLU"] = sitesMLU;
                        jsonData["sitesHINC"] = sitesHINC;
                        jsonData["sitesSAC"] = sitesSAC;
			jsonData["fastaResult"] = fasta;
			jsonData["isSuccess"] = true;

                        callback(jsonData);
                },
                error: function(xhr, desc, err) {
			var jsonData = {};
			jsonData["request"] = xhr;
			jsonData["detail"] = "Details: " + desc + "\nError:" + err;
			jsonData["message"] = "Server Error";
			jsonData["isSuccess"] = false;

			callback(jsonData);
                }
        })
}

//Place holder function for time being
function dateProcess(xData)
{
	//for dates, cull by year
	return xData.substr(0,4);
}

//Query for the data
function getJsonData(xComponent, yComponent, callback) {
	//Check if yComponents is array
	var fields;
	if(yComponent.constructor === Array) {
		fields = yComponent.join(",");
	} else {
		fields = yComponent;
	}
	
	//Add in xComponent
	fields = xComponent + "," + fields;

	//Change values
	fields = fields.replaceAll("received_date","received_date,day,week,month,year");
	
	//Request data
	$.ajax({
		url: '/getdata.php',
		type: 'post',
		data: {'col': fields,'flags':flags},
		startTime: performance.now(),
 		success: function(data, status) {
			data = JSON.parse(data);
			//console.log("Before preprocessing: " + (performance.now()-this.startTime));
                        preProcess(xComponent, yComponent, data, callback);
			//console.log("After preprocessing: " + (performance.now()-this.startTime));
		},
 		error: function(xhr, desc, err) {
 			console.log(xhr);
 			console.log("Details: " + desc + "\nError:" + err);
 		}
	});
}

function preProcess(xComponent, yComponent, data, callback, flags = "") {
        //Init array
        var prrsv = {};
        var xAxis = [];
        var groups = [];
	var yData;
	var xData;

        if(yComponent.constructor === Array) {
		for (var i = 0; i < data.length; i++) {
			for (var j = 0; j < yComponent.length; j++)
			{
                        	//Shorten Variables
                        	yData = data[i][yComponent[j]];
	                        xData = data[i][xComponent];

        	                //Throw out unlabeled
                	        if (yData == null || yData == '')
                        	        continue;

	                        //Create a complex structure
        	                if (prrsv[yData] == null) {
                	                prrsv[yData] = [];
	                        }

        	                if (flu[yData][xData] == null) {
                	                prrsv[yData][xData] = 0;
	                        } else {
        	                        prrsv[yData][xData] = prrsv[yData][xData] + 1;
                	        }

                        	//Keep track of the x axis values & groups. Is this redundant?
	                        if (xAxis.indexOf(data[i][xComponent]) < 0)
        	                        xAxis.push(data[i][xComponent]);
                	        if (groups.indexOf(data[i][yComponent[j]]) < 0)
                        	        groups.push(data[i][yComponent[j]]);
			}
		}
	}
        else {
        	for (var i = 0; i < data.length; i++) {

			//Shorten Variables
			yData = data[i][yComponent];
			xData = data[i][xComponent];

			//Throw out unlabeled
	           	if (yData == null || yData == '')
        	        	continue;

            		//Create a complex structure
	            	if (prrsv[yData] == null) {
        	        	prrsv[yData] = [];
	            	}	

			if (prrsv[yData][xData] == null) {
                		prrsv[yData][xData] = 0;
	            	} else {
        	        	prrsv[yData][xData] = prrsv[yData][xData] + 1;
            		}

			//Keep track of the x axis values & groups
        		if (xAxis.indexOf(data[i][xComponent]) < 0)
        			xAxis.push(data[i][xComponent]);
		        if (groups.indexOf(data[i][yComponent]) < 0)
        		        groups.push(data[i][yComponent]);
		}
	}

	//Check structure
	callback(data);
}

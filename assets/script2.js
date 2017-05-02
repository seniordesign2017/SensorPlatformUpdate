$(function() {
	if($("#sleeperDiv2").text.length != 0){
		function fetchData() {
			
			console.log('fetching data from Murano');
			$("#appconsole2").text('Fetching Data For '+myDevice+' From Server...');
			$("#appconsole2").css('color', '#555555');

			// recent data is grabbed as newdata
			function onDataReceived(newdata) {
				$("#appstatus2").text('Running');
				$("#appstatus2").css('color', '555555');
				$("#appconsole2").text('Processing Data');
				$("#appconsole2").css('color', '#555555');
				var data_to_plot = [];
				//Load all the data in one pass; if we only got partial
				// data we could merge it with what we already have.
				//console.log(series)
				console.log(newdata);

				//check if newdata has data
				if (jQuery.isEmptyObject(newdata.timeseries.values)){
				//newdata has no data
				//Database error
				console.log('no data in selected window, check device')
				$("#appconsole2").text('No data found in window for this device');
				$("#placeholder2").text('Graph: Data Not Found for: '+myDevice);
				}else{
					//newdata has data
					console.log('valid data return for: '+myDevice);
					//for each column in the newdata from timeseries 
					
					for (j = 1; j < newdata.timeseries.columns.length; j++){
						var data = [];
						//set data from newdata to raw_data
						var raw_data = newdata.timeseries.values
						var friendly = newdata.timeseries.columns[j];
						var units = "";
						var last_val;
						//check name of column and use correct unit
						if (friendly == "pumpTemperature"){
							units = "F";
							friendly = "Pump Temperature";
					
						}else if (friendly == "flow"){
							units = "GPM";
							friendly = "Flow";
							
						}else if(friendly == "pressure"){
							units = "PSI";
							friendly = "Pressure";
							
						}else if(friendly == "pressure2"){
							units="PSI";
							friendly="Pressure2";
							
						}else if(friendly == "humidity"){
							units = "%";
							friendly= "Humidity";
							
						}else if(friendly == "current"){
							units = "A";
							friendly = "Current";
							
						}else if(friendly == "atmoPressure"){
							units = "Pa";
							friendly = "Barometric Pressure";
						
						}
						

						console.log(raw_data, j);

						// reformat data for flot
						for (var i = raw_data.length - 1; i >= 0; i--) {
							if (raw_data[i][j] != null)
							data.unshift([raw_data[i][0],raw_data[i][j]])
						}
						
						// only push if data returned
						if(graphType2 == "all"||(graphType2=="temper" && friendly == "Pump Temperature")||(graphType2=="press" && friendly == "Pressure")||(graphType2 == "flow"&& friendly == "Flow")(graphType2=="press2" && friendly == "Pressure2")||(graphType2=="bpress" && friendly == "Barometric Pressure")||(graphType2=="curr" && friendly == "Current")||(graphType2=="humid" && friendly == "Humidity")){
							
							if (data.length > 0) {
								last_val = data[data.length-1];
								// put data into data_to_plot
								data_to_plot.push({
									label: friendly + ' - '+ last_val[1] + ' ' +units,
									data: data,
									units: units
								});
								
								changeCurrentValue(last_val[1],friendly);
								
							}
						}
					}
					$("#placeholder2").text('');
					$.plot("#placeholder2", data_to_plot, graph_options);
					$("#appconsole2").text('Data Plotted');
					$("#appconsole2").css('color', '#555555');
				
				}
				
				if (updateInterval != 0){
					setTimeout(fetchData, updateInterval);
				}
			}

			function onError( jqXHR, textStatus, errorThrown) {
				console.log('error: ' + textStatus + ',' + errorThrown);
				$("#appconsole2").text('No Server Response');
				$("#appstatus2").text('Server Offline');
				$("#appstatus2").css('color', red_color);
				if (updateInterval != 0){
					setTimeout(fetchData, updateInterval+3000);
				}
			}

			$.ajax({
				url: app_domain+"development/device/data?identifier="+myDevice+"&window="+timeWindow,
				type: "GET",
				dataType: "json",
				success: onDataReceived,
				crossDomain: true,
				error: onError,
				statusCode: {
					504: function() {
						console.log( "server not responding" );
						$("#appstatus2").text('Server Not Responding 504');
						$("#appstatus2").css('color', red_color);
					}
				}
				,timeout: 10000
			});

		}
	}
}
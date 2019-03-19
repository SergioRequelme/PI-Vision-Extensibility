//************************************
// Begin defining a new symbol
/*
Empresa: Piper Ingenieros SAC
Ing. Sergio Requelme
*/
//************************************
(function (CS) {
    //'use strict';
    // Specify the symbol definition	
    var myCustomSymbolDefinition = {
        // Specify the unique name for this symbol; this instructs PI Vision to also
        // look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
        typeName: 'CountLimit',
        // Specify the user-friendly name of the symbol that will appear in PI Vision
        displayName: '1 Edit CountLimit',
        // Specify the number of data sources for this symbol; just a single data source or multiple
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
        // Specify the location of an image file to use as the icon for this symbol
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/max.png',
        visObjectType: symbolVis,
        // Specify default configuration for this symbol
        //First time you load the graph
        getDefaultConfig: function () {
            return {
                DataShape: 'TimeSeries',
                DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModeEvents,
                FormatType: null,
                // Specify the default height and width of this symbol
                Height: 300,
                Width: 1000,
                // Allow large queries
                Intervals: 1000,
                // Specify the value of custom configuration options
                minimumYValue: 0,
                maximumYValue: 100,
                yAxisRange: 'allSigma',
                showTitle: false,
                textColor: "black",
                fontSize: 12,
                backgroundColor: "transparent",
                gridColor: "transparent",
                plotAreaFillColor: "transparent",
                axesColor: "#000000",
                seriesColor1: "#ffd600",
                seriesColor2: "#62ff00",
                showLegend: true,
                showChartScrollBar: false,
                legendPosition: "bottom",
                useColumns: false,
                decimalPlaces: 1,
                bulletSize: 5,
                customTitle: ""
            };
        },
        // Allow use in collections! !!!!!!!!!!!!!!!!!!!!!!!!!
        supportsCollections: true,
        // By including this, you're specifying that you want to allow configuration options for this symbol
        configOptions: function () {
            return [{
                // Add a title that will appear when the user right-clicks a symbol
                title: 'Editar Formato',
                // Supply a unique name for this cofiguration setting, so it can be reused, if needed
                mode: 'format'
            }];
        }
        // Specify the name of the function that will be called to initialize the symbol
        //init: myCustomSymbolInitFunction
    };
    //************************************
    // Function called to initialize the symbol
    //************************************
    //function myCustomSymbolInitFunction(scope, elem) {
    function symbolVis() {}
    CS.deriveVisualizationFromBase(symbolVis);
    symbolVis.prototype.init = function (scope, elem) {
        // Specify which function to call when a data update or configuration change occurs 
        this.onDataUpdate = myCustomDataUpdateFunction;
        this.onConfigChange = myCustomConfigurationChangeFunction;

        // Locate the html div that will contain the symbol, using its id, which is "container" by default
        var symbolContainerDiv = elem.find('#container')[0];
        // Use random functions to generate a new unique id for this symbol, to make it unique among all other custom symbols
        var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
        // Write that new unique ID back to overwrite the old id
        symbolContainerDiv.id = newUniqueIDString;
        var chart = false;
        var dataArray = [];
        //************************************
        // When a data update occurs...
        //************************************
        function myCustomDataUpdateFunction(data) {
            // If there is indeed new data in the update
            console.log("New data received: ", data);
            if (data !== null && data.Data) {
                dataArray = [];
                // Check for an error
                if (data.Data[0].ErrorDescription || data.Data[1].ErrorDescription) {
                    console.log(data.Data[0].ErrorDescription);
                    console.log(data.Data[1].ErrorDescription);
                }
                // If the custom visualization hasn't been made yet... create the custom visualization!
                // Custom code begins here:
                // -----------------------------------------------------------------------------------------
                //console.log("Now creating custom visualization...");
                // Get the data item name(s) and unit(s)
                if (data.Data[0].Label) {
                    var stringLabel1 = data.Data[0].Label;
                }
                if (data.Data[0].Units) {
                    var stringUnits1 = data.Data[0].Units;
                }
                if (data.Data[1].Label) {
                    var stringLabel2 = data.Data[1].Label;
                }
                if (data.Data[1].Units) {
                    var stringUnits2 = data.Data[1].Units;
                }
                //we will use the variable "count" to calculate the number of points plotted in the control that would represent the number of impacts
                var count = data.Data[0].Values.length;
                document.getElementById('count').value = count;
                //console.log("count first vector: " + count);
                
                //We will use 3 variables where we will save the necessary information to make the graph
                //In the variable "times" we will keep the information of the time in which the impact originated. represents the time of the first attribute.
                //In the variable "ValuesArray1", we will save all the generated impacts in a specific time range
                //the variable "valuesArray2", we will have the tendency of the objective.
                for (var i = 0; i < data.Data[0].Values.length; i++) {
                    var tiempos = (new Date(data.Data[0].Values[i].Time)).toLocaleTimeString();
                    var valuesArray1 = parseFloat(("" + data.Data[0].Values[i].Value).replace(",", ""));
                    var valuesArray2 = parseFloat(("" + data.Data[1].Values[0].Value).replace(",", ""));
                    //console.log("valor array2: " + valuesArray2);
                    
                    // Create a new event object
                    var newDataObject = {
                        "timestamp": tiempos,
                        "value0": valuesArray1,
                        "value1": valuesArray2,

                    };
                    dataArray.push(newDataObject);
                }
                //fun for  Value[j]
                //The search is made for all the values ​​that are above the target
                var nuevoArray = [];
                for (var j = 0; j < data.Data[0].Values.length; j++) {
                    var currentNumber = data.Data[0].Values[j].Value;
                    if (currentNumber > valuesArray2) {
                        nuevoArray.push(currentNumber)
                    }

                }
                
                /* console.log("nuevo Vector: " + nuevoArray);*/
                //Count the new vector Array [] that exceeds the target, which represent the critical impacts
                var newcount = nuevoArray.length;
                document.getElementById('newcount').value = newcount;
                //console.log("count the new Vector: " + newcount);


                // Create the custom visualization
                if (!chart) {
                    // Create the chart
                    chart = AmCharts.makeChart(symbolContainerDiv.id, {
                        "type": "serial",
                        "theme": "light",
                        "depth3D": 20,
                        "angle": 30,
                        "marginRight": 10,
                        "marginLeft": 10,
                        "autoMarginOffset": 10,
                        "addClassNames": true,
                        "titles": createArrayOfChartTitles(),
                        "fontSize": 12,
                        "backgroundAlpha": 1,
                        "backgroundColor": scope.config.backgroundColor,
                        "plotAreaFillAlphas": 0.1,
                        "plotAreaFillColors": scope.config.plotAreaFillColor,
                        "color": scope.config.textColor,
                        "pathToImages": "Scripts/app/editor/symbols/ext/images/",
                        "precision": scope.config.decimalPlaces,
                        "valueAxes": [
                            {
                                "id": "Axis1",
                                "axisColor": scope.config.axesColor,
                                "gridAlpha": 0,
                                "position": "left"
							}],
                        "categoryAxis": {
                            "axisColor": scope.config.axesColor, // Linea eje x color    
                            //"axisAlpha": 1,
                            "gridAlpha": 0,
                            "autoWrap": true,
                        },
                        "graphs": [{
                                "id": "Line1",
                                "type": "line",
                                "balloonText": "[[title]]: <b>[[value0]]</b>",
                                "labelPosition": "top",
                                "labelText": "[[value0]]",
                                "bullet": "square",
                                "fontSize": scope.config.fontSize,
                                "color": scope.config.seriesColor1,
                                "lineThickness": 1,
                                "bulletSize": 5,
                                "bulletBorderAlpha": 1,
                                "bulletColor": "#ffffff",
                                "useLineColorForBulletBorder": true,
                                "bulletBorderThickness": 2,
                                //"hideBulletsCount": 50,
                                "fillAlphas": 0,
                                "lineAlpha": 1,
                                "lineColor": scope.config.seriesColor1,
                                "title": "PDA-LA",
                                "valueAxis": "Axis1",
                                "valueField": "value0",
                                "showBalloon": true,
                                "animationPlayed": true,
                                "dashLengthField": "dashLengthLine"
						},
                            {
                                "id": "ImpCriticos1",
                                "type": "smoothedLine",
                                "lineThickness": 2,
                                "lineColor": scope.config.seriesColor2,
                                "title": stringLabel2,
                                "valueAxis": "Axis1",
                                "valueField": "value1",
                                "animationPlayed": true,
						}],
                        "dataProvider": dataArray,
                        "categoryField": "timestamp",
                        "chartScrollbar": {
                            //"graph": "g1",
                            "graphType": "line",
                            "position": "bottom",
                            "scrollbarHeight": 20,
                            "autoGridCount": true,
                            "enabled": scope.config.showChartScrollBar,
                            "dragIcon": "dragIconRectSmall",
                            "backgroundAlpha": 1,
                            "backgroundColor": scope.config.plotAreaFillColor,
                            "selectedBackgroundAlpha": 0.2
                        },
                        "legend": {
                            "position": scope.config.legendPosition,
                            "equalWidths": false,
                            "color": scope.config.textColor,
                            "fontSize": 12,
                            "enabled": scope.config.showLegend,
                            "valueAlign": "right",
                            "horizontalGap": 10,
                            "useGraphSettings": true,
                            "markerSize": 10
                        },
                        "dataDateFormat": "YYYY-MM-DD",
                        "zoomOutButtonImage": ""
                    });
                } else {

                    // Update the title
                    if (scope.config.showTitle) {
                        chart.titles = createArrayOfChartTitles();
                    } else {
                        chart.titles = null;
                    } // Refresh the graph					
                    chart.dataProvider = dataArray;
                    chart.validateData();
                    chart.validateNow();
                }
            }
        }

        function createArrayOfChartTitles() {
            // Build the titles array
            var titlesArray;
            if (scope.config.useCustomTitle) {
                titlesArray = [
                    {
                        "text": scope.config.customTitle,
                        "size": (scope.config.fontSize + 3)
        			}
        		];
            } else {
                titlesArray = [
                    {
                        "text": " " /*+ convertMonthToString(monthNow)*/ ,
                        "bold": true,
                        "size": (scope.config.fontSize + 3)
        			}
        		];
            }
            return titlesArray;
        }

        function myCustomConfigurationChangeFunction(data) {
            // If the visualization exists...
            if (chart) {
                // Update the title
                if (scope.config.showTitle) {
                    chart.titles = createArrayOfChartTitles();
                } else {
                    chart.titles = null;
                }
                // Update colors and fonts
                chart.valueAxes[0].axisColor = scope.config.axesColor;
                chart.categoryAxis.axisColor = scope.config.axesColor;

                if (chart.color !== scope.config.textColor) {
                    chart.color = scope.config.textColor;
                }
                if (chart.backgroundColor !== scope.config.backgroundColor) {
                    chart.backgroundColor = scope.config.backgroundColor;
                }
                if (chart.plotAreaFillColors !== scope.config.plotAreaFillColor) {
                    chart.plotAreaFillColors = scope.config.plotAreaFillColor;
                }
                if (chart.fontSize !== scope.config.fontSize) {
                    chart.fontSize = scope.config.fontSize;
                    chart.titles = createArrayOfChartTitles();
                }
                if (chart.graphs[0].lineColor !== scope.config.seriesColor1) {
                    chart.graphs[0].lineColor = scope.config.seriesColor1;
                    chart.graphs[0].color = scope.config.seriesColor1;
                }
                if (chart.graphs[1].lineColor !== scope.config.seriesColor2) {
                    chart.graphs[1].lineColor = scope.config.seriesColor2;
                    chart.graphs[1].color = scope.config.seriesColor1;
                }
                if (chart.graphs[2].lineColor !== scope.config.seriesColor3) {
                    chart.graphs[2].lineColor = scope.config.seriesColor3;
                }
                if (chart.graphs[3].lineColor !== scope.config.seriesColor4) {
                    chart.graphs[3].lineColor = scope.config.seriesColor4;
                }

                if (chart.precision != scope.config.decimalPlaces) {
                    chart.precision = scope.config.decimalPlaces;
                }

                // Update the scroll bar
                if (chart.chartScrollbar.enabled != scope.config.showChartScrollBar) {
                    chart.chartScrollbar.enabled = scope.config.showChartScrollBar;
                }
                chart.legend.enabled = scope.config.showLegend;
                chart.legend.position = scope.config.legendPosition;
                // Commit updates to the chart
                chart.validateData();
                chart.validateNow();
                //console.log("Styling updated.");
            }
        }

    };

    // Register this custom symbol definition with PI Vision
    CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);

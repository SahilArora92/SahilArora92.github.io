var host = "http://stocks-env.us-east-2.elasticbeanstalk.com/";
var indArr = ['SMA', 'EMA', 'STOCH', 'RSI', 'ADX', 'CCI', 'BBANDS', 'MACD'];
var activeTab = "Price";
var abc="";
var indChartsCache = {};
$(document).ready(function () {
    function validate() {
       
        var inputErr = /^[a-zA-Z]+$/.test(this.value.trim()) ? false : true;
        $('#btn-search').prop('disabled', inputErr);
        if (inputErr) {
            $('#inputError').show();
            $('#inputDiv').addClass("has-error");
        }
        else {
            $('#inputError').hide();
            $('#inputDiv').removeClass("has-error");
        }
    }
    function callFavApi(favKeys) {
        //var fContent="";
        if (favKeys == "") {
            fillEmptyFavorites();
        }
        else {
            $.ajax({
                url: host + '/stocks/fav/' + favKeys,
                type: 'GET',
                success: function (response, status, xhr) {

                    if (response["Error Message"] == undefined) {
                        fillFavorites(response);
                    }
                    else {
                        fillFavoritesError(response);
                    }

                },
                error: function (xhr, status, error) {
                    fillFavoritesError(error);

                }
            });
        }

    }
    function removeDuplicateRows(){
        var seen = {};
        $('#favTable tr').each(function() {
            var txt = $(this).text();
            if (seen[txt]||(txt.indexOf("undefined")>=0))
                $(this).remove();
            else
                seen[txt] = true;
        });
    }
    function sortLogic()
    {
        removeDuplicateRows();
        var col = $("#sortby option:checked").val();
        if (col != "Default") {
            $("#order").removeAttr("disabled");
            var dir = $("#order option:checked").val();
            col = parseInt(col);
            dir = parseInt(dir);
            $("#favTable").tablesorter({ sortList: [[col, dir]] });
        }
        else{
            $("#order").attr("disabled","disabled");
        }
        removeDuplicateRows();
    }
    function fillEmptyFavorites() {
        var favContent = "";
        favContent += "<thead>";
        favContent += "<tr>";
        favContent += "<th scope='col'>Symbol</th>";
        favContent += "<th scope='col'>Stock Price</th>";
        favContent += "<th scope='col'>Change (ChangePercent)</th>";
        favContent += "<th scope='col'>Volume</th>";
        favContent += "<th scope='col'></th>";
        favContent += "</tr>";
        favContent += "</thead><tbody></tbody>";
        $("#favTable").html(favContent);
    }
    function RefreshFavData() {
        var lsKeys = [];
        for (var i = 0; i < localStorage.length; i++) {
            lsKeys.push(localStorage.key(i));
        }
        callFavApi(lsKeys.toString());

    }
    function fillFavoritesError(err) {
        $("#favTable").empty();
        var favContent = "<div class='alert alert-danger'>Error Failed to get Favorites data</div>";
        $("#favError").html(favContent);
    }
    function fillFavorites(currentSD) {
        //var currentSD=RefreshData();
        
        var favContent = "";
        favContent += "<thead>";
        favContent += "<tr>";
        favContent += "<th scope='col'>Symbol</th>";
        favContent += "<th scope='col'>Stock Price</th>";
        favContent += "<th scope='col'>Change (ChangePercent)</th>";
        favContent += "<th scope='col'>Volume</th>";
        favContent += "<th scope='col'></th>";
        favContent += "</tr>";
        favContent += "</thead>";
        favContent += "<tbody>";
        for (var i = 0; i < localStorage.length; i++) {
            //var currentStockDet=JSON.parse(localStorage.getItem(localStorage.key(i)));
            var currentKey = localStorage.key(i);
            if(!currentSD[currentKey]){
                continue;
            }
            favContent += "<tr>";
            favContent += "<td class='IndicatorTag'>" + currentSD[currentKey]["Stock Ticker Symbol"] + "</td>";
            //rows added for sorting as comma separated values cannot be compared
            favContent += "<td style='display:none'>" + currentSD[currentKey]["IntLastPrice"] + "</td>";
            favContent += "<td style='display:none'>" + currentSD[currentKey]["Change"] + "</td>";
            favContent += "<td style='display:none'>" + currentSD[currentKey]["Change Percent"] + "</td>";
            favContent += "<td style='display:none'>" + currentSD[currentKey]["IntVolume"] + "</td>";

            favContent += "<td>" + currentSD[currentKey]["Last Price"] + "</td>";
            if (currentSD[currentKey]["Change"] > 0) {
                favContent += "<td class='green'>" + currentSD[currentKey]["Change"] + " (" + currentSD[currentKey]["Change Percent"] + ") <img src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png' width='20' height='20'></td>";
            }
            else if (currentSD[currentKey]["Change"] < 0) {
                favContent += "<td class='red'>" + currentSD[currentKey]["Change"] + " (" + currentSD[currentKey]["Change Percent"] + ") <img src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png' width='20' height='20'></td>";
            }
            else {
                favContent += "<td>" + currentSD[currentKey]["Change"] + " (" + currentSD[currentKey]["Change Percent"] + ")</td>"
            }

            favContent += "<td>" + currentSD[currentKey]["Volume"] + "</td>";
            favContent += "<td><button><span class='glyphicon glyphicon-trash'></span></button></td>";
            favContent += "</tr>";
        }
        favContent += "</tbody>";
        $("#favTable").html(favContent);
        $("#favError").empty();

        sortLogic();
    }
    //on page load show data
    RefreshFavData();
    //on refresh button click refresh
    $("#btn-favRefresh").click(function () {
        RefreshFavData();
    });

    //auto refresh fav Data
    var atimer;
    $('#ch-autoRefresh').change(function () {
        if (this.checked) {
            //set Interval
            atimer = setInterval(function () {
                RefreshFavData();
            }, 5000);
        }
        else {
            //clear Interval
            clearInterval(atimer);
        }
    });

    //disable order on page load
    $("#order").attr("disabled","disabled");
    $("#favSelectors").change(function () {
        sortLogic();
    });



    function disableBtn(btn) {
        $("#" + btn).prop("disabled", true);
    }
    function enableBtn(btn) {
        $("#" + btn).prop("disabled", false);
    }

    $('#favTable').on('click', ':button', function (e) {
        $(this).closest('tr').remove();
        var sym = $(this).closest('tr').find('.IndicatorTag').text();
        localStorage.removeItem(sym.toUpperCase());
        $("#btn-add-fav").find('span').toggleClass('glyphicon-star-empty');
        $("#btn-add-fav").find('span').toggleClass('glyphicon-star');
    });

    //input validation
    disableBtn("btn-goToStock");
    $("#inputStock").blur(validate);
    $("#inputStock").keyup(validate);
    var symbol;
    //for local storage
    var currentStockDetails = {};

    var isInside=false;
    $(document).click(function(e) {
        
        if(e.target.id=="input-0"){
            isInside=true;
        }
        if(isInside==true && $("#input-0").val()=="" && e.target.id!="input-0" && e.target.id!="btn-clear")
        {   
            var scope = angular.element($("body")).scope();
            scope.$apply(function(){
                scope.hasError = true;
            });
            isInside=false;
        }
      });


    // jQuery methods go here...
    $("#btn-search").click(function () {
        enableBtn("btn-goToStock");
        symbol = abc;



        //success response array
        var successArr = {};
        successArr["Price"] = false;
        for (var i = 0; i < indArr.length; i++) {
            successArr[indArr[i]] = false;
        }
        disableBtn("btn-fb");
        disableBtn("btn-add-fav");
        $('#chartTabList a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            activeTab = $(e.target).attr("href");
            activeTab = activeTab.replace('#', '');
            if (successArr[activeTab]) {
                enableBtn("btn-fb");
            }
            else {
                disableBtn("btn-fb");
            }
        });
        $( document ).ajaxComplete(function( event, request, settings ) {
            if (successArr[activeTab]) {
                enableBtn("btn-fb");
            }
            else {
                disableBtn("btn-fb");
            }
          });
        /*while(true){
         for (const key in successArr) {
             if (successArr.hasOwnProperty(key)) {
                 const element = successArr[key];
                 if(element){
                     enableBtn("btn-fb");
                 }
                 else{
                     disableBtn("btn-fb");
                 }
             }
         }
        }*/




        //Initilaize tabs
        $('#stockTable').empty();
        $('#PriceChart').empty();
        $('#newsFeed').empty();
        $('#historicalCharts').empty();




        //Progress Bar
        $('#priceProgress').show();
        $('#stockTableProgress').show();
        $('#historicalChartsProgress').show();
        $('#newsFeedProgress').show();

        //details Table
        var content = '';
        $.ajax({
            url: host + '/stocks/details/' + symbol,
            type: 'GET',
            success: function (response, status, xhr) {
                $('#stockTableProgress').hide();

                if (response["Error Message"] == undefined && response["Stock Ticker Symbol"] != undefined) {
                    currentStockDetails = response;
                    content += "<tr><td>Stock Ticker Symbol</td><td>" + response["Stock Ticker Symbol"] + "</td></tr>";
                    content += "<tr><td>Last Price</td><td>" + response["Last Price"] + "</td></tr>";
                    if (response["Change"] > 0) {
                        content += "<tr><td>Change (Change Percent)</td><td class='green'>" + response["Change"] + " (" + response["Change Percent"] + ") <img src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png' width='20' height='20'></td></tr>";
                    }
                    else if (response["Change"] < 0) {
                        content += "<tr><td>Change (Change Percent)</td><td class='red'>" + response["Change"] + " (" + response["Change Percent"] + ") <img src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png' width='20' height='20'></td></tr>";
                    }
                    else {
                        content += "<tr><td>Change (Change Percent)</td><td>" + response["Change"] + " (" + response["Change Percent"] + ")</td></tr>"
                    }
                    content += "<tr><td>Timestamp</td><td>" + response["Timestamp"] + "</td></tr>";
                    content += "<tr><td>Open</td><td>" + response["Open"] + "</td></tr>";
                    content += "<tr><td>Close</td><td>" + response["Close"] + "</td></tr>";
                    content += "<tr><td>Day's Range</td><td>" + response["Day's Range"] + "</td></tr>";
                    content += "<tr><td>Volume</td><td>" + response["Volume"] + "</td></tr>";
                    enableBtn("btn-add-fav");
                    $('#stockTable').html(content);
                    $('#stockTable td:nth-child(1)').addClass('textBold');
                    $('#stockTable tr:nth-child(odd)').addClass('backgroundGrey');
                    $('#stockTable td:nth-child(n)').addClass('paddingTopBottom');
                }
                else {
                    content += "<div class='alert alert-danger'>Error Failed to get current stock data</div>";
                    $('#stockTable').html(content);
                    disableBtn("btn-add-fav");
                }
            },
            error: function (xhr, status, error) {
                disableBtn("btn-add-fav");
                $('#stockTableProgress').hide();
                content += "<div class='alert alert-danger'>Error Failed to get current stock data</div>";
                $('#stockTable').html(content);
            }
        });

        //check fav button state
        var currentItem = localStorage.getItem(symbol.toUpperCase());
        if (currentItem != null) {

            $("#btn-add-fav span").addClass("glyphicon-star");
            if ($("#btn-add-fav span").hasClass("glyphicon-star-empty")) {
                $("#btn-add-fav span").removeClass("glyphicon-star-empty");
            }
        }
        else {
            $("#btn-add-fav span").addClass("glyphicon-star-empty");
            if ($("#btn-add-fav span").hasClass("glyphicon-star")) {
                $("#btn-add-fav span").removeClass("glyphicon-star");
            }
        }

        //historical data
        var histContent = "";
        $.ajax({
            url: host + '/stocks/historical/' + symbol,
            type: 'GET',
            success: function (response, status, xhr) {
                $('#historicalChartsProgress').hide();

                if (response["Error Message"] == undefined) {
                    generateHistoricalCharts(response);
                }
                else {
                    histContent += "<div class='alert alert-danger'>Error Failed to get historical data</div>";
                    $('#historicalCharts').html(histContent);
                }

            },
            error: function (xhr, status, error) {
                $('#historicalChartsProgress').hide();
                histContent += "<div class='alert alert-danger'>Error Failed to get historical data</div>";
                $('#historicalCharts').html(histContent);
            }
        });
        function generateHistoricalCharts(chartData) {
            // Create the chart
            Highcharts.stockChart('historicalCharts', {

                chart: {
                    height:400
                },

                title: {
                    text: chartData['title']
                },

                subtitle: {
                    useHTML: true,
                    text: '<a href="https://www.alphavantage.co/" target="_blank">Source: Alpha Vantage</a>'
                },

                rangeSelector: {
                    allButtonsEnabled: true,
                    buttons: [{
                        type: 'week',
                        count: 1,
                        text: '1w',
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    selected: 0,
                },
                xAxis: {

                },
                yAxis: {
                    title: {
                        text: "Stock Value"
                    },
                },
                series: [{
                    name: chartData['symbol'] + ' Stock Price',
                    data: chartData["data"],
                    type: 'area',
                    threshold: null,
                    //tooltip: {
                    //headerFormat: '%A,%m %d,%Y',
                    //    valueDecimals: 2
                    //}
                }],
                tooltip: {
                    //headerFormat: '%A,%m %d,%Y',
                    shared: true,
                    useHTML: true,
                    headerFormat: '<small>{point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                        '<td style="text-align: right"><b>{point.y} EUR</b></td></tr>',
                    footerFormat: '</table>',
                    valueDecimals: 2
                },
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            subtitle: {
                                text: null
                            },
                            navigator: {
                                enabled: false
                            }
                        }
                    }]
                }
            });

        }

        //newsfeed
        var newsContent = "";
        $.ajax({
            url: host + '/stocks/news/' + symbol,
            type: 'GET',
            success: function (response, status, xhr) {
                $('#newsFeedProgress').hide();

                if (response["Error Message"] == undefined) {
                    response = JSON.parse(response);
                    for (var key in response) {
                        if (response.hasOwnProperty(key)) {
                            var element = response[key];
                            newsContent += "<div class='backgroundGrey paddingLeft'>";
                            newsContent += "<a  href='" + element["link"] + "' target='_blank'><h4 class='paddingBottom paddingTop'>" + element["title"] + "</h4></a>";
                            newsContent += "<p>Author: " + element["author"] + "</p>";
                            newsContent += "<p class='paddingBottom'>Date: " + element["pubDate"] + "</p>";
                            newsContent += "</div>";
                        }
                    }
                }
                else {
                    newsContent += "<div class='alert alert-danger'>Error Failed to get news feed data</div>";
                }
                $('#newsFeed').html(newsContent);
            },
            error: function (xhr, status, error) {
                $('#newsFeedProgress').hide();
                newsContent += "<div class='alert alert-danger'>Error Failed to get news feed data</div>";
                $('#newsFeed').html(newsContent);
            }
        });

        var i = 0;
        function indLoop() {
            setTimeout(function () {
                var ind = indArr[i]
                callIndApi(ind, symbol)
                i++;
                if (i < indArr.length) {
                    indLoop();
                }
            }, 200)
        }

        //Add delay to loop
        indLoop();
        //IndApi Call
        function callIndApi(indicator, symbol) {

            $('#' + indicator + 'Chart').empty();
            $('#' + indicator + 'Progress').show();

            var indContent = "";
            var indErrorMessage = "<div class='alert alert-danger'>Error Failed to get " + indicator + " data</div>";
            successArr[indicator] = false;
            $.ajax({
                url: host + '/stocks/charts/' + indicator + '/' + symbol,
                type: 'GET',
                success: function (response, status, xhr) {
                    $('#' + indicator + 'Progress').hide();
                    if (response["Error Message"] == undefined) {
                        generateIndCharts(response);
                        successArr[indicator] = true;
                        //$('#'+indicator+'Chart').html("<p>"+indicator+"</p>");
                    }
                    else {
                        successArr[indicator] = false;
                        indContent += indErrorMessage;
                        $('#' + indicator + 'Chart').html(indContent);
                    }
                },
                error: function (xhr, status, error) {
                    successArr[indicator] = false;
                    $('#' + indicator + 'Progress').hide();
                    indContent += indErrorMessage;
                    $('#' + indicator + 'Chart').html(indContent);
                }
            });
        }
        function generateIndCharts(chartData) {

            indChartsCache[chartData["indicator"]] = {
                chart: {
                    type: 'line',
                    zoomType:'xy'
                },
                title: {
                    text: chartData["title"]
                },
                subtitle: {
                    useHTML: true,
                    text: '<a href="https://www.alphavantage.co/" target="_blank">Source: Alpha Vantage</a>'
                },
                xAxis: {
                    type: 'datetime',
                    categories: chartData["dates"],
                    labels: {
                        format: '{value:%m/%d}',
                        rotation: 315
                    },
                    //range: 127,
                    tickInterval: 5,
                    reversed: true,
                    //endOnTick: true
                },
                yAxis: [{ //primary Axis
                    title: {
                        text: chartData["indicator"]
                    }
                }],
                tooltip: {
                    xDateFormat: '%m/%d'
                },
                


                series: chartData["seriesJson"],
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            subtitle: {
                                text: null
                            },
                            navigator: {
                                enabled: false
                            }
                        }
                    }]
                }
            };
            Highcharts.chart(chartData["indicator"] + 'Chart', indChartsCache[chartData["indicator"]]
            );
        }

        //PriceVol data
        var PriceVolContent = "";
        $.ajax({
            url: host + '/stocks/chart/Price/' + symbol,
            type: 'GET',
            success: function (response, status, xhr) {
                $('#priceProgress').hide();
                if (response["Error Message"] == undefined) {
                    generatePriceVolCharts(response);
                    successArr["Price"] = true;
                    enableBtn("btn-fb");
                }
                else {
                    successArr["Price"] = false;
                    PriceVolContent += "<div class='alert alert-danger'>Error Failed to get Price vol data</div>";
                    $('#PriceChart').html(PriceVolContent);
                }
            },
            error: function (xhr, status, error) {
                successArr["Price"] = false;
                $('#priceProgress').hide();
                PriceVolContent += "<div class='alert alert-danger'>Error Failed to get Price vol data</div>";
                $('#PriceChart').html(PriceVolContent);
            }
        });

        function generatePriceVolCharts(chartData) {
            indChartsCache["Price"] = {
                chart: {
                    type: 'area',
                    zoomType:'xy'
                },
                title: {
                    text: chartData["symbol"] + " Stock Price and Volume"
                },
                subtitle: {
                    useHTML: true,
                    text: '<a href="https://www.alphavantage.co/" target="_blank">Source: Alpha Vantage</a>'
                },
                xAxis: {
                    type: 'datetime',
                    categories: chartData["dates"],
                    labels: {
                        format: '{value:%m/%d}',
                        rotation: 315
                    },
                    tickInterval: 5,
                    reversed: true,
                },
                yAxis: [{ //primary Axis
                    title: {
                        text: "Stock Price"
                    }
                }, { //secondary Axis
                    title: {
                        text: "Volume"
                    },
                    gridLineWidth: 0,
                    opposite: true
                }],

                plotOptions: {
                    series: {
                        color: '#0000ff',
                        fillColor: '#e6e6ff'
                    }
                },
                tooltip: {
                    xDateFormat: '%m/%d'
                },

                series: [{
                    name: chartData["symbol"],
                    data: chartData["close"],
                    marker: {
                        enabled: false
                    }
                }, {
                    name: ' Volume',
                    type: 'column',
                    yAxis: 1,
                    data: chartData["volume"],
                    color: '#ff0000'
                }],
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            subtitle: {
                                text: null
                            },
                            navigator: {
                                enabled: false
                            }
                        }
                    }]
                }
            };
            Highcharts.chart('PriceChart', indChartsCache["Price"]);
        }


    });



    //clear functionality
    /* function emptyAllContent(){
        var arr=['stockTable','Price','historicalChart','newsFeed'];
        for (const key in indArr) {
            if (indArr.hasOwnProperty(key)) {
                const element = indArr[key];
                arr.push(element);
            }
        }
        for (const key in arr) {
            if (arr.hasOwnProperty(key)) {
                const element = arr[key];
                $('#'+element).empty();
            }
        }
        disableBtn("btn-add-fav");
        disableBtn("btn-fb");
        disableBtn("btn-goToStock");
        if ($("#btn-add-fav span").hasClass("glyphicon-star")) {
            $("#btn-add-fav span").removeClass("glyphicon-star");
            $("#btn-add-fav span").addClass("glyphicon-star-empty");
        }
    } */
    $("#btn-clear").click(function(){
        disableBtn("btn-goToStock");
        $('#inputError').hide();
    
    });

    //fav symbol click
    $("#favTable").on("click", "td.IndicatorTag", function() {
        var txt=$( this ).text();
        // set angular autocomplete text
        var scope = angular.element($("body")).scope();
        scope.$apply(function(){
            scope.searchText = txt;
        });
        enableBtn("btn-search");
        $("#btn-search").click();
      });
    









    //tabs
    $('#currentStock a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#historicalCharts a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#newsFeed a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#Price a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#SMA a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#EMA a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#RSI a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#ADX a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#CCI a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#BBANDS a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    $('#MACD a').click(function (event) {
        event.preventDefault();
        $(this).tab('show')
    });
    function smallIcons(){
        $("#tabCS").html(" Stock");
        $("#tabHist").html(" Charts");
        $("#tabNews").html(" News");
        $("#autoRefreshTxt").html("");
    }
    function bigIcons(){
        $("#tabCS").html(" Current Stock");
        $("#tabHist").html(" Historical Charts");
        $("#tabNews").html(" News Feed");
        $("#autoRefreshTxt").html(" Automatic Refresh: ");
    }
    function resizeCheck(){
        if($( window ).width()<500){
            smallIcons();
        }
        else{
            bigIcons();
        }
    }
    resizeCheck();
    $( window ).resize(function() {
        
        resizeCheck();
      });


    //Export high charts
    $("#btn-fb").click(function () {
        var data = {
            options: JSON.stringify(indChartsCache[activeTab]),
            type: 'image/png',
            async: true
        };

        var exportUrl = 'http://export.highcharts.com/';
        $.post(exportUrl, data, function (data) {
            var url = exportUrl + data;
            $.ajaxSetup({ cache: true });
            $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
                FB.init({
                    appId: '1222164164552259',
                    version: 'v2.7' // or v2.1, v2.2, v2.3, ...
                });
                FB.ui({
                    method: 'feed',
                    picture: url
                }, (response) => {
                    if (response && !response.error_message) {
                        //succeed	
                        alert("Posted Successfully");
                    } else {
                        //fail
                        alert("Post Fail");
                    }
                });
            });
        });
    });
    function getFavFromLocal()
    {   
        var myFavJson={};
        for (var i = 0; i < localStorage.length; i++) {
            var currentKey = localStorage.key(i);
            myFavJson[currentKey]=JSON.parse(localStorage.getItem(currentKey.toUpperCase()));
        }
        return myFavJson;

    }
    //Fav button click
    $("#btn-add-fav").click(function (e) {
        $(this).find('span').toggleClass('glyphicon-star-empty');
        $(this).find('span').toggleClass('glyphicon-star');
        var currentItem = localStorage.getItem(symbol.toUpperCase());
        //it is fav
        if ($(this).find('span').hasClass('glyphicon-star')) {
            //add stock to fav
            if (currentItem == null)
                localStorage.setItem(symbol.toUpperCase(), JSON.stringify(currentStockDetails));
                var localFavJson=getFavFromLocal();
                fillFavorites(localFavJson);
        }
        else {
            //remove stock from local storage
            if (currentItem != null)
                localStorage.removeItem(symbol.toUpperCase());
                var localFavJson=getFavFromLocal();
                fillFavorites(localFavJson);
        }
    });
    function switchDirSlider()
    {
        if($("#tabsContainer").hasClass('panelAniL')){
            $("#tabsContainer").removeClass('panelAniL');
            $("#tabsContainer").addClass('panelAniR');
        }
        else if($("#tabsContainer").hasClass('panelAniR')){
            $("#tabsContainer").removeClass('panelAniR');
            $("#tabsContainer").addClass('panelAniL');
        }
        if($("#favContainer").hasClass('panelAniL')){
            $("#favContainer").removeClass('panelAniL');
            $("#favContainer").addClass('panelAniR');
        }
        else if($("#favContainer").hasClass('panelAniR')){
            $("#favContainer").removeClass('panelAniR');
            $("#favContainer").addClass('panelAniL');
        }
    }
    $("#btn-goToStock").click(function (e) {
        switchDirSlider();
    });
    $("#btn-goToFav").click(function (e) {
        switchDirSlider();
    });
    
});

var app = angular.module("StocksApp", ['ngAnimate','ngMaterial']);

app.controller('slider', function($scope,$http) {
    $scope.showTabs=false;
    $scope.query=function(searchText){
        var myData=$http
        .get('http://stocks-env.us-east-2.elasticbeanstalk.com/stocks/autocomplete/'+ searchText)
        .then(function(data) {
          // Map the response object to the data object.
          return data["data"];
        });
        return myData;
    }
    $scope.isBtnActive="disabled";
    $scope.hasError=false;
    $scope.searchTextChange=function(searchText){
        if(searchText.length>0){
            $scope.isBtnActive="active";
            $scope.hasError=false;
            abc=searchText;
            $scope.hasNoError=true;
        }
        else{
            $scope.hasError=true;
            $scope.hasNoError=false;
            $scope.isBtnActive="disabled";
        }
    }
    $scope.selectedItemChange=function(selectedItem){
        if(selectedItem)
        abc=selectedItem.Symbol;
    }
    
});


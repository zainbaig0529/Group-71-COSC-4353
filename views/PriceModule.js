function PriceModule()
{
	//document.getElementById("SuggestedPricePerGallon").setAttribute("value","stinky");
        //document.getElementById('TotalAmountDue').setAttribute("value","smelly");
        var xhttp = new XMLHttpRequest();
            
        xhttp.onreadystatechange = function() {
            
        document.getElementById("SuggestedPricePerGallon").setAttribute("value", this.responseText);
            
            }
	xhttp.open("GET", "fuelQuoteMidifiedHtml.txt");
	xhttp.send();
}

var myn = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		init : function () {
			gBrowser.addEventListener("load", function () {
                myn.run();
				
			}, false);
		},
			
		run : function () {
			var reader = {
			    onInputStreamReady : function(input) {
			        var sin = Cc["@mozilla.org/scriptableinputstream;1"]
			                    .createInstance(Ci.nsIScriptableInputStream);
			        sin.init(input);
			        sin.available();
			        var request = '';
			        while (sin.available()) {
			          request = request + sin.read(512);
			        }
			        actionToDo(request);
			        var tm = Cc["@mozilla.org/thread-manager;1"].getService();
					input.asyncWait(reader,0,0,tm.mainThread);
			    }
			}
			var listener = {
			    onSocketAccepted: function(serverSocket, clientSocket) {
			        console.log("Accepted connection on "+clientSocket.host
			+":"+clientSocket.port);
			        input = clientSocket.openInputStream(0, 0,
			0).QueryInterface(Ci.nsIAsyncInputStream);
			        output =
			clientSocket.openOutputStream(Ci.nsITransport.OPEN_BLOCKING, 0, 0);
			        var tm = Cc["@mozilla.org/thread-manager;1"].getService();
					input.asyncWait(reader,0,0,tm.mainThread);
			    }
			}
			
			var serverSocket = Cc["@mozilla.org/network/server-socket;1"].
			                    createInstance(Ci.nsIServerSocket);
			serverSocket.init(9999, true, 5);
			/*alert("Opened socket on " + serverSocket.port);*/
			serverSocket.asyncListen(listener);
		}
		
	};
}();

/* Utils */
function trim(str)
{ 
	return str.replace(/^\s+|\s+$/g,""); 
}


/* Actions */
function actionToDo(req){
			/* Command received */
			var reqTrim = trim(req);			
			var values;

			/* ADD */
			if((values = reqTrim.match("^add\\((.*)\\):(.*)")) != null)
			{					
				var tabString = "tab-"+values[1];
				openAnURLFromAttribute(tabString, values[2]);
			}
			
			/* REMOVE */
			if((values = reqTrim.match("^del\\((.*)\\)")) != null)
			{	
				var tabString = "tab-"+values[1];
				removeATabFromAttribute(tabString);
			}			
}

function removeATabFromAttribute(id)
{
	var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	           .getService(Components.interfaces.nsIWindowMediator);
    var browser = windowMediator.getEnumerator('navigator:browser').getNext().getBrowser();
	for (var i = 0; i < browser.mTabContainer.childNodes.length;i++) 
	{
	  	/* One tab */
	   	var currTab = browser.mTabContainer.childNodes[i];
	   	/* This is our tab ? */
	   	if (currTab.hasAttribute(id)) 
	   	{
	  		gBrowser.removeTab(currTab);
			break;
	   	}	
	}	
}

function openAnURLFromAttribute(id, url) 
{
	  var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	           .getService(Components.interfaces.nsIWindowMediator);
      var browser = windowMediator.getEnumerator('navigator:browser').getNext().getBrowser();
	  var found = false;
	  for (var i = 0; i < browser.mTabContainer.childNodes.length;i++) 
	  {
	    	/* One tab */
	    	var currTab = browser.mTabContainer.childNodes[i];
	    	/* This is our tab ? */
	    	if (currTab.hasAttribute(id)) 
	    	{
	     		browser.selectedTab = currTab;
				gBrowser.loadURI(url);
      			browser.focus();
				found = true;
	      		break;
	    	}
		}
		if (!found) {
		    /* This is a new tab */
		    var newTab = browser.addTab(url);
		
		    newTab.setAttribute(id, "something");
		    browser.selectedTab = newTab;
		    browser.focus();
		  }
}
		
window.addEventListener("load", myn.run, false);
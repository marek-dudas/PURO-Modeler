var PuroEditor = {
  init: function(toolBoxElement, viewElement, obmListTableElement, width, height) {
	model = new PuroModel();
	this.view = new PuroView(width, height, viewElement);
	this.control = new PuroController(model);
	this.control.init();
	this.view.decorateControls(toolBoxElement, this.control);
	this.view.setData(model);
	this.control.setView(this.view);
	//this.view.updateOBMList(obmListTableElement);
	//this.view.startLayout();
	this.view.updateView();
      this.view.updateOBMList();
	
	gup = function( name )
	{
	  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	  var regexS = "[\\?&]"+name+"=([^&#]*)";
	  var regex = new RegExp( regexS );
	  var results = regex.exec( window.location.href );
	  if( results == null )
	    return null;
	  else
	    return results[1];
	};
  },
  
	loadModelFromUrl: function() {
		var modelId = gup('model');
		if(modelId!=null) this.control.loadModel(modelId);
	},
	
	setUserAndLoad: function(user) {
			  this.control.setUser(user);
			  this.view.updateOBMList(obmListTableElement);
	},
  
  loginUserFromUrl: function() {
	  var user = gup('user');
	  var pass = gup('pass');
	  if(user!=null && pass!=null) {
		  this.control.setUser(user, pass);
		  this.view.updateOBMList(obmListTableElement);
	  }
	  else {
		  $.get( sessionUrl, this.setUserAndLoad.bind(this), "json" );
	  }
  },
	
	logout: function() {
		$.get(sessionUrl+"?logout=1", function() {window.location.href = serverRoot;});
	}
}




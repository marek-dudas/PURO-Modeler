function PuroEditor(toolBoxElement, viewElement, obmListTableElement, width, height) {
	model = new PuroModel();
	this.view = new PuroView(width, height, viewElement);
	this.control = new PuroController(model); 
	this.view.decorateControls(toolBoxElement, this.control);
	this.view.setData(model);
	this.control.setView(this.view);
	this.view.updateOBMList(obmListTableElement);
	//this.view.startLayout();
	this.view.updateView();
	
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

	this.loadModelFromUrl = function() {
		var modelId = gup('model');
		if(modelId!=null) this.control.loadModel(modelId);
	};
}



function PuroLoader() {
	dojo.require("dojox.json.ref");
	  //this.store = new dojox.data.CouchDBRestStore({target: couchdbUrl, syncMode:true}); //"http://admin:c0d1988@protegeserver.cz/couchdb"});
	var thisloader = this;
	require(["dojo/store/JsonRest"], function(JsonRest){
		  	thisloader.store = new JsonRest({ target: couchdbUrl });});
};

/*
PuroLoader.prototype.addModel = function(model) {
	//this.store.newItem(model, null);
	//this.store.save(null);
	this.store.add(model, {id:model.id});
};*/

PuroLoader.prototype.saveModel = function(model) {
	store = this.store;
	if(model.oldId != null) {
		//this.store.remove(model.oldId+"?rev="+model.oldRev).then(function() {
		//	store.add(model, null);
		//});
		model._rev = model.oldRev;
		store.put(model, {id:model.oldId}).then(
			function(result){
				model.oldRev=result.rev;
			});
	}
	else this.store.add(model, null).then(
			function(result){
				model.oldRev=result.rev;
				model.oldId=result.id;
			});
};

PuroLoader.prototype.getRandomInt = function(){
	max = 100000000;
	min = 10;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*
PuroLoader.prototype.getNewId = function(){
	found = false;
	while(!found)
	{
		id = this.getRandomInt();
		//obj = this.store.fetchItemByIdentity({identity:id});
		obj = null;
		obj = this.store.get(id);
		if(obj==null) found = true;
	}
	return id;
};*/

PuroLoader.prototype.deserialize = function(obm) {
	return dojox.json.ref.resolveJson(obm);
};

PuroLoader.prototype.getOBMs = function(puroview) {
	//var result = this.store.fetch({sort: [{attribute: "name"}]}).results; //{sort: [{attribute: "name"}]}
	var puroloader = this;
	this.store.query("_all_docs?include_docs=true", null ).then(function(result){
		obms = [];
		for(var i=0; i<result.rows.length; i++){
			obms.push(puroloader.deserialize(result.rows[i].doc));
		}
		puroview.fillOBMList(obms);
	});
	
	/*var obmList = [];
	for(var i=0; i<result.length; i++) {
		var obm = {};
		obm.name = this.store.getValue(result[i], "name");
		obm.id = this.store.getValue(result[i], "id");
		obmList.push(obm);
	}
	return obmList;*/
};

PuroLoader.prototype.getOBMbyId = function(id, controller) {
	this.store.get(id).then(function(obm){
		desOBM = dojox.json.ref.resolveJson(obm);
		rebuiltModel = new PuroModel();
		rebuiltModel.rebuildFrom(desOBM);
		controller.loadModelFromJStore(rebuiltModel);
	});
	
};

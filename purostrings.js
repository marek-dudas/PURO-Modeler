var linkTypes = {
	instanceOf: 'instanceOf',
	disjoint: 'disjoint',
	subTypeOf: 'subTypeOf',
	participates: 'participates',
	link: 'link'
}

var purostr = {
	Btype: "B-type",
	Bobject: "B-object",
	Bvaluation: "B-valuation",
	Brelation: "B-relation",
	Battribute: "B-attribute",
	invalidIncrement:'incrementing level on invalid bterm',
	BinstanceOf: "B-instanceOf",
	BsubTypeOf: "B-subtypeOf",
	someObjects: 'Some_objects',
	disjoint: 'disjoint',
	link: "link",
	compareVocabs: "Compared Vocabularies",
	isInVocabs: "Vocabularies with implementation of selected nodes:",
	errorType: "This node must be an instance of some BType.\r\n",
	errorLabelMiss: "This link must have a label.\r\n",
	errorLabelPlus: "This link must not have a label.\r\n",
	errorDirection: "Some of these links have wrong direction.\r\n",
	interBTypeLinks: [
		linkTypes.subTypeOf,
		linkTypes.instanceOf,
		linkTypes.disjoint
	],
	relToBTypeLinks: [
		linkTypes.participates,
		linkTypes.instanceOf
	]
};

var puroOntology = {
		Btype: "BType",
		Bobject: "BObject",
		Bvaluation: "BValuation",
		Brelation: "BRelation",
		BinstanceOf: "instanceOf",
		BsubTypeOf: "subTypeOf",	
		Battribute: "BAttribute",
		link: "Link"
		
};

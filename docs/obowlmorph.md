# OBOWLMorph

OBOWLMorph is tool for transforming PURO models into OWL ontology skeletons

You can access it at [protegeserver.cz/purom4/OBOWLMorph](http://protegeserver.cz/purom4/OBOWLMorph).
But the best way is to first create a model in [PURO Modeler](http://protegeserver.cz/purom4) and
go to OBOWLMorph from there.

## Authors

* Marek Dudáš
* Ondřej Zamazal
* [Vojtěch Svátek](https://nb.vse.cz/~svatek/topics.htm)

## Acknowledgments

The development has been heavily supported by [University of Economics, Prague](http://vse.cz).
It was also partially supported by LOD2 and OpenBudgets projects.

## Documentation

Some info can be found in [Marek Dudáš's dissertation thesis](https://vskp.vse.cz/id/1347934).

### PURO RDF serialization

The serialization is sent to the SPARQL transformation service in order to produce the OWL
ontology skeleton. Currently, you can get to it by using Chrome dev tools or similar and
manually looking at the payload being sent. A manual download button is being considered.

Below is an example serialization in Turtle. The source is the `book and topic` example model
that is available in PURO Modeler for everyone.
OBOWLMorph sends the data in RDF/XML by default, but you can easily transform it to Turtle, e.g.,
by using [RDF Translator](https://rdf-translator.appspot.com/).

```
@prefix pm: <http://lod2-dev.vse.cz/data/puromodels#> .
@prefix puro: <http://lod2-dev.vse.cz/ontology/puro#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xml: <http://www.w3.org/XML/1998/namespace> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

pm:Mareks_copy_of_The_history_of_dogs a puro:BObject ;
    rdfs:label "Mareks_copy_of_The_history_of_dogs" ;
    puro:instanceOf pm:The_history_of_dogs ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

<http://lod2-dev.vse.cz/data/puromodels#02504> a puro:BObject ;
    rdfs:label "02504" ;
    puro:instanceOf pm:DDC_Topic ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:Book a puro:BType ;
    rdfs:label "Book" ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:DDC_Topic a puro:BType ;
    rdfs:label "DDC_Topic" ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" ;
    puro:subTypeOf pm:Topic .

pm:Location a puro:BType ;
    rdfs:label "Location" ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:Prague a puro:BObject ;
    rdfs:label "Prague" ;
    puro:instanceOf pm:Location ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:The_history_of_dogs a puro:BType ;
    rdfs:label "The_history_of_dogs" ;
    puro:instanceOf pm:Book ;
    puro:linkedTo pm:has_topic,
        pm:published_in ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:Topic a puro:BType ;
    rdfs:label "Topic" ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:has_topic a puro:BRelation ;
    rdfs:label "has_topic" ;
    puro:linkedTo <http://lod2-dev.vse.cz/data/puromodels#02504> ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:published_in a puro:BRelation ;
    rdfs:label "published_in" ;
    puro:linkedTo pm:Prague,
        pm:when,
        pm:when_May_6 ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:when_May_6 a puro:BValuation ;
    rdfs:label "when_May_6" ;
    puro:linkedTo pm:when ;
    puro:modelingStyle puro:objectPropSubclass ;
    puro:rigid "true" .

pm:when a puro:BAttribute ;
    rdfs:label "when" .
```

#### Nodes
You can see that all nodes from the PURO model are represented by instances of classes representing
the PURO language constructs 

* `puro:BType`
* `puro:BObject`
* `puro:BRelation`
* `puro:BAttribute`
* `puro:BValuation`

#### Links
Links are represented by RDF predicates.

* `puro:instanceOf`
* `puro:subTypeOf`
* `puro:linkedTo`

`puro:linkedTo` represents the graphical links other than instanceOf and subTypeOf.
Mostly, the `linkedTo` triples conform directly to the graphical model, with one exception:
There are direct `linkedTo` links from PURO entities like BObject or BRelation to
instances of BValuation, in addition to the linkage through BAttribute. That is just a technical
aspect of the serialization, making the transformation through SPARQL easier.

#### Values

* `rdfs:label` - its value is what the user entered as the label of the PURO node in the model.
Usually, its the name of the PURO entity. In case of BValuation, it is the actual value being assigned.

#### Annotations

* `puro:modelingStyle` specifies the target OWL encoding style to be used when transforming the
entity to OWL
* `puro:rigid` is not used at this moment. 

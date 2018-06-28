/*

Here is basic API to the "DB" object:

- Attributes: 
        getAllAttributeNames() -> [string, ...]
        getAllAttributeValues(attributeName) -> [value, ...]

- Report Types:
        addReportType(reportName)
        getAllReportTypes() -> [string, ...]

- Chunk Names:
        addChunkName(reportType, chunkName)
        getAllChunkNames(reportType) -> [string, ...]

- Contents: 
	getChunk(reportType, chunkName, attributes) -> {"inherited": boolean, "contents": string}
	setChunkContents(reportType, chunkName, attributes, string)
	getReportContents(reportType, attributes) -> [HTML-formatted-string]

*/

// TODO: preload some citations (w/ new fixed keys)
// TODO: process citations (put them at the bottom)

// Since there is no citation UI, we hard-code a few here to have something to play with.
var citations = [
  {
    "fixed_key": "SEER675",
    "fields": {
      "authors": "Surveillance, Epidemiology, and End Results (SEER) Program, National Cancer Institute. 2012-2014",
      "created_at": "2017-06-19",
      "date": "Accessed April 2018",
      "title": "DevCan software (http://surveillance.cancer.gov/devcan) V 6.7.5",
      "type": "journal",
      "updated_at": "2017-06-19"
    },
    "model": "results.Reference",
    "pk": 391
  },
  { 
    "fixed_key": "NCCN2018bc",
    "fields": {
      "authors": "National Comprehensive Cancer Network",
      "created_at": "2018-06-19",
      "date": "Published May 2018",
      "journal": "NCCN Guidelines Version 2.2018",
      "title": "Breast Cancer Screening and Diagnosis",
      "type": "website",
      "updated_at": "2018-06-19",
      "url": "http://www.nccn.org",
      "url_title": "Available at www.nccn.org"
    },
    "model": "results.Reference",
    "pk": 392
  },
  { 
    "fixed_key": "Thompson01",
    "fields": {
      "authors": "Thompson D, Easton D",
      "created_at": "2018-06-21",
      "date": "2001",
      "journal": "Am J Hum Genet",
      "pages": "410-419", 
      "title": "Variation in cancer risks, by mutation position, in BRCA2 mutation carriers",
      "type": "journal",
      "updated_at": "2018-06-21",
      "volume": 68
    },
    "model": "results.Reference",
    "pk": 395
  },
  {
    "fixed_key": "Gumaste15",
    "fields": {
      "authors": "Gumaste PV, Penn LA, Cymerman RM, Kirchhoff T, Polsky D, Mclellan B",
      "created_at": "2018-06-21",
      "date": "2015",
      "issue_number": "6",
      "journal": "Br J Dermatol",
      "pages": "1498-506",
      "title": "Skin cancer risk in BRCA1/2 mutation carriers",
      "type": "journal",
      "updated_at": "2018-06-21",
      "volume": 172
    },
  },
  {
    "fixed_key": "Tripathi16",
    "fields": {
      "authors": "Tripathi R, Chen Z, Li L, Bordeaux JS",
      "created_at": "2018-06-21",
      "date": "2016",
      "issue_number": "6",
      "journal": "J Am Acad Dermatol",
      "pages": "1210-1215",
      "title": "Incidence and survival of sebaceous carcinoma in the United States",
      "type": "journal",
      "updated_at": "2018-06-21",
      "volume": 75
    },
    "model": "results.Reference",
    "pk": 397
  }
]

function DB() {
  this._reportTypes = []  // [ <reportType>, ... ]
  this._chunkNames = {}  // { reportType: [<chunkName>, ...], ... }
  this._chunkContents = {}  // {'chunkName': [ {"attributes": <attrs>, "specificity": <int>,  "content": <string> }, ... ], ...} sorted 

  this._citations = {}
  for (var i = 0; i < citations.length; i++) {
    var citation = citations[i]
    this._citations[citation.fixed_key] = citation
  }
}

// ATTRIBUTES

var attributeValues = {
  'gene': [null, 'LION', 'TIGR', 'BEAR'],
  'mutation': [null, 'DWARF', 'ALBINO'],
  'sex': [null, 'M', 'F']
}

DB.prototype.getAllAttributeNames = function () {
  return Object.keys(attributeValues)
}

DB.prototype._validateAttributeName = function(attributeName) {
  var names = this.getAllAttributeNames()
  for (var i = 0; i < names.length; i++ ) {
    if (attributeName == names[i]) {
      return
    }
  }
  throw new Error('There is no attribute named ' + attributeName)
}

DB.prototype.getAllAttributeValues = function(attributeName) {
  this._validateAttributeName(attributeName)
  return attributeValues[attributeName]
}

DB.prototype._validateAttributeValue = function(attributeName, attributeValue) {
  var values = this.getAllAttributeValues(attributeName)
  for (var i = 0; i < values.length; i++) {
    if (attributeValue == values[i]) {
      return
    }
  }
  throw new Error(attributeValue + ' is not a valid value for attribute ' + attributeName)
}

DB.prototype._normalizeAttributes = function(attrs) {
  var result = {}
  var names = this.getAllAttributeNames()
  for (var i = 0; i < names.length; i++) {
    var attributeName = names[i]
    var attributeValue = attrs[attributeName]
    this._validateAttributeValue(attributeName, attributeValue)
    result[attributeName] = attributeValue || null
  }
  return result
}

// REPORT TYPES

DB.prototype.addReportType = function(reportType) {
  for (var i = 0; i < this._reportTypes.length; i++) {
    if (this._reportTypes[i] == reportType) {
      throw new Error('There is already a report named ' + reportType)
    }
  }
  this._reportTypes.push(reportType)
  this._chunkNames[reportType] = []
}

DB.prototype.getAllReportTypes = function() {
  return this._reportTypes
}

DB.prototype._validateReportType = function(reportType) {
  for (var i = 0; i < this._reportTypes.length; i++) {
    if (reportType == this._reportTypes[i]) {
      return
    }
  }
  throw new Error('There is no report type named ' + reportType)
}

// CHUNKS

DB.prototype.addChunkName = function(reportType, chunkName) {
  this._validateReportType(reportType)
  var chunkNames = this._chunkNames[reportType]
  for (var i = 0; i < chunkNames.length; i++) {
    if (chunkName == chunkNames[i]) {
      throw new Error(reportType + 'already has a chunk named ' + chunkName)
    }
  }
  chunkNames.push(chunkName)
  this._chunkContents[chunkName] = []
}

DB.prototype.getAllChunkNames = function(reportType) {
  this._validateReportType(reportType)
  return this._chunkNames[reportType]
}

DB.prototype._validateChunkName = function(reportType, chunkName) {
  this._validateReportType(reportType)
  var chunkNames = this.getAllChunkNames(reportType)
  for (var i = 0; i < chunkNames.length; i++) {
    if (chunkNames[i] == chunkName) {
      return
    }
  }
  throw new Error(reportType + ' has no chunk named ' + chunkName)
}

DB.prototype._specificity = function(attrs) {
  var result = 0
  var names = this.getAllAttributeNames()
  names.push('reportType')
  for (var i = 0; i < names.length; i++) {
    var attributeName = names[i]
    if (attrs[attributeName]) {
      result += 1
    }
  }
  return result
}

DB.prototype._isExactMatch = function(currentAttrs, definedAttrs) {
  var names = this.getAllAttributeNames()
  names.push('reportType')
  for (var i = 0; i < names.length; i++) {
    var attributeName = names[i]
    if (currentAttrs[attributeName] != definedAttrs[attributeName]) {
      return false
    }
  }
  return true
}

DB.prototype._isMatch = function(currentAttrs, definedAttrs) {
  var names = this.getAllAttributeNames()
  names.push('reportType')
  for (var i = 0; i < names.length; i++) {
    var currentValue = currentAttrs[names[i]]
    var definedValue = definedAttrs[names[i]]
    if (definedValue && currentValue != definedValue) {
      return false
    }
  }
  return true
}

DB.prototype.setChunkContents = function(reportType, chunkName, attrs, contents) {
  attrs = this._normalizeAttributes(attrs)
  attrs.reportType = reportType
  this._validateChunkName(reportType, chunkName)
  var target = null
  var instances = this._chunkContents[chunkName]
  for (var i = 0; i < instances.length; i++) {
    var instance = instances[i]
    if (this._isExactMatch(attrs, instance.attributes)) {
      target = instance
      break
    }
  }
  if (! target) {
    target = {"attributes": attrs, "specificity": this._specificity(attrs)}
    instances.push(target)
    instances.sort(function(a, b) {return b.specificity - a.specificity})
  }
  target.contents = contents
}

DB.prototype.getChunk = function(reportType, chunkName, attrs) {
  attrs = this._normalizeAttributes(attrs)
  attrs.reportType = reportType
  this._validateChunkName(reportType, chunkName)
  var instances = this._chunkContents[chunkName]
  for (var i = 0; i < instances.length; i++) {
    var instance = instances[i]
    if (this._isMatch(attrs, instance.attributes)) {
      var inherited = ! this._isExactMatch(attrs, instance.attributes)
      var contents = instance.contents
      return { "inherited": inherited, "contents": contents }
    }
  }
  return { "inherited": true, "contents": null }
}

// REPORTS

DB.prototype.getReportContents = function(reportType, attrs) {
  var results = []
  var names = this.getAllChunkNames(reportType)
  for (var i = 0; i < names.length; i++) {
    var chunkName = names[i]
    var contents = this.getChunk(reportType, chunkName, attrs).contents
    if (contents) {
      results.push('<p>')
      results.push(contents)
      results.push('</p>\n\n')
    }
  }
  return this._process(results.join(''), attrs).trim()
}

function substituter(attribs, name) {
  if (name in attribs) {
    return attribs[name]
  }
  var sex_dependents = {
    'man/woman': {'M': 'man', 'F': 'woman'},
    'men/women': {'M': 'men', 'F': 'women'},
    'his/her': {'M': 'his', 'F': 'her'},
    'him/her': {'M': 'him', 'F': 'her'},
    'he/she': {'M': 'he', 'F': 'she'}
  }
  if (name in sex_dependents) {
    return sex_dependents[name][attribs.sex]
  }
  throw new Error('unknown attribute ' + name)
}

DB.prototype._process = function(s, attribs) {
  var s = s.replace(/_([^_]+)_/g, '<em>$1</em>')
  s = s.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
  s = s.replace(/\[\[([^\[\]]+)\]\]/g, '<sup>$1</sup>')
  s = s.replace(/<<([^<>]+)>>/g, function(match, name) {return substituter(attribs, name)})
  return s
}

DB.prototype.getCitation = function(fixedKey) {
  if (! fixedKey in this._citations) {
    throw new Error('there is no citation named ' + fixedKey)
  }
  return this._citations[fixedKey]
}

module.exports = {DB: DB}

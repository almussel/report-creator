/*

Here is basic API to the "DB" object:

- Attributes: 
        getAllAttributeNames() -> [string, ...]
        getAllAttributeValues(name) -> [value, ...]
        setCurrentAttribute(name, value)
        getCurrentAttributes() -> { name: value, ...}

- Report Types:
        addReportType(name)
        getAllReportTypes() -> [string, ...]
        setCurrentReportType(name)
        getCurrentReportType() -> string

- Chunk Names:
        addChunkName(name)
        getAllChunkNames() -> [string, ...]
        setCurrentChunkName(name)
        getCurrentChunkName() -> string

- Contents: 
        getCurrentChunkContents() -> string
        setCurrentChunkContents(string)
        getReportContents() -> [HTML-formatted-string]

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
  this._currentReportType = null
  this._chunkNames = {}  // { reportType: [<chunkName>, ...], ... }
  this._currentChunkName = null
  this._currentAttributes = {}
  this._chunkContents = {}  // {'key': <key-string>, 'value': <value>, ... }
  this._citations = {}
  for (var i = 0; i < citations.length; i++) {
    var citation = citations[i]
    this._citations[citation['fixed_key']] = citation
  }
}

DB.prototype.getAllAttributeNames = function () {
  return ['gene', 'mutation', 'sex']
}

DB.prototype._isValidAttributeName = function(name) {
  var names = this.getAllAttributeNames()
  for (var i = 0; i < names.length; i++ ) {
    if (names[i] == name) { return true }
  }
  return false
}

DB.prototype.getAllAttributeValues = function(name) {
  if (! this._isValidAttributeName(name)) {
    throw new Error('There is no attribute named ' + name)
  }
  return {
    'gene': [null, 'LION', 'TIGR', 'BEAR'],
    'sex': [null, 'M', 'F'],
    'mutation': [null, 'DWARF', 'ALBINO']
  } [name]
}

DB.prototype._isValidAttributeValue = function(name, value) {
  var values = this.getAllAttributeValues(name)
  for (var i = 0; i < values.length; i++) {
    if (values[i] == value) { return true }
  }
  return false
}

DB.prototype.setCurrentAttribute = function(name, value) {
  if (! this._isValidAttributeValue(name, value)) {
    throw new Error(value + ' is not a valid value for attribute ' + name)
  }
  this._currentAttributes[name] = value
}

DB.prototype.getCurrentAttributes = function() {
  var result = {}
  var names = this.getAllAttributeNames()
  for (var i = 0; i < names.length; i++) {
    var name = names[i]
    result[name] = this._currentAttributes[name] || null
  }
  return result
}

DB.prototype.addReportType = function(name) {
  for (var i = 0; i < this._reportTypes.length; i++) {
    if (this._reportTypes[i] == name) {
      throw new Error('There is already a report named ' + name)
    }
  }
  this._reportTypes.push(name)
  this._chunkNames[name] = []
}

DB.prototype.getAllReportTypes = function() {
  return this._reportTypes
}

DB.prototype.setCurrentReportType = function(name) {
  for (var i = 0; i < this._reportTypes.length; i++) {
    if (this._reportTypes[i] == name) {
      this._currentReportType = name
      this._currentChunkName = null
      this._currentAttributes = {}
      return
    }
  }
  throw new Error('There is no report type named ' + name)
}

DB.prototype.getCurrentReportType = function() {
  if (! this._currentReportType) {
    throw new Error('There is no current report type')
  }
  return this._currentReportType
}

DB.prototype.addChunkName = function(name) {
  var chunkNames = this._chunkNames[this._currentReportType]
  for (var i = 0; i < chunkNames.length; i++) {
    if (chunkNames[i] == name) {
      throw new Error(this._currentReportType + 'already has a chunk named ' + name)
    }
  }
  chunkNames.push(name)
}

DB.prototype.getAllChunkNames = function() {
  return this._chunkNames[this._currentReportType]
}

DB.prototype.setCurrentChunkName = function(name) {
  var chunkNames = this.getAllChunkNames()
  for (var i = 0; i < chunkNames.length; i++) {
    if (chunkNames[i] == name) {
      this._currentChunkName = name
      return
    }
  }
  throw new Error(this._currentReportType + ' has no chunk named ' + name)
}

DB.prototype.getCurrentChunkName = function() {
  if (! this._currentChunkName) {
    throw new Error('There is no current chunk name')
  }
  return this._currentChunkName
}

DB.prototype._getCurrentKey = function () {
  var result = this.getCurrentAttributes()
  result['reportType'] = this.getCurrentReportType()
  result['chunkName'] = this.getCurrentChunkName()
  return JSON.stringify(result)
}

DB.prototype.setCurrentChunkContents = function(contents) {
  this._chunkContents[this._getCurrentKey()] = contents
}

DB.prototype.getCurrentChunkContents = function() {
  return this._chunkContents[this._getCurrentKey()] || null
}

DB.prototype.getReportContents = function() {
  var attrs = this.getCurrentAttributes()
  attrs['reportType'] = this.getCurrentReportType()
  var results = []
  var names = this.getAllChunkNames()
  for (var i = 0; i < names.length; i++) {
    var name = names[i]
    attrs['chunkName'] = name
    var key = JSON.stringify(attrs)
    var contents = this._chunkContents[key]
    if (contents) {
      results.push('<p>')
      results.push(contents)
      results.push('</p>\n\n')
    }
  }
  return this._process(results.join('')).trim()
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
    return sex_dependents[name][attribs['sex']]
  }
  throw new Error('unknown attribute ' + name)
}

DB.prototype._process = function(s) {
  var s = s.replace(/_([^_]+)_/g, '<em>$1</em>')
  s = s.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
  s = s.replace(/\[\[([^\[\]]+)\]\]/g, '<sup>$1</sup>')
  var attribs = this.getCurrentAttributes()
  s = s.replace(/<<([^<>]+)>>/g, function(match, name) {return substituter(attribs, name)})
  return s
}

DB.prototype.getCitation = function(name) {
  if (! name in this._citations) {
    throw new Error('there is no citation named ' + name)
  }
  return this._citations[name]
}

module.exports = {DB: DB}

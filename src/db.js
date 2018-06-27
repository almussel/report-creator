
function DB() {
  this._reportTypes = []
  this._currentReportType = null
  this._chunkNames = {}
  this._currentChunkName = null
  this._chunkContents = {}
}

DB.prototype.addReportType = function(name) {
  this._reportTypes.push(name)
  this._chunkNames[name] = []
}

DB.prototype.getAllReportTypes = function() {
  return this._reportTypes
}

DB.prototype.setCurrentReportType = function(name) {
  this._currentReportType = name
}

DB.prototype.getCurrentReportType = function() {
  return this._currentReportType
}

DB.prototype.addChunkName = function(name) {
  this._chunkNames[this._currentReportType].push(name)
}

DB.prototype.getAllChunkNames = function() {
  return this._chunkNames[this._currentReportType]
}

DB.prototype.setCurrentChunkName = function(name) {
  this._currentChunkName = name
}

DB.prototype.getCurrentChunkName = function() {
  return this._currentChunkName
}

DB.prototype.setCurrentChunkContents = function(contents) {
  this._chunkContents[this._currentChunkName] = contents
}

DB.prototype.getCurrentChunkContents = function() {
  return this._chunkContents[this._currentChunkName]
}

DB.prototype.getReportContents = function() {
  var results = []
  var names = this.getAllChunkNames()
  for (var i = 0; i < names.length; i++) {
    results.push('<p>')
    results.push(this._chunkContents[names[i]])
    results.push('</p>\n')
  }
  return results.join('')
}


var db = new DB()

db.addReportType('Red')
db.addReportType('Orange')
db.addReportType('Yellow')
console.log('all reports: ' + db.getAllReportTypes())
db.setCurrentReportType('Orange')
console.log('current report: ' + db.getCurrentReportType())

// Chunk names are always relative to current report type
db.addChunkName('Big')
db.addChunkName('Little')
console.log('all chunks: ' + db.getAllChunkNames())
db.setCurrentChunkName('Little')
console.log('current chunk: ' + db.getCurrentChunkName())

db.setCurrentChunkContents('ipsum lorem')
console.log('contents: ' + db.getCurrentChunkContents())

// Report is in HTML form so it can be displayed
console.log('report: ' + db.getReportContents())

export { DB };
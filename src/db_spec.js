var JS = require('jstest')
var DB = require('./db').DB

JS.Test.describe('DB', function() { with(this) {
  before(function() { with(this) {
    this.db = new DB()
  }})

// REPORT TYPES

  describe('addReportType', function() { with(this) {
    it('adds report types', function() { with(this) {
      db.addReportType('mammals')
      db.addReportType('birds')
      assertEqual(['mammals', 'birds'], db.getAllReportTypes())
    }})

    it('throws on duplicate name', function() { with(this) {
      db.addReportType('mammals')
      assertThrows(Error, function() {
        this.db.addReportType('mammals')
      })
    }})
  }})

  describe('_validateReportType', function() { with(this) {
    it('throws when name is bad', function() { with(this) {
      this.db.addReportType('mammals')
      assertThrows(Error, function() {
        this.db._validateReportType('birds')
      })
    }})
  }})

// CHUNKS

  describe('addChunkName', function() { with(this) {
    it('adds the name', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.addChunkName('mammals', 'FUR_TYPE')
      this.db.addChunkName('mammals', 'EYE_COLOR')
      assertEqual(['FUR_TYPE', 'EYE_COLOR'], this.db.getAllChunkNames('mammals'))
    }})
  }})

  describe('getAllChunkNames', function() { with(this) {
    it('changes when report type changes', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.addReportType('birds')
      this.db.addChunkName('mammals', 'FUR_TYPE')
      this.db.addChunkName('mammals', 'EYE_COLOR')
      this.db.addChunkName('birds', 'FEATHERS')
      assertEqual(['FEATHERS'], this.db.getAllChunkNames('birds'))
      assertEqual(['FUR_TYPE', 'EYE_COLOR'], this.db.getAllChunkNames('mammals'))
    }})
  }})

  describe('getAllAttributeNames', function() { with(this) {
    it('returns all the names', function() { with(this) {
      assertEqual(['gene', 'mutation', 'sex'], this.db.getAllAttributeNames())
    }})
  }})

  describe('getAllAttributeValues', function() { with(this) {
    it('returns all the values', function() { with(this) {
      assertEqual([null, 'M', 'F'], this.db.getAllAttributeValues('sex'))
    }})

    it('throws when name is bad', function() { with(this) {
      assertThrows(Error, function() {
        this.db.getAllAttributesValues('size')
      })
    }})
  }})

  describe('_normalizeAttributes', function() { with(this) {
    it('fills in missing fields', function() { with(this) {
      attrs = {'sex': 'M'}
      attrs = this.db._normalizeAttributes(attrs)
      assertEqual(null, attrs.gene)
      assertEqual('M', attrs.sex)
      assertEqual(null, attrs.mutation)
    }})

    it('throws with bad values', function() { with(this) {
      attrs = {'sex': 'Z'}
      assertThrows(Error, function() {
        this.db._normalizeAttributes(attrs)
      })
    }})
  }})

  describe('get/setChunkContents', function() { with(this) {
    it('gets back what it sets', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.addChunkName('mammals', 'FUR_TYPE')
      var attrs = {'sex': 'F'}
      var str = 'The Cat in the Hat'
      this.db.setChunkContents('mammals', 'FUR_TYPE', attrs, str)
      assertEqual(str, this.db.getChunk('mammals', 'FUR_TYPE', attrs).contents)
    }})

    it('tracks different contents for different attributes', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.addChunkName('mammals', 'FUR_TYPE')
      var attrs = {'sex': 'F', 'gene': 'LION'}

      var str1 = 'The Cat in the Hat'
      this.db.setChunkContents('mammals', 'FUR_TYPE', attrs, str1)

      attrs.sex = 'M'
      var str2 = 'Green Eggs and Ham'
      this.db.setChunkContents('mammals', 'FUR_TYPE', attrs, str2)

      attrs.sex = null
      var str3 = 'Hop on Pop'
      this.db.setChunkContents('mammals', 'FUR_TYPE', attrs, str3)

      attrs.sex = 'M'
      var result = this.db.getChunk('mammals', 'FUR_TYPE', attrs)
      assertEqual([false, str2], [result.inherited, result.contents])

      attrs.sex = null
      result = this.db.getChunk('mammals', 'FUR_TYPE', attrs)
      assertEqual([false, str3], [result.inherited, result.contents])

      attrs.sex = 'F'
      result = this.db.getChunk('mammals', 'FUR_TYPE', attrs)
      assertEqual([false, str1], [result.inherited, result.contents])

      attrs.gene = 'TIGR'
      result = this.db.getChunk('mammals', 'FUR_TYPE', attrs)
      assertEqual([true, null], [result.inherited, result.contents])
    }})

    it('handles inheritance correctly', function() { with(this) {
      var attrs = {'gene': null, 'mutation': null, 'sex': null}
      this.db.addReportType('mammals')
      this.db.addChunkName('mammals', 'ABOUT')
      this.db.setChunkContents('mammals', 'ABOUT', attrs, 'A mammal')

      attrs.gene = 'LION'
      this.db.setChunkContents('mammals', 'ABOUT', attrs, 'A lion')
      attrs.sex = 'F'
      this.db.setChunkContents('mammals', 'ABOUT', attrs, 'A female lion')

      var result = this.db.getChunk('mammals', 'ABOUT', attrs)
      assertEqual([false, 'A female lion'], [result.inherited, result.contents])

      attrs.sex = 'M'
      var result = this.db.getChunk('mammals', 'ABOUT', attrs)
      assertEqual([true, 'A lion'], [result.inherited, result.contents])

      attrs.sex = null
      attrs.mutation = 'ALBINO'
      var result = this.db.getChunk('mammals', 'ABOUT', attrs)
      assertEqual([true, 'A lion'], [result.inherited, result.contents])

      attrs.mutation = null
      var result = this.db.getChunk('mammals', 'ABOUT', attrs)
      assertEqual([false, 'A lion'], [result.inherited, result.contents])

      attrs.gene = null
      var result = this.db.getChunk('mammals', 'ABOUT', attrs)
      assertEqual([false, 'A mammal'], [result.inherited, result.contents])

      attrs.gene = 'TIGR'
      var result = this.db.getChunk('mammals', 'ABOUT', attrs)
      assertEqual([true, 'A mammal'], [result.inherited, result.contents])
    }})
  }})

  describe('getReportContents', function() { with(this) {
    it('processes the text', function() { with(this) {
      var attrs = {}
      this.db.addReportType('mammals')
      this.db.addChunkName('mammals', 'FUR_TYPE')
      this.db.setChunkContents('mammals', 'FUR_TYPE', attrs, 'Soft and _fuzzy_, with *a double coat*.')
      this.db.addChunkName('mammals', 'EYE_COLOR')
      this.db.setChunkContents('mammals', 'EYE_COLOR', attrs, 'Green with slit pupil.[[Miller94]]\n\nA reflective retina increases the sensitivity in dark environments.')
      str = this.db.getReportContents('mammals', attrs)
      assertEqual(
        '<p>Soft and <em>fuzzy</em>, with <strong>a double coat</strong>.</p>\n\n<p>Green with slit pupil.<sup>Miller94</sup></p><p>A reflective retina increases the sensitivity in dark environments.</p>', str)
    }})

    it('substitutes attribute values', function() { with(this) {
      attrs = {'gene': 'BEAR', 'sex': 'M'}
      var str = this.db._markDown('A <<man/woman>> with a mutation in the _<<gene>>_ gene.', attrs)
      assertEqual('A man with a mutation in the <em>BEAR</em> gene.', str)
    }})

    it('throws for unknown substitution values', function() { with(this) {
      assertThrows(Error, function() {
        this.db._markDown('A <<gremlin>> shrieked', {})
      })
    }})
  }})

  describe('getCitation', function() { with(this) {
    it('finds the citation', function() { with(this) {
      var citation = this.db.getCitation('Thompson01')
      assertEqual('Am J Hum Genet', citation.fields.journal)
    }})
  }})
}})


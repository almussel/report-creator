var JS = require('jstest')
var DB = require('./db').DB

JS.Test.describe('DB', function() { with(this) {
  before(function() { with(this) {
    this.db = new DB()
  }})

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

  describe('getCurrentReportType', function() { with(this) {
    it('returns correct value', function() { with(this) {
      this.db.addReportType('animals')
      this.db.setCurrentReportType('animals')
      assertEqual('animals', this.db.getCurrentReportType())
    }})

    it('throws when none', function() { with(this) {
      assertThrows(Error, function() {
        this.db.getCurrentReportType()
      })
    }})
  }})

  describe('setCurrentReportType', function() { with(this) {
    it('clears other fields', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.addReportType('birds')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('cat')
      this.db.setCurrentChunkName('cat')
      this.db.setCurrentAttribute('gene', 'LION')
      this.db.setCurrentReportType('birds')
      assertThrows(Error, function() {
        this.db.getCurrentChunkName()
      })
      assertEqual(null, this.db.getCurrentAttributes()['gene'])
    }})

    it('throws when name is bad', function() { with(this) {
      this.db.addReportType('mammals')
      assertThrows(Error, function() {
        this.db.setCurrentReportType('birds')
      })
    }})
  }})

  describe('addChunkName', function() { with(this) {
    it('adds the name', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('FUR_TYPE')
      this.db.addChunkName('EYE_COLOR')
      assertEqual(['FUR_TYPE', 'EYE_COLOR'], this.db.getAllChunkNames())
    }})
  }})

  describe('getCurrentChunkName', function() { with(this) {
    it('gets the name', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('FUR_TYPE')
      this.db.setCurrentChunkName('FUR_TYPE')
      assertEqual('FUR_TYPE', this.db.getCurrentChunkName())
    }})

    it('throws when there is no name', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('FUR_TYPE')
      assertThrows(Error, function() {
        this.db.getCurrentChunkName()
      })
    }})
  }})

  describe('setCurrentChunkName', function() { with(this) {
    it('throws when name is unknown', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      assertThrows(Error, function() {
        this.db.setCurrentChunkName('FUR_TYPE')
      })
    }})
  }})

  describe('getAllChunkNames', function() { with(this) {
    it('changes when report type changes', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('FUR_TYPE')
      this.db.addChunkName('EYE_COLOR')
      this.db.addReportType('birds')
      this.db.setCurrentReportType('birds')
      this.db.addChunkName('FEATHERS')
      assertEqual(['FEATHERS'], this.db.getAllChunkNames())
      this.db.setCurrentReportType('mammals')
      assertEqual(['FUR_TYPE', 'EYE_COLOR'], this.db.getAllChunkNames())
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

  describe('getCurrentAttributes', function() { with(this) {
    it('returns nulls when not set', function() { with(this) {
      attrs = this.db.getCurrentAttributes()
      assertEqual(null, attrs['gene'])
      assertEqual(null, attrs['mutation'])
      assertEqual(null, attrs['sex'])
    }})

    it('returns values when set', function() { with(this) {
      this.db.setCurrentAttribute('sex', 'M')
      this.db.setCurrentAttribute('mutation', 'ALBINO')
      var attrs = this.db.getCurrentAttributes()
      assertEqual(null, attrs['gene'])
      assertEqual('ALBINO', attrs['mutation'])
      assertEqual('M', attrs['sex'])
    }})
  }})

  describe('_getCurrentKey', function() { with(this) {
    it('returns a correct string', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('FUR_TYPE')
      this.db.setCurrentChunkName('FUR_TYPE')
      assertEqual('{"gene":null,"mutation":null,"sex":null,"reportType":"mammals","chunkName":"FUR_TYPE"}',
        this.db._getCurrentKey())
    }})
  }})

  describe('get/setChunkContents', function() { with(this) {
    it('gets back what it sets', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('FUR_TYPE')
      this.db.setCurrentChunkName('FUR_TYPE')
      this.db.setCurrentAttribute('sex', 'F')
      var str = 'The Cat in the Hat'
      this.db.setCurrentChunkContents(str)
      assertEqual(str, this.db.getCurrentChunkContents())
    }})

    it('keeps track of attributes', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('FUR_TYPE')
      this.db.setCurrentChunkName('FUR_TYPE')

      this.db.setCurrentAttribute('sex', 'F')
      var str1 = 'The Cat in the Hat'
      this.db.setCurrentChunkContents(str1)

      this.db.setCurrentAttribute('sex', 'M')
      var str2 = 'Green Eggs and Ham'
      this.db.setCurrentChunkContents(str2)

      this.db.setCurrentAttribute('sex', null)
      var str3 = 'Hop on Pop'
      this.db.setCurrentChunkContents(str3)

      this.db.setCurrentAttribute('sex', 'M')
      assertEqual(str2, this.db.getCurrentChunkContents())
      this.db.setCurrentAttribute('sex', null)
      assertEqual(str3, this.db.getCurrentChunkContents())
      this.db.setCurrentAttribute('sex', 'F')
      assertEqual(str1, this.db.getCurrentChunkContents())
      this.db.setCurrentAttribute('gene', 'TIGR')
      assertEqual(null, this.db.getCurrentChunkContents())
    }})
  }})

  describe('getReportContents', function() { with(this) {
    it('processes the text', function() { with(this) {
      this.db.addReportType('mammals')
      this.db.setCurrentReportType('mammals')
      this.db.addChunkName('FUR_TYPE')
      this.db.setCurrentChunkName('FUR_TYPE')
      this.db.setCurrentChunkContents('Soft and _fuzzy_, with *a double coat*.')
      this.db.addChunkName('EYE_COLOR')
      this.db.setCurrentChunkName('EYE_COLOR')
      this.db.setCurrentChunkContents('Green with slit pupil[[Miller94]] and reflective retina.')
      str = this.db.getReportContents()
      assertEqual(
        '<p>Soft and <em>fuzzy</em>, with <strong>a double coat</strong>.</p>\n\n<p>Green with slit pupil<sup>Miller94</sup> and reflective retina.</p>', str)
    }})
  }})

  describe('getCitation', function() { with(this) {
    it('finds the citation', function() { with(this) {
      var citation = this.db.getCitation('Thompson01')
      assertEqual('Am J Hum Genet', citation['fields']['journal'])
    }})
  }})
}})


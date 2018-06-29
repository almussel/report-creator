import { DB } from './db.js';
import React, { Component } from 'react';
import './App.css';

var db = new DB()
db.addReportType('Default Report')
//db.addChunkName('Default Report', 'General')
//db.addChunkName('Default Report', 'Gene Specific')

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reportType: 'Default Report',
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>  Report Creator! </h1>
        </header>
        <div  className="App-title" >
          <h2> Report Type: {this.state.reportType} </h2>
          <select onChange={this.handleChange}>
            {db.getAllReportTypes().map((value) =>
              <option key={value} value={value}> {value} </option>
            )}
          </select>
        </div>
        <AttributeSelector reportType={this.state.reportType}/>
      </div>
    );
  }
}


class AttributeSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    db.getAllAttributeNames().map((attribute) => this.state[attribute] = null)
    this.handleChange = this.handleChange.bind(this)
    this.clearAttributes = this.clearAttributes.bind(this)
  }

  handleChange(event, attribute) {
    var newState = {}
    newState[attribute] = event.target.value || null
    this.setState(newState)
  }
  
  clearAttributes() {
    var newState = {}
    for (var attribute in this.state) {
      newState[attribute] = null
    }
    this.setState(newState)
  }

  render() {
    return (
      <div id="wrapper">
        <div id="left">
          <h2> Attributes </h2>
          {Object.keys(this.state).map((attribute) =>
            <div key={attribute}>
              <label> {attribute} </label>
              <select value={this.state[attribute] || ''} onChange={(e) => this.handleChange(e, attribute)}>
                {db.getAllAttributeValues(attribute).map((value) =>
                  <option key={value} value={value}> {value} </option>
                )}
              </select>
            </div>
          )}
          <button onClick={this.clearAttributes}> Clear </button>
          <ChunkEditor reportType={this.props.reportType} attributes={this.state} />
        </div>
        <ReportViewer id="right" reportType={this.props.reportType} attributes={this.state} />
      </div>
    )
  }
}


class ChunkEditor extends Component {
  constructor(props) {
    super(props);
    var chunks = db.getAllChunkNames(this.props.reportType)
    this.state = {
        currentChunk: chunks ? chunks[0] : null,
        chunks: chunks,
        newChunk: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleNewChunkChange = this.handleNewChunkChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      currentChunk: event.target.value
    })
  }

  handleNewChunkChange(event) {
    this.setState({newChunk: event.target.value});
  }

  handleSubmit(event) {
    db.addChunkName(this.props.reportType, this.state.newChunk)
    this.setState({
      currentChunk: this.state.newChunk,
      newChunk: ''
    })
    event.preventDefault()
  }

  render() {
    return (
      <div>
        <h2> Sections </h2>
        {this.state.chunks.map((chunk) =>
          <div key={chunk}>
            <label>
            <input type="radio" value={chunk} checked={this.state.currentChunk === chunk} onChange={this.handleChange} /> {chunk}
            </label>
            <br />
          </div>
        )}
        <br />
        <form onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Add a new section" value={this.state.newChunk} onChange={this.handleNewChunkChange} />
        </form>
        {this.state.currentChunk ?
        (
          <ReportChunkTextField reportType={this.props.reportType} chunkName={this.state.currentChunk} attributes={this.props.attributes}/>
        ) : (
          <div />
        )}
      </div>
    )
  }
}


class ReportChunkTextField extends Component {
  constructor(props) {
    super(props);
    this.state = db.getChunk(this.props.reportType, this.props.chunkName, this.props.attributes)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.override = this.override.bind(this)
    this.attributesExist = this.attributesExist.bind(this)
  }

  componentWillReceiveProps(newProps) {
    if (newProps !== this.props) {
      this.setState(db.getChunk(newProps.reportType, newProps.chunkName, newProps.attributes));
    }
  }

  handleChange(event) {
    this.setState({contents: event.target.value})
  }

  handleSubmit(event) {
    db.setChunkContents(this.props.reportType, this.props.chunkName, this.props.attributes, this.state.contents)
    event.preventDefault()
  }

  override(event) {
    this.setState(db.getChunk(this.props.reportType, this.props.chunkName, this.props.attributes))
    this.setState({inherited: !event.target.checked})
  }

  attributesExist() {
    for (var key in this.props.attributes) {
      if (this.props.attributes[key]) {
        return true
      }
    }
    return false
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <h3> {this.props.chunkName} </h3>
        </div>
        <div>
          {(this.attributesExist()) ? (
            <div>
              <input type="checkbox" checked={!this.state.inherited} onChange={this.override}/> Override default section
              <br />
              <br />
            </div>
          ) : (
            <div />
          )}
          <textarea disabled={this.state.inherited && this.attributesExist()} value={this.state.contents || ''} onChange={this.handleChange} />
        <br />
        </div>
        <input type="submit" value="Save" />
      </form>
    )
  }
}


class ReportViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reportHTML: db.getReportContents(this.props.reportType, this.props.attributes),
      view: false
    }

    this.renderReport = this.renderReport.bind(this)
    this.allAttributesSet = this.allAttributesSet.bind(this)
  }

  allAttributesSet() {
    for (var key in this.props.attributes) {
      if (!this.props.attributes[key]) {
        return false
      }
    }
    return true
  }

  renderReport() {
    if (this.allAttributesSet()) {
      this.setState({
        reportHTML: db.getReportContents(this.props.reportType, this.props.attributes),
        view: true
      })
    } else {
      this.setState({
        reportHTML: "<p>Please set all attributes to view a report</p>",
        view: true
      })
    }
  }

  render() {
      return (
      <div>
        <button onClick={this.renderReport}> View whole report </button>
        <br />
        {this.state.view ? (
          <div dangerouslySetInnerHTML={{__html: this.state.reportHTML}} />
        ) : (
          <div />
        )}
      </div>
    )
  }
}


export default App;

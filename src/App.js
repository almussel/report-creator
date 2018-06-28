import { DB } from './db.js';
import React, { Component } from 'react';
import './App.css';

var db = new DB()
db.addReportType('Default Report')
db.setCurrentReportType('Default Report')
db.addChunkName('Starting Chunk')
db.addChunkName('Other Chunk')
db.setCurrentChunkName('Starting Chunk')
db.setCurrentChunkContents('some default contents')

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reportType: 'Default Report',
    }
  }

  render() {
    return (
      <div>
        <h1> Report Creator! </h1>
        <h2> Report Type: {this.state.reportType} </h2>
        <select onChange={this.handleChange}>
          {db.getAllReportTypes().map((value) =>
            <option key={value} value={value}> {value} </option>
          )}
        </select>
        <AttributeSelector reportType={this.state.reportType}/>
        <button> View whole report </button>
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
    console.log('rendering')
    console.log(this.state)
    return (
      <div>
        <h2> Attributes </h2>
        {Object.keys(this.state).map((attribute) =>
          <div key={attribute}>
            <label> {attribute} </label>
            <select onChange={(e) => this.handleChange(e, attribute)}>
              {db.getAllAttributeValues(attribute).map((value) =>
                <option key={value} value={value} selected={value === this.state[attribute]}> {value} </option>
              )}
            </select>
          </div>
        )}
        <button onClick={this.clearAttributes}> Clear </button>
        <ChunkEditor reportType={this.props.reportType} attributes={this.state}/>
      </div>
    )
  }
}


class ChunkEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
        currentChunk: 'Starting Chunk',
        chunks: db.getAllChunkNames(this.reportType),
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
    db.addChunkName(this.state.newChunk)
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
        <ReportChunkTextField reportType={this.props.reportType} chunkName={this.state.currentChunk} attributes={this.props.attributes}/>
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
  }

  handleChange(event) {
    this.setState({contents: event.target.value})
  }

  handleSubmit(event) {
    db.setChunkContents(this.props.reportType, this.props.chunk, this.state.contents)
    event.preventDefault()
  }

  render() {
    return (
        <form onSubmit={this.handleSubmit}>
        <div>
          <h3> {this.props.chunkName} </h3>
          <p> {this.state.contents} </p>
        </div>
        <label>
          <textarea value={this.state.contents} onChange={this.handleChange} />
        <br />
        </label>
        <input type="submit" value="Save" />
      </form>
    );
  }
}



export default App;

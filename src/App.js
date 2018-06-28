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
  }

  render() {
    return (
      <div>
        <h1> Report Creator! </h1>
        <h2> Report Type: {db.getCurrentReportType()} </h2>
        <select onChange={this.handleChange}>
          {db.getAllReportTypes().map((value) =>
            <option key={value} value={value}> {value} </option>
          )}
        </select>
        <AttributeSelector attributes={db.getAllAttributeNames()}/>
        <ChunkEditor chunks={db.getAllChunkNames()} attributes={db.getCurrentAttributes()}/>
        <button> View whole report </button>
      </div>
    );
  }
}


class AttributeSelector extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
    this.clearAttributes = this.clearAttributes.bind(this)
  }

  handleChange(event, attribute) {
    db.setCurrentAttribute(attribute, event.target.value || null)
    console.log(db.getCurrentAttributes())
  }
  
  clearAttributes() {
    db.getAllAttributeNames().map((attribute) =>
      db.setCurrentAttribute(attribute, null)
    )
    console.log(db.getCurrentAttributes())
  }

  render() {
    return (
      <div>
        <h2> Attributes </h2>
        {this.props.attributes.map((attribute) =>
          <div key={attribute}>
            <label> {attribute} </label>
            <select onChange={(e) => this.handleChange(e, attribute)}>
              {db.getAllAttributeValues(attribute).map((value) =>
                <option key={value} value={value}> {value} </option>
              )}
            </select>
          </div>
        )}
        <button onClick={this.clearAttributes}> Clear </button>
      </div>
    )
  }


}


class ChunkEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
        selectedOption: db.getCurrentChunkName(),
        newChunk: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleNewChunkChange = this.handleNewChunkChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    db.setCurrentChunkName(event.target.value)
    this.setState({
      selectedOption: event.target.value
    })
  }

  handleNewChunkChange(event) {
    this.setState({newChunk: event.target.value});
  }

  handleSubmit(event) {
    db.addChunkName(this.state.newChunk)
    db.setCurrentChunkName(this.state.newChunk)
    this.setState({
      selectedOption: this.state.newChunk,
      newChunk: ''
    })
    event.preventDefault()
  }

  render() {
    return (
      <div>
        <h2> Sections </h2>
        {this.props.chunks.map((chunk) =>
          <div key={chunk}>
            <label>
            <input type="radio" value={chunk} checked={this.state.selectedOption === chunk} onChange={this.handleChange} /> {chunk}
            </label>
            <br />
          </div>
        )}
        <br />
        <form onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Add a new section" value={this.state.newChunk} onChange={this.handleNewChunkChange} />
        </form>
        <ReportChunkTextField chunk={this.selectedOption} />
      </div>
    )
  }
}


class ReportChunkTextField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: db.getCurrentChunkContents(),
      savedContent: db.getCurrentChunkContents()
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({content: event.target.value})
  }

  refreshContent() {
    this.setState({
      content: db.getCurrentChunkContents(),
      savedContent: db.getCurrentChunkContents()
    })
  }

  handleSubmit(event) {
    db.setCurrentChunkContents(this.state.content)
    this.refreshContent()
    event.preventDefault()
  }

  render() {
    return (
        <form onSubmit={this.handleSubmit}>
        <div>
          <h3> {db.getCurrentChunkName()} </h3>
          <p> {db.getCurrentChunkContents()} </p>
        </div>
        <label>
          <textarea value={this.state.content} onChange={this.handleChange} />
        <br />
        </label>
        <input type="submit" value="Save" />
      </form>
    );
  }
}



export default App;

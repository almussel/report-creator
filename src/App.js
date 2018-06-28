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
        <ChunkEditor chunks={db.getAllChunkNames()}/>
        <button> View whole report </button>
      </div>
    );
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
        {this.props.chunks.map((chunk) =>
          <div>
            <label>
            <input type="radio" key={chunk} value={chunk} checked={this.state.selectedOption === chunk} onChange={this.handleChange} /> {chunk}
            </label>
            <br />
          </div>
        )}
        <form onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Add a new section" value={this.state.newChunk} onChange={this.handleNewChunkChange} />
        </form>
        <ReportChunkTextField />
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
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({content: event.target.value});
  }

  handleSubmit(event) {
    db.setCurrentChunkContents(this.state.content);
    this.setState({savedContent: db.getCurrentChunkContents()});
    event.preventDefault()
  }

  render() {
    return (
        <form onSubmit={this.handleSubmit}>
        <div>
          <h2> {db.getCurrentChunkName()} </h2>
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

import { DB } from './db.js';
import React, { Component } from 'react';
import './App.css';

var db = new DB()

class App extends Component {
  constructor(props) {
    super(props);
    db.setCurrentChunkName('Starting Chunk')
    db.setCurrentChunkContents('some default contents')
  }
  render() {
    return (
      <div>
        <h1> Report Creator! </h1>
        <ReportChunkTextField />
      </div>
    );
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
          <p> {this.state.savedContent} </p>
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

import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import './app.scss';

class ZoomLogin extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        name: '',
        zoomPassword: '',
        userPassword:'',
        signature: '',
        meetingID: '',
        china: '0',
        apiKey: '', 
      };
    }
  
    componentDidMount() {
      // get id and pw 
      this.setState({
        meetingID: process.env.REACT_APP_ZOOM_MEETING_NUMBER,
        zoomPassword: process.env.REACT_APP_ZOOM_MEETING_PW,
      });

      // get signature

      let myHeaders = new Headers();
      let fields = {
        meetingNumber : 7748821239,
        role: 0
      }
      myHeaders.append('Content-Type', 'application/json');

      fetch('https://zoom-web-sig.herokuapp.com', {
          method: 'POST',
          headers: myHeaders,
          cache: 'default',
          body: JSON.stringify(fields)
      }).then((response) => response.json())
        .then(data => {
          this.setState({
            signature: data.signature
          });
        });
    }

    handleNameChange(event){
      this.setState({
        name: event.target.value
      })
    }

    handlePasswordChange(event){
      let button = document.getElementById('signin-btn');
      this.setState({
        userPassword: event.target.value
      })
      if(_.isEqual(this.state.zoomPassword, event.target.value)){
        button.disabled = false;
      }
      else{
        button.disabled = true;
      }
    }
      
  
    render() {
      return (
        <div id="login-root">
          <div id="splash">
            <div id="spl-gradient"></div>
            <img id="spl-logo" src={require('../img/logo.png')} />
            <img id="spl-background" src={require('../img/background.png')} />
          </div>
          <div id="login-form">
            <div id="login-heading">
              <h4>Welcome to Staff Advance 2020</h4>
              <p>Please enter your name along with the provied password.</p>
            </div>
            <div id="login-fields">
              <input onChange={this.handleNameChange.bind(this)} id="name-input"></input>
              <input onChange={this.handlePasswordChange.bind(this)} id="password-input"></input>
            </div>
            <button disabled id="signin-btn">Join</button>
          </div>
        </div>
      );
    }
  }
  
  const styles = {
  };
  
  ReactDOM.render(
     <ZoomLogin />,
    document.getElementById('login-container')
  );
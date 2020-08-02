import { ZoomMtg } from "./zoom.js";
import { EditorState, RichUtils } from "draft-js";
import { DraftailEditor, BLOCK_TYPE, INLINE_STYLE } from "draftail";
import React from 'react';
import ReactDOM from 'react-dom';
import './app.scss';

const testTool = window.testTool;
// get meeting args from url
const tmpArgs = testTool.parseQuery();
const meetingConfig = {
  apiKey: tmpArgs.apiKey,
  meetingNumber: tmpArgs.mn,
  userName: (function () {
    if (tmpArgs.name) {
      try {
        return testTool.b64DecodeUnicode(tmpArgs.name);
      } catch (e) {
        return tmpArgs.name;
      }
    }
    return (
      "CDN#" +
      tmpArgs.version +
      "#" +
      testTool.detectOS() +
      "#" +
      testTool.getBrowserInfo()
    );
  })(),
  passWord: tmpArgs.pwd,
  leaveUrl: "/index.html",
  role: parseInt(tmpArgs.role, 10),
  userEmail: (function () {
    try {
      return testTool.b64DecodeUnicode(tmpArgs.email);
    } catch (e) {
      return tmpArgs.email;
    }
  })(),
  lang: tmpArgs.lang,
  signature: tmpArgs.signature,
  china: tmpArgs.china === "1",
};

console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

// it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();
function beginJoin(signature) {
  ZoomMtg.init({
    leaveUrl: meetingConfig.leaveUrl,
    webEndpoint: meetingConfig.webEndpoint,
    success: function () {
      console.log(meetingConfig);
      console.log("signature", signature);
      $.i18n.reload(meetingConfig.lang);
      ZoomMtg.join({
        meetingNumber: meetingConfig.meetingNumber,
        userName: meetingConfig.userName,
        signature: signature,
        apiKey: meetingConfig.apiKey,
        userEmail: meetingConfig.userEmail,
        passWord: meetingConfig.passWord,
        success: function (res) {
          console.log("join meeting success");
          console.log("get attendeelist");
          ZoomMtg.getAttendeeslist({});
          ZoomMtg.getCurrentUser({
            success: function (res) {
              document.addEventListener('DOMContentLoaded', function() {
                document.getElementById('wc-container-left').classList.add('show-participants');
                var wrapper = document.createElement('p');
                document.getElementById("wc-footer-left").appendChild(wrapper);
              }, false);
              console.log("success getCurrentUser", res.result.currentUser);
            },
          });
        },
        error: function (res) {
          console.log(res);
        },
      });
    },
    error: function (res) {
      console.log(res);
    },
  });
}

beginJoin(meetingConfig.signature);

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
    this.setEditor = (editor) => {
      this.editor = editor;
    };
    this.focusEditor = () => {
      if (this.editor) {
        this.editor.focus();
      }
    };
  }

  componentDidMount() {
    this.focusEditor();
  }

  handleKeyCommand (command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  onChange (editorState) {
    this.setState({
      editorState
    });
  };

  hideNotes (){
    // console.log('hide notes');
    document.getElementById('draft-container').classList.add('hidden');
  }

  render() {
    return (
      <div>
        <div id="notes-header">
          <div class="chat-participant-header">Notes</div>
          <button onClick={this.hideNotes} id="btn-close-notes">
            <i class="far fa-times-circle"></i>
          </button>
        </div>
        <DraftailEditor
          enableHorizontalRule
          enableLineBreak
          showUndoControl
          showRedoControl
          spellCheck
          placeholder={''}
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
          blockTypes={[
            { type: BLOCK_TYPE.HEADER_ONE },
            { type: BLOCK_TYPE.HEADER_TWO },
            { type: BLOCK_TYPE.HEADER_THREE },
            { type: BLOCK_TYPE.BLOCKQUOTE },
            { type: BLOCK_TYPE.UNORDERED_LIST_ITEM },
            { type: BLOCK_TYPE.ORDERED_LIST_ITEM }
          ]}
          inlineStyles={[
            { type: INLINE_STYLE.BOLD },
            { type: INLINE_STYLE.ITALIC },
            { type: INLINE_STYLE.UNDERLINE }
          ]}
        />
      </div>
    );
  }
}

const styles = {
  editor: {
    border: '1px solid gray',
    minHeight: '6em'
  }
};

ReactDOM.render(
   <MyEditor />,
  document.getElementById('draft-container')
);
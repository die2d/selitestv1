import React from 'react';
import FileUpload from '../files/FileUpload';
import CompressedPreview from '../files//previews/CompressedPreview';
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit';
import HorizontalSplitIcon from '@material-ui/icons/HorizontalSplit';
import Grid from '@material-ui/core/Grid';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Editor from '../inputs/editor/Editor';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Library from '../tools/Library';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import Fab from '@material-ui/core/Fab'

export default class CompressedForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLibrary: false,
      attributes: {
        compressed: undefined,
        instruction: '',
      }
    }
  }

  validateContent = (content) => {
    if (content.compressed === undefined) {
      console.log("upload or url");
      return false;
    }
    if (content.instruction === '') {
      console.log("enter a instruction");
      return false;
    }
    return true;
  }

  getCompressedAttributes(){
    let compressedContent = this.state.attributes;
    if (this.validateContent(compressedContent)) {
      return compressedContent;
    }
    else {
      return undefined;
    }
  }

  getFileInformation(file){
    let attributes = this.state.attributes;
    attributes.compressed = file;
    this.setState({
      attributes: attributes,
      showPreview: true,
      showGallery: false,
    });
  }

  unPickFile(){
    let attributes = this.state.attributes;
    attributes.compressed = undefined;
    this.setState({
      showPreview: false,
      attributes: attributes,
    });
  }

  getInnerHtml(innerHTML){
    let attributes = this.state.attributes;
    attributes.instruction = innerHTML;
    this.setState({
      attributes: attributes,
    });
  }

  showLibrary(){
    this.setState({
      showGallery: true,
    })
  }

  hideLibrary(){
    this.setState({
      showGallery: false,
    })
  }

  componentDidMount(){
    this.props.getCompressedAttributesFunction(() => this.getCompressedAttributes());
  }

  render() {
    return(
      <div>
        {
          !this.state.showGallery ?
            <div id="dialog-max-height" className="dialog-form-container">
              <div className="media-gallery-button-container">
                <Fab onClick={() => this.showLibrary()}>
                  <FolderSpecialIcon/>
                </Fab>
                <p className="media-fab-text">Open library</p>
              </div>
              {
                !this.state.showPreview ?
                  <div className="form-file-container">
                    <FileUpload
                      type="compressed"
                      accept={['.zip', '.rar', '.tz', '.7z']}
                      label={'Click the button to upload a compressed file'}
                      getFileInformation={this.getFileInformation.bind(this)}
                    />
                  </div>
                :
                <CompressedPreview
                  file={this.state.attributes.compressed}
                  unPickFile={this.unPickFile.bind(this)}
                />
              }
              <div>
                <p className="form-editor-label">Write the instructions that the student must follow below:</p>
                <div className="editor-block">
                  <Editor
                    areaHeight="25vh"
                    buttonLabels={false}
                    innerHTML={this.state.attributes.instruction}
                    addLinks={true}
                    getInnerHtml={this.getInnerHtml.bind(this)}
                  />
                </div>
              </div>
            </div>
          :
          <Library
            user={"MyUser"}
            type={"compressed"}
            getFileInformation={this.getFileInformation.bind(this)}
            hideLibrary={this.hideLibrary.bind(this)}
          />
        }
      </div>
    );
  }
}

import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Help from '../tools/Help';
import Link from '@material-ui/core/Link';
import Editor from '../inputs/editor/Editor';

export default class H5PForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attributes: {
        instruction: '',
        link: '',
        size: '',
      },
    }
  }

  getSize(iFrameText) {
    let widthIndex = iFrameText.indexOf('width="');
    let attributes = iFrameText.substring(widthIndex);
    attributes = attributes.split('"');
    let width = attributes[1];
    let height = attributes[3];
    let size = {width: width, height: height};
    return size;
  }

  getSourceUrl(iFrameText) {
    const iFrameTag = '<iframe src="';
    let url = iFrameText.substring(iFrameTag.length);
    url = url.split('"');
    url = url[0];
    return url;
  }

  getInnerHtml(innerHTML){
    let attributes = this.state.attributes;
    attributes.instruction = innerHTML;
    this.setState({
      attributes: attributes,
    });
  }

  getH5pAttributes(){
    let h5pContent = this.state.attributes;
    if (this.validateContent(h5pContent) ) {
      return h5pContent;
    }
    else {
      return undefined;
    }
  }

  validateContent = (content) => {
    return true;
  }

  handleChange = name => event => {
    let attributes = this.state.attributes;
    if (name === "link") {
      attributes.link = this.getSourceUrl(event.target.value);
      attributes.size = this.getSize(event.target.value);
    }
    this.setState({
      attributes: attributes,
    }, () => console.log(this.state.attributes));
  }

  componentDidMount(){
    this.props.getH5pAttributesFunction(() => this.getH5pAttributes());
  }

  render() {
    return(
      <div className="dialog-form-container">
        <TextField
          id="url-input"
          label="H5P URL"
          margin="normal"
          variant="outlined"
          fullWidth
          required
          className="form-dialog-input"
          autoFocus={true}
          value={this.state.attributes.link}
          onChange={this.handleChange('link')}
        />
        <div className="center-button-container">
          <Button color="primary">Check Url</Button>
          <Help
            helper="hp5Helper"
            text="To create H5P content follow the next steps:"
          />
        </div>
        <div className="advice-link-container">
          <p className="advice-link-text">You can find some examples and demos</p>
          <Link
            className="advice-link"
            component="button"
            variant="body2"
            onClick={() => {
              window.open('https://h5p.org/content-types-and-applications', '_blank');
            }}
          >
            Here
          </Link>
        </div>
        <div className="editor-block">
          <Editor
            areaHeight='20vh'
            innerHTML={this.state.attributes.instruction}
            buttonLabels={false}
            addLinks={true}
            getInnerHtml={this.getInnerHtml.bind(this)}
          />
        </div>
      </div>
    )
  }
}

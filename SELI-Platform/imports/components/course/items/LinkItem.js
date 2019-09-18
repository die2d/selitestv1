import React from 'react';
import Divider from '@material-ui/core/Divider';
import MenuItem from './MenuItem';
import Link from '@material-ui/core/Link';

export default class LinkItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  openExternalLink = () => {
    var win = window.open(this.props.item.attributes.url, '_blank');
    win.focus();
  }

  componentDidMount(){

  }

  render() {
    return(
      <div className="content-box">
        <div onClick={() => this.openExternalLink()} className="link-content-item">
          <div
            className="link-item-container-html"
            dangerouslySetInnerHTML={{__html: this.props.item.attributes.description}}
          >
          </div>
        </div>
        <div className="menu-content-item">
          <MenuItem
            item={this.props.item}
            removeItem={this.props.removeItem.bind(this)}
          />
        </div>
      </div>
      );
    }
  }

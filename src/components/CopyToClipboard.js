import React, { cloneElement } from "react";
import styled from "styled-jss";
import PropTypes from "prop-types";
import { CopyToClipboard as Copy } from "react-copy-to-clipboard";
import FontAwesome from "react-fontawesome";
import ReactTooltip from "react-tooltip";

const COPY_REVERT_DURATION = 1000;
const COPY_TEXT = ["copied!", "copy details"];

const CopyBlock = styled("small")({
  cursor: "pointer",
  fontSize: "1.2em",
  "& span": {
    transition: "color 200ms"
  },
  "& .copied": {
    color: "rgba(185, 233, 212, 1)"
  }
});

class CopyToClipboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false
    };
  }
  onCopy() {
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, COPY_REVERT_DURATION);
  }
  render() {
    const { value, text, icon, children } = this.props;
    const id = "copy" + value.toString().replace(" ", "-") + Math.random();
    const { copied } = this.state;
    const [textCopied, textCopy] = COPY_TEXT;
    let content = children ? (
      cloneElement(children, { copied })
    ) : (
      <FontAwesome
        className={copied ? "copied" : ""}
        name={icon || "paste"}
        style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)" }}
      />
    );

    return (
      <CopyBlock>
        <ReactTooltip
          id={id}
          className="small-tooltip"
          effect="solid"
          getContent={() => (copied ? textCopied : text || textCopy)}
        />
        <Copy text={value} onCopy={this.onCopy.bind(this)}>
          <div data-for={id} data-tip>
            {content}
          </div>
        </Copy>
      </CopyBlock>
    );
  }
}

CopyToClipboard.propTypes = {
  value: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string,
  children: PropTypes.element
};

export default CopyToClipboard;

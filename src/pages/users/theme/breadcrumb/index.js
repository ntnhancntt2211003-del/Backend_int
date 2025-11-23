import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { ROUTERS } from "utils/router";

const Breadcrumb = (props) => {
  return (
    <div className="breadcrumb">
      <div className="breadcrumb_text">
        <a href="#" className="breadcrumb_text_logo">
          HKT <span>SHOP</span>
        </a>
        <div className="breadcrumb_options">
          <ul>
            <li className="link">
              <Link to={ROUTERS.USER.HOME}>Home</Link>
            </li>
            <li>{props.name}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default memo(Breadcrumb);

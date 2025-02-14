/*
 * Copyright 2022 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Button, Col, Row} from "react-bootstrap";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faPlusCircle,} from "@fortawesome/free-solid-svg-icons";
import {Clipboard} from "react-feather";
import PropTypes from "prop-types";

/**
 * Displays the study conclusions or a placeholder.
 *
 * @param conclusions
 * @param showModal
 * @param isSignedIn
 * @returns {*}
 * @constructor
 */
const Conclusions = ({conclusions, showModal, isSignedIn}) => {

  if (!!conclusions) {

    const createMarkup = (content) => {
      return {__html: content};
    };

    return (

        <div className="d-flex">

          <div className="stat stat-transparent">
            <Clipboard
                size={36}
                className="align-middle text-primary me-4"
            />
          </div>

          <div className="flex-grow-1 ms-3">

            <Row>

              <Col xs={12}>
                <div className="mb-3" dangerouslySetInnerHTML={createMarkup(
                    conclusions.content)}/>
              </Col>

              <Col xs={12}>
                <small>
                  Added {new Date(
                    conclusions.createdAt).toLocaleDateString()} by {conclusions.createdBy.displayName}
                </small>
              </Col>

              {
                !!conclusions.lastModifiedBy
                    ? (
                        <Col xs={12}>
                          <small>
                            Updated {new Date(
                              conclusions.updatedAt).toLocaleDateString()} by {conclusions.lastModifiedBy.displayName}
                          </small>
                        </Col>
                    ) : ''
              }

              {
                isSignedIn ? (
                    <Col xs={12} className="mt-2">
                      <Button color={'info'} onClick={() => showModal(true)}>
                        Edit
                        &nbsp;&nbsp;
                        <FontAwesomeIcon icon={faEdit}/>
                      </Button>
                    </Col>
                ) : ''
              }

            </Row>

          </div>
        </div>
    );
  } else {
    return (
        <Row>
          <Col sm={12}>
            <div className={"text-center"}>
              <h4>No conclusions have been added.</h4>
              {
                isSignedIn
                    ? (
                        <div>
                          <Button variant={"primary"}
                                  onClick={() => showModal(true)}>
                            Add Conclusions
                            &nbsp;&nbsp;
                            <FontAwesomeIcon icon={faPlusCircle}/>
                          </Button>
                        </div>
                    ) : ''
              }
            </div>
          </Col>
        </Row>
    );
  }

};

Conclusions.propTypes = {
  conclusions: PropTypes.object,
  showModal: PropTypes.func.isRequired,
  isSignedIn: PropTypes.bool.isRequired,
}

export default Conclusions;

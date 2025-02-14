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

import React, {useEffect, useState} from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Modal,
  Row,
  Table
} from 'react-bootstrap';
import {Clipboard, Edit, FolderPlus} from 'react-feather';
import ToolkitProvider, {Search} from "react-bootstrap-table2-toolkit";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import {RepairableStorageFolderLink} from "../../common/files";
import {RepairableNotebookFolderLink} from "../../common/eln";
import {SettingsLoadingMessage} from "../../common/loading";
import {SettingsErrorMessage} from "../../common/errors";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const createMarkup = (content) => {
  return {__html: content};
};

const ProgramSettings = props => {
  
  const [state, setState] = useState({
    programs: [],
    isLoaded: false,
    isError: false,
    showDetails: false,
    selectedProgram: null,
    isModalOpen: false
  });

  const showModal = (selected) => {
    console.debug(selected);
    if (!!selected) {
      setState(prevState => ({
        ...prevState,
        selectedProgram: selected,
        isModalOpen: true
      }));
    } else {
      setState(prevState => ({
        ...prevState,
        isModalOpen: false,
        selectedProgram: null
      }))
    }
  };

  useEffect(() => {
    axios.get("/api/internal/program?details=true")
    .then(async response => {
      setState(prevState => ({
        ...prevState,
        programs: response.data,
        isLoaded: true
      }))
    })
    .catch(error => {
      console.error(error);
      setState(prevState => ({
        ...prevState,
        isError: true,
        error: error
      }));
    });
  }, []);

  let content = '';
  if (state.isLoaded) {
    content = <ProgramsTable
        programs={state.programs}
        showModal={showModal}
    />
  } else if (state.isError) {
    content = <SettingsErrorMessage/>;
  } else {
    content = <SettingsLoadingMessage/>;
  }

  return (
      <Card>

        <Card.Header>
          <Card.Title tag="h5" className="mb-0">
            Registered Programs
            <span className="float-end">
              <Button
                  variant={"primary"}
                  href={"/programs/new"}
              >
                New Program
                &nbsp;
                <FolderPlus className="feather align-middle ms-2 mb-1"/>
              </Button>
            </span>
          </Card.Title>
        </Card.Header>

        <Card.Body>

          {content}

          <ProgramDetailsModal
              isOpen={state.isModalOpen}
              program={state.selectedProgram}
              showModal={showModal}
          />

        </Card.Body>

      </Card>
  );

}

const ProgramsTable = ({
  programs,
  showModal
}) => {

  const navigate = useNavigate();

  const columns = [
    {
      dataField: "name",
      text: "Name",
      sort: true,
      // headerStyle: {width: '40%'},
      formatter: (c, d, i, x) => <Button variant="link"
                                         onClick={() => showModal(
                                             d)}>{d.name}</Button>,
      sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (rowA.name > rowB.name) {
          return order === "desc" ? -1 : 1;
        }
        if (rowB.name > rowA.name) {
          return order === "desc" ? 1 : -1;
        }
        return 0;
      },
    },
    {
      dataField: "code",
      text: "Code",
      sort: true,
      // headerStyle: {width: '20%'},
      formatter: (cell, d, index, x) => d.code,
    },
    {
      dataField: "createdAt",
      text: "Created",
      sort: true,
      // headerStyle: {width: '40%'},
      formatter: (c, d, i, x) => new Date(d.createdAt).toLocaleDateString()
    },
    {
      dataField: "status",
      text: "Status",
      sort: true,
      // headerStyle: {width: '10%'},
      formatter: (c, d, i, x) => {
        if (d.active) {
          return <Badge bg="success">Active</Badge>
        } else {
          return <Badge bg="danger">Inactive</Badge>
        }
      }
    },
    {
      dataField: "eln",
      text: "ELN",
      sort: false,
      // headerStyle: {width: '40%'},
      formatter: (c, d, i, x) => {
        if (!!d.notebookFolder) {
          if (!!d.notebookFolder.url && d.notebookFolder.url !== "ERROR") {
            return <a href={d.notebookFolder.url} target="_blank" rel="noopener noreferrer">ELN Folder</a>
          } else {
            return <Badge bg="warning">ERROR</Badge>
          }
        } else {
          return "n/a"
        }
      }
    },
    {
      dataField: "storage",
      text: "File Storage",
      sort: false,
      // headerStyle: {width: '40%'},
      formatter: (c, d, i, x) => {
        if (!!d.primaryStorageFolder) {
          if (!!d.primaryStorageFolder.url) {
            return <a href={d.primaryStorageFolder.url} target="_blank" rel="noopener noreferrer">Files
              Folder</a>
          } else {
            return <Badge bg="warning">ERROR</Badge>
          }
        } else {
          return "n/a"
        }
      }
    },
    {
      dataField: "controls",
      text: "",
      sort: false,
      // headerStyle: {width: '10%'},
      formatter: (c, d, i, x) => {
        return (
            <React.Fragment>
              <Dropdown>

                <Dropdown.Toggle variant={"outline-primary"}>
                  {/*<FontAwesomeIcon icon={faBars} />*/}
                  &nbsp;Options&nbsp;
                </Dropdown.Toggle>

                <Dropdown.Menu>

                  <Dropdown.Item onClick={() => showModal(d)}>
                    <FontAwesomeIcon icon={faInfoCircle}/>
                    &nbsp;&nbsp;
                    View Details
                  </Dropdown.Item>

                  <Dropdown.Item
                      onClick={() => navigate("/program/" + d.id + "/edit")}
                  >
                    <FontAwesomeIcon icon={faEdit}/>
                    &nbsp;&nbsp;
                    Edit Program
                  </Dropdown.Item>

                </Dropdown.Menu>

              </Dropdown>

            </React.Fragment>
        )
      }
    }
  ];

  return (
      <ToolkitProvider
          keyField="id"
          data={programs}
          columns={columns}
          search
          exportCSV
      >
        {props => (
            <div>
              <div className="float-end">
                <Search.SearchBar
                    {...props.searchProps}
                />
              </div>
              <BootstrapTable
                  bootstrap4
                  keyField="id"
                  bordered={false}
                  pagination={paginationFactory({
                    sizePerPage: 10,
                    sizePerPageList: [10, 20, 40, 80]
                  })}
                  defaultSorted={[{
                    dataField: "name",
                    order: "asc"
                  }]}
                  {...props.baseProps}
              >
              </BootstrapTable>
            </div>
        )}
      </ToolkitProvider>
  )

}

const ProgramDetailsModal = ({program, isOpen, showModal}) => {

  if (!program) {
    return "";
  }

  const attributes = Object.keys(program.attributes).map(k => {
    return (
        <tr key={"assay-type-attribute-" + k}>
          <td>{k}</td>
          <td>{program.attributes[k]}</td>
        </tr>
    )
  });

  return (
      <Modal
          show={isOpen}
          onHide={() => showModal()}
          size={"lg"}
      >
        <Modal.Header closeButton>
          Program: <strong>{program.name}</strong> (<code>{program.code}</code>)
        </Modal.Header>
        <Modal.Body>
          <Row>

            <Col md={6}>
              <h4>Name</h4>
              <p>{program.name}</p>
            </Col>

            <Col md={6}>
              <h4>Code</h4>
              <p>{program.code}</p>
            </Col>

            <Col md={12}>
              <h4>Description</h4>
              <div dangerouslySetInnerHTML={createMarkup(
                  program.description)}/>
            </Col>

            <Col md={6}>
              <h4>Created</h4>
              <p>{new Date(
                  program.createdAt).toLocaleString()} by {program.createdBy.displayName}</p>
            </Col>

            <Col md={6}>
              <h4>Last Updated</h4>
              <p>{new Date(
                  program.createdAt).toLocaleString()} by {program.lastModifiedBy.displayName}</p>
            </Col>

            <Col md={6}>
              <h4>Active</h4>
              <p>
                <TrueFalseLabel bool={program.active}/>
              </p>
            </Col>

            <Col xs={12}>
              <hr/>
            </Col>

            <Col xs={6}>
              <h4>File Storage</h4>
              <p>
                <RepairableStorageFolderLink
                    folder={program.primaryStorageFolder}
                    repairUrl={"/api/internal/program/" + program.id + "/storage/repair"}
                />
              </p>
            </Col>

            <Col xs={6}>
              <h4>ELN Folder</h4>
              <p>
                <RepairableNotebookFolderLink
                    folder={program.notebookFolder}
                    repairUrl={"/api/internal/program/" + program.id + "/notebook/repair"}
                />
              </p>
            </Col>

            <Col xs={12}>
              <hr/>
            </Col>

            <Col xs={12}>
              <h4>Attributes</h4>
              {
                attributes.length > 0
                    ? (
                        <Table style={{fontSize: "0.8rem"}}>
                          <thead>
                          <tr>
                            <th>Name</th>
                            <th>Value</th>
                          </tr>
                          </thead>
                          <tbody>
                          {attributes}
                          </tbody>
                        </Table>
                    ) : <p className="text-muted">n/a</p>
              }
            </Col>

          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info"
                  href={"/program/" + program.id}>
            <Clipboard size={14} className="mb-1"/>
            &nbsp;
            View Program
          </Button>
          <Button variant="warning"
                  href={"/program/" + program.id + "/edit"}>
            <Edit size={14} className="mb-1"/>
            &nbsp;
            Edit
          </Button>
          <Button variant="secondary" onClick={() => showModal()}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
  )

}

const TrueFalseLabel = ({bool}) => {
  if (!!bool) {
    return <Badge bg={'success'}>True</Badge>
  } else {
    return <Badge bg={'danger'}>False</Badge>
  }
}

export default ProgramSettings;
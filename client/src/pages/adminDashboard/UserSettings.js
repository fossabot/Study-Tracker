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

import React, {useEffect} from "react";
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
import {Edit, User, UserPlus} from 'react-feather';
import ToolkitProvider, {Search} from "react-bootstrap-table2-toolkit";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import {SettingsErrorMessage} from "../../common/errors";
import {SettingsLoadingMessage} from "../../common/loading";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faEdit,
  faInfoCircle,
  faRedo,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import swal from "sweetalert";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const resetUserPassword = (user) => {
  swal({
    title: "Are you sure you want to reset the password for user: "
        + user["displayName"] + " (" + user["email"] + ")?",
    text: "This will override any existing password reset requests and send a "
        + "new notification email to the user.",
    icon: "warning",
    buttons: true
  })
  .then(val => {
    if (val) {
      axios.post("/api/internal/user/" + user["id"] + "/password-reset")
      .then(response => {
        swal("Password reset successful",
            "A notification email has been sent to the user.",
            "success")
      })
      .catch(error => {
        console.error(error);
        swal("Request failed",
            "Check the server log for more information.",
            "warning");
      })
    }
  })
}

const toggleUserActive = (user, active) => {
  swal({
    title: "Are you sure you want to " + (!!active ? "enable" : "disable")
        + " user: " + user["displayName"] + " (" + user["email"] + ")?",
    text: "Disabled users cannot be added to new studies and assays, but they "
        + "will remain associated with existing studies and assays.",
    icon: "warning",
    buttons: true
  })
  .then(val => {
    if (val) {
      axios.post("/api/internal/user/" + user["id"] + "/status?active=" + active)
      .then(response => {
        swal("User " + (!!active ? "enabled" : "disabled"),
            "Refresh the page to view the updated user information.",
            "success")
      })
      .catch(error => {
        console.error(error);
        swal("Request failed",
            "Check the server log for more information.",
            "warning");
      })
    }
  });
}

const UserSettings = props => {

  const [state, setState] = React.useState({
    users: [],
    isLoaded: false,
    isError: false,
    showDetails: false,
    selectedUser: null
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const navigate = useNavigate();

  const showModal = (selected) => {
    if (selected) {
      setState(prevState => ({...prevState, selectedUser: selected}));
      setIsModalOpen(true)
    } else {
      setIsModalOpen(false);
    }
  }

  useEffect(() => {
    axios.get("/api/internal/user")
    .then(async response => {
      setState(prevState => ({
        ...prevState,
        users: response.data,
        isLoaded: true
      }));
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
    content = <UserTable users={state.users} showModal={showModal}/>
  } else if (state.isError) {
    content = <SettingsErrorMessage/>
  } else {
    content = <SettingsLoadingMessage/>
  }

  return (
      <React.Fragment>

        <Card>
          <Card.Header>
            <Card.Title tag="h5" className="mb-0">
              Registered Users
              <span className="float-end">
                <Button
                    color={"primary"}
                    onClick={() => navigate("/users/new")}
                >
                  New User
                  &nbsp;
                  <UserPlus className="feather align-middle ms-2 mb-1"/>
                </Button>
              </span>
            </Card.Title>
          </Card.Header>
          <Card.Body>

            {content}

            <UserDetailsModal
                showModal={showModal}
                isOpen={isModalOpen}
                user={state.selectedUser}
            />

          </Card.Body>
        </Card>

      </React.Fragment>
  );

}

const UserTable = ({users, showModal}) => {

  const navigate = useNavigate();

  const columns = [
    {
      dataField: "displayName",
      text: "Display Name",
      sort: true,
      headerStyle: {width: '25%%'},
      formatter: (cell, d, index, x) => d.displayName,
      sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (rowA.displayName > rowB.displayName) {
          return order === "desc" ? -1 : 1;
        }
        if (rowB.displayName > rowA.displayName) {
          return order === "desc" ? 1 : -1;
        }
        return 0;
      },
    },
    {
      dataField: "email",
      text: "Email",
      sort: true,
      headerStyle: {width: '20%%'},
      formatter: (c, d, i, x) => <Button variant={"link"}
                                         onClick={() => showModal(d)}>{d.email}</Button>,
      sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (rowA.email > rowB.email) {
          return order === "desc" ? -1 : 1;
        }
        if (rowB.email > rowA.email) {
          return order === "desc" ? 1 : -1;
        }
        return 0;
      },
    },
    {
      dataField: "type",
      text: "Type",
      sort: true,
      headerStyle: {width: '10%'},
      formatter: (c, d, i, x) => {
        if (d.admin) {
          return <Badge bg="danger">Admin</Badge>
        } else {
          return <Badge bg="info">User</Badge>
        }
      }
    },
    {
      dataField: "status",
      text: "Status",
      sort: true,
      headerStyle: {width: '10%'},
      formatter: (c, d, i, x) => {
        if (d.locked) {
          return <Badge bg="warning">Locked</Badge>
        } else if (d.active) {
          return <Badge bg="success">Active</Badge>
        } else {
          return <Badge bg="danger">Inactive</Badge>
        }
      }
    },
    {
      dataField: "controls",
      text: "",
      sort: false,
      headerStyle: {width: '10%'},
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
                      onClick={() => navigate("/users/" + d.id + "/edit")}
                  >
                    <FontAwesomeIcon icon={faEdit}/>
                    &nbsp;&nbsp;
                    Edit User
                  </Dropdown.Item>

                  <Dropdown.Divider/>

                  {
                    !!d.active ? (
                        <Dropdown.Item
                            className={"text-warning"}
                            onClick={() => toggleUserActive(d, false)}
                        >
                          <FontAwesomeIcon icon={faTimesCircle}/>
                          &nbsp;&nbsp;
                          Set Inactive
                        </Dropdown.Item>
                    ) : (
                        <Dropdown.Item
                            className={"text-warning"}
                            onClick={() => toggleUserActive(d, true)}
                        >
                          <FontAwesomeIcon icon={faCheckCircle}/>
                          &nbsp;&nbsp;
                          Set Active
                        </Dropdown.Item>
                    )
                  }

                  <Dropdown.Item
                      className={"text-warning"}
                      onClick={() => resetUserPassword(d)}
                  >
                    <FontAwesomeIcon icon={faRedo}/>
                    &nbsp;&nbsp;
                    Reset Password
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
          data={users}
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
                    dataField: "displayName",
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

const UserDetailsModal = ({user, isOpen, showModal}) => {

  if (!user) {
    return "";
  }

  const attributes = Object.keys(user.attributes).map(k => {
    return (
        <tr key={"assay-type-attribute-" + k}>
          <td>{k}</td>
          <td>{user.attributes[k]}</td>
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
          User:&nbsp;
          <strong>{user.displayName}</strong>&nbsp;(<code>{user.email}</code>)
        </Modal.Header>
        <Modal.Body>
          <Row>

            <Col md={6}>
              <h4>Name</h4>
              <p>{user.displayName}</p>
            </Col>
            <Col md={6}>
              <h4>Email</h4>
              <p>{user.email}</p>
            </Col>
            <Col md={6}>
              <h4>Department</h4>
              <p>{user.department || 'n/a'}</p>
            </Col>
            <Col md={6}>
              <h4>Title</h4>
              <p>{user.title || 'n/a'}</p>
            </Col>

            <Col xs={12}>
              <hr/>
            </Col>

            <Col md={6}>
              <h4>Active</h4>
              <p>
                <TrueFalseLabel bool={user.active}/>
              </p>
            </Col>
            <Col md={6}>
              <h4>Admin</h4>
              <p>
                <TrueFalseLabel bool={user.admin}/>
              </p>
            </Col>
            <Col md={6}>
              <h4>Account Locked</h4>
              <p>
                <TrueFalseLabel bool={user.locked}/>
              </p>
            </Col>
            <Col md={6}>
              <h4>Account Expired</h4>
              <p>
                <TrueFalseLabel bool={user.expired}/>
              </p>
            </Col>
            <Col md={6}>
              <h4>Credentials Expired</h4>
              <p>
                <TrueFalseLabel bool={user.credentialsExpired}/>
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
          <Button variant="info" href={"/user/" + user.id}>
            <User size={14} className="mb-1"/>
            &nbsp;
            View Profile
          </Button>
          <Button variant="warning" href={"/users/" + user.id + "/edit"}>
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
    return <Badge color={'success'}>True</Badge>
  } else {
    return <Badge color={'danger'}>False</Badge>
  }
}

export default UserSettings;
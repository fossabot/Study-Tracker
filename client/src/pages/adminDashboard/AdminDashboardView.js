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

import React from "react";
import NavBar from "../../common/structure/NavBar";
import Footer from "../../common/structure/Footer";
import AdminDashboard from "./AdminDashboard";

const AdminDashboardView = props => {

  return (
      <div className="wrapper">
        <div className="main">
          <NavBar hideToggle={true} hideSearch={true}/>
          <div className="content">
            <AdminDashboard />
          </div>
          <Footer/>
        </div>
      </div>
  );

}

export default AdminDashboardView;

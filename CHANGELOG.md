# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Study Tracker will eventually deprecate support of Elasticsearch 7.10 in favor of newer versions.
- Working on a new module for capturing data sets and their metadata. This module will allow the registration of various data sources (such as AWS S3), and the creation of data set records that will include one-or-more resources from these storage locations, along with metadata describing them. Users will then be allowed to associate one-or-more data sets with a study. Studies will likely get data set records created for them, which will include their storage folder and notebook by default.
- Updates to the UI of the various 'Details' pages and the main page are in progress.
- Will update and improve assay task functionality to allow capturing of additional information.
- Will add a notifications feature that will capture and display notifications for users.

## [0.7.2] - 2022-XX-XX

### Added

- Added bean property bindings to configuration properties for easier reference and validation. Any misconfigured properties will throw a more accessible error message at startup.

### Changed

- Updated configuration properties for email integration. The old properties were spring-specific, but will still work.

### Fixed

- Fixed a bug with study and assay list display, due to missing fields.
- Fixed a bug where failed study notebook loading would crash the web app.

## [0.7.1] - 2022-11-15

### Added
- Added File Manager tool to the Study Tracker UI. This tool allows the browsing of storage locations registered within Study Tracker. Users can navigate & create folders, and upload & download files.
- Added support for Amazon Web Services S3 storage locations. This allows users to store files in S3 buckets.
- Added support for creating API users, which can be used exclusively for API access. This allows for easier management of integrations and removes the need to use a user's credentials for API access.
- Admin users can now select existing Benchling projects to map new programs to.
- Added generic Git service integration with GitLab implementation. Users can now opt to create Git repositories for new studies and assays.

### Changed
- Changed the signature of the JWT created and returned to authenticated users to include creation and expiration times.
- Updated program, study, and assay forms to make some features optional. Users can choose whether they want notebook and git resources created for them, rather than assuming they are required.
- Updated the database schema to capture integration configuration parameters for external services that Study Tracker connects with. This will allow for admin users to connect services from within the application, without the need for back-end modifications and redeployment.

### Fixed
- Fixed validation of Quill input fields to prevent empty inputs.
- Fixed validation of required custom assay type fields.
- Fixed validation of key-value attribute fields.
- Fixed a number of small UI bugs.

## [0.7.0] - 2022-09-26

Study Tracker version 0.7.0 is the first of several transitional updates that will modernize the front and back ends of the application. These updates are primarily designed to utilize newer versions of dependencies, remove deprecated dependencies, and mitigate security vulnerabilities. A significant number of new features will be added, as well, in order to take the application in a direction that will broaden its utility.

### Added
- Added a new, versioned public API intended for use by external applications and users. The existing Swagger API documentation now covers this API. This API supports JWT-based authentication. The existing API has been 'hidden' and is now intended only for use by the front-end web application, but otherwise functions the same.
- Assays are now indexed by Elasticsearch, allowing for a more effective power search tool.

### Changed
- Study Tracker now uses the `frontend-maven-plugin` to download NPM & NodeJS and build the front-end web application. This allows for a more streamlined build process and removes the requirement for NodeJS & NPM installation from the user.
- Updated the front-end to use React 17.0.2. Rewrote a lot of the front-end code to use modern techniques, such as React Hooks and Formik, which will make future development easier.
- The old API has been hidden from the Swagger documentation. It is still available, but is not intended for use by external applications and users.
- Benchling notebook entry templates no longer require registration in the front-end to allow their usage when creating studies and assays. Users can now select from any existing template in their tenant when creating studies and assays.
- Improved parameterization of Elasticsearch in `.properties` files.

### Removed
- Removed the admin dashboard functionality for registering notebook entry templates.

### Deprecated
- The `NotebookEntryTemplate` model and associated classes have been deprecated and are no longer in active use. They will be removed in a future release, which will include a database migration script.

### Fixed
- Fixed a number of minor UI bugs.


## [0.6.9] - 2022-06-14

### Added
- Added 'Features' API endpoint. This endpoint returns a list of features that are enabled for the current tenant. This is intended to be used by the front-end to determine which features are available for the current user.
- Added support for externalized SAML keystore files.

### Changed
- Study and Assay Details pages' Files tabs will now not load all remote content by default. The user must now click a button to load the content. This is intended to improve performance for users with large numbers of files, and also prevent exhausting Egnyte's API rate limit.

### Fixed
- Fixed sign-out redirects for SAML users.
- Fixed folder repair functionality.


## [0.6.8] - 2022-05-31

### Added
- Added Swagger UI link to the admin dashboard.
- Added the ability to enable/disable users from the admin dashboard.
- Added the ability to reset user password in the admin dashboard.
- Added CSRF protection to the API.

### Changed
- Refactored the base package structure, updated Java dependencies.

### Fixed
- Fixed assay edit page login redirect bug.
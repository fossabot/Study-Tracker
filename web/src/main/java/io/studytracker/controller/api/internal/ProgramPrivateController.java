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

package io.studytracker.controller.api.internal;

import io.studytracker.controller.api.AbstractProgramController;
import io.studytracker.eln.NotebookFolder;
import io.studytracker.eln.NotebookFolderService;
import io.studytracker.events.EventsService;
import io.studytracker.events.util.ProgramActivityUtils;
import io.studytracker.exception.InsufficientPrivilegesException;
import io.studytracker.exception.RecordNotFoundException;
import io.studytracker.mapstruct.dto.form.ProgramFormDto;
import io.studytracker.mapstruct.dto.response.ActivityDetailsDto;
import io.studytracker.mapstruct.dto.response.ProgramDetailsDto;
import io.studytracker.mapstruct.mapper.ActivityMapper;
import io.studytracker.model.Activity;
import io.studytracker.model.FileStorageLocation;
import io.studytracker.model.Program;
import io.studytracker.model.ProgramOptions;
import io.studytracker.model.User;
import io.studytracker.service.ActivityService;
import io.studytracker.service.StorageLocationService;
import io.studytracker.storage.StorageFolder;
import io.studytracker.storage.StudyStorageService;
import io.studytracker.storage.exception.StudyStorageNotFoundException;
import java.util.List;
import java.util.Optional;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
@RestController
@RequestMapping("/api/internal/program")
public class ProgramPrivateController extends AbstractProgramController {

  private static final Logger LOGGER = LoggerFactory.getLogger(ProgramPrivateController.class);

  @Autowired private ActivityService activityService;

  @Autowired private EventsService eventsService;

  @Autowired private ActivityMapper activityMapper;

  @Autowired private StorageLocationService storageLocationService;

  @Autowired(required = false)
  private NotebookFolderService notebookFolderService;

  @GetMapping("")
  public List<?> getAllPrograms(
      @RequestParam(required = false, name = "details") boolean showDetails) throws Exception {
    List<Program> programs = this.getProgramService().findAll();
    if (showDetails) {
      return this.getProgramMapper().toProgramDetailsList(programs);
    } else {
      return this.getProgramMapper().toProgramSummaryList(programs);
    }
  }

  @GetMapping("/{id}")
  public ProgramDetailsDto getProgram(@PathVariable("id") Long programId) throws Exception {
    Optional<Program> optional = this.getProgramService().findById(programId);
    if (optional.isPresent()) {
      return this.getProgramMapper().toProgramDetails(optional.get());
    } else {
      throw new RecordNotFoundException("Could not find program: " + programId);
    }
  }

  @PostMapping("")
  public HttpEntity<ProgramDetailsDto> createProgram(@RequestBody @Valid ProgramFormDto dto) {
    LOGGER.info("Creating new program: " + dto.toString());
    Program newProgram = this.getProgramMapper().fromProgramFormDto(dto);
    ProgramOptions options = this.getProgramMapper().optionsFromFormDto(dto);
    Program program = this.createNewProgram(newProgram, options);
    return new ResponseEntity<>(this.getProgramMapper().toProgramDetails(program), HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public HttpEntity<ProgramDetailsDto> updateProgram(
      @PathVariable("id") Long programId,
      @RequestBody @Valid ProgramFormDto dto
  ) {
    LOGGER.info("Updating program: " + programId);
    Program program = this.updateExistingProgram(this.getProgramMapper().fromProgramFormDto(dto));
    return new ResponseEntity<>(this.getProgramMapper().toProgramDetails(program), HttpStatus.OK);
  }

  @DeleteMapping("/{id}")
  public HttpEntity<?> deleteProgram(@PathVariable("id") Long programId) {
    LOGGER.info("Deleting program: " + programId);
    this.deleteExistingProgram(programId);
    return new ResponseEntity<>(HttpStatus.OK);
  }

  @PostMapping("/{id}/status")
  public HttpEntity<?> updateProgramStatus(
      @PathVariable("id") Long programId,
      @RequestParam("active") boolean active
  ) {

    User user = this.getAuthenticatedUser();
    if (!user.isAdmin()) {
      throw new InsufficientPrivilegesException(
          "You do not have permission to perform this action.");
    }

    Optional<Program> optional = this.getProgramService().findById(programId);
    if (!optional.isPresent()) {
      throw new RecordNotFoundException("Program not found: " + programId);
    }
    Program program = optional.get();

    program.setActive(active);
    this.getProgramService().update(program);

    // Publish events
    Activity activity = ProgramActivityUtils.fromUpdatedProgram(program, user);
    activityService.create(activity);
    eventsService.dispatchEvent(activity);

    return new ResponseEntity<>(HttpStatus.OK);
  }

  @GetMapping("/{id}/activity")
  public HttpEntity<List<ActivityDetailsDto>> getProgramActivity(
      @PathVariable("id") Long programId) {
    Optional<Program> optional = this.getProgramService().findById(programId);
    if (!optional.isPresent()) {
      throw new RecordNotFoundException("Program not found: " + programId);
    }
    Program program = optional.get();
    List<Activity> activities = activityService.findByProgram(program);
    return new ResponseEntity<>(activityMapper.toActivityDetailsList(activities), HttpStatus.OK);
  }

  /**
   * Retrieves the program's storage folder reference as a {@link StorageFolder} object.
   *
   * @param programId PKID of the program
   * @return
   */
  @GetMapping("/{id}/storage")
  public HttpEntity<StorageFolder> getProgramStorageFolder(@PathVariable("id") Long programId) {
    Optional<Program> optional = this.getProgramService().findById(programId);
    if (!optional.isPresent()) {
      throw new RecordNotFoundException("Program not found: " + programId);
    }
    Program program = optional.get();
    try {
      FileStorageLocation location = storageLocationService.findByFileStoreFolder(program.getPrimaryStorageFolder());
      StudyStorageService studyStorageService = storageLocationService.lookupStudyStorageService(location);
      return new ResponseEntity<>(studyStorageService.findFolder(location, program), HttpStatus.OK);
    } catch (StudyStorageNotFoundException e) {
      throw new RecordNotFoundException("Program folder not found:" + programId);
    }
  }

  /**
   * Repairs the reference to a program's storage folder by either fetching a new reference or
   * creating a new folder.
   *
   * @param programId
   * @return
   */
  @PatchMapping("/{id}/storage")
  public HttpEntity<?> repairProgramStorageFolder(@PathVariable("id") Long programId) {

    // Check user privileges
    User user = this.getAuthenticatedUser();
    if (!user.isAdmin()) {
      throw new InsufficientPrivilegesException(
          "You do not have permission to perform this action.");
    }

    // Check that the program exists
    Optional<Program> optional = this.getProgramService().findById(programId);
    if (!optional.isPresent()) {
      throw new RecordNotFoundException("Program not found: " + programId);
    }
    Program program = optional.get();

    // Repair the storage folder
    this.getProgramService().repairStorageFolder(program);
    return new ResponseEntity<>(HttpStatus.OK);
  }

  @GetMapping("/{id}/notebook")
  public NotebookFolder getProgramElnFolder(@PathVariable("id") Long programId) {

    // Check that the program exists
    Optional<Program> optional = this.getProgramService().findById(programId);
    if (!optional.isPresent()) {
      throw new RecordNotFoundException("Program not found: " + programId);
    }
    Program program = optional.get();

    // Check that the folder exists
    Optional<NotebookFolder> folderOptional =
        Optional.ofNullable(notebookFolderService).flatMap(service -> service.findProgramFolder(program));
    if (!folderOptional.isPresent()) {
      throw new RecordNotFoundException("Cannot find notebook folder for program: " + programId);
    }

    return folderOptional.get();
  }

  @PatchMapping("/{id}/notebook")
  public HttpEntity<?> repairNotebookFolder(@PathVariable("id") Long programId) {

    // Check user privileges
    User user = this.getAuthenticatedUser();
    if (!user.isAdmin()) {
      throw new InsufficientPrivilegesException(
          "You do not have permission to perform this action.");
    }

    // Check that the program exists
    Optional<Program> optional = this.getProgramService().findById(programId);
    if (!optional.isPresent()) {
      throw new RecordNotFoundException("Program not found: " + programId);
    }
    Program program = optional.get();

    // Repair the folder
    this.getProgramService().repairElnFolder(program);
    return new ResponseEntity<>(HttpStatus.OK);
  }
}

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

package io.studytracker.mapstruct.dto.form;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.studytracker.model.NotebookEntryTemplate;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NotebookEntryTemplateFormDto {

  private Long id;
  private @NotNull(message = "Template name must not be empty") String name;
  private @NotNull(message = "Template id must not be empty") String templateId;
  //  private UserSlimDto createdBy;
  //  private UserSlimDto lastModifiedBy;
  //  private Date createdAt;
  //  private Date updatedAt;
  private boolean active = true;
  private NotebookEntryTemplate.Category category;
  private boolean isDefault = false;
}
WebHooksPlugin = {
		
    editBuildEventTemplate: function(data) {
    	WebHooksPlugin.TemplateEditBuildEventDialog.showDialog("Edit Build Event Template", 'editBuildEventTemplate', data);
    },
    copyBuildEventTemplate: function(data) {
    	WebHooksPlugin.TemplateEditBuildEventDialog.showDialog("Copy Build Event Template", 'copyBuildEventTemplate', data);
    },
    addBuildEventTemplate: function(data) {
    	WebHooksPlugin.TemplateEditBuildEventDialog.showDialogAddEventTemplate("Add Build Event Template", 'addBuildEventTemplate', data);
    },
    createDefaultTemplate: function(data) {
    	WebHooksPlugin.TemplateEditBuildEventDialog.showDialogCreateDefaultTemplate("Add Default Template", 'addDefaultTemplate', data);
    },
    copyFilter: function(data) {
    	DebRepoFilterPlugin.RepoEditFilterDialog.showDialog("Copy Artifact Filter", 'copyArtifactFilter', data);
    },
    deleteBuildEventTemplate: function(data) {
    	WebHooksPlugin.DeleteTemplateItemDialog.showDialog("Delete Build Event Template", 'deleteBuildEventTemplate', data);
    },
    deleteTemplate: function(data) {
    	WebHooksPlugin.DeleteTemplateDialog.showDialog("Delete Template", 'deleteTemplate', data);
    },
    TemplateEditBuildEventDialog: OO.extend(BS.AbstractWebForm, OO.extend(BS.AbstractModalDialog, {
        getContainer: function () {
            return $('editTemplateDialog');
        },

        formElement: function () {
            return $('editTemplateForm');
        },

        showDialogCreateDefaultTemplate: function (title, action, data) {
        	
        	//this.getWebHookTemplateData(data.templateName, data.templateNumber, action);
        	this.getParentTemplateData(data.templateName, data.templateNumber, action)
			this.disableCheckboxes();
			this.clearEditor();

            $j("input[id='WebhookTemplateaction']").val(action);
            $j(".dialogTitle").html(title);
            this.cleanFields(data);
            this.cleanErrors();
            this.showCentered();
        },
        
        showDialogAddEventTemplate: function (title, action, data) {
        	
        	this.getTemplateDataOrGetParentOnFailure(data.templateName, data.templateNumber, action)
        	
        	$j("input[id='WebhookTemplateaction']").val(action);
        	$j(".dialogTitle").html(title);
        	this.cleanFields(data);
        	this.cleanErrors();
        	this.showCentered();
        },
        
        showDialog: function (title, action, data) {
        	
        	this.getWebHookTemplateData(data.templateName, data.templateNumber, action);
        	
            $j("input[id='WebhookTemplateaction']").val(action);
            $j(".dialogTitle").html(title);
            this.cleanFields(data);
            this.cleanErrors();
            this.showCentered();
        },

        cleanFields: function (data) {
            $j("#repoEditFilterForm input[id='debrepo.uuid']").val(data.uuid);
            $j("#repoEditFilterForm input[id='debrepofilter.id']").val(data.id);
            $j(".runnerFormTable input[id='debrepofilter.regex']").val(data.regex);
            $j(".runnerFormTable input[id='debrepofilter.dist']").val(data.dist);
            $j(".runnerFormTable input[id='debrepofilter.component']").val(data.component);
            $j(".runnerFormTable select[id='debrepofilter.buildtypeid']").val(data.build);
            $j("#repoEditFilterForm input[id='projectId']").val(data.projectId);

            this.cleanErrors();
        },

        cleanErrors: function () {
            $j("#repoEditFilterForm .error").remove();
        },

        error: function($element, message) {
            var next = $element.next();
            if (next != null && next.prop("class") != null && next.prop("class").indexOf('error') > 0) {
                next.text(message);
            } else {
                $element.after("<p class='error'>" + message + "</p>");
            }
        },
        
        ajaxError: function(message) {
        	var next = $j("#ajaxResult").next();
        	if (next != null && next.prop("class") != null && next.prop("class").indexOf('error') > 0) {
        		next.text(message);
        	} else {
        		$j("#ajaxResult").after("<p class='error'>" + message + "</p>");
        	}
        },

        doValidate: function() {
            var errorFound = false;

            var name = $j('input[id="debrepo.name"]');
            if (name.val() == "") {
                this.error(name, "Please set the repository name");
                errorFound = true;
            }

            return !errorFound;
        },
        
		getWebHookTemplateData: function (templateName, buildTemplateId, action) {
			this.disableCheckboxes();
			this.clearEditor();
			this.getTemplateData(templateName, buildTemplateId, action);
		},
		putWebHookTemplateData: function () {
			this.disableCheckboxes();
			this.updateJsonDataFromForm();
			this.putTemplateData();
		},
		postWebHookTemplateData: function () {
			this.disableCheckboxes();
			this.updateJsonDataFromForm();
			this.postTemplateData();
		},
		disableCheckboxes: function () {
			$j("#editTemplateForm input.buildState").prop("disabled", true);
			$j("#editTemplateForm label").addClass("checkboxLooksDisabled");
		},
		enableCheckboxes: function () {
			$j("#editTemplateForm input.buildState").prop("disabled", false);
		},
		updateJsonDataFromForm: function () {
			myJson.templateText.content = editor.getValue();
			myJson.templateText.useTemplateTextForBranch = $j("#editTemplateForm input#useTemplateTextForBranch").is(':checked');
			myJson.branchTemplateText.content = editorBranch.getValue();
			
    		$j(myJson.state).each(function() {
    			//console.log(this.type + " :: "+ this.enabled);
    			this.enabled = $j("#editTemplateForm input[id='" + this.type + "']").prop( "checked");
    		});

		},
		clearEditor: function () {
			editor.session.setValue("Loading...");
			editorBranch.session.setValue("Loading...");
		},
		getParentTemplateData: function (templateName, buildTemplateId, action) {
			/* This method is used if the payload template does not have a default template.
			 * In that case, we don't have info about the parent template, so we request it here
			 * and graft it into the json request. 
			 * 
			 * Next we initialise the states as all editable and then iterate over any
			 * Build Event Templates  in the templateItem[] and set editable:false for any states 
			 * which already have a template defined. 
			 */
			var dialog = this;
			$j.ajax ({
				url: window['base_uri'] + '/app/rest/webhooks/templates/id:' + templateName,
				type: "GET",
				headers : {
					'Accept' : 'application/json'
				},
				success: function (response) {
					myJson = { 
							parentTemplate : response,
							templateText : { content: "" },
							branchTemplateText :  { content: "" },
							state : [ 
										{ type: "buildStarted", 		 enabled : false, editable: true },
										{ type: "changesLoaded", 		 enabled : false, editable: true },
										{ type: "buildInterrupted", 	 enabled : false, editable: true },
										{ type: "beforeBuildFinish", 	 enabled : false, editable: true },
										{ type: "buildSuccessful", 		 enabled : false, editable: true },
										{ type: "buildFailed", 			 enabled : false, editable: true },
										{ type: "buildFixed", 			 enabled : false, editable: true },
										{ type: "buildBroken", 			 enabled : false, editable: true },
										{ type: "responsibilityChanged", enabled : false, editable: true }
									]					
					};
					
					if (typeof myJson.parentTemplate.templateItem !== 'undefined' 
						&& myJson.parentTemplate.templateItem != null 
						&& myJson.parentTemplate.templateItem.length > 0) 
					{
						$j(myJson.parentTemplate.templateItem).each(function(thing, templateItem) {
							//console.log(templateItem);
							//console.log(templateItem.enabled);
							$j(templateItem.state).each(function(index, itemState){
								if (itemState.enabled) {
									$j(myJson.state).each(function(thang, state) {
										//console.log(state);
										if (state.type == itemState.type) {
											//console.log("they match " + state + templateItem);
											state.editable = false;
										}
									});
								}
							});
						});
					}

					//console.log(myJson);
					dialog.handleGetSuccess(action);
				}
			});
		}, 
		getTemplateData: function (templateName, buildTemplateId, action) {
			var dialog = this;
    		$j.ajax ({
    			url: window['base_uri'] + '/app/rest/webhooks/templates/id:' + templateName + '/templateItem/' + buildTemplateId + '?fields=$long,useTemplateTextForBranch,href,parentTemplate,content',
    		    type: "GET",
    		    headers : {
    		        'Accept' : 'application/json'
    		    },
    		    success: function (response) {
    				myJson = response;
    				//console.log(myJson);
    				dialog.handleGetSuccess(action);
    		    }
    		});
		}, 
		getTemplateDataOrGetParentOnFailure: function (templateName, buildTemplateId, action) {
			var dialog = this;
			$j.ajax ({
				url: window['base_uri'] + '/app/rest/webhooks/templates/id:' + templateName + '/templateItem/' + buildTemplateId + '?fields=$long,useTemplateTextForBranch,href,parentTemplate,content',
				type: "GET",
				headers : {
					'Accept' : 'application/json'
				},
				success: function (response) {
					myJson = response;
					//console.log(myJson);
					dialog.handleGetSuccess(action);
				},
				error: function (xhr, ajaxOptions, thrownError) {
					console.log(xhr);
					console.log(ajaxOptions);
					console.log(thrownError);
					if (xhr.status == 404) {
						dialog.getParentTemplateData(templateName, buildTemplateId, action);
					}
				}
			});
		}, 
		handleGetSuccess: function (action) {
			$j("#templateHeading").html(myJson.parentTemplate.description);
			this.updateCheckboxes(action);
			this.updateEditor(action);
		},
		putTemplateData: function () {
			var dialog = this;
			$j.ajax ({
				url: myJson.href,
				type: "PUT",
				data: JSON.stringify(myJson),
				dataType: 'json',
				headers : {
					'Content-Type' : 'application/json',
					'Accept' : 'application/json'
				},
				success: function (response) {
					//console.log(response);
					dialog.close();
					$("buildEventTemplatesContainer").refresh();
				},
				error: function (response) {
					console.log(response);
					alert(response);
				}
			});
		}, 
		postTemplateData: function () {
			var dialog = this;
			//console.log($j("input[id='WebhookTemplateaction']").val());
			var templateSubUri = "/templateItem";
			if ($j("input[id='WebhookTemplateaction']").val() === "addDefaultTemplate") {
				templateSubUri = "/defaultTemplate";
			}
			$j.ajax ({
				url: myJson.parentTemplate.href + templateSubUri,
				type: "POST",
				data: JSON.stringify(myJson),
				dataType: 'json',
				headers : {
					'Content-Type' : 'application/json',
					'Accept' : 'application/json'
				},
				success: function (response) {
					dialog.close();
					$("buildEventTemplatesContainer").refresh();
				},
				error: function (response) {
					console.log(response);
					alert(response);
				}
			});
		}, 
		handlePutSuccess: function () {
			$j("#templateHeading").html(myJson.parentTemplateDescription);
			this.updateCheckboxes();
			this.updateEditor();
		},
		updateCheckboxes: function (action) {
			
        	if (action === 'copyBuildEventTemplate' || action === 'addBuildEventTemplate') {
        		if (myJson.id == 'defaultTemplate') {
            		$j(myJson.state).each(function() {
            			//console.log(this.type + " :: "+ this.enabled);
            			$j("#editTemplateForm input[id='" + this.type + "']").prop( "checked", false).prop( "disabled", ! this.enabled);
            			if (this.enabled) {
            				$j("#editTemplateForm td[class='" + this.type + "'] label").removeClass("checkboxLooksDisabled");
            			}
            		});
        		} else {
            		$j(myJson.state).each(function() {
            			//console.log(this.type + " :: "+ this.enabled);
            			$j("#editTemplateForm input[id='" + this.type + "']").prop( "checked", false).prop( "disabled", ! this.editable && ! this.enabled);
            			if (this.editable && ! this.enabled) {
            				$j("#editTemplateForm td[class='" + this.type + "'] label").removeClass("checkboxLooksDisabled");
            			}
            		});
        		}
        		myJson.id = '_new';
        	} else {
	    		$j(myJson.state).each(function() {
	    			//console.log(this.type + " :: "+ this.enabled);
	    			$j("#editTemplateForm input[id='" + this.type + "']").prop( "checked", this.enabled).prop( "disabled", ! this.editable);
	    			if (this.editable) {
	    				$j("#editTemplateForm td[class='" + this.type + "'] label").removeClass("checkboxLooksDisabled");
	    			}
	    		});
        	}
        	
        	if (action === 'addDefaultTemplate' || action === 'addBuildEventTemplate') {
	    		$j("#editTemplateForm input[id='useTemplateTextForBranch']").prop( "checked", false).prop( "disabled", false);
				$j("label.useTemplateTextForBranch").removeClass("checkboxLooksDisabled");
				myJson.id = '_new';
        	} else {
	    		$j("#editTemplateForm input[id='useTemplateTextForBranch']").prop( "checked", myJson.templateText.useTemplateTextForBranch).prop( "disabled", false);
				$j("label.useTemplateTextForBranch").removeClass("checkboxLooksDisabled");
			}
		},
		updateEditor: function (action) {
			if (action === 'addDefaultTemplate' || action === 'addBuildEventTemplate') {
				editor.session.setValue("");
				editorBranch.session.setValue("");				
			} else {
				//console.log(myJson.templateText.content);
				editor.session.setValue(myJson.templateText.content);
				editorBranch.session.setValue(myJson.branchTemplateText.content);
			}
		},
		
		doPost: function() {
			//console.log(myJson);
			if (myJson.id == '_new' || myJson.id == '_copy') {
				this.postWebHookTemplateData();
			} else {
				this.putWebHookTemplateData();
			}
			return false;
		}
    })),
    
    DeleteTemplateItemDialog: OO.extend(BS.AbstractWebForm, OO.extend(BS.AbstractModalDialog, {
    	getContainer: function () {
    		return $('deleteTemplateItemDialog');
    	},
    	
    	formElement: function () {
    		return $('deleteTemplateItemForm');
    	},
    	
    	showDialog: function (title, action, data) {
    		$j("input[id='WebhookTemplateaction']").val(action);
    		$j(".dialogTitle").html(title);
    		this.cleanFields(data);
    		this.cleanErrors();
    		this.showCentered();
    	},
    	
    	cleanFields: function (data) {
    		$j("#deleteTemplateItemForm input[id='templateName']").val(data.templateName);
    		$j("#deleteTemplateItemForm input[id='templateNumber']").val(data.templateNumber);
    		this.cleanErrors();
    	},
    	
    	cleanErrors: function () {
    		$j("#deleteTemplateItemForm .error").remove();
    	},
    	
    	error: function($element, message) {
    		var next = $element.next();
    		if (next != null && next.prop("class") != null && next.prop("class").indexOf('error') > 0) {
    			next.text(message);
    		} else {
    			$element.after("<p class='error'>" + message + "</p>");
    		}
    	},
    	
    	ajaxError: function(message) {
    		var next = $j("#ajaxDeleteResult").next();
    		if (next != null && next.prop("class") != null && next.prop("class").indexOf('error') > 0) {
    			next.text(message);
    		} else {
    			$j("#ajaxDeleteResult").after("<p class='error'>" + message + "</p>");
    		}
    	},
    	
    	doPost: function() {
    		this.cleanErrors();
    		
			var dialog = this;
			//console.log($j("input[id='WebhookTemplateaction']").val());
			
			var templateName = $j("#deleteTemplateItemForm input[id='templateName']").val()
			var templateNumber = $j("#deleteTemplateItemForm input[id='templateNumber']").val()
			
			$j.ajax ({
				url: window['base_uri'] + '/app/rest/webhooks/templates/id:' + templateName + '/templateItem/' + templateNumber,
				type: "DELETE",
				headers : {
					'Content-Type' : 'application/json',
					'Accept' : 'application/json'
				},
				success: function (response) {
					dialog.close();
					$("buildEventTemplatesContainer").refresh();
				},
				error: function (response) {
					console.log(response);
					alert(response);
				}
			});
    		
    		return false;
    	}
    })),
    
    DeleteTemplateDialog: OO.extend(BS.AbstractWebForm, OO.extend(BS.AbstractModalDialog, {
    	getContainer: function () {
    		return $('deleteTemplateDialog');
    	},
    	
    	formElement: function () {
    		return $('deleteTemplateForm');
    	},
    	
    	showDialog: function (title, action, data) {
    		$j("input[id='WebhookTemplateaction']").val(action);
    		$j(".dialogTitle").html(title);
    		this.cleanFields(data);
    		this.cleanErrors();
    		this.showCentered();
    	},
    	
    	cleanFields: function (data) {
    		$j("#deleteTemplateForm input[id='templateName']").val(data.templateName);
    		this.cleanErrors();
    	},
    	
    	cleanErrors: function () {
    		$j("#deleteTemplateForm .error").remove();
    	},
    	
    	error: function($element, message) {
    		var next = $element.next();
    		if (next != null && next.prop("class") != null && next.prop("class").indexOf('error') > 0) {
    			next.text(message);
    		} else {
    			$element.after("<p class='error'>" + message + "</p>");
    		}
    	},
    	
    	ajaxError: function(message) {
    		var next = $j("#ajaxDeleteResult").next();
    		if (next != null && next.prop("class") != null && next.prop("class").indexOf('error') > 0) {
    			next.text(message);
    		} else {
    			$j("#ajaxDeleteResult").after("<p class='error'>" + message + "</p>");
    		}
    	},
    	
    	doPost: function() {
    		this.cleanErrors();
    		
    		var dialog = this;
    		console.log($j("input[id='WebhookTemplateaction']").val());
    		
    		var templateName = $j("#deleteTemplateForm input[id='templateName']").val()
    		
    		$j.ajax ({
    			url: window['base_uri'] + '/app/rest/webhooks/templates/id:' + templateName,
    			type: "DELETE",
    			headers : {
    				'Content-Type' : 'application/json',
    				'Accept' : 'application/json'
    			},
    			success: function (response) {
    				dialog.close();
    				window.location = window['base_uri'] + '/webhooks/templates.html';
    			},
    			error: function (response) {
    				console.log(response);
    				alert(response);
    			}
    		});
    		
    		return false;
    	}
    }))
};

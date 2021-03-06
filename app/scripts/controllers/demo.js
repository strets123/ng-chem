'use strict';

/**
 * @ngdoc function
 * @name ngChemApp.controller:DemoCtrl
 * @description
 * # DemoCtrl
 * Controller of the ngChemApp
 */
var app = angular.module('ngChemApp');


app.controller('DemoCtrl', ['$scope', '$rootScope', '$state', 'ChEMBLFactory', 'MessageFactory', 'CBHCompoundBatch', '$cookies', '$timeout', '$stateParams', 'projectKey', 'prefix', 'urlConfig', 'projectFactory',
    function($scope, $rootScope, $state, ChEMBLFactory, MessageFactory, CBHCompoundBatch, $cookies, $timeout, $stateParams, projectKey, prefix, urlConfig, projectFactory) {
        $scope.proj = {}

        $scope.projects = $scope.cbh.projects.objects;
        angular.forEach($scope.projects, function(proj) {
            if (proj.project_key == projectKey) {
                $scope.proj = proj;
                $rootScope.projName = proj.name;
                $rootScope.headline = "Back to " + $scope.proj.name + " project page";
                $scope.myschema = proj.schemaform.schema;
                $scope.myform = angular.copy(proj.schemaform.form);
                $scope.myformmappingpage = angular.copy(proj.schemaform.form);

                var len = Math.ceil(proj.schemaform.form.length / 2);
                $scope.firstForm = angular.copy(proj.schemaform.form).splice(0, len);
                $scope.secondForm = angular.copy(proj.schemaform.form).splice(len);
            }
        });

        $scope.urlConfig = urlConfig;
        var arr = window.location.href.split("/");
        $scope.myUrl = arr[0] + "//" + arr[2];
        $scope.csrftoken = $cookies[prefix.split("/")[0] + "csrftoken"];

        $scope.flowinit = {
            target: urlConfig.instance_path.url_frag + 'flow/upload/',
            headers: {
                'X-CSRFToken': $scope.csrftoken
            }
        };
        $scope.addCustomField = function() {
            var newItemNo = $scope.cust_fields_count + 1;
            $scope.molecule.metadata.custom_fields.push({
                'name': '',
                'value': '',
                'id': newItemNo
            });
            $scope.cust_fields_count++;
        };
        $scope.filedata = {};
        $scope.removeCustomField = function(number) {

            var filteredFields = $scope.molecule.metadata.custom_fields.filter(function(element) {
                return element.id != number;
            });

            $scope.molecule.metadata.custom_fields = filteredFields;


        };
        $rootScope.headline = "Back to " + $scope.proj.name + " project page";
        $rootScope.subheading = "Welcome to the ChemReg wizard"
        $rootScope.glyphicon = "arrow-left";
        // $rootScope.tophref = (urlConfig.instance_path.url_frag.split("/")[0] + "/#/projects/list/" + projectKey).replace("/dev/","");
        $rootScope.topLink = function() {
            $state.go("cbh.projects.list.project", {
                "projectKey": projectKey
            });
        }
        $scope.processingSingle = false;
        $scope.processingMultiBatch = false;
        $scope.tagFunction = function(content) {
            var item = {
                value: content,
                label: content,
                description: '',
                group: ''
            }
            return item;
        };



        $scope.testData = {};

        //User has pressed cancel or finished a registration - clear out all of the populated data
        $scope.startAgain = function(flowfiles) {
            $scope.justSaved = false;
            $scope.processingMultiBatch = false;
            $scope.processingSingle = false;
            $scope.struc_col_selected = {
                name: "",
                value: "Please select"
            };
            $scope.format_not_detected = false;
            $scope.file_error = "";
            $scope.file_format_not_detected = "";
            $scope.singleMol = CBHCompoundBatch.getSingleMol(); //
            $scope.finalData = {
                "objects": []
            }; //
            $scope.custom_field_mapping = {}; //
            $scope.warningNumber = 0; //
            $scope.uploaded_file_name = ""; //
            $scope.file_extension = "";
            $scope.filesInProcessing = false;

            $scope.struc_col_options = [{
                name: "",
                value: "No structure"
            },

            ]; //
            $scope.struc_col_str = ""; //
            $scope.validated = {
                "warnings": {
                    "inorganicCount": "0",
                    "painsCount": "0",
                    "saltCount": "0",
                    "tautomerCount": "0"
                }
            }; //
            $scope.validatedData = {}; //
            $scope.input_string = {
                "inputstring": "",
                "dataTypes": ["Auto-detect", "Smiles", "INCHI"],
                "dataTypeSelected": "Auto-detect"
            };
            
            angular.forEach(flowfiles, function(file) {
                file.cancel();
            });
            $scope.headers_not_retrieved = false;
            $scope.ids_not_processed = false;
            $scope.molecule = {
                'molfile': "",
                'molfileChanged': function() {
                    if ($scope.molecule.molfile) {
                        CBHCompoundBatch.validate(projectKey, $scope.molecule.molfile).then(
                            function(data) {
                                $scope.validatedData = {
                                    'errors': 0,
                                    'linkedproject': data.data.warnings.linkedproject,
                                    'new': 1 - data.data.warnings.linkedproject
                                };

                                $scope.validated = data.data;
                            },
                            function(error) {
                                $scope.validatedData = {
                                    'singleerror': 'Invalid valency of sketched molecule - this cannot be registered at this time',
                                    'errors': 1,
                                    'linkedproject': 0,
                                    'new': 0
                                };

                            });
                    } else {
                        $scope.validatedData = {
                            'singleerror': 'No Molecule',
                            'errors': 1,
                            'linkedproject': 0,
                            'new': 0
                        };

                    }
                },
                'metadata': {
                    'stereoSelected': {
                        name: '-1',
                        value: 'as drawn'
                    },
                    'labbook_id': '',
                    'custom_fields': [

                    ],
                    'projectFields': {}



                }

            };

            $scope.cust_fields_count = 0
            $scope.custom_fields = [];
            $scope.custom_field_choices = [];
            //do we need any back-end resetting here?

        };


        $scope.cancelFile = function(field) {
            $scope.headers_not_retrieved = false;
            $scope.file_error = false;
            $scope.file_format_not_detected = false;
            $scope.filesInProcessing = false;
            $scope.validatedData = {};
        }

        $scope.startAgain([]);
        $scope.formData = {};



        $scope.myData = [];

        //config object for the progress bar
        $scope.wizard = {
            'step': 0,
            'totalSteps': 4,
            'dynamic': 0,
            'max': 100,
        };




        $scope.alerts = [
            /*{ type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' }*/
        ];


        $scope.parsed_input = [{
            "smiles": "COc1ccc2[C@@H]3[C@H](COc2c1)C(C)(C)OC4=C3C(=O)C(=O)C5=C4OC(C)(C)[C@H]6COc7cc(OC)ccc7[C@@H]56",
            "chemblId": "CHEMBL446858",
            "passesRuleOfThree": "No",
            "molecularWeight": 544.59,
            "molecularFormula": "C32H32O8",
            "acdLogp": 7.67,
            "knownDrug": "No",
            "stdInChiKey": "GHBOEFUAGSHXPO-UWXQAFAOSA-N",
            "species": null,
            "synonyms": null,
            "medChemFriendly": "Yes",
            "rotatableBonds": 2,
            "acdBasicPka": null,
            "alogp": 3.63,
            "preferredCompoundName": null,
            "numRo5Violations": 1,
            "acdLogd": 7.67,
            "acdAcidicPka": null
        }, {
            "smiles": "CN1C(=O)N(C)c2ncn(C)c2C1=O",
            "chemblId": "CHEMBL113",
            "passesRuleOfThree": "Yes",
            "molecularWeight": 194.19,
            "molecularFormula": "C8H10N4O2",
            "acdLogp": -0.63,
            "knownDrug": "Yes",
            "stdInChiKey": "RYYVLZVUVIJVGH-UHFFFAOYSA-N",
            "species": "NEUTRAL",
            "synonyms": "Coffeine,SID104171124,SID11110908,Methyltheobromine,Caffeine,Cafcit,NoDoz Caplets and Chewable Tablets,SID124879556,Theine",
            "medChemFriendly": "Yes",
            "rotatableBonds": 0,
            "acdBasicPka": 0.52,
            "alogp": -0.10,
            "preferredCompoundName": "CAFFEINE",
            "numRo5Violations": 0,
            "acdLogd": -0.63,
            "acdAcidicPka": null
        }];
        $scope.parsed_input.map(function(d) {
            d.smiles = btoa(d.smiles)
        });

      

        $scope.assignFileId = function(id, ext, file) {
            $scope.startAgain();
            $scope.uploaded_file_name = id;
            $scope.file_extension = ext;
            $scope.headers_not_retrieved = false;
            $timeout($scope.parseHeaders, 100);
        }

        $scope.setDragModels = function(){
            $scope.dragmodels.lists.headers = [];
                angular.copy($scope.struc_col_options).slice(1).map(function(d){
                    if($scope.struc_col_str === d.name){
                        $scope.binmodels.lists.ignored.push(d);
                    }else{
                        $scope.dragmodels.lists.headers.push(d);
                    }
            });
        }
        $scope.mapFilePage = function() {
            $scope.setDragModels();

            if ($scope.file_extension == "cdx" || $scope.file_extension == "cdxml" || $scope.file_extension == "" || $scope.dragmodels.lists.headers.length == 0) {
                $state.go("cbh.projects.project.demo.map.multiple", {
                    'multiple_batch_id': $scope.validatedData.currentBatch
                });
            } else {
                $state.go("cbh.projects.project.demo.map.file", {
                    'multiple_batch_id': $scope.validatedData.currentBatch
                });
            }
        }
        $scope.validatePage = function() {
            if($scope.isFileExcel() && $scope.isStrucColUnspecified()){
                $scope.processFiles();
            }else{
                $state.go("cbh.projects.project.demo.validate", {
                    'multiple_batch_id': $scope.validatedData.currentBatch
                });
            }
            

        }
        $scope.isFileExcel = function() {
            return ($scope.file_extension == 'xls' || $scope.file_extension == 'xlsx');
        }

        $scope.parseInput = function() {

            $scope.filedata.flow.files = [];
            $scope.validatedData = {};
            $scope.ids_not_processed = false;
            $scope.format_not_detected = false;
            $scope.input_string.splitted = {}
            var split = splitInput($scope.input_string.inputstring, $scope.dataTypeSelected);
            if ($scope.input_string.dataTypeSelected != "Auto-detect") {
                //Override if user sets a preference
                split.type = scope.input_string.dataTypeSelected;
            } else {
                if (split.type == "unknown") {
                    $scope.format_not_detected = true;
                }

            }

            $scope.input_string.splitted = split;
            if (split) {
                $scope.processInput();
            }


        };

        $scope.processInput = function() {
            $scope.inProcessing = true;
            CBHCompoundBatch.validateList(projectKey, $scope.input_string.splitted).then(
                function(data) {
                    $scope.validatedData = data;
                    $scope.inProcessing = false;
                },
                function(error) {
                    $state.go('cbh.projects.project.demo.add.multiple');
                    $scope.ids_not_processed = true;
                });

        };

        //export our resultset to either SD or Excel files
        //if user has uploaded an Excel file, use that and create a new worksheet in the file with the exported data
        //if the user has uploaded a SD file, use that and add our data to the existing molecules
        $scope.export = function(file_type) {
            /*CBHCompoundBatch.export(file_type).then(
                function(data) {
                    console.log(data);
                }
            )*/
            CBHCompoundBatch.query({
                multiple_batch_id: $scope.validatedData.currentBatch,
                format: file_type
            }).then(function(result) {
                //$scope.finalData.objects = result.objects;
            });
        }



        $scope.$watch('validated', function() {
            $scope.warningNumber = parseInt($scope.validated.warnings.inorganicCount) + parseInt($scope.validated.warnings.tautomerCount) + parseInt($scope.validated.warnings.saltCount) + parseInt($scope.validated.warnings.painsCount);
        });

        $scope.addAlert = function(message, alert_type) {
            $scope.alerts.push({
                msg: message || 'There has been an error!',
                type: alert_type || "danger"
            });
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        //$scope.stereoSelected = { name:'1', value:'as drawn'};
        //call this to save data to the DB
        $scope.saveSingleMol = function() {
            //send this to the service for saving data
            //form fields bound to the scope molecule object
            //this may be performed during the transition to the finish page - any results to be shown need a promise for that page.

            //submit
            $scope.processingSingle = true;


            $scope.finalData.objects = [];
            $scope.singleMol = CBHCompoundBatch.getSingleMol(projectKey);
            CBHCompoundBatch.saveSingleCompound(projectKey,
                $scope.molecule.molfile,
                $scope.molecule.metadata.projectFields,
                $scope.molecule.metadata.stereoSelected

            ).then(
                function(data) {
                    $scope.molecule.metadata.projectFields = {};
                    $scope.processingSingle = false;
                    $scope.singleMol = data.data;
                    $scope.finalData.objects.push(data.data);
                    $scope.validatedData.currentBatch = data.data.multipleBatchId;
                    $state.go("cbh.projects.project.demo.map.finish", {
                        'multiple_batch_id': $scope.validatedData.currentBatch,
                        limit: 10000,
                        offset: 0
                    });
                },
                function(error) {
                    $scope.processingSingle = false;

                });

        };





        $scope.messages = MessageFactory.getMessages();

        $scope.saveMultiBatchMolecules = function() {

            CBHCompoundBatch.saveMultiBatchMolecules(projectKey, $scope.validatedData.currentBatch, $scope.molecule.metadata.projectFields).then(
                function(data) {
                    $scope.molecule.metadata.projectFields = {};
                    $state.go("cbh.projects.project.demo.map.finish", {
                        'multiple_batch_id': $scope.validatedData.currentBatch,
                        limit: 10000,
                        offset: 0
                    });
                    $scope.processingMultiBatch = false;
                    $scope.justSaved = true;
                },
                function(error) {
                    $scope.molecule.metadata.projectFields = {};
                    $scope.validated = {
                        'errors': {
                            'invalidMolecule': true
                        }
                    };
                    $scope.processingMultiBatch = false;
                });
        };

        //for the mapping step of lists of smiles/inchis
        $scope.mapCustomFieldsToMols = function(isFile) {
            var mapping_obj = false;
            if (isFile) {
                mapping_obj = $scope.saveCustomFieldMapping();
            }
            $scope.processingMultiBatch = true;
            CBHCompoundBatch.saveBatchCustomFields(projectKey, $scope.validatedData.currentBatch, $scope.molecule.metadata.projectFields, mapping_obj).then(
                function(data) {
                    //$scope.validatedData = (data.data);
                    $scope.saveMultiBatchMolecules();
                },
                function(error) {
                    console.log(error);
                    $scope.processingMultiBatch = false;
                }
            );

        };



        $scope.automap = function() {
            angular.forEach($scope.dropmodels.lists, function(value) {
                angular.forEach($scope.dragmodels.lists.headers, function(hdr, k) {
                    if (hdr.name == value.name) {
                        $scope.dragmodels.lists.headers.splice(k, 1);
                        value.list.push(hdr);
                    }
                });
            });
        };


        $scope.setupMapping = function() {
            //set up test lists of droppables here
            $scope.dragmodels = {
                selected: null,
                lists: {
                    "headers": []
                }
            };
            $scope.dropmodels = {
                selected: null,
                lists: [] //will be replaced by database fields
            }
            $scope.binmodels = {
                selected: null,
                lists: {
                    "ignored": []
                } //will be replaced by database fields
            }
            angular.copy($scope.myformmappingpage).map(function(i){
                i.name=i.key; 
                i.list = [];
                $scope.dropmodels.lists.push(i); 
                                
            });
        }
        $scope.setupMapping();
        $scope.saveCustomFieldMapping = function() {
            //create a new json object containing the drag, drop and bin models as they are
            //pass to the backend to rationalise when reading the file
            //translate appropriate datafields so that they go into custom_fields under the correct parameter. (dropmodels)
            //use others as-is (dragmodels)
            //and do not add the rest (binmodels)
            var mapping_obj = {};
            mapping_obj.new_fields = []
            mapping_obj.remapped_fields = []
            angular.forEach($scope.dragmodels.lists.headers, function(value, key) {
                mapping_obj.new_fields.push(value);
            });
            angular.forEach($scope.dropmodels.lists, function(value) {
                mapping_obj.remapped_fields.push(value)
            });

            //mapping_obj.remapped_fields = $scope.dropmodels.lists
            mapping_obj.ignored_fields = $scope.binmodels.lists.ignored

            return mapping_obj;

        };


        $scope.resetMappingForm = function() {
            //put all the draggable fields back to where they came from (assuming no automapping is displayed)
            $scope.setupMapping();
            $scope.setDragModels();

        };

        $scope.updateStrucCol = function(str) {
            //If it is a real structure column then try to process the file
            if (str != "No structure") {
                $scope.struc_col_str = str;
                $scope.processFiles();
                
            }else{
                $scope.struc_col_str = "";
                $scope.cancelFile();
            }
        }

        $scope.parseHeaders = function() {
            //call service to pull out headers from uploaded file
            //service backend detects file type
            //returns object which is populated into the list for map page
            $scope.filesInProcessing = true;
            if ($scope.file_extension == "cdx" || $scope.file_extension == "cdxml") {
                $scope.processFiles();
            } else {
                $scope.dragmodels.lists.headers = [];
                $scope.setupMapping();
                $scope.file_error = "";
                $scope.file_format_not_detected = "";
                CBHCompoundBatch.fetchHeaders(projectKey, $scope.uploaded_file_name).then(

                    function(data) {

                        //do something with the returned data
                        angular.forEach(data.data.headers, function(value, key) {
                            // $scope.dragmodels.lists.headers.push({
                            //     label: value
                            // });
                            $scope.struc_col_options.push({
                                name: value,
                                value: value
                            });
                        });
                        //Now try to prcess the fiel to avoid concurrency issues
                        if (!$scope.isFileExcel()) {
                            $scope.processFiles();
                        }else{
                            $scope.filesInProcessing = false;
                        }
                    },
                    function(error) {
                        $scope.headers_not_retrieved = true;
                        $scope.filesInProcessing = false;
                    });
                    
            }
        };
        //convert our molfile or excel file containing smiles into CBHCompoundBatch objects 
        //so they can be used in the validate methods provided for SMILES/InChi lists
        //this method also needs to pass the field mapping from the map page
        $scope.processFiles = function() {
            CBHCompoundBatch.validateFiles(projectKey, $scope.uploaded_file_name, $scope.struc_col_str).then(
                function(data) {
                    $scope.validatedData = data;
                    $scope.filesInProcessing = false;
                    if($scope.isFileExcel() && $scope.isStrucColUnspecified()){
                    
                        $state.go("cbh.projects.project.demo.validate", {
                            'multiple_batch_id': $scope.validatedData.currentBatch
                        });
                    }
                },
                function(error) {
                    if (error.data.error == "Invalid File Format") {
                        $scope.file_format_not_detected = "Invalid File Format";
                        $scope.filesInProcessing = false;

                    } else {
                        $scope.filesInProcessing = false;
                        $scope.file_error = "file_not_processed";
                    }
                }
            )

        }



        

       

        $scope.getMessage = function(lookup_str) {
            return MessageFactory.getMessage(lookup_str);

        };

        $scope.isStrucColUnspecified = function() {
            //indicates to the "next" button on mapping files page that the structure column has been specified
            return ($scope.struc_col_str == "");
        }




    }
]);

app.controller('MessageCtrl', function($scope) {


});
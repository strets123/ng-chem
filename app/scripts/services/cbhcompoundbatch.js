'use strict';

/**
 * @ngdoc service
 * @name ngChemApp.CBHCompoundBatch
 * @description
 * # CBHCompoundBatch
 * Factory in the ngChemApp.
 */
angular.module('ngChemApp')
  .factory('CBHCompoundBatch', ['$http', '$q','urlConfig'  ,function ($http, $q  ,urlConfig, cbh_compound_batches) {
    // Service logic
    // ...

    var CBHCompoundBatch = {};


    CBHCompoundBatch.getSingleMol = function(){
        return { acdAcidicPka: null,
                         acdBasicPka: null,
                         acdLogd: null,
                         acdLogp: null,
                         alogp: null,
                         chemblId: "",
                         created: "",
                         ctab: "",
                         customFields: {},
                         editableBy: {},
                         id: null,
                         knownDrug: 0,
                         medChemFriendly: null,
                         modified: "",
                         molecularFormula: "",
                         molecularWeight: null,
                         numRo5Violations: null,
                         passesRuleOfThree: null,
                         preferredCompoundName: null,
                         rotatableBonds: 0,
                         smiles: "",
                         species: null,
                         stdCtab: "",
                         stdInChiKey: "",
                     };
    }

    CBHCompoundBatch.validateList = function(projectKey, values){
        values.projectKey = projectKey;
        var promise = $http.post( urlConfig.cbh_compound_batches.list_endpoint  + "/validate_list/" , values).then(
            function(data){
                return data.data;
            }
        );
        return promise;
    }
    CBHCompoundBatch.validate = function(projectKey, data) {
        data.projectKey = projectKey;
      return $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/validate/", {"ctab":data, "projectKey": projectKey});
    };



    CBHCompoundBatch.saveSingleCompound = function(projectKey, molfile, customFields, stereoSelected) {

        return $http.post( urlConfig.cbh_compound_batches.list_endpoint +"/" , {"projectKey": projectKey ,ctab:molfile, "customFields":prepCustomFields(customFields) , "stereoSelected" : stereoSelected});
    };

    CBHCompoundBatch.saveMultiBatchMolecules = function(projectKey, currentBatch, customFields) {

        return $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/multi_batch_save/", {"projectKey": projectKey, "currentBatch":currentBatch, "customFields": customFields,});
    };

    CBHCompoundBatch.validateBatch = function(projectKey,molfiles) {

        return $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/bulk/validate", {"projectKey": projectKey, ctab:molfile });
    };

    CBHCompoundBatch.uploadBatch = function(projectKey, molfiles) {

        return $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/bulk/upload", {"projectKey": projectKey,ctab:molfile });
    };

    CBHCompoundBatch.fetchHeaders = function(projectKey, file_name) {

        return $http.post( urlConfig.cbh_batch_upload.list_endpoint + "/headers/", {"projectKey" :projectKey, file_name:file_name });
    };

    CBHCompoundBatch.fetchExistingFields = function(projectKey) {
        return $http.post ( urlConfig.cbh_compound_batches.list_endpoint + "/existing/", {"projectKey" :projectKey});
    };
    CBHCompoundBatch.query = function(projectKey,filters) {
        console.log(urlConfig);
        filters.projectKey = projectKey;
        filters.project__project_key = projectKey;
         var promise = $http( 
            {
                url: urlConfig.cbh_compound_batches.list_endpoint,
                method: 'GET',
                params: filters
            }
            ).then(
            function(data){
                return data.data;
            }
        );
        return promise;
    };
    CBHCompoundBatch.paginate = function(page_url) {
        /*filters.projectKey = projectKey;
        filters.project__project_key = projectKey;*/
         var promise = $http( 
            {
                url: page_url,
                method: 'GET',
                //params: filters
            }
            ).then(
            function(data){
                return data.data;
            }
        );
        return promise;
    };
    /*CBHCompoundBatch.downloadURL = function(filters) {
        return urlConfig.cbh_compound_batches.list_endpoint + 
    };*/

    CBHCompoundBatch.saveBatchCustomFields = function(projectKey,currentBatch, customFields, mapping ) {

        return $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/multi_batch_custom_fields/", {"projectKey": projectKey, "currentBatch":currentBatch, "customFields": prepCustomFields(customFields), "mapping":mapping });
    }

    CBHCompoundBatch.validateFiles = function(projectKey,file_name, struc_col) {
        var promise = $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/validate_files/" , {"projectKey": projectKey, "file_name":file_name, "struc_col":struc_col}).then(
            function(data){
                return data.data;
            }
        );
        return promise;
    };
    CBHCompoundBatch.export = function(fileType, currentBatch) {
        return $http.get( urlConfig.cbh_compound_batches.list_endpoint, { "fileType":fileType, "currentBatch": currentBatch } );
    }

    return CBHCompoundBatch;

  }]);

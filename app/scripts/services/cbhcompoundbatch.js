'use strict';

/**
 * @ngdoc service
 * @name ngChemApp.CBHCompoundBatch
 * @description
 * # CBHCompoundBatch
 * Factory in the ngChemApp.
 */
angular.module('ngChemApp')
  .factory('CBHCompoundBatch', ['$compile', '$http', '$q','$cookies','urlConfig'  ,function ($compile, $http, $q , $cookies ,urlConfig, cbh_compound_batches) {

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
    };




    CBHCompoundBatch.getSearchResults = function(mb_id, limit, offset, filter, sorts){
            var params = {
                                    "limit" : limit,
                                    "offset" : offset,
                                    "current_batch" : mb_id, 
                                    "sorts" : sorts}
            if((filter.bool.must.length + filter.bool.must_not.length + filter.bool.should.length ) > 0){
              params.query = JSON.stringify(filter);
            }else{
              console.log(filter.bool);
            }
            var promise = $http.get(urlConfig.cbh_compound_batches.list_endpoint + "/get_part_processed_multiple_batch/"
                                ,{ params:params }  //JSON sorts string
                                );
            return  promise;  
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
      return $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/validate/", {"ctab":data, "projectKey": projectKey});

    };


    CBHCompoundBatch.createMultiBatch = function(currentDataset) {
        var canceller = $q.defer();
        var cancel = function(reason){
            canceller.resolve(reason);
        };
        currentDataset.cancellers.push(cancel);
        var promise = $http.post(urlConfig.cbh_compound_batches.list_endpoint + "/validate_files/"
                            ,currentDataset.config  ,
                            {
                              
                              timeout: canceller.promise,
                                         
                            });
        return  promise;
                  
  
    }


    CBHCompoundBatch.saveSingleCompound = function(projectKey, molfile, customFields, stereoSelected) {
        //Add a property to the molfile to say that this molecule has been hand drawn
        molfile += '\n>  <_drawingBondsWedged>\nTrue\n\n$$$$';
        return $http.post( urlConfig.cbh_compound_batches.list_endpoint +"/" , {"projectKey": projectKey ,ctab:molfile, "customFields":customFields , "stereoSelected" : "As Drawn"});

    };

    CBHCompoundBatch.saveMultiBatchMolecules = function(config) {
        return $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/multi_batch_save/", config);
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

    CBHCompoundBatch.query = function(filters) {
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


    CBHCompoundBatch.getImages = function(objects, imageSize, name, callback){
         var defer = $q.defer();
        var promises = [];


        angular.forEach(objects, function(obj){
            var siz = imageSize;
            if(name=="bigImageSrc"){
              if(obj.molecularWeight< 300){
                siz = 200;
              }
            }
            if(angular.isDefined(obj.ctab)){
              var params = {
                  size: siz,
                  ctab: obj.ctab,
                }
              }else{
                var params = {
                  size: siz,
                  ctab: "",
                }
              }
            
            if(angular.isDefined(obj.properties)){
              if(angular.isDefined(obj.properties.substructureMatch)){
                params.smarts = obj.properties.substructureMatch;
              }
            }
            
            promises.push($http({method:"POST", 
                url: "https://chembiohub.ox.ac.uk/utils/ctab2image",
                data: params, 
                headers: {'X-CSRFToken': undefined}}));

        });
        $q.all(promises).then(function(data){
          var index = 0;
          angular.forEach(data, function(d){
            if(d.data.toString()){
              objects[index].properties[name] = "data:image/png;base64," + d.data;
            }else{
              objects[index].properties[name] = "images/no-structure.png";
            }

            index ++;
          });
          if(angular.isDefined(callback)) {
              callback();
          }
          
          return data

          
        });
        return defer.promise;
    }

    CBHCompoundBatch.patch = function(data, projectKey){
        var promise = $http.patch(  urlConfig.cbh_compound_batches.list_endpoint + '/' + data.id + '/' ,       
                data
            ).then(
            function(data){
                return data.data;
            }
        );
        return promise;
    }

    CBHCompoundBatch.patchTempList = function(data){
        var promise = $http.post(  urlConfig.cbh_compound_batches.list_endpoint + '/update_temp_batches/' ,       
                data
            ).then(
            function(data){
                return data.data;
            }
        );
        return promise;
    }




    CBHCompoundBatch.search = function(searchForm) {
        var promise = $http({
            url:urlConfig.cbh_compound_batches.list_endpoint,
            method:'GET',
            params: searchForm,
            
        }).then(function(data){
            return data.data;
        });
        return promise;
    }

    CBHCompoundBatch.multiBatchForUser = function(username) {
        var promise = $http({
            url:urlConfig.cbh_multiple_batches.list_endpoint,
            method:'GET',
            params: {
                'created_by': username,
                'limit': 1000,
            },
        }).then(function(data){
            return data.data;
        });
        return promise;
    }

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

    CBHCompoundBatch.saveBatchCustomFields = function(config) {

        return $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/multi_batch_custom_fields/", config );
    }

    CBHCompoundBatch.validateFiles = function(projectKey,file_name, struc_col) {
        var promise = $http.post( urlConfig.cbh_compound_batches.list_endpoint + "/validate_files/" , {"projectKey": projectKey, "file_name":file_name, "struc_col":struc_col}).then(
            function(data){
                return data.data;
            }
        );
        return promise;
    };

//     CBHCompoundBatch.export = function(format, filters) {
//         var defer = $q.defer();
//         $http.get( urlConfig.cbh_compound_batches.list_endpoint, { params: filters } )
//           .then(function(result) {
//             // this callback will be called asynchronously
//             // when the response is available
//             /*var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
//             var objectUrl = URL.createObjectURL(blob);
//             window.location = objectUrl;*/
//             defer.resolve(result);
//           },
//           function() {
//             // called asynchronously if an error occurs
//             // or server returns response with an error status.
//             defer.reject();
//           });
//           return defer.promise;

//     }

//     CBHCompoundBatch.export = function(searchForm) {
//         var promise = $http({
//             url:myUrl,
//             method:'GET',
//             params: searchForm,
//             responseType: 'arraybuffer',
//             /*headers: {
//                'Content-Type': 'application/json'
//              }*/
//         }).then(function(data){
//             var blob = new Blob([data.data], {type: data.headers("Content-Type")});
//             return blob;
//         });
//         return promise;
// =======
//     CBHCompoundBatch.export = function(fileType, currentBatch) {
//         return $http.get( urlConfig.cbh_compound_batches.list_endpoint, { "fileType":fileType, "currentBatch": currentBatch } );
// >>>>>>> 4b81ee6b3e4fad06d378def1b1c42363caa9882c
//     }

    return CBHCompoundBatch;

  }]);

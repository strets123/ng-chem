'use strict';

/**
 * @ngdoc overview
 * @name ngChemApp
 * @description
 * # ngChemApp
 *
 * Main module of the application.
 */
angular.module('ngChemApp')


  .config(function ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
      
          // catch all route
    // send users to the form page 
    $urlRouterProvider.otherwise('/projects/list');

    /*$urlRouterProvider.rule(function ($injector, $location) {
       //what this function returns will be set as the $location.url
        var path = $location.path(), normalized = path.toLowerCase();
        if (path != normalized) {
            //instead of returning a new url string, I'll just change the $location.path directly so I don't have to worry about constructing a new url string and so a new state change is not triggered
            $location.replace().path(normalized);
        }
        // because we've returned nothing, no state change occurs
    });*/
      //$rootScopeProvider.digestTtl(15); 
      $urlMatcherFactoryProvider.defaultSquashPolicy("slash");      
      var modalInstance;
      $stateProvider
         .state('cbh', {
          url: '',
            /*data: {
              login_rule: ""
            },*/
            templateUrl: 'views/cbh.html',
            abstract : true,
            resolve: {

              projects: ['ProjectFactory', function(ProjectFactory){
                   return ProjectFactory.get({ "schemaform" : true}).$promise;
               }],
              
               loggedIn : ['LoginService', function(LoginService){
                  //   console.log("test");
                  // var login = ;
                   return LoginService.get().$promise;

               }],
              
            
            },
            controller:  function($scope, $rootScope, $state, $location, urlConfig, loggedIn, projects) {
                var cbh = this;
                cbh.logged_in_user = loggedIn.objects[0];
                cbh.projects = projects;
                cbh.prefix = "hub";
                cbh.searchPage =   function(){
                  $location.url('/search?limit=&offset=');
                }
                $scope.projects = projects.objects;
                 $scope.projects.map(function(proj){
                  if (!proj.is_default){
                    $scope.isDefault = false;
                  }
              });
                $scope.isLoggedIn = function() {
                var loggedIn = false;
                    if(cbh.logged_in_user.id > 0) {
                      loggedIn = true;
                    }
                    return loggedIn;
                };

                $rootScope.getUrlBase = function() {
                  return urlConfig.instance_path.url_frag;
                };

                $scope.getProjectObj = function(projectKey){
                  angular.forEach($scope.projects, function(proj){
                    if (projectKey == proj.project_key) {
                      return proj;
                    }
                  });
                };

            },
            controllerAs : "cbh",
            
         })

        // HOME STATES AND NESTED VIEWS ========================================
        .state('cbh.404', {
            url: '/404',
            /*data: {
              login_rule: ""
            },*/
            templateUrl: '404.html',
            controller: function($scope) {

            }
        })

        .state('cbh.search', {
            url: '/search?project&functional_group&flexmatch&related_molregno__chembl__chembl_id__in&with_substructure&similar_to&fpValue&created__gte&created__lte&molfile&smiles&search_custom_fields__kv_any&limit&offset',
            //url: '/search',
            //params: ['project__project_key', 'flexmatch', 'with_substructure', 'similar_to', 'fpValue', 'created__gte', 'created__lte', 'molfile', 'smiles', 'limit', 'offset', 'random'],
            resolve:{
              gridconfig: ['CompoundListSetup', function(CompoundListSetup){
                  return CompoundListSetup;
              }],
              projectFactory: ['ProjectFactory', function(ProjectFactory) {
                return ProjectFactory;
              }],
             
              projectKey: ['$stateParams', function($stateParams){
                  //There is no project key but this needs to be here to stop us breaking the batch controller
                  return "";
              }],
              
              
              
            },
            
            views: {
              '': {
                templateUrl: 'views/search.html'
              },
              'form@cbh.search': {
                controller: 'SearchCtrl',
                templateUrl: 'views/templates/search-template.html'
              },
              'results@cbh.search': {
                templateUrl: 'views/templates/compound-list.html',
                controller: 'BatchesCtrl'
              }
            }
            
            
        })

        .state('cbh.help', {
            //parent: 'Default',
            url: '/help',
            
            resolve:{
            },
            templateUrl: 'views/help.html',
            controller: function($scope) {

            }
        })

        .state('cbh.projects', {
            url: '/projects',
            
            resolve:{
              gridconfig: ['CompoundListSetup', function(CompoundListSetup){
                  return CompoundListSetup;
              }],
         
             
              
            },
            templateUrl: 'views/projects.html',
            controller: 'ProjectCtrl'
        })

        .state('cbh.projects.list', {
            url: '/list',
            templateUrl: 'views/projects-list.html',
            controller: function($rootScope, $state, $scope) {
              $rootScope.headline = "Projects List";
              $rootScope.subheading = "Click a project title to see more details and add compounds to that project";
              $rootScope.help_lookup = "";
              $rootScope.projectKey = "Projects";
              $rootScope.projName = "Projects";
              $rootScope.glyphicon = "folder-open";

              //if a new user has no projects associated, refdirect them to a default view with supplementary info
              // if(angular.equals({}, $rootScope.projects)) {
              //   $state.go('cbh.projects.empty');
              // }
              $scope.isDefault = true;
              
            }
        })

        // .state('cbh.projects.empty', {
        //   url: '/newuser',
        //   templateUrl: 'views/no-projects.html',
        //   controller: function($scope) {

        //   }

        // })

        .state('cbh.projects.list.project', {
            url: '/:projectKey?limit&offset',
            resolve: {
              projectKey: ['$stateParams', function($stateParams){
                  return $stateParams.projectKey;
              }],

            },
            
            views: {
              projectlist: {
                templateUrl: 'views/project-summary.html',
                controller: 'BatchesCtrl',
              }
            }
            
        })

        .state('cbh.projects.project', {
            url: '/:projectKey',
            templateUrl: 'views/project-full.html',
            controller: function($rootScope, projectKey) {
              //need to check here thaat project is valid
              //we already have a list of allowed projects - if none of these, redirect to project list?
              $rootScope.projectKey = projectKey;
            },
            resolve: {
              projectKey: ['$stateParams', function($stateParams){
                  return $stateParams.projectKey;
              }]
            }
        })

        .state('cbh.projects.add', {
            url: '/add',
            templateUrl: 'views/projects-add.html',
            controller: function($rootScope){
              $rootScope.headline = "Add a new Project"
              $rootScope.subheading = ""
              $rootScope.help_lookup = ""
              $rootScope.glyphicon = "folder-open";
            }
        })




        .state('cbh.projects.project.demo', {
            
            resolve:{
              projectFactory: ['ProjectFactory', function(ProjectFactory) {
                return ProjectFactory;
              }],
              
            },
            url: '/demo',
            templateUrl: 'views/start.html',
            controller: 'DemoCtrl'
        })
        
        // nested states 
        // each of these sections will have their own view
        // url will be nested (/form/profile)
        .state('cbh.projects.project.demo.intro', {
            url: '/intro',
            templateUrl: 'views/demo-intro.html',
            controller: function($scope) {
              $scope.wizard.step = 0;
              $scope.wizard.dynamic = 0;
              $scope.wizard.totalSteps = 0;
              applyTicks("intro");
            }
        })

        .state('cbh.projects.project.demo.add', {
            url: '/add',
            templateUrl: 'views/demo-add.html',
            controller: function($scope) {
              $scope.wizard.step = 1;
              $scope.wizard.dynamic = 41;
              applyTicks("add");
              


            }
        })

        .state('cbh.projects.project.demo.add.single', {
            url: '/single',
            templateUrl: 'views/demo-add-single.html',
            controller: function($scope) {
             
                $scope.single=true;

                $scope.wizard.step = 1;
                $scope.wizard.dynamic = 49.5;
                //only need 2 wizard steps if this is the case
                $scope.wizard.totalSteps = 2;

                

                $scope.errors = [];

                //default selection set in the scope molecule object, select box value bound to form.                                           
                
                $scope.sketchMolfile = "";
     
                $scope.open_warnings = false;
                
            }
        })

        .state('cbh.projects.project.demo.add.multiple', {
            url: '/multiple',
            templateUrl: 'views/demo-add-multiple.html',
            controller: function($scope) {
              $scope.filedata.flow.files=[];
              $scope.startAgain();
              $scope.wizard.step = 1;
              $scope.wizard.dynamic = 41;
              $scope.wizard.totalSteps = 4;

              
            }
        })


        // url will be /form/interests
        .state('cbh.projects.project.demo.validate', {
            url: '/validate/:multiple_batch_id',
            resolve: {
              multiple_batch_id: ['$stateParams', function($stateParams){
                  return $stateParams.multiple_batch_id;
              }],
            },
            templateUrl: 'views/demo-validate.html',
            controller: function($scope) {
              $scope.fullPage="col-md-3";
              $scope.wizard.step = 2;
              $scope.wizard.dynamic =  58;
              applyTicks("validate");
            }
        })

        .state('cbh.projects.project.demo.map', {
            url: '/map/:multiple_batch_id',
            resolve: {
              multiple_batch_id: ['$stateParams', function($stateParams){
                  return $stateParams.multiple_batch_id;
              }],
            },
            templateUrl: 'views/demo-map.html',
            controller: function($scope) {
              $scope.wizard.step = 3;
              $scope.wizard.dynamic = 74;

              applyTicks("map");
            }
        })

        .state('cbh.projects.project.demo.map.file', {
            url: '/map-file',
            templateUrl: 'views/demo-map-file.html',
            controller: function($scope) {
              
            }
        })
        .state('cbh.projects.project.demo.map.multiple', {
            url: '/map-multiple',
            templateUrl: 'views/demo-map-multiple.html',
            controller: function($scope) {

            }
        })
        
        // url will be /form/payment
        .state('cbh.projects.project.demo.map.finish', {
            url: '/finish/',
            resolve: {
              multiple_batch_id: ['$stateParams', function($stateParams){
                  return $stateParams.multiple_batch_id;
              }],
            },
            views: {
              '': {
                templateUrl: 'views/demo-finish.html',
                controller: function($scope, $stateParams) {

                  if ($scope.wizard.totalSteps == 4) {
                    $scope.wizard.step = 4;
                  }
                  else {
                    $scope.wizard.step = 2;
                  }
                  
                  $scope.wizard.dynamic = 100;
                  applyTicks("finish");
                  $scope.multiple_batch_id = $stateParams.multiple_batch_id;

                }
              },
              'resultslist@cbh.projects.project.demo.map.finish': {
                templateUrl: 'views/templates/compound-grid.html',
                controller: 'BatchesCtrl',
              },

            }
            
        })

        // .state("Default", {
        //   url: '/',
        //   abstract: true,
        // })
        
        //creating a stateful modal box to show single compound details as directed at:
        // http://www.sitepoint.com/creating-stateful-modals-angularjs-angular-ui-router/
        /*.state('Modal', {
          parent: 'Default',
          onEnter: ["$state", '$modal', function($state, $modal) {
            //console.log($state);
            var modalInstance = $modal.open({
              template: '<div ui-view="modal"></div>',
              backdrop: true,
              windowClass: 'right fade'
            });
            $(document).on("keyup", function(e) {
              if(e.keyCode == 27) {
                $(document).off("keyup");
                $state.go("Default");
              }
            });
       
          }],
          onExit: function() {
            if (modalInstance) {
                modalInstance.close();
            }
          },
          abstract: true
        })

        .state('singleCompound', {
          parent: 'Modal',
          views: {
            "modal@": {
              templateUrl: "views/single-compound.html"
            }
          },*/
          /*resolve:{
              
              modalProvider: ['ModalProvider', function(ModalProvider){
                return ModalProvider;
              }]
            },
            controller: function($scope, $state, modalProvider) {
              this.parent = modalProvider.getModal('cbh.projects.list.project');
            }*/
        //});
        


  }).run(function($http, $cookies, $rootScope, $document, $state, LoginService, ProjectFactory, urlConfig, prefix) {
    var pref = prefix.split("/")[0];
    $http.defaults.headers.post['X-CSRFToken'] = $cookies[pref + "csrftoken"];
    $http.defaults.headers.patch['X-CSRFToken'] = $cookies[pref + "csrftoken"];
    $http.defaults.headers.put['X-CSRFToken'] = $cookies[pref + "csrftoken"];4

    // $rootScope.$on('$stateChangeStart', function(e, to, toParams, from, fromParams) {
    //   //console.log(to.name);
    //   if (to.name == '404') return;
    //   if(to.name.lastIndexOf('singleCompound', 0) === 0) return;
      
    //   //need to stop people navigating to a nonsense/nonexistent project
    //   // if (toParams.projectKey) {
    //   //     var flag = false;
    //   //     ProjectFactory.get().$promise.then(function(res) {
            
    //   //       angular.forEach(res.objects, function(proj) {
    //   //         if (toParams.projectKey == proj.project_key) {
    //   //           //the project key in the url is an accessible project! Have a biscuit.
    //   //           flag = true;
    //   //         }
    //   //       });
            
    //   //       if(flag) {
    //   //         $state.go(to, toParams, {notify: false});
    //   //       }
    //   //       else if(angular.equals({}, $rootScope.projects)) {
    //   //         $state.go('cbh.projects.empty');
    //   //       }
    //   //       else{
    //   //         //project key not recognised - redirect to the project list for the logged in user
    //   //         //this doesn't contain a projectKey param so you won't infinitely loop
    //   //         $state.go('cbh.projects.list');
    //   //       }
            
    //   //     });
          
    //   // }
      
    //   // if (result && result.to) {
    //   //   //console.log("result and result.to is passing");
    //   //   e.preventDefault();
    //   //   // Optionally set option.notify to false if you don't want 
    //   //   // to retrigger another $stateChangeStart event
    //   //   $state.go(result.to, result.params, {notify: false});
    //   // }
    //   else {
    //     $state.go('404');
    //   }
    // });

    $rootScope.$on('$stateChangeSuccess', function(e, to) {
      //$('html,body').animate({ scrollTop: target.offset().top}, 1000);
      //$animate.
      $document.scrollTop(0,0);
    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){ 
        console.log(error);
    });

    


  
    
}).config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
}])
.factory('authHttpResponseInterceptor',['$q','$location', 'urlConfig',function($q,$location, urlConfig){
    return {
        response: function(response){
            if (response.status === 401) {
                console.log("Response 401");
            }
            return response || $q.when(response);
        },
        responseError: function(rejection) {
            // if (rejection.status === 401) {
            //     console.log("Response Error 401",rejection);
            //     window.location = urlConfig.instance_path.url_frag + "login"
            //     //$location.path('/login').search('returnTo', $location.path());
            // }
            return $q.reject(rejection);
        }
    }
}])
.config(['$httpProvider',function($httpProvider) {
    //Http Intercpetor to check auth failures for xhr requests
    $httpProvider.interceptors.push('authHttpResponseInterceptor');
}]);




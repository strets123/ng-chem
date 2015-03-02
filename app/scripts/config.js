
'use strict';
var arr = window.location.href.split("/");
var part = "devapi"
if (arr[2] != 'localhost'){
	part = arr[3];
}

var path = arr[0] + "//" + arr[2] + "/" + part +"/";

var configuration = {"cbh_batch_upload": {"list_endpoint": path + "cbh_batch_upload", "schema": path + "cbh_batch_upload/schema"}, "cbh_projects": {"list_endpoint": path + "cbh_projects", "schema": path + "cbh_projects/schema"}, "cbh_compound_batches": {"list_endpoint": path + "cbh_compound_batches", "schema": path + "cbh_compound_batches/schema"}, "users": {"list_endpoint": path + "users", "schema": path + "users/schema"}}

angular.module('ngChemApp').value('urlConfig',  
  configuration
);


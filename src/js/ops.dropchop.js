var dropchop = (function(dc) {
  
  'use strict';

  dc = dc || {};
  dc.ops = dc.ops || {};

  dc.ops.init = function() {
    // build ops.geo container
    var geoContainer = $('<div>').addClass('operations-geo');
    dc.$elem.append(geoContainer);

    // create geo buttons & forms
    for (var geoOp in dc.ops.geo) {
      var geoBtn = $('<button>').addClass('operation operation-geo operation-inactive')
        .html('<h4>' + geoOp + '</h4><p>' + dc.ops.geo[geoOp].description + '</p>')
        .prop('disabled', true)
        .attr('data-operation', geoOp);
      geoBtn.on('click', _geoBtnClick);

      geoContainer.append(geoBtn);
    }

    $(dc).on('layer:selected', dc.ops.geoCheck);
    $(dc).on('layer:unselected', dc.ops.geoCheck);
    // $('.operation-geo').removeClass('operation-inactive');
    // $('.operation-geo').prop('disabled', false);
    $(dc).on('operation:geo', dc.ops.geoExecute);
    $(dc).on('operation:file:load-gist', dc.ops.file['load-gist'].get);
    $(dc).on('operation:file:load-url', dc.ops.file['load-url'].get);
    $(dc).on('operation:file:load-overpass', dc.ops.file['load-overpass'].get);
    $(dc).on('operation:file:rename', dc.ops.file.rename.callback);

    // setup ops file
    var leftMenu = $('<div>').addClass('dropchop-menu-left');
    for (var fileOp in dc.ops.file) {
      if(dc.ops.file[fileOp].type === 'break') {
        var $breakSpace = $('<div>').addClass('menu-action-break');
        leftMenu.append($breakSpace);
      } else {
        var fileBtn = $('<button>').addClass('menu-action')
          .html(dc.ops.file[fileOp].icon || 'A')
          .attr('data-operation', fileOp)
          .attr('data-tooltip', dc.ops.file[fileOp].description);
          if (dc.ops.file[fileOp].type === 'info') fileBtn.addClass('dropchop-info');
        fileBtn.on('click', _fileBtnClick);
        leftMenu.append(fileBtn);
      }
    }
    dc.$elem.append(leftMenu);
  };

  function _geoBtnClick(event) {
    event.preventDefault();
    var operation = $(this).attr('data-operation');
    // if operation requires no parameters, don't render a form
    if (!dc.ops.geo[operation].parameters) {
      $(dc).trigger('operation:geo', [operation, dc.selection.list]);
    // otherwise render the form
    } else {
      $(dc).trigger('form:geo', [operation]);
    }
  }

  function _fileBtnClick(event) {
    event.preventDefault();

    var operation = $(this).attr('data-operation');
    try {
      dc.ops.file[operation].execute();
    } catch (err) {
      dc.notify('error', 'This operation doesn\'t exist!');
      throw err;
    }
  }

  /**
   * Execute a turf function based on button operation click.
   * @param {object} original event that triggered this function
   * @param {string} operation to be executed via turf
   * @param {array} series of parameters to be applied to turf operation
   */
  dc.ops.geoExecute = function(event, operation, parameters) {
    var prep = dc.ops.prepareTurfParams(operation, parameters);
    var result = null;
    try {
      result = dc.ops.geo[operation].execute(prep.options);
    } catch(err) {
      dc.notify('That operation isn\'t possible. Try changing the order of your selection.');
      throw err;
    }

    $(dc).trigger('file:added', [prep.name, result]);
  };

  /**
   * Prepare parameters for executing within a turf function using .apply() - returns an array
   * @param {array} options from the user passed from the original event trigger
   */
  dc.ops.prepareTurfParams = function(operation, params) {
    var data = {};
    data.options = [];

    var geoms = [];
    var nameArray = [];
    // get geometry array from selection
    $(dc.selection.list).each(function(i) {
      if ($.inArray('switch-' + dc.selection.list[i].stamp, params) === -1) {
        geoms.push(dc.selection.list[i].raw);
      } else {
        geoms.unshift(dc.selection.list[i].raw);
      }
      nameArray.push(dc.selection.list[i].name);
    });

    // merge params with options array
    data.options = $.merge(geoms, params);

    // create name array
    data.name = dc.util.concat(nameArray, '_', operation);
    
    return data;
  };

  dc.ops.geoCheck = function(event, layer) {

    // check selection count vs operation min/max
    for (var o in dc.ops.geo) {
      var op = dc.ops.geo[o];
      if (dc.selection.list.length > op.maxFeatures || dc.selection.list.length < op.minFeatures) {
        turnItOff(o);
        // don't go any further
      } else {

        // check operation against each selection data type
        for (var x = 0; x < dc.selection.list.length; x++) {
          var sel = dc.selection.list[x];

          // if the selection type is in the array, mark it as active!
          if ($.inArray(sel.type, op.requirements.types) > -1 || op.requirements.generalFeature === true) {
            turnItOn(o);
          } else {
            turnItOff(o);
          }

        }
      }
    }

    function turnItOff(op) {
      var btn = $('[data-operation='+ op +']');
      btn.addClass('operation-inactive');
      btn.prop('disabled', true);
    }

    function turnItOn(op) {
      var btn = $('[data-operation='+ op +']');
      btn.removeClass('operation-inactive');
      btn.prop('disabled', false);
    }
    
  };

  return dc;

})(dropchop || {});
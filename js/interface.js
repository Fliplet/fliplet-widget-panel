// VARS
var widgetId = Fliplet.Widget.getDefaultId();
var data = Fliplet.Widget.getData() || {items:[]},
    linkPromises = [];

if(_.isUndefined(data.items)) {
  data.items = [];
}
_.forEach(data.items,function (item){
  if(_.isObject(item.linkAction)) {
    initLinkProvider(item);
  }
});

var listLength = data.items.length + 1;
var accordionCollapsed = false;

var $accordionContainer = $('#accordion');
var templates = {
  panel: template('panel')
};

var $testElement = $('#testelement');

setTimeout (function() {
  // SORTING PANELS
  $('.panel-group').sortable({
    handle: ".panel-heading",
    cancel: ".icon-delete",
    tolerance: 'pointer',
    revert: 150,
    placeholder: 'panel panel-default placeholder tile',
    cursor: '-webkit-grabbing; -moz-grabbing;',
    axis: 'y',
    start: function(event, ui) {
      $('.panel-collapse.in').collapse('hide');
      ui.item.addClass('focus').css('height', ui.helper.find('.panel-heading').outerHeight() + 2);
      $('.panel').not(ui.item).addClass('faded');
    },
    stop: function(event, ui) {
      ui.item.removeClass('focus');

      var sortedIds = $( ".panel-group" ).sortable( "toArray" ,{attribute: 'data-id'});
      data.items = _.sortBy(data.items, function(item){
        return sortedIds.indexOf(item.id);
      });
      save();
      $('.panel').not(ui.item).removeClass('faded');
    },
    sort: function(event, ui) {
      $('.panel-group').sortable('refresh');
      $('.tab-content').trigger('scroll');
    }
  });
}, 1000);

$('#help_tip').on('click', function() {
  alert("During beta, please use live chat and let us know what you need help with.");
});

// EVENTS
$(".tab-content")
    .on('click', '.icon-delete', function() {

      var $item = $(this).closest("[data-id], .panel"),
          id = $item.data('id');

      _.remove(data.items, {id: id});
      _.remove(linkPromises,{id: id});

      $(this).parents('.panel').remove();
      checkPanelLength();
      listLength--;
      save();

      $(this).parents('.panel').remove();
      checkPanelLength();
    })
    .on('click', '.list-item-set-link', function() {

      var $item = $(this).closest("[data-id], .panel"),
          id = $item.data('id'),
          item = _.find(data.items, {id: id});

      initLinkProvider(item);

      if ( $(this).siblings().hasClass('hidden') ) {
        $(this).siblings().removeClass('hidden');
      }
      $(this).addClass('hidden');
      $(this).siblings('.link-remove').show();
      save();

    })
    .on('click', '.add-image', function() {

      var $item = $(this).closest("[data-id], .panel"),
          id = $item.data('id'),
          item = _.find(data.items, {id: id});

      initImageProvider(item);

      $(this).text('Replace image');
      if ( $(this).siblings('.thumb-holder').hasClass('hidden') ) {
        $(this).siblings('.thumb-holder').removeClass('hidden');
      }
    })
    .on('click', '.link-remove', function() {

      var $item = $(this).closest("[data-id], .panel"),
          id = $item.data('id'),
          item = _.find(data.items, {id: id});

      _.remove(linkPromises,{id: id});
      $('[data-id="' + item.id + '"] .add-link').empty();
      $(this).addClass('hidden');
      $(this).siblings('.list-item-set-link').removeClass('hidden');
      save();
    })
    .on('click', '.image-remove', function() {

      var $item = $(this).closest("[data-id], .panel"),
          id = $item.data('id'),
          item = _.find(data.items, {id: id});

      item.imageConf = null;
      $('[data-id="' + id + '"] .list-item-color').prop("disabled", false);
      $(this).parents('.add-image-holder').find('.add-image').text('Add image');
      $(this).parents('.add-image-holder').find('.thumb-holder').addClass('hidden');
      save();
    })
    .on('click', '.change-color', function() {
      alert('You will be able to set up a color for this list item.');
    })
    .on('keyup change blur', '.list-item-title', function() {
      var $listItem = $(this).parents('.panel');
      setListItemTitle($listItem.index(), $(this).val());
      debounceSave();
    }).on('keyup change blur paste', '.list-item-desc', function() {
      debounceSave();
    }).on('keyup change blur paste', '.list-item-color', function() {
      var $this = $(this);

      var color = $this.val();
      $testElement.css('background-color', color);
      color = colorIsValid ? $this.val() : "white";
      $this.siblings('div').css('background-color', color);
      $testElement.css('background-color', "white");
      debounceSave();
    })
    .on('click', '.expand-items', function() {
      // Update accordionCollapsed if all panels are collapsed/expanded
      if (!$('.panel-collapse.in').length) {
        accordionCollapsed = true;
      } else if ($('.panel-collapse.in').length == $('.panel-collapse').length) {
        accordionCollapsed = false;
      }

      if (accordionCollapsed) {
        expandAccordion();
      } else {
        collapseAccordion();
      }
    })
    .on('click', '.new-list-item', function() {
      var item ={};
      item.id = makeid(8);
      item.number = listLength++;
      item.linkAction = null;
      item.description = "";
      data.items.push(item);

      addListItem(item);

      checkPanelLength();
      save();
    })
    .on('show.bs.collapse', '.panel-collapse', function() {
      $(this).siblings('.panel-heading').find('.fa-chevron-right').removeClass('fa-chevron-right').addClass('fa-chevron-down');
    })
    .on('hide.bs.collapse', '.panel-collapse', function() {
      $(this).siblings('.panel-heading').find('.fa-chevron-down').removeClass('fa-chevron-down').addClass('fa-chevron-right');
    })
    .on('shown.bs.collapse hidden.bs.collapse', '.panel-collapse', function() {
      $('.tab-content').trigger('scroll');
    });

// FUNCTIONS

function colorIsValid(color){
  return /^#[0-9A-F]{6}$/i.test(color) && ((color == "white" || color == "#FFFFFF")|| $testElement.css('background-color') != "rgb(255, 255, 255)");
}

function initLinkProvider(item){

  item.linkAction = item.linkAction || {};
  item.linkAction.provId = item.id;

  var linkActionProvider = Fliplet.Widget.open('com.fliplet.link', {
    // If provided, the iframe will be appended here,
    // otherwise will be displayed as a full-size iframe overlay
    selector: '[data-id="' + item.id + '"] .add-link',
    // Also send the data I have locally, so that
    // the interface gets repopulated with the same stuff
    data: item.linkAction,
    // Events fired from the provider
    onEvent: function (event, data) {
      if (event === 'interface-validate') {
        Fliplet.Widget.toggleSaveButton(data.isValid === true);
      }
    },
    closeOnSave: false
  });

  linkActionProvider.then(function (data) {
    item.linkAction = data ? data.data: {};
    return Promise.resolve();
  });

  linkActionProvider.id = item.id;
  linkPromises.push(linkActionProvider);
}

function initImageProvider(item){
    var imageProvider = Fliplet.Widget.open('com.fliplet.image-manager', {
      // Also send the data I have locally, so that
      // the interface gets repopulated with the same stuff
      data: item.imageConf,
      // Events fired from the provider
      onEvent: function (event, data) {
        if (event === 'interface-validate') {
          Fliplet.Widget.toggleSaveButton(data.isValid === true);
        }
      },
      single: true,
      type: 'image'
    });

  imageProvider.then(function (data) {
    item.imageConf = data.data;
    $('[data-id="' + item.id + '"] .list-item-color').prop("disabled", true);
    $('[data-id="' + item.id + '"] .thumb-image img').attr("src",data.data.thumbnail);
    save();
    return Promise.resolve();
  });
}

function template(name) {
  return Handlebars.compile($('#template-' + name).html());
}

function makeid(length)
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function expandAccordion(){
  accordionCollapsed = false;
  $('.panel-collapse').collapse('show');
}

function collapseAccordion(){
  accordionCollapsed = true;
  $('.panel-collapse').collapse('hide');
}

function setListItemTitle(index, title) {
  $('#accordion').find('.panel:eq(' + index + ') .panel-title-text').html(title);
}

function addListItem(data) {
  $accordionContainer.append(templates.panel(data));
}

function checkPanelLength() {
  if ( $('.panel').length > 0 ) {
    if ( !$('.panels-empty').hasClass('hidden') ) {
      $('.panels-empty').addClass('hidden');
    }
  } else {
    $('.panels-empty').removeClass('hidden');
  }
}

Fliplet.Widget.onSaveRequest(function () {
  save(true);
});

var debounceSave = _.debounce( save, 500);

function save(notifyComplete){
  _.forEach(data.items,function(item){
    item.description = $('#list-item-desc-'+item.id).val();
    item.title = $('#list-item-title-'+item.id).val();
    item.color = $('#list-item-color-'+item.id).val();
  });

  Promise.all(linkPromises).then(function () {
    // when all providers have finished
    Fliplet.Widget.save(data).then(function () {
      if(notifyComplete) {
        Fliplet.Widget.complete();
        return;
      }
      Fliplet.Studio.emit('reload-widget-instance', widgetId);
    });
  });

  // forward save request to all providers
  linkPromises.forEach(function (promise) {
    promise.forwardSaveRequest();
  });
}
// VARS
var data = Fliplet.Widget.getData() || {};

var listLength = 0;
var accordionCollapsed = false;

var $accordionContainer = $('#accordion');
var templates = {
  panel: template('panel')
};

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
      $('.panel').not(ui.item).removeClass('faded');
    },
    sort: function(event, ui) {
      $('.panel-group').sortable('refresh');
      $('.tab-content').trigger('scroll');
    }
  });
}, 1000);

// EVENTS
$(".tab-content")
  .on('click', '.icon-delete', function() {
    $(this).parents('.panel').remove();
    checkPanelLength();
  })
  .on('click', '.list-item-set-link', function() {
    alert('A panel with the link actions options will slide in from the right.');
    $(this).text('Change link');
    if ( $(this).siblings().hasClass('hidden') ) {
      $(this).siblings().removeClass('hidden');
    }
  })
  .on('click', '.add-image', function() {
    alert('A panel with the image library will slide in from the right.');
    $(this).text('Replace image');
    if ( $(this).siblings('.thumb-holder').hasClass('hidden') ) {
      $(this).siblings('.thumb-holder').removeClass('hidden');
    }
  })
  .on('click', '.link-remove', function() {
    $(this).addClass('hidden');
    $(this).siblings('.list-item-set-link').text('Add link');
    $(this).siblings('.linked-to').addClass('hidden');
  })
  .on('click', '.image-remove', function() {
    $(this).parents('.add-image-holder').find('.add-image').text('Add image');
    $(this).parents('.add-image-holder').find('.thumb-holder').addClass('hidden');
  })
  .on('click', '.change-color', function() {
    alert('You will be able to set up a color for this list item.');
  })
  .on('keyup change blur', '.list-item-title', function() {
    var $listItem = $(this).parents('.panel');
    setListItemTitle($listItem.index(), $(this).val());
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
    listLength++;

    data.id = makeid(8);
    data.number = listLength;

    addListItem(data);
    checkPanelLength();
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

$('#help_tip').on('click', function() {
  alert("During beta, please use live chat and let us know what you need help with.");
});

// FUNCTIONS
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
  Fliplet.Widget.save(data).then(function () {
    Fliplet.Widget.complete();
  });
});

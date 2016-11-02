$('.linked[data-panel-item-id]').click(function (event) {
    event.preventDefault();

    var data = Fliplet.Widget.getData($(this).parents('[data-panels-id]').data('panels-id'));

    var itemData = _.find(data.items,{id: $(this).data('panel-item-id')});

    if(!_.isUndefined(itemData) && (!_.isUndefined(itemData.linkAction) && !_.isEmpty(itemData.linkAction))) {
        Fliplet.Analytics.trackEvent('link', 'screen', itemData.title);
        Fliplet.Navigate.to(itemData.linkAction);
    }
});
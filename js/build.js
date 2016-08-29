$('[data-button-id]').click(function (event) {
    event.preventDefault();

    var data = Fliplet.Widget.getData($(this).parents('[data-list-id]').data('list-id'));

    var itemData = _.find(data.items,{id: $(this).data('button-id')});

    if(!_.isUndefined(itemData) && !_.isUndefined(itemData.linkAction)) {
        Fliplet.Navigate.to(itemData.linkAction);
    }
});
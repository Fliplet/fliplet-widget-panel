Fliplet.Widget.instance('panels', function (data) {
  var $container = $(this);

  function authenticateImages() {
    _.forEach(data.items, function (item) {
      if (!_.get(item, 'imageConf.url') || !Fliplet.Media.isRemoteUrl(item.imageConf.url)) {
        return;
      }

      $container.find('[data-panel-item-id="' + item.id + '"] .list-image').css({
        backgroundImage: 'url(' + Fliplet.Media.authenticate(item.imageConf.url) + ')'
      });
    });
  }

  $container.on('click', '.linked[data-panel-item-id]', function(event) {
    event.preventDefault();

    var itemData = _.find(data.items, {
      id: $(this).data('panel-item-id')
    });

    if (_.get(itemData, 'linkAction') && !_.isEmpty(_.get(itemData, 'linkAction'))) {
      Fliplet.Navigate.to(itemData.linkAction);
    }
  });

  Fliplet().then(authenticateImages);
});

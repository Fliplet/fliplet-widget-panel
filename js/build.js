Fliplet.Widget.instance('panels', function (data) {
  var $container = $(this);

  function authenticateImages() {
    Fliplet.Utils.forEach(data.items, function (item) {
      if (!Fliplet.Utils.get(item, 'imageConf.url') || !Fliplet.Media.isRemoteUrl(item.imageConf.url)) {
        return;
      }

      $container.find('[data-panel-item-id="' + item.id + '"] .list-image').css({
        backgroundImage: 'url(' + Fliplet.Media.authenticate(item.imageConf.url) + ')'
      });
    });
  }

  $container.on('click', '.linked[data-panel-item-id]', function(event) {
    event.preventDefault();

    var itemData = Fliplet.Utils.find(data.items, {
      id: $(this).data('panel-item-id')
    });

    if (Fliplet.Utils.get(itemData, 'linkAction') && !Fliplet.Utils.isEmpty(Fliplet.Utils.get(itemData, 'linkAction'))) {
      Fliplet.Navigate.to(itemData.linkAction);
    }
  });

  Fliplet().then(authenticateImages);
});

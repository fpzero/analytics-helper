function expose() {
  window[options.helperName] = {
    internal: internal,
    init: init,
    pageview: pageview,
    event: event,
    sanitize: sanitize,
    getDataLayer: getDataLayer,
    cookie: cookie,
    getKey: getKey,
    safeFn: safeFn,
    fn: fn,
    options: options
  };
}

expose();
/*
 * ROOT points to the URI of the API service.
 * Set this for example to `https://intelmq.organization.tld/`
 * If this is not set it is by default the same service asthe intelmq-manager.
 */
var ROOT;
var ROOT = ROOT ?? window.location.href.substring(0, window.location.href.lastIndexOf('/manager') + 1);

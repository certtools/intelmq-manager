/* intelmq-manager.js javascript file for intelmq-manager
 *
 * SPDX-FileCopyrightText: 2020 IntelMQ Team <intelmq-team@cert.at>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Do not change this file! If you want to customize the settings,
 * create a 'var.js' file and define the custom settings there with
 * var VARIABLENAME = value
 */

/*
 * ROOT points to the URI of the API service.
 * Set this for example to `https://intelmq.organization.tld/`
 * If this is not set it is by default the same service as the intelmq-manager.
 */
var ROOT = ROOT ?? window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

/*
 * If there are multiple versions of the API, they can be defined here
 */
var API_V1 = ROOT + '/v1/api/'

/*
 * use a specific version when accessing the API variable
 */
var API = API_V1

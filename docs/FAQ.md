<!--
SPDX-FileCopyrightText: 2020 IntelMQ Team

SPDX-License-Identifier: AGPL-3.0-or-later
-->

FAQ
===

Error saving a big configuration in docker
------------------------------------------

Problem: When saving a configuration with lots of bots (~30) the reponse is always an error. All files are saved correctly, but not the runtime configuration, which is unchanged.

Reason: Look at your apache error logs, it may say that it discarded the data because the temporary directory is not writeable.

Solution: Fix your docker image by making the temporary directoy `/tmp` writeable as it should be.

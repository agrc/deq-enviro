#!/usr/bin/env python
# * coding: utf8 *
'''
main.py

A module that contains the main forklift pallets for deq
'''

import build_json
import settings
import update_sgid
import update_fgdb
import update_ftp
from forklift.models import Pallet, Crate
from os import path

current_folder = path.dirname(__file__)


class DEQNightly0TempTables(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly0TempTables, self).__init__()

        self.test_layer = test_layer

    def build(self, target):
        self.add_crates(update_sgid.get_temp_crate_infos(self.test_layer))

    def process(self):
        crate_results = {}
        for crate in self.get_crates():
            crate_results[crate.source_name] = crate.result
        update_sgid.start_etl(crate_results)


#: pallets are executed in alphabetical order
class DEQNightly1SDEUpdatePallet(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly1SDEUpdatePallet, self).__init__()

        self.test_layer = test_layer

    def build(self, target):
        if self.test_layer is not None:
            self.add_crates(update_sgid.get_crate_infos(self.test_layer))
        else:
            self.add_crates(update_sgid.get_crate_infos())

    def process(self):
        if settings.updateFTP:
            self.log.info('UPDATING FTP PACKAGES')
            update_ftp.run()


class DEQNightly2FGDBUpdatePallet(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly2FGDBUpdatePallet, self).__init__()

        self.arcgis_services = [('DEQEnviro/Secure', 'MapServer'),
                                ('DEQEnviro/MapService', 'MapServer'),
                                ('DEQEnviro/ExportWebMap', 'GPServer'),
                                ('DEQEnviro/Toolbox', 'GPServer')]
        self.copy_data = [settings.fgd]
        self.test_layer = test_layer

    def validate_crate(self, crate):
        return update_fgdb.validate_crate(crate)

    def build(self, target):
        if self.test_layer is not None:
            self.add_crates(update_fgdb.get_crate_infos(self.test_layer))
        else:
            self.add_crates(update_fgdb.get_crate_infos())

    def process(self):
        for crate in self.get_crates():
            if crate.result in [Crate.CREATED, Crate.UPDATED]:
                self.log('post processing crate: %s', crate.name)
                update_fgdb.post_process_crate(crate)

    def ship(self):
        self.log.info('BUILDING JSON FILE')
        build_json.run()
#
#         #: TODO - notify Harold
#         # if len(sdeErrors) + len(fgdbErrors) > 0:
#         #     errors = 'SDE UPDATE ERRORS:\n\n{}\n\n\n\nFGDB UPDATE ERRORS:\n\n{}'.format('\n\n'.join(sdeErrors), '\n\n'.join(fgdbErrors))
#         #     emailer.sendEmail('{} - Data Errors'.format(scriptName),
#         #                       'There were {} errors in the nightly deq script: \n{}'.format(len(sdeErrors + fgdbErrors), errors))
#         # else:
#         #     emailer.sendEmail('{} - Script Ran Successfully'.format(scriptName), 'Updated datasets:\n{}'.format('\n'.join(update_fgdb.successes)))

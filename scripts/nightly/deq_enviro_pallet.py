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
import pystache
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from forklift.models import Pallet, Crate
from forklift.messaging import send_email
from os import path

current_folder = path.dirname(__file__)


def send_report_email(name, report_data):
    report_data['name'] = name
    template = path.join(path.abspath(path.dirname(__file__)), 'report_template.html')
    with open(template, 'r') as template_file:
        email_content = pystache.render(template_file.read(), report_data)

    message = MIMEMultipart()
    message.attach(MIMEText(email_content, 'html'))

    send_email(settings.reportEmail, 'DEQ Nightly Report'.format(name), message)


#: pallets are executed in alphabetical order
class DEQNightly0TempTables(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly0TempTables, self).__init__()

        self.test_layer = test_layer

    def build(self, target):
        self.add_crates(update_sgid.get_temp_crate_infos(self.test_layer))

    def process(self):
        self.log.info('ETL-ing temp tables to points in SGID...')
        update_sgid.start_etl(self.get_crates())

    def ship(self):
        send_report_email('Temp Tables', self.get_report())


class DEQNightly1SDEUpdatePallet(Pallet):
    #: this pallet assumes that the destination data already exits
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
            update_ftp.run(self.log)

    def ship(self):
        send_report_email('SGID', self.get_report())


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
        pass
        if self.test_layer is not None:
            self.add_crates(update_fgdb.get_crate_infos(self.test_layer))
        else:
            self.add_crates(update_fgdb.get_crate_infos())

    def process(self):
        pass
        for crate in self.get_crates():
            if crate.result[0] in [Crate.CREATED, Crate.UPDATED]:
                self.log.info('post processing crate: %s', crate.destination_name)
                update_fgdb.post_process_crate(crate)

    def ship(self):
        try:
            self.log.info('BUILDING JSON FILE')
            build_json.run()
        except:
            raise
        finally:
            send_report_email('App Data', self.get_report())

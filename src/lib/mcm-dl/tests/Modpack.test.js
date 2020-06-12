import * as main from '../src/main';
import { expect } from 'chai';
import Twitch from '../src/Twitch';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
describe('determineType()', function () {
    it('should determine type:\'twitch\' from sample.zip', function () {
        let pack = main.determineType("tests/sample.zip");
        expect(pack).equal("twitch");
    });
});
describe('createModpack()', function () {
    it('should return twitch pack from sample.zip', function () {
        let pack = main.createModpack("tests/sample.zip");
        let zip = new AdmZip(pack.file);
        let manifest = JSON.parse(zip.readAsText('manifest.json'));
        let x = new Twitch("tests/sample.zip", 'twitch', "3upman", "4.0.1", manifest);
        expect(pack.file).equal('tests/sample.zip');
        expect(pack.type).equal('twitch');
        expect(pack.version).equal('4.0.1');
        expect(pack.author).equal('3upman');
    });
});
describe('Twitch().download', function () {
    it('should be create a ./mods folder', function () {
        let pack = main.createModpack("tests/sample.zip");
        let dl = pack.download('./mods');
        dl.on('download-progress', (downloaded, total) => {
            if (downloaded == total) {
                expect(fs.existsSync('./mods')).true;
            }
        });
    });
});
describe('createMultiMC()', function () {
    it('should copy the overrides folder', function () {
        let pack = main.createModpack("tests/sample.zip");
        pack.createMultiMC('./');
        expect(fs.existsSync('./NAM Pack 2019.4/mods/OptiFine_1.12.2_HD_U_E3.jar')).true;
    });
});

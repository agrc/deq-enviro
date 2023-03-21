/* eslint-disable max-len */
define(['app/search/utilities'], function (utilities) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/search/utilities', function () {
        bdd.describe('getRadioFilterParts', function () {
            bdd.it('should parse the parts correctly', function () {
                const tests = [
                    [
                        "TYPE <> 'Abandoned Well' AND NOT SOURCE LIKE 'Non-Production Well%' AND NOT(TYPE = 'Underground' AND SUMMARY_ST = 'T') (All other PODs)",
                        {
                            value:
                "TYPE <> 'Abandoned Well' AND NOT SOURCE LIKE 'Non-Production Well%' AND NOT(TYPE = 'Underground' AND SUMMARY_ST = 'T')",
                            label: 'All other PODs'
                        }
                    ],
                    [
                        "ASSESSMENT = '5: TMDL Required (303d List) / 4A: TMDL Approved (Impaired)' (5: TMDL Required (303d List) / 4A: TMDL Approved (Impaired))",
                        {
                            value:
                "ASSESSMENT = '5: TMDL Required (303d List) / 4A: TMDL Approved (Impaired)'",
                            label: '5: TMDL Required (303d List) / 4A: TMDL Approved (Impaired)'
                        }
                    ],
                    [
                        "ASSESSMENT = '5: TMDL Required (303d List) / 4A: TMDL Approved (Impaired)' (5: TMDL Required (303d List) / 4A: TMDL Approved (Impaired))",
                        {
                            value:
                "ASSESSMENT = '5: TMDL Required (303d List) / 4A: TMDL Approved (Impaired)'",
                            label: '5: TMDL Required (303d List) / 4A: TMDL Approved (Impaired)'
                        }
                    ],
                    [
                        "ASSESSMENT = '5: TMDL Required (Impaired 303d list)' (5: TMDL Required (Impaired 303d list))",
                        {
                            value: "ASSESSMENT = '5: TMDL Required (Impaired 303d list)'",
                            label: '5: TMDL Required (Impaired 303d list)'
                        }
                    ]
                ];

                tests.forEach(([input, expected]) => {
                    expect(utilities.getRadioFilterParts(input)).to.deep.equal(expected);
                });
            });
        });
    });
});

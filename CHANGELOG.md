# Changelog

## [2.0.0-5](https://github.com/agrc/deq-enviro/compare/v2.0.0-4...v2.0.0-5) (2023-05-05)


### 🎨 Design Improvements

* use dark gray for default text color ([e028dc3](https://github.com/agrc/deq-enviro/commit/e028dc309fc05fbae96040de9ff154fae7b4f358))


### 🚀 Features

* add deq favicon ([a1a29a7](https://github.com/agrc/deq-enviro/commit/a1a29a7e7e63d63ca50703db63ad9d42927b419a))
* add google analytics ([68dc947](https://github.com/agrc/deq-enviro/commit/68dc947c651c89b08053eb952097d5d58eee1725))
* add skeleton loader to query layers while waiting for remote configs ([334d5aa](https://github.com/agrc/deq-enviro/commit/334d5aa0590a622a37550c8e3df0b7860e6ff279))
* add utds icon component ([46d4999](https://github.com/agrc/deq-enviro/commit/46d4999aefa0f2ebcb106b424b9500a07e743a49))
* **checkbox:** implement basic utds checkbox ([5365640](https://github.com/agrc/deq-enviro/commit/53656402980ff4c804f067773c57c05e0aea394c))
* **icon:** add bold parameter ([598a877](https://github.com/agrc/deq-enviro/commit/598a877ec2f7e75caab941671ec949cf9bf201e4))
* implement Accordion component ([458e8e5](https://github.com/agrc/deq-enviro/commit/458e8e5b27924eea281cf86a687f2c8f02cf4cdb))
* implement basic map ([c368971](https://github.com/agrc/deq-enviro/commit/c36897127a4b24fcacd3df19ed8f0ee57324d7a6))
* implement basic query layer selector ([a78deb6](https://github.com/agrc/deq-enviro/commit/a78deb665ffd24184184f9ad61066876a320da67))
* implement utah design system header and basic layout ([f0f54b5](https://github.com/agrc/deq-enviro/commit/f0f54b5cd9d2f9cca37d474041ab958bb5f9906f))
* **tooltip:** add optional delayDuration prop ([5ae094a](https://github.com/agrc/deq-enviro/commit/5ae094a0bffdba03f86dd53b28874d2dc069d49a))
* **tooltip:** implement utds tooltip ([3d54ebb](https://github.com/agrc/deq-enviro/commit/3d54ebb022316695549ee379f3ceb1d061545e61))
* **utds:** add the beginnings of a typography layer ([d4300d6](https://github.com/agrc/deq-enviro/commit/d4300d65d384d24c56732f371f22e0ddb8044d02))
* very basic mobile layout ([5d42fd3](https://github.com/agrc/deq-enviro/commit/5d42fd3d38c954f4c5560d088108b97fe4a0b719))


### 🐛 Bug Fixes

* **accordion:** fix strange artifacts around top corners ([b593044](https://github.com/agrc/deq-enviro/commit/b593044ca9eb9dd34933a7c9d2979524a89e7c74))
* **accordion:** larger icon ([07030d0](https://github.com/agrc/deq-enviro/commit/07030d02e1e7d5a9b6694c78eedc4f3a6f0ce5bd))
* **accordion:** remove borders and add background ([18b4d2c](https://github.com/agrc/deq-enviro/commit/18b4d2cda37a763992895ba1f812541c94980191))
* **accordion:** remove empty className ([89a0ab6](https://github.com/agrc/deq-enviro/commit/89a0ab6bb7268ff56792d18316f446d7a80be7bc))
* allow for external stylesheets from google fonts ([f077200](https://github.com/agrc/deq-enviro/commit/f07720010094c8cf627178c4729bc66833bfa6a2))
* **configs:** switch to using unique id rather than index ([b2b0930](https://github.com/agrc/deq-enviro/commit/b2b093028d36840b0a4912a1f3495cec00b4ef99))
* **functions:** convert empty strings to null values ([9d574e6](https://github.com/agrc/deq-enviro/commit/9d574e600e568295d18c23de91c443e8f9e67de1))
* **header:** make sure that popup shows on top of app content ([55923be](https://github.com/agrc/deq-enviro/commit/55923be3383f02152e50a48bb112ff460935c047))
* **header:** re-implement utds header css in tailwind ([c02b83b](https://github.com/agrc/deq-enviro/commit/c02b83bc568478de0e6ec3e67027f2b45c054f8a))
* **header:** switch back to newer scoped version of utds header css ([f72a16a](https://github.com/agrc/deq-enviro/commit/f72a16a8c23c978c72e35e7feb5745cf01140cec))
* **icon:** add all tailwind text sizes ([e289340](https://github.com/agrc/deq-enviro/commit/e2893400a5a79623cd1950415944b432581a87f3))
* **icon:** remove dynamic class names ([0b1753a](https://github.com/agrc/deq-enviro/commit/0b1753a3fbf41545051b5031561052cd29f54600))
* move info popup to query layer name and give external link a better icon ([5378260](https://github.com/agrc/deq-enviro/commit/53782605f068b7fc9fd29797f750b10da24f1a88))
* only some fields are required for query layers ([f95c5e9](https://github.com/agrc/deq-enviro/commit/f95c5e91f98853ff4622b37cfe889518e11d30c0))
* remove global utds class ([cccb878](https://github.com/agrc/deq-enviro/commit/cccb8780d76dd6a2498665ec1174e8f1cf92ba66))
* remove links from config spreadsheet and remote config ([7b67d66](https://github.com/agrc/deq-enviro/commit/7b67d66388f11eee81df9e806caaaed756721178))
* use yup to validate query layer configs ([5b2eabd](https://github.com/agrc/deq-enviro/commit/5b2eabd612ba1d43a5db333677d196e71fa50c4a))

## [2.0.0-4](https://github.com/agrc/deq-enviro/compare/v2.0.0-3...v2.0.0-4) (2023-04-20)


### 🐛 Bug Fixes

* **ci:** split out remote config defaults update from function ([226b723](https://github.com/agrc/deq-enviro/commit/226b72358e49956a06de0d0ccfc98730bb488fd9))
* **functions:** more user-friendly result messages ([91028d1](https://github.com/agrc/deq-enviro/commit/91028d1802d991aff820a84af3d076f04107fe1f))
* **functions:** move feature service to config spreadsheet ([8263382](https://github.com/agrc/deq-enviro/commit/8263382e9dd81bd88cf7078bdac200dff7f673d4))
* **functions:** move spreadsheet id to secret manager ([5b874ce](https://github.com/agrc/deq-enviro/commit/5b874cef52bd595d43fc80bab870e3490458bd6c))
* **functions:** remove irrelevant unit test ([6dc083b](https://github.com/agrc/deq-enviro/commit/6dc083b3c272e4781f74178fa2bd4d9525600675))


### 🚀 Features

* **apps-scripts:** add example code and docs ([c393940](https://github.com/agrc/deq-enviro/commit/c3939400ae67fbdb53f2e668a2e5652736b44bcb))

## [2.0.0-3](https://github.com/agrc/deq-enviro/compare/v2.0.0-2...v2.0.0-3) (2023-04-18)


### 🐛 Bug Fixes

* **ci:** remove husky ([f6d1194](https://github.com/agrc/deq-enviro/commit/f6d119409e12bd9a920469b64f00f65221befb6e))

## [2.0.0-2](https://github.com/agrc/deq-enviro/compare/v2.0.0-1...v2.0.0-2) (2023-04-18)


### 🐛 Bug Fixes

* **ci:** remove remote config template ([d990011](https://github.com/agrc/deq-enviro/commit/d990011e4c0502e7d578a0074693102bfa15a176))

## [2.0.0-1](https://github.com/agrc/deq-enviro/compare/v2.0.0-0...v2.0.0-1) (2023-04-18)


### 🐛 Bug Fixes

* **ci:** secret names ([0300ddd](https://github.com/agrc/deq-enviro/commit/0300ddd5615f7d4cad19542b134b911e8578883c))


### 🚀 Features

* **functions:** create function for updating fb remote config from sheet ([130a17e](https://github.com/agrc/deq-enviro/commit/130a17e732d6047b19c0a13732d60ecb75191912)), closes [#494](https://github.com/agrc/deq-enviro/issues/494)
* integrate remote configs into front end ([ce83922](https://github.com/agrc/deq-enviro/commit/ce8392249d5965b7640bd298b5347c0622dd387a)), closes [#494](https://github.com/agrc/deq-enviro/issues/494)

## [2.0.0-0](https://github.com/agrc/deq-enviro/compare/v1.9.2...v2.0.0-0) (2023-03-22)


### ⚠ BREAKING CHANGES

* new hosting platform

### 🚀 Features

* implement eslint, prettier, & husky ([0c63d73](https://github.com/agrc/deq-enviro/commit/0c63d739e3f00589054dd665c4a351dfbb373aeb)), closes [#492](https://github.com/agrc/deq-enviro/issues/492) [#409](https://github.com/agrc/deq-enviro/issues/409)
* implement firebase hosting ([47377e0](https://github.com/agrc/deq-enviro/commit/47377e0a64381f5d7e4454064240de5965522dcc)), closes [#440](https://github.com/agrc/deq-enviro/issues/440) [#437](https://github.com/agrc/deq-enviro/issues/437)

# Changelog

## [2.0.3](https://github.com/agrc/deq-enviro/compare/v2.0.2...v2.0.3) (2024-05-02)


### 🐛 Bug Fixes

* **download:** add missing arcgis dependency ([57c3c33](https://github.com/agrc/deq-enviro/commit/57c3c3322031aceda5e0c3aaebd91d7fe51494c0))

## [2.0.2](https://github.com/agrc/deq-enviro/compare/v2.0.1...v2.0.2) (2024-04-29)


### 🐛 Bug Fixes

* **forklift:** skip query layers without source data ([09ebbab](https://github.com/agrc/deq-enviro/commit/09ebbabb36cb005a71e48cb4e9a212ed0fd7fb1e))
* point at enviro-specific print service ([709a697](https://github.com/agrc/deq-enviro/commit/709a697ca19bd6daf3e686f7efb6dcbc45a40102))
* update forklift pallet for v2 config changes ([192aee3](https://github.com/agrc/deq-enviro/commit/192aee31b405d14f35652146f08aa1c558c84ea6))

## [2.0.1](https://github.com/agrc/deq-enviro/compare/v2.0.0...v2.0.1) (2024-04-22)


### 🐛 Bug Fixes

* add missing bash statement ([e619ac2](https://github.com/agrc/deq-enviro/commit/e619ac230db6959ef05c9ad6287559ae78c6de28))

## [2.0.0](https://github.com/agrc/deq-enviro/compare/v2.0.0-76...v2.0.0) (2024-04-19)


### 📖 Documentation Improvements

* correct function name ([082e12c](https://github.com/agrc/deq-enviro/commit/082e12c88d55316fa61854d08484360b772b2684))

## [2.0.0-76](https://github.com/agrc/deq-enviro/compare/v2.0.0-75...v2.0.0-76) (2024-04-19)


### 🐛 Bug Fixes

* handle nested parentheses in filter configs ([1ee2326](https://github.com/agrc/deq-enviro/commit/1ee232605368c9e918c22b7bdc6d2b8f696a7e40))


### 🌲 Dependencies

* bump the major-dependencies group in /cloudrun with 5 updates ([9ccdcb7](https://github.com/agrc/deq-enviro/commit/9ccdcb7b91b6fe9463bfee2fcb1b58205c1e9eda))
* Q4 dependency bumps 🌲 ([74cf6af](https://github.com/agrc/deq-enviro/commit/74cf6af301a720d47a1e1764172238cf5d7cf559))


### 📖 Documentation Improvements

* clean up and add app scripts reference blog post ([23683b2](https://github.com/agrc/deq-enviro/commit/23683b2ee9a8d097ad3a3b697324d23ab87c53af))

## [2.0.0-75](https://github.com/agrc/deq-enviro/compare/v2.0.0-74...v2.0.0-75) (2024-04-19)


### 🐛 Bug Fixes

* switch to production ugrc web api ([086309f](https://github.com/agrc/deq-enviro/commit/086309f53a5986bdb809c44a36a49c454620dd9f))


### 📖 Documentation Improvements

* add results grid fields docs ([34967e1](https://github.com/agrc/deq-enviro/commit/34967e1b9dc368ea333a1703759cbc49aa3ca0d6))

## [2.0.0-74](https://github.com/agrc/deq-enviro/compare/v2.0.0-73...v2.0.0-74) (2024-03-15)


### 🐛 Bug Fixes

* add logging for missing layers in config ([fc325a1](https://github.com/agrc/deq-enviro/commit/fc325a16c80058d64a5c2d45ecea99bb0b9d5ba2))

## [2.0.0-73](https://github.com/agrc/deq-enviro/compare/v2.0.0-72...v2.0.0-73) (2024-03-13)


### 🚀 Features

* parse HTML in identify attributes ([dc94ad0](https://github.com/agrc/deq-enviro/commit/dc94ad0c3fe0a233fe284004cd9ba7674fb34909)), closes [#656](https://github.com/agrc/deq-enviro/issues/656)

## [2.0.0-72](https://github.com/agrc/deq-enviro/compare/v2.0.0-71...v2.0.0-72) (2024-03-10)


### 🚀 Features

* search by returned polygon feature ([125d118](https://github.com/agrc/deq-enviro/commit/125d118136d28477d813f36c106fb769ce747e0c)), closes [#647](https://github.com/agrc/deq-enviro/issues/647)


### 🐛 Bug Fixes

* add field types to field configs ([eadc930](https://github.com/agrc/deq-enviro/commit/eadc930968a5a7162717cb269289f8e2c3170aae)), closes [#645](https://github.com/agrc/deq-enviro/issues/645)
* add retry logic to the layer search process ([e416633](https://github.com/agrc/deq-enviro/commit/e416633db90b80a30bd234a6d42477641e44a5a9)), closes [#648](https://github.com/agrc/deq-enviro/issues/648)
* apply label config from spreadsheet ([069565d](https://github.com/agrc/deq-enviro/commit/069565d811ae3d7eecaba04c661d1477c15fa96a)), closes [#649](https://github.com/agrc/deq-enviro/issues/649)
* **button:** better styling for when text wraps ([41dccab](https://github.com/agrc/deq-enviro/commit/41dccabd0bce32d341fec51fbe8a25eb555329f0))
* **button:** smaller default padding for xl size ([ea14cae](https://github.com/agrc/deq-enviro/commit/ea14cae32cdc95c1100becda2d9ae74e192642f4))
* only show config fields in identify pane ([7f15263](https://github.com/agrc/deq-enviro/commit/7f15263631e37f3022a91e5e06d8e37748699717)), closes [#644](https://github.com/agrc/deq-enviro/issues/644)
* prevent reference layer name truncation ([5d012ec](https://github.com/agrc/deq-enviro/commit/5d012ecc1ef66bf46571a3f7a809cfb875e30d92)), closes [#651](https://github.com/agrc/deq-enviro/issues/651)
* switch back to yellow fill for search geometry symbol ([f95a60c](https://github.com/agrc/deq-enviro/commit/f95a60ce51a7095badbbc131c8a2e86567bba20f)), closes [#646](https://github.com/agrc/deq-enviro/issues/646)

## [2.0.0-71](https://github.com/agrc/deq-enviro/compare/v2.0.0-70...v2.0.0-71) (2024-02-27)


### 🐛 Bug Fixes

* allow for spaces in auto-link URLs ([f9755ac](https://github.com/agrc/deq-enviro/commit/f9755acf6f898661e2650e2e46bbcdcf3ee8420e))

## [2.0.0-70](https://github.com/agrc/deq-enviro/compare/v2.0.0-69...v2.0.0-70) (2024-02-15)


### 🐛 Bug Fixes

* another fix for starting over crashes ([7a0d5c4](https://github.com/agrc/deq-enviro/commit/7a0d5c4aa8fa2e4ea6b6196abf77cbde1784e55e))

## [2.0.0-69](https://github.com/agrc/deq-enviro/compare/v2.0.0-68...v2.0.0-69) (2024-02-15)


### 🐛 Bug Fixes

* fix bug causing a crash after clear after doing a search ([60d1d7b](https://github.com/agrc/deq-enviro/commit/60d1d7b343ed11f5c2d4ddcebf738313dac10f38))

## [2.0.0-68](https://github.com/agrc/deq-enviro/compare/v2.0.0-67...v2.0.0-68) (2024-02-13)


### 🐛 Bug Fixes

* fix crash when starting new search after using custom attribute search ([c57b376](https://github.com/agrc/deq-enviro/commit/c57b37681601b0065e9068986456e37625aeced5))

## [2.0.0-67](https://github.com/agrc/deq-enviro/compare/v2.0.0-66...v2.0.0-67) (2024-02-09)


### 🐛 Bug Fixes

* bug preventing radio special filters from working ([dc2c6b0](https://github.com/agrc/deq-enviro/commit/dc2c6b0e9797e1fa8a8bfaab05b02bd9b0bd56e7)), closes [#555](https://github.com/agrc/deq-enviro/issues/555)

## [2.0.0-66](https://github.com/agrc/deq-enviro/compare/v2.0.0-65...v2.0.0-66) (2024-02-06)


### 🐛 Bug Fixes

* **download:** add support for nested relationships ([d80cfa3](https://github.com/agrc/deq-enviro/commit/d80cfa3dade4006c78bfc5e7e9f058dfdbd140c3))
* **download:** prevent duplicate related tables from being created ([a585bc5](https://github.com/agrc/deq-enviro/commit/a585bc53981c1993de3ad76135981b5ac7092af0))
* **download:** support string type primary keys for relationships ([ab93226](https://github.com/agrc/deq-enviro/commit/ab932268c06fb6093f9a734e5c62a81fc0b2c740))
* **download:** workaround for arcgis package bug related to FID field in dry cleaners layer ([b5a2a5f](https://github.com/agrc/deq-enviro/commit/b5a2a5fc959d2153fa828c22219de3fd3e745874))
* handle missing objectIdField props ([7b53800](https://github.com/agrc/deq-enviro/commit/7b5380067f76d369234562eb5a4b32857404380f))
* pass a proper geometry object for state extent ([f2e031a](https://github.com/agrc/deq-enviro/commit/f2e031a89bed5f3a0981b63ff60ae843d144ff2b))
* prevent messing with geometry when caching ([f2a482f](https://github.com/agrc/deq-enviro/commit/f2a482feebacd20097f4c367697ef2313473c4f4))


### 🌲 Dependencies

* bump npm dependencies 🌲 ([55b1eb7](https://github.com/agrc/deq-enviro/commit/55b1eb7804c8f5afc5c4a385d4838e08f7a0b1f2))


### 🎨 Design Improvements

* make search result layer text more aligned ([fa21a98](https://github.com/agrc/deq-enviro/commit/fa21a988c0d5562e853a27000955a76fb8ec9b25))

## [2.0.0-65](https://github.com/agrc/deq-enviro/compare/v2.0.0-64...v2.0.0-65) (2024-01-31)


### 🐛 Bug Fixes

* more CSP updates for qualtrics ([5d4cebb](https://github.com/agrc/deq-enviro/commit/5d4cebbbe339eef6565cbd0973240008525eee47))

## [2.0.0-64](https://github.com/agrc/deq-enviro/compare/v2.0.0-63...v2.0.0-64) (2024-01-31)


### 🚀 Features

* add support for "Additional Search" configs ([7c6eab2](https://github.com/agrc/deq-enviro/commit/7c6eab22071fa749550fdd5a1822fa2ca0f318f3)), closes [#572](https://github.com/agrc/deq-enviro/issues/572)
* add support for "Special Filters Default To On" config field ([9796832](https://github.com/agrc/deq-enviro/commit/97968329f6e9ee26a755c7e5b24dc70031e0dbb7))
* parse dates into human-readable format ([c93878d](https://github.com/agrc/deq-enviro/commit/c93878d473d81b2a3274fca5384476ee4de5ce4b)), closes [#634](https://github.com/agrc/deq-enviro/issues/634)
* show that layer filters have been applied in search progress ([664f89b](https://github.com/agrc/deq-enviro/commit/664f89b8eadac6c4820d2ea9b30ad810af0800af))


### 🐛 Bug Fixes

* allow qualtrics script ([de7a0c4](https://github.com/agrc/deq-enviro/commit/de7a0c475dad1af031a73fca616225a1e4533938))
* apply layer filter defaults when manually clearing search ([f3f827b](https://github.com/agrc/deq-enviro/commit/f3f827b33b3a3d1a7810eff9a25b5549f5e062ec))
* fix bug causing duplicate records to be fetched ([3f7ce9b](https://github.com/agrc/deq-enviro/commit/3f7ce9b15695f61fbe60a0ae0ab75d3810c1ab01))
* fix regression in caching search geometries ([517313b](https://github.com/agrc/deq-enviro/commit/517313b3fe64858fb20c9567c92f329db646f315))
* fix regression preventing result tables from showing layers with errors ([5c19d2c](https://github.com/agrc/deq-enviro/commit/5c19d2c1b7368695614e898ab0e5770338e70a0e))
* handle no layer filter values ([8829d09](https://github.com/agrc/deq-enviro/commit/8829d099ffe017a4701b9e691f62f28e4270d0fd))
* linting errors ([fe14ac5](https://github.com/agrc/deq-enviro/commit/fe14ac56c9b1cf2902ecac467252821a8c588e86))
* **tooltip:** make sure that it's not overlapped by other content ([f9a9721](https://github.com/agrc/deq-enviro/commit/f9a972121b35d4cfbedac4c849bb74506417925e))

## [2.0.0-63](https://github.com/agrc/deq-enviro/compare/v2.0.0-62...v2.0.0-63) (2024-01-30)


### 🚀 Features

* implement layer filters ([0148ee3](https://github.com/agrc/deq-enviro/commit/0148ee384fba3b538aa96597b542d412a97b1216)), closes [#555](https://github.com/agrc/deq-enviro/issues/555)
* **popup:** implement Popup component ([43da064](https://github.com/agrc/deq-enviro/commit/43da0642a76794e0518b3df5c30bfce2da8be9d3))


### 🐛 Bug Fixes

* add analytics to layer-specific filters ([bee3c22](https://github.com/agrc/deq-enviro/commit/bee3c223b1028ecc3ce930a46f3c3ffcac8cf399))
* add hover title to data filter icon ([9f90ef2](https://github.com/agrc/deq-enviro/commit/9f90ef23a7580e5f30208a6aea0592c310ff0359))
* **button:** standardize forwarded component name ([62c9e27](https://github.com/agrc/deq-enviro/commit/62c9e27d5719695569d51d35ed3c41376f7f31d4))
* **input:** add string as a min/max param type ([c46fe68](https://github.com/agrc/deq-enviro/commit/c46fe683d612ddf1ab8eb79a562a15b21338609e))
* linting ([98987e1](https://github.com/agrc/deq-enviro/commit/98987e15e755755e1b58c13495b5dca46166f7ce))

## [2.0.0-62](https://github.com/agrc/deq-enviro/compare/v2.0.0-61...v2.0.0-62) (2024-01-25)


### 🚀 Features

* parse special filter configs ([b949d7f](https://github.com/agrc/deq-enviro/commit/b949d7f319ef75e90464e13e3cd9a23d51241ce5))


### 🐛 Bug Fixes

* **checkbox:** give wrapped labels more vertical separation ([aec8fd9](https://github.com/agrc/deq-enviro/commit/aec8fd9e34d0969d3651246457bd2d554e90026c))

## [2.0.0-61](https://github.com/agrc/deq-enviro/compare/v2.0.0-60...v2.0.0-61) (2024-01-12)


### 🚀 Features

* add custom analytics events ([1afa532](https://github.com/agrc/deq-enviro/commit/1afa532513d5a081f85c96b1281fd5cc7ec30e4c)), closes [#630](https://github.com/agrc/deq-enviro/issues/630)
* show updating activity indicator on map ([269997f](https://github.com/agrc/deq-enviro/commit/269997fed5dd753c9b9d6d291ca40a0d9f1a2f62)), closes [#633](https://github.com/agrc/deq-enviro/issues/633)


### 🐛 Bug Fixes

* allow for scrolling in results pane when no tables are expanded ([67afdbd](https://github.com/agrc/deq-enviro/commit/67afdbd8b67dd4beb534dfee675738ca900cddbe))
* **button:** add onClick to anchor buttons ([55b2d4b](https://github.com/agrc/deq-enviro/commit/55b2d4b6a08c7c387bc22a19ec6412fe56389935))
* ditch dynamic imports ([54ae30c](https://github.com/agrc/deq-enviro/commit/54ae30c42d9f6fa56dfc8b91e9872f6141e142e9))
* **download:** fix bug preventing related tables from showing up in the download ([2709b5d](https://github.com/agrc/deq-enviro/commit/2709b5dcf283fc7c01a80adeae248a00419f9258))
* enable start new search button after download ([5dbb9d0](https://github.com/agrc/deq-enviro/commit/5dbb9d098f3ca5d82fc8ccc69797cb1e4b4b0868)), closes [#632](https://github.com/agrc/deq-enviro/issues/632)
* fix bug preventing search from completing when a layer had an error ([dc8d0c4](https://github.com/agrc/deq-enviro/commit/dc8d0c44fccf2f9e6c0547c49cecfaa854c7a428))
* fix regression bug after upgrading xstate ([b06f7aa](https://github.com/agrc/deq-enviro/commit/b06f7aaf0b0f02f4c81f2f6869dbcdfae619274d))
* layer order in results grid and download should match the search results ([fb0250a](https://github.com/agrc/deq-enviro/commit/fb0250a2d053f7469964a59e9e4e08e8c4093f38))
* move analytics import to provider to allow for mocking in storybook ([b5d66a9](https://github.com/agrc/deq-enviro/commit/b5d66a9f19bd3e54971de49c99f37252414afa5a))
* point to AGOL print task ([2d5f790](https://github.com/agrc/deq-enviro/commit/2d5f7901abb3c371e8223ce75eee77a5c4224d2f))
* prevent showing result table before search is complete ([6062b2c](https://github.com/agrc/deq-enviro/commit/6062b2c563934305a957a92636fa4d6cd426e7b9))
* reduce max returned records to prevent timeouts ([fa860c1](https://github.com/agrc/deq-enviro/commit/fa860c140f06ba5e4d127ae98d3f397809f098c7))
* remove check for export endpoint on feature services ([970fa85](https://github.com/agrc/deq-enviro/commit/970fa85aadd0041f05d938bf676667a97763365f))
* **sherlock:** line -&gt; polyline symbol name ([d5fbdff](https://github.com/agrc/deq-enviro/commit/d5fbdffbfb02edeed565b993fd57707e8b2ce1a8))
* update snapshots ([4043a42](https://github.com/agrc/deq-enviro/commit/4043a42331e75ec513366d12a2247197032cfde2))


### 🌲 Dependencies

* add dependabot config for cloudrun/python ([6506fdb](https://github.com/agrc/deq-enviro/commit/6506fdb058e7770219239565ef8b7240c60efcf7))
* bump deps 🌲 ([d2be3cf](https://github.com/agrc/deq-enviro/commit/d2be3cf803ff6e14058973d8a4df71a894680d5d))
* bump deps 🌲 ([4b0a532](https://github.com/agrc/deq-enviro/commit/4b0a5329334033d5460700e2578e592227e06708))
* bump utah design system to remove annoying console warning ([fbf31b4](https://github.com/agrc/deq-enviro/commit/fbf31b4689a4b282620da8afba829661be43f321))


### 📖 Documentation Improvements

* add note about field alias config option ([a629e66](https://github.com/agrc/deq-enviro/commit/a629e667c594e21fafc08342733ba937591a45e6))
* add notes about cloudrun local dev ([43039ae](https://github.com/agrc/deq-enviro/commit/43039aef0d8b41015a64af647c959cbd5078e417))

## [2.0.0-60](https://github.com/agrc/deq-enviro/compare/v2.0.0-35...v2.0.0-60) (2024-01-02)


### 🐛 Bug Fixes

* **download:** switch from request- to event-driven download processing ([59f011f](https://github.com/agrc/deq-enviro/commit/59f011fd9d11bd963ca0e2e9714739efef848565))

## [2.0.0-35](https://github.com/agrc/deq-enviro/compare/v2.0.0-34...v2.0.0-35) (2023-12-21)


### 🐛 Bug Fixes

* switch download request to be async with firestore push updates ([1018019](https://github.com/agrc/deq-enviro/commit/1018019c19170bcd387540408d1ae297dd0b155f)), closes [#599](https://github.com/agrc/deq-enviro/issues/599)

## [2.0.0-34](https://github.com/agrc/deq-enviro/compare/v2.0.0-33...v2.0.0-34) (2023-12-19)


### 🐛 Bug Fixes

* **download:** implement workaround for shapefile export bug in arcgis ([fe5169c](https://github.com/agrc/deq-enviro/commit/fe5169cd51c2b70507f83fd65d5f9b258ae0636f))
* **download:** use correct geojson export ([d0ff5ad](https://github.com/agrc/deq-enviro/commit/d0ff5ad836851d7223a38047db6fbc856f72549b))
* **download:** use correct logging in bucket module ([8853cd3](https://github.com/agrc/deq-enviro/commit/8853cd38f8b017cd12ea1d7b350674af20ed7527))

## [2.0.0-33](https://github.com/agrc/deq-enviro/compare/v2.0.0-32...v2.0.0-33) (2023-12-15)


### 🐛 Bug Fixes

* **download:** handle empty relationships ([83ea0f9](https://github.com/agrc/deq-enviro/commit/83ea0f90a8603008015ea2024b009ef21565638d))
* remove unused formats ([671d006](https://github.com/agrc/deq-enviro/commit/671d00674efd200141069d226f981562d9a2b4f5))

## [2.0.0-32](https://github.com/agrc/deq-enviro/compare/v2.0.0-31...v2.0.0-32) (2023-12-15)


### 🚀 Features

* **download:** add geojson support and native cloud logging ([bef73cb](https://github.com/agrc/deq-enviro/commit/bef73cb0c08d64bf7e368b39964ff5c1d8a0eb90))
* **download:** implement csv, excel, and shapefile formats ([fa4c03e](https://github.com/agrc/deq-enviro/commit/fa4c03e6ed10ffd6f636752412b44b98ecc45804))

## [2.0.0-31](https://github.com/agrc/deq-enviro/compare/v2.0.0-30...v2.0.0-31) (2023-12-14)


### 🐛 Bug Fixes

* fix env var syntax ([6cc338a](https://github.com/agrc/deq-enviro/commit/6cc338a3ba466d1fcaea4e05f28c09ac4c2f72ba))

## [2.0.0-30](https://github.com/agrc/deq-enviro/compare/v2.0.0-29...v2.0.0-30) (2023-12-13)


### 🐛 Bug Fixes

* remove gunicorn timeout ([79debb2](https://github.com/agrc/deq-enviro/commit/79debb2acdf0bef0119bc347a91e576b9fd4d0c4))

## [2.0.0-29](https://github.com/agrc/deq-enviro/compare/v2.0.0-28...v2.0.0-29) (2023-12-12)


### 🐛 Bug Fixes

* **download:** increase memory limit ([b5646de](https://github.com/agrc/deq-enviro/commit/b5646debd390b1066ae4b0f779019fc268100e94))
* **download:** only allow one request per instance ([f324f4a](https://github.com/agrc/deq-enviro/commit/f324f4a089920850bb9695b58a6f2a2671c0da43))

## [2.0.0-28](https://github.com/agrc/deq-enviro/compare/v2.0.0-27...v2.0.0-28) (2023-12-12)


### 🐛 Bug Fixes

* add cloud run service to content security policy ([845e5d9](https://github.com/agrc/deq-enviro/commit/845e5d9562bbbb064373960ca112287137917e1c))

## [2.0.0-27](https://github.com/agrc/deq-enviro/compare/v2.0.0-25...v2.0.0-27) (2023-12-12)


### 🐛 Bug Fixes

* add cloud run service to content security policy ([c3e4c04](https://github.com/agrc/deq-enviro/commit/c3e4c04dfa9e7b76bf8a6e50a0fb1befe23b2d22))

## [2.0.0-25](https://github.com/agrc/deq-enviro/compare/v2.0.0-24...v2.0.0-25) (2023-12-12)


### 🐛 Bug Fixes

* better text for download button ([22e7723](https://github.com/agrc/deq-enviro/commit/22e77231f28793adc88b329db4e2ef241d99961d))

## [2.0.0-24](https://github.com/agrc/deq-enviro/compare/v2.0.0-23...v2.0.0-24) (2023-12-12)


### 🐛 Bug Fixes

* add download URL environment variable and corresponding secret ([51ae17e](https://github.com/agrc/deq-enviro/commit/51ae17ed1a1eaf5ae0c421acd4f70dfaec21aa0b))
* fix environment variable and secret names ([e5c6353](https://github.com/agrc/deq-enviro/commit/e5c635371f73e00554f07e1737d2eab37104e1e6))

## [2.0.0-23](https://github.com/agrc/deq-enviro/compare/v2.0.0-22...v2.0.0-23) (2023-12-12)


### 🐛 Bug Fixes

* **download:** copy source files in prod container ([dbc81d4](https://github.com/agrc/deq-enviro/commit/dbc81d4bc497aa3540eb95c11cc89b5aa31c61e9))

## [2.0.0-22](https://github.com/agrc/deq-enviro/compare/v2.0.0-21...v2.0.0-22) (2023-12-12)


### 🚀 Features

* **download:** basic bootstrap of cloud run service and dev environment ([ea8bc4a](https://github.com/agrc/deq-enviro/commit/ea8bc4a8d54b9aced5e2f1b11945d13644e4078a))
* wire up front end to download service ([9ccdd94](https://github.com/agrc/deq-enviro/commit/9ccdd94168f0cc2be80194fd89354c62980eaf8c))


### 🐛 Bug Fixes

* use cloudrun as proxy for downloading zip file from bucket ([f223799](https://github.com/agrc/deq-enviro/commit/f223799c01f6fa3eb8a058e1539ef94aee5d08f7))

## [2.0.0-21](https://github.com/agrc/deq-enviro/compare/v2.0.0-20...v2.0.0-21) (2023-11-28)


### 🐛 Bug Fixes

* add skip link to remove warning from UDS header ([7b4d3b2](https://github.com/agrc/deq-enviro/commit/7b4d3b2f11b958361407f68fc963b6f8f9c62552))
* bump deps 🌲 and nodejs version for functions ([aca57fb](https://github.com/agrc/deq-enviro/commit/aca57fbcd4ed10e8c99cb0106e732b905c2b0672))

## [2.0.0-20](https://github.com/agrc/deq-enviro/compare/v2.0.0-19...v2.0.0-20) (2023-10-19)


### 🚀 Features

* add additional information links to related tables ([a468adf](https://github.com/agrc/deq-enviro/commit/a468adf60daede0b12542be74942d6b2f645defa))
* add config support for identify field aliases ([6948c41](https://github.com/agrc/deq-enviro/commit/6948c4120ad543a48c2f40c17d704bc4c462f1e5))
* add counts to related table tabs ([d2cdf08](https://github.com/agrc/deq-enviro/commit/d2cdf088be043c299f10d3167fa4d58ae6b675cc))
* add field name validation to config deploy function ([425718b](https://github.com/agrc/deq-enviro/commit/425718b2c4272d186f96ebdddc81914f2d762f7f))
* add related tables config validation ([46105b3](https://github.com/agrc/deq-enviro/commit/46105b3bcbf9d0ef89cded2b8cbede8a9278e4a4))
* add support for field aliases via config spreadsheet in related table grid fields ([d31fe36](https://github.com/agrc/deq-enviro/commit/d31fe3696320791a02238a5e27c41855b63a912d))
* basic related records implementation ([cfca8ee](https://github.com/agrc/deq-enviro/commit/cfca8ee1c0550b1ddb7f8acaf38b3e21ed8c6de9))


### 🐛 Bug Fixes

* account for missing objectIdField service json prop ([c5f4878](https://github.com/agrc/deq-enviro/commit/c5f48783290a545a8fdf5be86b119d477f56b6eb))
* apply default opacity to point result layers ([7ccdb93](https://github.com/agrc/deq-enviro/commit/7ccdb93139c73c23d2ba39014ac81e2b95df647b)), closes [#574](https://github.com/agrc/deq-enviro/issues/574)
* better calculation for the number of features requested at a time ([e1ce804](https://github.com/agrc/deq-enviro/commit/e1ce80435ea231b8c910339af755ab319af3048c))
* cache unique layer ids rather than entire config ([9b7ecc1](https://github.com/agrc/deq-enviro/commit/9b7ecc1233529428aa9234562c147a695795f77b))
* clear current search if search cache is cleared ([35624a7](https://github.com/agrc/deq-enviro/commit/35624a7432fcb693feefbe1840ee8ebdd341f76b))
* fix bug causing results panel resize handle to become disconnected from the top of the panel ([ab53741](https://github.com/agrc/deq-enviro/commit/ab537414a3966b40e8cfb6f212a4e794d7739fce))
* fix storybook/vite issues ([046027f](https://github.com/agrc/deq-enviro/commit/046027f412ecd530562b7504515d181b45cc7a3f))
* **functions:** fix relationship class field name validation ([b357963](https://github.com/agrc/deq-enviro/commit/b357963428b6c14c0ccfa4c3d9f0ca355c1dcaec))
* linting errors ([f4c8ed4](https://github.com/agrc/deq-enviro/commit/f4c8ed465109479e4c38905170964238c5d2af2c))
* simplify firebase config and update measurement id ([fa3b91a](https://github.com/agrc/deq-enviro/commit/fa3b91a656e7c8ef99d82787c087664d4a786949))
* **tabs:** layout improvements ([00b8045](https://github.com/agrc/deq-enviro/commit/00b80458825b23d9617b3f9e018e2e9e1d1b44c0))


### 🌲 Dependencies

* bump deps ([c04fc6a](https://github.com/agrc/deq-enviro/commit/c04fc6ae513c9fa35a828eddef4b1478324c7b9d))


### 📖 Documentation Improvements

* **simple-table:** add storybook stories ([a1678ec](https://github.com/agrc/deq-enviro/commit/a1678ec109dc3f626426dd24012368d2e93b8dde))

## [2.0.0-19](https://github.com/agrc/deq-enviro/compare/v2.0.0-18...v2.0.0-19) (2023-09-22)


### 🐛 Bug Fixes

* prevent very large zoom extent for searches with some combinations of layers ([8a838aa](https://github.com/agrc/deq-enviro/commit/8a838aa465627843219c13d04d5d6a595bfb347b))

## [2.0.0-18](https://github.com/agrc/deq-enviro/compare/v2.0.0-17...v2.0.0-18) (2023-09-22)


### 🚀 Features

* **dialog:** implement Dialog component ([4f1021e](https://github.com/agrc/deq-enviro/commit/4f1021ed2906531cb637523fba318b41704439c6))
* implement disclaimer popup ([42585ff](https://github.com/agrc/deq-enviro/commit/42585ff3e96a0d088b6dd0d3fc9e4c06cf476279)), closes [#558](https://github.com/agrc/deq-enviro/issues/558)
* make results panel resizable ([817bfc1](https://github.com/agrc/deq-enviro/commit/817bfc1c1faff1912c4b9c2ac1adfd50d3c8a27f)), closes [#551](https://github.com/agrc/deq-enviro/issues/551)


### 🐛 Bug Fixes

* fix bug preventing the advanced filter to be properly reset ([e486ac0](https://github.com/agrc/deq-enviro/commit/e486ac0a10cd3f2f44f0afb6f441924d24dcccae)), closes [#553](https://github.com/agrc/deq-enviro/issues/553)
* fix print widget export button background color ([0003193](https://github.com/agrc/deq-enviro/commit/000319381e4ad8677ec5522b4318d94745b476c8)), closes [#559](https://github.com/agrc/deq-enviro/issues/559)
* prevent results panel from scrolling past the bottom of the table ([f38b3c2](https://github.com/agrc/deq-enviro/commit/f38b3c2cfe84e0c8fb0a042b9746c7ffa99382a2)), closes [#570](https://github.com/agrc/deq-enviro/issues/570)
* shorten results grid default height ([c665559](https://github.com/agrc/deq-enviro/commit/c665559a91ff9f8ae44f938e214a921698d8d8cb)), closes [#552](https://github.com/agrc/deq-enviro/issues/552)

## [2.0.0-17](https://github.com/agrc/deq-enviro/compare/v2.0.0-16...v2.0.0-17) (2023-09-21)


### 🚀 Features

* **input:** implement prefix and suffix props ([7514c88](https://github.com/agrc/deq-enviro/commit/7514c88263ebcdf9ffe6a615df1f2fe211a5f37b))


### 🐛 Bug Fixes

* fix incorrect calculation for longitude in degrees, minutes, seconds ([021dcf7](https://github.com/agrc/deq-enviro/commit/021dcf7e2cb5b0cadbdea8f1ec6532bc43d554b5))
* make sure that map can't zoom in too far ([c02c301](https://github.com/agrc/deq-enviro/commit/c02c3013625b47f0a196049f3029d462ce724e32))

## [2.0.0-16](https://github.com/agrc/deq-enviro/compare/v2.0.0-15...v2.0.0-16) (2023-09-20)


### 🐛 Bug Fixes

* cache search geometry after change ([f8cd01f](https://github.com/agrc/deq-enviro/commit/f8cd01f08e5f651ec0f730713907a9b2d604d078))
* fix bug preventing search geometry from being cached between sessions ([55b61dd](https://github.com/agrc/deq-enviro/commit/55b61dd8ed00d4af9c5c59ca5968be3e228b7950))
* fix incorrect symbol style token ([d9a6ce4](https://github.com/agrc/deq-enviro/commit/d9a6ce4d5a612dcb4f0e2f8834035ee37f9602be))
* handle searching by id/name in numeric fields ([5bea12d](https://github.com/agrc/deq-enviro/commit/5bea12dfe53c09d2cad8c5cb0eebb570098fb3a9))
* make search graphic less intrusive ([0eb1162](https://github.com/agrc/deq-enviro/commit/0eb1162fe1d1830f0388cde1227d6bdba2b93180))
* make searching more accurate and performant ([bb0a992](https://github.com/agrc/deq-enviro/commit/bb0a992498bb4cc9ab8c9869cdd4f235ef9b23f3))
* page through results if there are more than the max result count ([1118567](https://github.com/agrc/deq-enviro/commit/11185679a18e4b0e6b8986020bb2e20d336ecbc9))
* remove client-side queries ([8830303](https://github.com/agrc/deq-enviro/commit/88303030c54ff3f234f7347cf29e8f24c4e9b103))
* zoom to points in identify pane ([8dd80d5](https://github.com/agrc/deq-enviro/commit/8dd80d51c3e3e5b3f6d937e8960821214e8b0456))

## [2.0.0-15](https://github.com/agrc/deq-enviro/compare/v2.0.0-14...v2.0.0-15) (2023-09-07)


### 🚀 Features

* add error boundary to search result layer ([d462983](https://github.com/agrc/deq-enviro/commit/d462983ff14b08f6a21a55014bcb6f92c6406c1d))
* add legends to result tables ([3b3db1c](https://github.com/agrc/deq-enviro/commit/3b3db1c635f38a8a216b2a38dd01f04844039b23)), closes [#556](https://github.com/agrc/deq-enviro/issues/556)
* use nice looking default symbols ([a9c4edd](https://github.com/agrc/deq-enviro/commit/a9c4edd1b0f10c2e04cd9076fa2029cc0ff3c39a))
* use symbology from AGOL item, if available ([b387f52](https://github.com/agrc/deq-enviro/commit/b387f52ec2f6878b20c2a2a3634a1fc736acb90d))


### 🐛 Bug Fixes

* always add points on top of polygon layers ([11a2536](https://github.com/agrc/deq-enviro/commit/11a2536475c4cf388f73e84462c7519c88e859f5)), closes [#546](https://github.com/agrc/deq-enviro/issues/546)
* fix result table default sorting regression ([b9518e5](https://github.com/agrc/deq-enviro/commit/b9518e5d95855694d998520574bae501ddf32d6c))

## [2.0.0-14](https://github.com/agrc/deq-enviro/compare/v2.0.0-13...v2.0.0-14) (2023-08-31)


### 🐛 Bug Fixes

* **functions:** handle validation for {FieldName} syntax in link configs ([dd9fb30](https://github.com/agrc/deq-enviro/commit/dd9fb302e87287bd27bd5f2f10bdb1828ced80bd))

## [2.0.0-13](https://github.com/agrc/deq-enviro/compare/v2.0.0-12...v2.0.0-13) (2023-08-30)


### 🚀 Features

* **button:** add link buttons ([7bd908e](https://github.com/agrc/deq-enviro/commit/7bd908e0bfecc7750265fa059b7b8d5224af3708))
* convert urls to links in feature identify attributes tab ([e506482](https://github.com/agrc/deq-enviro/commit/e506482d25c0b604b0a61fb47d99ec09335315b0))
* **icon:** add additional more* icons ([cdfc0f4](https://github.com/agrc/deq-enviro/commit/cdfc0f4e1187224c71f5efb7eec400adc85f5d69))
* implement feature identify with attributes only ([5a77d10](https://github.com/agrc/deq-enviro/commit/5a77d10645852e96fd1144f0f3b4436e8995bff1))
* implement links in identify panel ([2cef5b6](https://github.com/agrc/deq-enviro/commit/2cef5b64a5f95e5aaa1ddea53316129272705e98))
* implement map feature selection ([7706b1b](https://github.com/agrc/deq-enviro/commit/7706b1b6d4b1f59a908ce6a1e52fb4a0be3fea6b))
* implement zoom to feature in identify pane ([da7097a](https://github.com/agrc/deq-enviro/commit/da7097ab37fa28a17edeac3486d812ba9afa0aa9))
* **simple-table:** implement simple table component ([26fd030](https://github.com/agrc/deq-enviro/commit/26fd030ef3917d14d1f72d5f189d9e76270bf46d))
* **simple-table:** wrap longer content ([97bf6ec](https://github.com/agrc/deq-enviro/commit/97bf6ec13851c8b36258bf2b57af6e8bc00893a5))
* **table:** add support for custom column widths ([eefbef7](https://github.com/agrc/deq-enviro/commit/eefbef763726d7788b6333cb6868f3fee387335a))
* **table:** add support for row hover css pseudo-classes ([7ead7aa](https://github.com/agrc/deq-enviro/commit/7ead7aa2420b08f6683ec098df852b434685fea8))
* **tabs:** implement tabs component ([5ddcaef](https://github.com/agrc/deq-enviro/commit/5ddcaef0e1e37e2633fbd13b44503f74b72773a6))
* use field aliases in result tables headers ([95d38c3](https://github.com/agrc/deq-enviro/commit/95d38c3b716904a9eeba77dbba6d5caca5c62616))


### 🐛 Bug Fixes

* prevent identify attributes table from overflowing it's parent ([5ff5040](https://github.com/agrc/deq-enviro/commit/5ff50404974bbc77a12f3cd969c333db0ddd4ad9))


### 📖 Documentation Improvements

* add link to analytics dashboard ([259f365](https://github.com/agrc/deq-enviro/commit/259f365125e2f8a51a2e9081185b5207a7ccf0a9))
* cull old info and start adding v2 stuff ([03984a5](https://github.com/agrc/deq-enviro/commit/03984a5cf281987f8d6bbd65fca2c68c5f7e2e85))

## [2.0.0-12](https://github.com/agrc/deq-enviro/compare/v2.0.0-11...v2.0.0-12) (2023-07-20)


### 🐛 Bug Fixes

* **functions:** correct lazy import path ([5f5d8fc](https://github.com/agrc/deq-enviro/commit/5f5d8fc06f298a789df21ad7c4352afce4676e8a))

## [2.0.0-11](https://github.com/agrc/deq-enviro/compare/v2.0.0-10...v2.0.0-11) (2023-07-19)


### 🚀 Features

* add max record count warning ([a79fe1e](https://github.com/agrc/deq-enviro/commit/a79fe1e1709d1321b3bacf52c679746f06885374))
* **table:** make columns sortable ([c12a3c1](https://github.com/agrc/deq-enviro/commit/c12a3c1f5ade54824b0e27f4d4ba284b628e6450))
* **table:** support default sorting ([c4564cb](https://github.com/agrc/deq-enviro/commit/c4564cb294e22d82c45171850826c49e6940f6cd))


### 🐛 Bug Fixes

* sort by the first field in grid by default ([56b7077](https://github.com/agrc/deq-enviro/commit/56b70771107f168a4beda0ccb2713f274fcd1bb0))
* **table:** add labels to sort icons ([81d4fb3](https://github.com/agrc/deq-enviro/commit/81d4fb35adb6ea9057de5275c66beed9a4533ff2))
* **table:** make sorted state more UDS-compliant ([70ddd57](https://github.com/agrc/deq-enviro/commit/70ddd573837b00c4ec28ad4cc23e86b9703a4ce2))
* update deprecated prop for react-table ([a5a0e3c](https://github.com/agrc/deq-enviro/commit/a5a0e3c55dc9bf2848331dd0e9f0a51a3cdc0565))


### 🌲 Dependencies

* bump deps 🌲 ([4155d32](https://github.com/agrc/deq-enviro/commit/4155d32671d78fa96e89cdec75f3b26769e44838))

## [2.0.0-10](https://github.com/agrc/deq-enviro/compare/v2.0.0-9...v2.0.0-10) (2023-07-17)


### 📖 Documentation Improvements

* **table:** add example reference ([54ebc85](https://github.com/agrc/deq-enviro/commit/54ebc855cbf40a04f0e95f917b6bdb41f8ce340b))


### 🚀 Features

* add max record count warning ([afbce1b](https://github.com/agrc/deq-enviro/commit/afbce1b50fc027ef0a8b841373b052ec5bd329af))
* **link:** implement link component for utah design system ([89d1a48](https://github.com/agrc/deq-enviro/commit/89d1a4837cb79ef5f88393f93f15f94a268059ca))
* **table:** make columns sortable ([1401aec](https://github.com/agrc/deq-enviro/commit/1401aec08f7c25341774de4787d490783d50745d))
* **table:** support default sorting ([996a44f](https://github.com/agrc/deq-enviro/commit/996a44fe9f172684db06d5c6df845aafc0937844))


### 🐛 Bug Fixes

* **icon:** switch to inline flex ([11a7081](https://github.com/agrc/deq-enviro/commit/11a7081c6b62df14e80c0f105083fe53dae514db))
* prevent user from zooming in beyond base map tiles ([bf879e0](https://github.com/agrc/deq-enviro/commit/bf879e0a0a65293ea615f2a021f0e17687b69b64))
* sort by the first field in grid by default ([ec9a0c4](https://github.com/agrc/deq-enviro/commit/ec9a0c48fd278b479d280b1c85530e9a73c88694))
* **table:** add labels to sort icons ([0e025bc](https://github.com/agrc/deq-enviro/commit/0e025bc0b695f3eeff1e1f567c19eadc5d382160))
* **table:** make sorted state more UDS-compliant ([ddd6149](https://github.com/agrc/deq-enviro/commit/ddd61497a769e77c70834de93cd4681c63824a92))

## [2.0.0-9](https://github.com/agrc/deq-enviro/compare/v2.0.0-8...v2.0.0-9) (2023-07-17)


### 📖 Documentation Improvements

* add more drawing instructions ([6955956](https://github.com/agrc/deq-enviro/commit/695595620d99fc8475c713704c458d9471757c37))


### 🎨 Design Improvements

* fix mobile sidebar layout ([5f7dbaa](https://github.com/agrc/deq-enviro/commit/5f7dbaa47f98d6f1e2f6ab6cc04cfdf5073bab74))
* give tag a bit more room ([006c5d9](https://github.com/agrc/deq-enviro/commit/006c5d900dc87d2cba1a7aaf13b0317103bc1406))
* handle longer search filter name tags ([6bb8d1e](https://github.com/agrc/deq-enviro/commit/6bb8d1e432f75565c5340dfc83e659a1a8ca3ae0))
* **sherlock:** prevent hover boundary from overlapping label ([444375a](https://github.com/agrc/deq-enviro/commit/444375abae696d08d52bbd782ea55227c494dfdc))
* standardize spacing ([192e263](https://github.com/agrc/deq-enviro/commit/192e2632c57bf60520693ab5d2c870bde6f60643))


### 🚀 Features

* add error boundary ([023d718](https://github.com/agrc/deq-enviro/commit/023d7186f2a361d1efa342b03572e64feda2093e))
* add print widget ([cee6df5](https://github.com/agrc/deq-enviro/commit/cee6df5041b1df24562757d48987d68317bc2a32))
* add reference layers ([14c8dd8](https://github.com/agrc/deq-enviro/commit/14c8dd823c01aea481c1fb45f18d42136530d8db))
* implement coordinates advanced filter ([57cf9f4](https://github.com/agrc/deq-enviro/commit/57cf9f4adbdde4b8aa682509b63e2053d3b0da3c))
* implement name and id searches ([c512f57](https://github.com/agrc/deq-enviro/commit/c512f57731fbcfa0cfe9236aa8440c1f3fb76c00))
* implement statewide, county, city, and zip for advanced filter ([2c5880e](https://github.com/agrc/deq-enviro/commit/2c5880e778809637776edb36422f43b8982b5df5))
* implement stream advanced filter ([09cc407](https://github.com/agrc/deq-enviro/commit/09cc407589b4538664db83bf1d73f41193234481))
* implement street address filter ([592c3ee](https://github.com/agrc/deq-enviro/commit/592c3ee1620f5fd83cc17098349c7dcb80108fb0))
* implement user-drawn shape filter ([9e41bea](https://github.com/agrc/deq-enviro/commit/9e41bea472575bf5297cf9444f5f006af9ea4302))
* **input:** implement utds input ([5a781b5](https://github.com/agrc/deq-enviro/commit/5a781b5f516d8bbeb7887a69e64834d690801dba))
* **select:** implement basic select component ([7cbb4f9](https://github.com/agrc/deq-enviro/commit/7cbb4f969fe03185c6d180aa273ba56527d1afc0))
* **sherlock:** implement utds version of sherlock ([ce9db6a](https://github.com/agrc/deq-enviro/commit/ce9db6a93f2fdccecfb620b38aafe4592e754086))


### 🐛 Bug Fixes

* add missing label ([a5cbac0](https://github.com/agrc/deq-enviro/commit/a5cbac0b0fe3300e7e3d7f08db9e4e7ef48f8541))
* add new domain to csp ([a238a88](https://github.com/agrc/deq-enviro/commit/a238a883747f18929d389f60b91463a2b693328b))
* add verb to advanced filter button ([6308b81](https://github.com/agrc/deq-enviro/commit/6308b81a03dec5cbda0c089bc2459aa06db37e48))
* allow for requests to dev web api ([863d294](https://github.com/agrc/deq-enviro/commit/863d294c79a729e6f7d7e53d2444b690ab1fb96e))
* better layout and scrolling for result tables ([4d241aa](https://github.com/agrc/deq-enviro/commit/4d241aa8224a3565b213ccbae7cdd42d9994aeb0))
* better/more reliable flow for search wizard ([19e15d7](https://github.com/agrc/deq-enviro/commit/19e15d7b973edcd81c9bcffd841eaecc54f304e2))
* **ci:** add missing env var ([f04cd8c](https://github.com/agrc/deq-enviro/commit/f04cd8c68011e0833b8e75288e5ca67767db671e))
* **ci:** switch to separate web api key for previews ([9f84cfc](https://github.com/agrc/deq-enviro/commit/9f84cfc11be315f3071305293f91fb118045401e))
* clear search cache if schema has changed ([1c6c69b](https://github.com/agrc/deq-enviro/commit/1c6c69bc8633885ee4b76c81ffda0daefd2a3cf6))
* disable download button if no layers are selected ([c0033b0](https://github.com/agrc/deq-enviro/commit/c0033b0a149ca5b0785ae8b50c6e54292c1f10fb))
* don't pass booleans to className prop ([9c144ab](https://github.com/agrc/deq-enviro/commit/9c144abee378ca81aff3efb4922859cf309f6e54))
* don't try to download layers with no results ([3595bc7](https://github.com/agrc/deq-enviro/commit/3595bc754c46a29f1503ed0559f60859f8b51ea7))
* fix downloads for feature services with non-0 layer indexes ([7b1954f](https://github.com/agrc/deq-enviro/commit/7b1954f3db6c4bd4e76fc7be2fe5440f5e6d2466))
* **functions:** init app in config update function ([e43cf2b](https://github.com/agrc/deq-enviro/commit/e43cf2b68b9c78a084a9dfad96eb7023265c628b))
* **functions:** lazy load to help with cold starts ([fb5a3a3](https://github.com/agrc/deq-enviro/commit/fb5a3a381096108948f0bc918e43696370e578e2))
* **functions:** more proper secrets access 🎩 ([a8ccf78](https://github.com/agrc/deq-enviro/commit/a8ccf78e2ee1a6f65727c00757b06bb84bec13ca))
* **functions:** move opensgid params to secret ([d94bdab](https://github.com/agrc/deq-enviro/commit/d94bdabfad75cdc1e53098eff34dc1687276c8c4))
* **functions:** remove unnecessary imports and correct secrets ([d317d7b](https://github.com/agrc/deq-enviro/commit/d317d7be8903695e519fdee58f5e957a23281b61))
* hide footer using config rather than css ([9fdf8b1](https://github.com/agrc/deq-enviro/commit/9fdf8b13085f9936aa3e3ea8b33f3219e5bc2524)), closes [#528](https://github.com/agrc/deq-enviro/issues/528)
* import typo ([25fe8c0](https://github.com/agrc/deq-enviro/commit/25fe8c013cb78bbf5436973e2db5ed54f5c66027))
* increase node heap size for building storybook ([25b9341](https://github.com/agrc/deq-enviro/commit/25b9341842508dfcda2696de0d5b9647c3e8f223))
* **input:** pass required attribute and merge classNames ([454ea14](https://github.com/agrc/deq-enviro/commit/454ea140e450702819b659910800cb0d70330f07))
* make sure that map zooms reliably ([54fe657](https://github.com/agrc/deq-enviro/commit/54fe65770d00dde2a5d38909e2249f3cadef971b))
* make sure that the user can always see the bottom of the select filter type dropdown ([f0613d9](https://github.com/agrc/deq-enviro/commit/f0613d983a9ddd35e8542224d29260a465418cd5))
* more descriptive name for attribute filters ([4704a1c](https://github.com/agrc/deq-enviro/commit/4704a1c867945e6c956df232f7588ae0ec4e5168))
* more stable general layout ([1160bb4](https://github.com/agrc/deq-enviro/commit/1160bb48f489352725add6f74a65cef0d1830166))
* **select:** allow for passing className ([b9d8fde](https://github.com/agrc/deq-enviro/commit/b9d8fde55f5869b241d46c3c7fcbd7e2de603a32))
* **select:** move drop-down to body so that it always overlaps everything else ([a5ab57f](https://github.com/agrc/deq-enviro/commit/a5ab57fe9deb979b8c03018458f406566de2be27))
* **sherlock:** better z-index application ([7d707e1](https://github.com/agrc/deq-enviro/commit/7d707e1421ed9bb9734e714f4600068afbf76b7a))
* **sherlock:** bring into better utds compliance ([88ca491](https://github.com/agrc/deq-enviro/commit/88ca491dc346837c7f4c75a3b53e47ca9d93f3ac))
* **sherlock:** clean up unnecessary utility class ([e47e982](https://github.com/agrc/deq-enviro/commit/e47e98210725679651c49886bb39acda86a078d1))
* **sherlock:** debounce search function ([4891751](https://github.com/agrc/deq-enviro/commit/4891751e795d239444fbfe7130fbdb3cd27e4516))
* **sherlock:** export provider base to allow for custom providers ([31d6812](https://github.com/agrc/deq-enviro/commit/31d68121d492996e354fce37c614c49204b87b03))
* **sherlock:** linting error ([5144d45](https://github.com/agrc/deq-enviro/commit/5144d45fa91a19d0f5f1c15fbcfbd1d4af4dee0f))
* **sherlock:** more linting ([df5b3a4](https://github.com/agrc/deq-enviro/commit/df5b3a452db61a3e2e43f7deeaf5d174a0096815))
* **sherlock:** remove `identical` attribute style option ([28d682e](https://github.com/agrc/deq-enviro/commit/28d682e28c5147d8b4a7a339d45bfd7f608d9985))
* **sherlock:** return a single graphic for now ([120c362](https://github.com/agrc/deq-enviro/commit/120c362f94faf0623cf9c3ce282948604532ef5f))
* **sherlock:** show loading indicator when getting matched feature ([1bbc678](https://github.com/agrc/deq-enviro/commit/1bbc6784e4792e8b5489e447ec0e874314062d42))
* **sherlock:** switch to ky for better error handling ([134975d](https://github.com/agrc/deq-enviro/commit/134975ddbef03b13eb8336e7baf49bba151b2fee))
* solidify map zooming to advanced filter geometry ([4c578b0](https://github.com/agrc/deq-enviro/commit/4c578b0d0fa8ebcfc531d38673b2b07ba74c4f13))
* **style:** use more generic color names ([7ddd82c](https://github.com/agrc/deq-enviro/commit/7ddd82cc2750487ff5e132ce4122f8c3ab583627))
* switch to custom function for stream search ([d75b9a5](https://github.com/agrc/deq-enviro/commit/d75b9a58d833522c7a857dfb4db3c2fb9e10336e))
* **table:** don't expand row(s) to fill height ([5c59824](https://github.com/agrc/deq-enviro/commit/5c598242d3564ce5e7f03c1638e3f8cc1d433227))
* **utds:** standardize height between select, sherlock, and input ([41492e5](https://github.com/agrc/deq-enviro/commit/41492e5f01af270aca1246e8203c5c831873ce58))
* wire up start over after download ([ed4f8c5](https://github.com/agrc/deq-enviro/commit/ed4f8c5eff2c2d6b4ab5b16dd70a3cff8951de51))

## [2.0.0-8](https://github.com/agrc/deq-enviro/compare/v2.0.0-7...v2.0.0-8) (2023-06-05)


### 🎨 Design Improvements

* give more distinction to the filter text ([6e126a2](https://github.com/agrc/deq-enviro/commit/6e126a28b2ed90f6f65a6d16aeb40a3238e1eea0))
* keep buttons at the bottom ([e974269](https://github.com/agrc/deq-enviro/commit/e9742695a192f22d4420aefc8fd99132d1a0f007))


### 🚀 Features

* add geopackage and sqlite download formats ([5e0acb9](https://github.com/agrc/deq-enviro/commit/5e0acb91469c055fb594f6c494e03df4c2ef2182))
* basic results grid with tables ([063712b](https://github.com/agrc/deq-enviro/commit/063712be49a46d4d23854732f3135a12e4b2feee))
* implement download function ([1989718](https://github.com/agrc/deq-enviro/commit/1989718a4577f49c4346661b440231cfee9e3994))
* **radio-group:** implement UTDS RadioGroup component ([561b316](https://github.com/agrc/deq-enviro/commit/561b3166ab3bd64b15f175b1c05f541fc7190ad2))
* **table:** implement utds table ([7afb245](https://github.com/agrc/deq-enviro/commit/7afb2456723bcac8619d89b03f125314b94ede04))
* **update:** add validation errors ([c6e79ce](https://github.com/agrc/deq-enviro/commit/c6e79cea4295be96cc8c5f990c213d19c850031e))


### 🐛 Bug Fixes

* **checkbox:** more clear change event name and show hover effects only when clickable ([1c3746b](https://github.com/agrc/deq-enviro/commit/1c3746bbbb356d0dcb9d3bc2ce06d1b8a3dc3a07))
* clear map layers when wizard is cleared ([7a548b7](https://github.com/agrc/deq-enviro/commit/7a548b7544c963bbc3f304c657a561d897e78bee))
* **functions:** clean up unused npm packages ([c59d432](https://github.com/agrc/deq-enviro/commit/c59d4322403032f1af5933cc4ba077c4e0f5e9cf))
* **generate:** switch to got for retry functionality ([8bf367b](https://github.com/agrc/deq-enviro/commit/8bf367bfb9091165cbdf1dff9c6510d37ccb8443))
* **generate:** use newer api ([65bcbae](https://github.com/agrc/deq-enviro/commit/65bcbae84ef8ba0b56688e007b75273a0e7b3876))
* more accurately reflect if service supports exports ([50667e5](https://github.com/agrc/deq-enviro/commit/50667e59e73b06a104fb5e1744d064d0d2b0bf37))
* more appropriate buttons and names for result state ([a57d328](https://github.com/agrc/deq-enviro/commit/a57d328944969c3220b0eede109258b00729d695))
* more clear language ([6cb4621](https://github.com/agrc/deq-enviro/commit/6cb462149d75346e5260e9d4f8fbbdec43632764))
* **radio & checkbox:** use better cursor for disabled state ([0fcd9be](https://github.com/agrc/deq-enviro/commit/0fcd9beba15f205647065deb0d280094e9916320))
* renaming export bug ([63d5983](https://github.com/agrc/deq-enviro/commit/63d5983d04e0e8d6a7216a4dd36ded1d73ffbbbb))
* sort divisions and layer names alphabetically ([0221929](https://github.com/agrc/deq-enviro/commit/022192940916658fe35b816155599e4dbb9bdff9))
* **spinner:** add standard sizes that match text sizes ([0e35873](https://github.com/agrc/deq-enviro/commit/0e35873649f1135dfcdc2bd3d74d6d0b36161f1a))
* switch to createReplica calls from client for downloads per layer ([e0a5acf](https://github.com/agrc/deq-enviro/commit/e0a5acf2f8f23b9684ea9df8e30a211ae9d576dc))
* **utds:** clsx -&gt; tailwind-merge and remove all important qualifiers ([6fa3a1a](https://github.com/agrc/deq-enviro/commit/6fa3a1a540deba9e4149628a8155e90e33cf2617))

## [2.0.0-7](https://github.com/agrc/deq-enviro/compare/v2.0.0-6...v2.0.0-7) (2023-05-16)


### 🐛 Bug Fixes

* **ci:** install function deps during deploy ([138474c](https://github.com/agrc/deq-enviro/commit/138474c9f7d2a25145e8e1ae7f3855641f0240dc))

## [2.0.0-6](https://github.com/agrc/deq-enviro/compare/v2.0.0-5...v2.0.0-6) (2023-05-16)


### 🚀 Features

* add search and clear buttons ([da431dd](https://github.com/agrc/deq-enviro/commit/da431dd28ad5552677c06156a8c77bf4bbdad858))
* **button:** implement the beginnings of the utds button ([f2fb7f5](https://github.com/agrc/deq-enviro/commit/f2fb7f59ab13db531cd1554a3f041000a333497d))
* deploy storybook static site in staging ([d8d964d](https://github.com/agrc/deq-enviro/commit/d8d964d94177a5aaab09f209fbdc38cd98f85f12))
* implement basic search ([938db23](https://github.com/agrc/deq-enviro/commit/938db2358eef9800173bcb3aec40a88288fd2d40))
* **spinner:** pull out spinner as separate component ([54a6932](https://github.com/agrc/deq-enviro/commit/54a6932a88c3390f9d96f7256b72f2f8d0f7807d))


### 🎨 Design Improvements

* **button:** give stories more space ([1ef0f10](https://github.com/agrc/deq-enviro/commit/1ef0f107396950895b55c40afd301f6a2ad3bf2a))


### 🐛 Bug Fixes

* allow storybook inline scripts in CSP ([4f62504](https://github.com/agrc/deq-enviro/commit/4f62504cf32c4f8f87323d1715ba5b7c8f0cd5e0))
* **button:** prevent text selection ([b0724d2](https://github.com/agrc/deq-enviro/commit/b0724d2a00d03caad159339de94232507535b682))
* **ci:** add functions project to dependabot ([d4da139](https://github.com/agrc/deq-enviro/commit/d4da1397fcf2f7aa656dee7ab5c9b006fa1bd2bc))
* **ci:** don't update remote config defaults in actions ([d3e13ea](https://github.com/agrc/deq-enviro/commit/d3e13ea7a5ddfc841f60681ae5ed0f5d83319444))
* **ci:** download functions project deps before tests ([da71d36](https://github.com/agrc/deq-enviro/commit/da71d3646f4b86c3216bbc64ff477de9fb9956b5))
* default to lite base map ([dffc362](https://github.com/agrc/deq-enviro/commit/dffc3620a6e3a0338822f322afcb8bf957d27f9d))
* **icon:** add support for use within a radix primitive using asChild ([113dcc9](https://github.com/agrc/deq-enviro/commit/113dcc9c934302ab6364b4f98dbe100373b5053d))
* make feature service a required field for query layers ([cb21109](https://github.com/agrc/deq-enviro/commit/cb2110984610e695ee3abc01d887d87db33b3f23))
* move functions into separate project ([523da1c](https://github.com/agrc/deq-enviro/commit/523da1ce342d173605c320277e33d6c5507a3e24))
* **spinner:** add some accessibility stuff ([3ababbe](https://github.com/agrc/deq-enviro/commit/3ababbe73568c8e75164d3a69df451d543fc33c2))
* **style:** gray -&gt; slate ([959e6f8](https://github.com/agrc/deq-enviro/commit/959e6f83c70f391e92c9f6a0b5cfdb3e427b8e16))
* **tooltip:** allow for string or component triggers ([3752602](https://github.com/agrc/deq-enviro/commit/375260253d15c6a57ba8d2c1f82374fa5631fe17))

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

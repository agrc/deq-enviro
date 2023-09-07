console.log(
  `🤓 Hey there! Here are a few console commands that might be useful to nerds like you:

  enviro.selectAllLayers() - Selects all of the query layers for searching
`,
);

window.enviro = {
  selectAllLayers: () => {
    document
      .querySelectorAll('[data-state=closed]>button')
      .forEach((button) => button.click());
    document
      .querySelectorAll('button[role=checkbox]')
      .forEach((button) => button.click());
  },
};

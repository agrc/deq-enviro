console.log(
  `🤓 Hey there! Here are a few console commands that might be useful to nerds like you:

  enviro.selectAllLayers() - Selects all of the query layers for searching
`,
);

// @ts-expect-error
window.enviro = {
  selectAllLayers: () => {
    document
      .querySelectorAll('[data-state=closed]>button')
      // @ts-expect-error
      .forEach((button) => button.click());
    document
      .querySelectorAll('button[role=checkbox]')
      // @ts-expect-error
      .forEach((button) => button.click());
  },
};

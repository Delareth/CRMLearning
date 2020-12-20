/// <reference path="typings/globals/xrm/index.d.ts" />

var Navicon = Navicon || {};

Navicon.nav_Utils = (function()
{
  // debug
  const getMethods = (obj) => {
    let properties = new Set();
    let currentObj = obj;
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function');
  }

  return {
    /**
     * @returns {Xrm.Page.Control}
     */
    GetControlByName: function(ui, tabName, fieldName)
    {
      const tab = ui.tabs.get(tabName);

      for (const sections of tab.sections.get())
      {
        const control = sections.controls.get(fieldName);

        if (control !== null) return control;
      }

      return undefined;
    },
    setFieldShowState: function(ui, tab, fieldName, state)
    {
      const control = this.GetControlByName(ui, tab, fieldName);

      control.setVisible(state);
    },
    // debug
    printMethodsInfo: function(...args)
    {
      console.log("----------------");
      for (const info of args)
      {
        console.log(info.constructor.name);
        console.log(getMethods(info));
      }
      console.log("----------------");
    }
  }
})();

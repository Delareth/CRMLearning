/// <reference path="typings/globals/xrm/index.d.ts" />

var Navicon = Navicon || {};

Navicon.nav_Model = (function()
{
  const ADMINROLENAME = "System Administrator";

  function checkIsUserSystemAdmin(formContext)
  {
    const isSystemAdmin = isUserWithRole(ADMINROLENAME);

    changeLockStateForAllFields(formContext.ui, !isSystemAdmin);
  }

  function changeLockStateForAllFields(ui, state)
  {
    const tab = ui.tabs.get("general");

    for (const sections of tab.sections.get())
    {
      for (const control of sections.controls.get())
      {
        control.setDisabled(state);
      }
    }
  }

  function isUserWithRole(roleName)
  {
    // eslint-disable-next-line no-undef
    const currentUserRoles = Xrm.Utility.getGlobalContext().userSettings.roles.get();

    for (let role of currentUserRoles)
    {
      if (role.name === roleName) return true;
    }

    return false;
  }

  return {
    onLoad: function(context)
    {
      checkIsUserSystemAdmin(context.getFormContext());
    }
  }
})();

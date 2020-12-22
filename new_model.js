/// <reference path="typings/globals/xrm/index.d.ts" />

var Navicon = Navicon || {};

Navicon.nav_Model = (function()
{
  const ADMINROLEID = "fe8dce58-773c-eb11-bf69-000d3a49de7b";

  function checkIsUserSystemAdmin(formContext)
  {
    const isSystemAdmin = isUserWithRole(ADMINROLEID);

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

  function isUserWithRole(roleId)
  {
    // eslint-disable-next-line no-undef
    const currentUserRoles = Xrm.Utility.getGlobalContext().userSettings.securityRoles;

    for (let userRoleID of currentUserRoles)
    {
      if (userRoleID === roleId) return true;
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

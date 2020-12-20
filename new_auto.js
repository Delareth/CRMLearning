/// <reference path="typings/globals/xrm/index.d.ts" />

var Navicon = Navicon || {};

Navicon.nav_Auto = (function()
{
  const VARS = {
    FieldIsDamaged: "new_isdamaged",
    FieldKm: "new_km",
    FieldOwnersCount: "new_ownerscount",
    FieldUsed: "new_used",
    TabGeneral: "general"
  }

  function isAutoUsed(formContext)
  {
    const isUsed = formContext.getAttribute(VARS.FieldUsed).getValue();

    return isUsed === null ? false : isUsed;
  }

  function setUsedInfoShowState(formContext, state)
  {
    const usedFields = [VARS.FieldIsDamaged, VARS.FieldKm, VARS.FieldOwnersCount];

    for (const field of usedFields)
    {
      Navicon.nav_Utils.setFieldShowState(formContext.ui, VARS.TabGeneral, field, state);
    }
  }

  function setListenerOnUsed(formContext)
  {
    const field = formContext.getAttribute(VARS.FieldUsed);

    field.addOnChange(onUsedChanged);
  }

  function onUsedChanged(context)
  {
    const formContext = context.getFormContext();
    const isUsed = isAutoUsed(formContext);

    setUsedInfoShowState(formContext, isUsed);
  }

  return {
    onLoad: function(context)
    {
      const formContext = context.getFormContext();
      const isUsed = isAutoUsed(formContext);

      setUsedInfoShowState(formContext, isUsed);
      setListenerOnUsed(formContext);
    }
  }
})();

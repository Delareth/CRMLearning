/// <reference path="typings/globals/xrm/index.d.ts" />

var Navicon = Navicon || {};

Navicon.nav_Communication = (function()
{
  const VARS = {
    FieldPhone: "new_phone",
    FieldEmail: "new_email",
    FieldType: "new_type",
    TabGeneral: "general"
  }

  function hideAllFieldsExceptSpecified(formContext, specifiedField = null)
  {
    let fieldsToHide = [VARS.FieldPhone, VARS.FieldEmail];

    if (specifiedField !== null)
    {
      fieldsToHide = fieldsToHide.filter((field) => field !== specifiedField);
    }

    for (const field of fieldsToHide)
    {
      Navicon.nav_Utils.setFieldShowState(formContext.ui, VARS.TabGeneral, field, false);
    }
  }

  function resetFieldsState(formContext)
  {
    const value = formContext.getAttribute(VARS.FieldType).getValue();

    switch (value)
    {
      case null:
      {
        hideAllFieldsExceptSpecified(formContext);
        break;
      }
      // phone
      case 100000000:
      {
        hideAllFieldsExceptSpecified(formContext, VARS.FieldPhone);
        Navicon.nav_Utils.setFieldShowState(formContext.ui, VARS.TabGeneral, VARS.FieldPhone, true);
        break;
      }
      // e-mail
      case 100000001:
      {
        hideAllFieldsExceptSpecified(formContext, VARS.FieldEmail);
        Navicon.nav_Utils.setFieldShowState(formContext.ui, VARS.TabGeneral, VARS.FieldEmail, true);
        break;
      }
    }
  }

  function setListenerOnType(formContext)
  {
    const field = formContext.getAttribute(VARS.FieldType);

    field.addOnChange(onTypeChanged);
  }

  function onTypeChanged(context)
  {
    resetFieldsState(context.getFormContext());
  }

  return {
    onLoad: function(context)
    {
      const formContext = context.getFormContext();

      resetFieldsState(formContext);
      setListenerOnType(formContext);
    }
  }
})();

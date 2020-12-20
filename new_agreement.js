/// <reference path="typings/globals/xrm/index.d.ts" />

var Navicon = Navicon || {};

Navicon.nav_Agreement = (function()
{
  const VARS = {
    FieldCredit: "new_creditid",
    FieldName: "new_name",
    FieldDate: "new_date",
    FieldContact: "new_contact",
    FieldAuto: "new_autoid",
    FieldAgreementNumber: "new_agreementfield",
    TabGeneral: "general",
    TabCredit: "credit"
  }

  /**
   * 
   * @param {Xrm.Ui} ui 
   */
  function hidePrimaryFields(ui)
  {
    const availableFields = [
      VARS.FieldAuto, VARS.FieldContact, VARS.FieldName, 
      VARS.FieldAgreementNumber, VARS.FieldDate
    ];

    const tab = ui.tabs.get(VARS.TabGeneral);

    for (const sections of tab.sections.get())
    {
      for (const control of sections.controls.get())
      {
        if (availableFields.includes(control.getName())) continue;

        control.setVisible(false);
      }
    }
  }

  /**
   * 
   * @param {Xrm.Ui} ui 
   */
  function setCreditPageVisible(ui, state)
  {
    ui.tabs.get(VARS.TabCredit).setVisible(state);
  }

  function setListenersOnContactAndAuto(formContext)
  {
    const contact = formContext.getAttribute(VARS.FieldContact);
    const auto = formContext.getAttribute(VARS.FieldAuto);

    contact.addOnChange(onContactOrAutoChanged);
    auto.addOnChange(onContactOrAutoChanged);
  }

  function onContactOrAutoChanged(context)
  {
    const formContext = context.getFormContext();

    if (formContext.data.entity.isValid())
    {
      setCreditPageVisible(formContext.ui, true);

      showAndSetListenerToCreditProgram(formContext);
      setCreditFieldsLock(formContext.ui, true);
    }
    else
    {
      setCreditPageVisible(formContext.ui, false);

      if (formContext.getAttribute(VARS.FieldAuto).getValue() === null)
      {
        Navicon.nav_Utils.setFieldShowState(formContext.ui, VARS.TabGeneral, VARS.FieldCredit, false);
      }
    }
  }

  function showAndSetListenerToCreditProgram(formContext)
  {
    Navicon.nav_Utils.setFieldShowState(formContext.ui, VARS.TabGeneral, VARS.FieldCredit, true);

    const credit = formContext.getAttribute(VARS.FieldCredit);

    credit.addOnChange(onCreditProgramChanged);
  }

  function setCreditFieldsLock(ui, isLocked)
  {
    const tab = ui.tabs.get(VARS.TabCredit);

    for (const sections of tab.sections.get())
    {
      for (const control of sections.controls.get())
      {
        control.setDisabled(isLocked);
      }
    }
  }

  function onCreditProgramChanged(context)
  {
    const formContext = context.getFormContext();
    const credit = formContext.getAttribute(VARS.FieldCredit);

    const isLocked = credit.getValue() === null;

    setCreditFieldsLock(formContext.ui, isLocked);
  }

  function normalizeAndSetAgreementField(field)
  {
    const currValue = field.getValue();

    if (currValue === null) return;

    let normalized = "";

    for (const char of currValue)
    {
      if (char === "-")
      {
        normalized += char;
        continue;
      }

      if (isNaN(parseInt(char))) continue;

      normalized += char;
    }

    field.setValue(normalized);
  }

  function setListenerToAgreementField(formContext)
  {
    const field = formContext.getAttribute(VARS.FieldAgreementNumber);

    field.addOnChange(onAgreementFieldChanged);
  }

  function onAgreementFieldChanged(context)
  {
    const formContext = context.getFormContext();
    const field = formContext.getAttribute(VARS.FieldAgreementNumber);

    normalizeAndSetAgreementField(field);
  }

  function setPreSearchListenerToCredit(formContext)
  {
    const credit = Navicon.nav_Utils.getControlByName(formContext.ui, VARS.TabGeneral, VARS.FieldCredit);

    credit.addPreSearch(onCreditPreSearch);
  }

  function onCreditPreSearch(context)
  {
    const credit = Navicon.nav_Utils.getControlByName(context.getFormContext().ui, VARS.TabGeneral, VARS.FieldCredit);

    const autoidValue = context.getFormContext().getAttribute(VARS.FieldAuto).getValue();

    let customerAccountFilter = 
      "<filter type='and'>" + 
      "<condition attribute='new_autoid' operator='eq' value='" + autoidValue[0].id + "'/>" + 
      "</filter>";

    credit.addCustomFilter(customerAccountFilter, "new_credit");
  }

  return {
    onLoad: function(context)
    {
      const formContext = context.getFormContext();

      hidePrimaryFields(formContext.ui);
      setCreditPageVisible(formContext.ui, false);

      setListenersOnContactAndAuto(formContext);
      setListenerToAgreementField(formContext);

      setPreSearchListenerToCredit(formContext);
    }
  }
})();

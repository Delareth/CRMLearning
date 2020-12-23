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
    FieldCreditPeriod: "new_creditperiod",
    FieldSumma: "new_summa",
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
      VARS.FieldAgreementNumber, VARS.FieldDate, VARS.FieldCredit
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
    auto.addOnChange(onAutoChanged);
  }

  function onAutoChanged(context)
  {
    const formContext = context.getFormContext();
    const autoRef = formContext.getAttribute(VARS.FieldAuto).getValue(); 

    if (autoRef !== null) 
    {
      setAutoSumma(formContext, autoRef[0].id);
      setCustomViewToCredit(formContext);
    }

    onContactOrAutoChanged(context);
  }

  function setAutoSumma(formContext, autoId)
  {
    const query = "?$select=new_used,new_amount&$expand=new_modelid($select=new_recommendedamount)";

    // eslint-disable-next-line no-undef
    Xrm.WebApi.retrieveRecord("new_auto", autoId, query).then(
      function success(result) 
      {
        const summa = formContext.getAttribute(VARS.FieldSumma);

        if (result.new_used)
        {
          summa.setValue(result.new_amount);
        }
        else
        {
          summa.setValue(result.new_modelid.new_recommendedamount);
        }
      },
      function (error) 
      {
        console.error(error);
      }
    );
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

  function setCustomViewToCredit(formContext)
  {
    const credit = Navicon.nav_Utils.getControlByName(formContext.ui, VARS.TabGeneral, VARS.FieldCredit);
    const autoRef = formContext.getAttribute(VARS.FieldAuto).getValue();
    
    if (autoRef === null) 
    {
      console.error("Can't set custom view to credit cause autoid is empty");
      return;
    }

    credit.addCustomView(
      "00000000-0000-0000-0000-000000000001",
      "new_credit",
      "Кредитные программы",
      getCreditFetch(autoRef[0].name, autoRef[0].id),
      getLayoutForCredit(),
      true
    );
  }

  function onCreditProgramChanged(context)
  {
    const formContext = context.getFormContext();
    const credit = formContext.getAttribute(VARS.FieldCredit);
    const creditValue = credit.getValue();

    const isCreditNull = creditValue === null;

    setCreditFieldsLock(formContext.ui, isCreditNull);

    if (isCreditNull) return;

    fetchCreditData(formContext, ["new_dateend", "new_creditperiod"]).then(
      function success(result) 
      {
        const endDate = new Date(result.new_dateend);

        isCreditDataValid(formContext, endDate).then(
          function success(isCreditValid)
          {
            if (isCreditValid) setCreditPeriod(formContext, result.new_creditperiod);
            else alert("Указанная кредитная программа не действительна для текущего договора!");
          },
          function (error)
          {
            console.error(error);
          }
        );
      },
      function (error) 
      {
        console.error(error);
      }
    );
  }

  function setCreditPeriod(formContext, period)
  {
    const creditPeriod = formContext.getAttribute(VARS.FieldCreditPeriod);
    creditPeriod.setValue(period);
  }

  function isCreditDataValid(formContext, endDate)
  {
    return new Promise((resolve, reject) => {

      const isValid = (endDate) => {
        const startDateRaw = formContext.getAttribute(VARS.FieldDate).getValue();

        const startDate = new Date(startDateRaw);

        // 10800000 - utc 3 hours
        const difMs = endDate - startDate - 10800000;

        return difMs >= 0;
      };

      // check is endDate precatched
      if (endDate === undefined)
      {
        fetchCreditData(formContext, ["new_dateend"]).then(
          function success(result) 
          {
            const endDate = new Date(result.new_dateend);

            resolve(isValid(endDate));
          },
          function (error) 
          {
            reject(error.message);
          }
        );
      }
      else
      {
        resolve(isValid(endDate));
      }
    });
  }

  function checkCreditOnSave(context)
  {
    const formContext = context.getFormContext();

    const invalidCredit = (alertText) => {
      alert(alertText);
      context.getEventArgs().preventDefault();
    };

    isCreditDataValid(formContext).then(
      function success(result)
      {
        if (!result) invalidCredit("Указанная кредитная программа не действительна для текущего договора!");
      },
      function (error)
      {
        console.error(error);
        invalidCredit("Невозможно распознать кредитную программу, проверьте правильность формы");
      }
    )
  }

  function fetchCreditData(formContext, fields)
  {
    return new Promise((resolve, reject) => {
      if (fields.length === 0) reject("Fields count must be greather than 0");

      const fieldToSearch = fields.join(",");

      const credit = formContext.getAttribute(VARS.FieldCredit);
      const creditRef = credit.getValue();

      if (creditRef === null) reject("Credit not selected");

      const creditId = creditRef[0].id;

      // eslint-disable-next-line no-undef
      Xrm.WebApi.retrieveRecord("new_credit", creditId, "?$select=" + fieldToSearch).then(
        function success(result) 
        {
          resolve(result);
        },
        function (error) 
        {
          reject(error);
        }
      );
    });
  }

  function getCreditFetch(uiname, autoID)
  {
    return '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">' +
    '<entity name="new_credit">' +
    '  <attribute name="new_creditid" />' +
    '  <attribute name="new_name" />' +
    '  <attribute name="new_percent" />' +
    '  <attribute name="new_dateend" />' +
    '  <attribute name="new_datestart" />' +
    '  <order attribute="new_name" descending="false" />' +
    '  <link-entity name="new_new_credit_new_auto" from="new_creditid" to="new_creditid" visible="false" intersect="true">' +
    '    <link-entity name="new_auto" from="new_autoid" to="new_autoid" alias="ae">' +
    '      <filter type="and">' +
    '        <condition attribute="new_autoid" operator="eq" uiname="' + uiname + '" uitype="new_auto" value="' + autoID +'" />' +
    '      </filter>' +
    '    </link-entity>' +
    '  </link-entity>' +
    '</entity>' +
    '</fetch>';
  }

  function getLayoutForCredit()
  {
    return "" +
      "<grid name='resultset' jump='fullname' select='1' icon='1' preview='1'>" +  
      "<row name = 'result' id = 'new_credit' >" +  
      "<cell name='new_name' width='300' />" +  
      "<cell name='new_datestart' width='125' />" +  
      "<cell name='new_dateend' width='125' />" +  
      "<cell name='new_creditperiod' width='150' />" +  
      "</row></grid>";
  }

  return {
    onLoad: function(context)
    {
      const formContext = context.getFormContext();

      hidePrimaryFields(formContext.ui);
      setCreditPageVisible(formContext.ui, false);

      setListenersOnContactAndAuto(formContext);
      setListenerToAgreementField(formContext);

      setCustomViewToCredit(formContext);
    },
    onSave: function(context)
    {
      checkCreditOnSave(context);
    },
    fetchCreditData: function(formContext, fields)
    {
      return fetchCreditData(formContext, fields);
    }
  }
})();

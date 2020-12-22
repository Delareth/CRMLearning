/// <reference path="typings/globals/xrm/index.d.ts" />

var Navicon = Navicon || {};

Navicon.nav_AgreementRibbon = (function()
{
  const FIELDS = {
    Summ: "new_summa",
    InitialFee: "new_initialfee",
    CreditPeriod: "new_creditperiod",
    CreditAmount: "new_creditamount",
    Percent: "new_percent",
    FullCreditAmount: "new_fullcreditamount"
  }

  function getRecalculatedCreditAmount(formContext)
  {
    const summ = formContext.getAttribute(FIELDS.Summ).getValue();
    const initialFee = formContext.getAttribute(FIELDS.InitialFee).getValue();

    if (summ === null) return initialFee;
    if (initialFee === null) return summ;
    if (summ === null && initialFee === null) return null;

    return summ - initialFee;
  }

  function getRecalculateFullCreditAmount(formContext, creditAmount)
  {
    return new Promise((resolve, reject) => {
      let creditPeriod = formContext.getAttribute(FIELDS.CreditPeriod).getValue();

      if (creditPeriod === null) creditPeriod = 0;
      if (creditAmount === null) creditAmount = 0;

      Navicon.nav_Agreement.fetchCreditData(formContext, [FIELDS.Percent]).then(
        function success(result)
        {
          let percent = result.new_percent;

          if (percent === null) percent = 0;

          const fullCreditAmount = (percent / 100 * creditPeriod * creditAmount) + creditAmount;

          resolve(fullCreditAmount);
        },
        function (error)
        {
          console.error(error);
          reject(error);
        }
      )
    });
  }

  return {
    recalculateCredit: function(formContext)
    {
      // eslint-disable-next-line no-undef
      Xrm.Utility.showProgressIndicator("Recalculating credit data, please wait...");

      const unlockProgress = (alertText) =>
      {
        // eslint-disable-next-line no-undef
        Xrm.Utility.closeProgressIndicator();
        if (alertText !== undefined) alert(alertText);
      };
      
      const recalculatedCreditAmount = getRecalculatedCreditAmount(formContext);

      getRecalculateFullCreditAmount(formContext, recalculatedCreditAmount).then(
        function success(result)
        {
          const creditAmount = formContext.getAttribute(FIELDS.CreditAmount);
          const fullCreditAmount = formContext.getAttribute(FIELDS.FullCreditAmount);

          creditAmount.setValue(recalculatedCreditAmount);
          fullCreditAmount.setValue(result);

          unlockProgress();
        },
        function reject(error)
        {
          console.error(error);
          unlockProgress("Произошла ошибка во время обработки данных, проверьте поле кредита");
        }
      )
    }
  }
})();

/// <reference path="typings/globals/xrm/index.d.ts" />

var Navicon = Navicon || {};

Navicon.nav_Credit = (function()
{
  function isEndDateValid(context)
  {
    const startDateRaw = context.getAttribute("new_datestart").getValue();
    const endDateRaw = context.getAttribute("new_dateend").getValue();

    if (startDateRaw === null) return false;
    if (endDateRaw === null) return false;

    const startDate = new Date(startDateRaw);
    const endDate = new Date(endDateRaw);

    const difMs = endDate - startDate;
    const difDate = new Date(difMs);
    const difYears = Math.abs(difDate.getUTCFullYear() - 1970);
    
    return difYears > 0;
  }

  return {
    onSave: function(context)
    {
      const formContext = context.getFormContext();

      if (!isEndDateValid(formContext))
      {
        alert("Дата окончания программы должна быть на год позже от её начала");
        context.getEventArgs().preventDefault();
      }
    }
  }
})();

document.addEventListener("DOMContentLoaded", function()
{
  const brandName = parent.Xrm.Page.getAttribute("new_name").getValue();
  const brandId = parent.Xrm.Page.data.entity.getId().replace("/[{}]/g", "");
  let fetchXml = getFetchXml(brandName, brandId);
  
  fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);

  parent.Xrm.WebApi.retrieveMultipleRecords("new_credit", fetchXml).then(
    function success(result) 
    {
      const existingCreditIds = [];

      for (const entity of result.entities)
      {
        if (existingCreditIds.includes(entity.new_creditid)) continue;

        const credit = {
          name: entity.new_name,
          id: entity.new_creditid
        };

        const model = {
          name: entity["new_model3.new_name"],
          id: entity["new_model3.new_modelid"]
        }

        addTableElem(credit, model, entity.new_creditperiod);

        existingCreditIds.push(entity.new_creditid);
      }
    },
    function (error) 
    {
      console.log(error);
    }
  );
});

function getFetchXml(brandName, brandId)
{
  return '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">' +
  '  <entity name="new_credit" >' +
  '    <attribute name="new_creditid" />' +
  '    <attribute name="new_creditperiod" />' +
  '    <attribute name="new_name" />' +
  '    <link-entity name="new_new_credit_new_auto" from="new_creditid" to="new_creditid" link-type="inner" intersect="true" >' +
  '      <link-entity name="new_auto" from="new_autoid" to="new_autoid" link-type="inner" intersect="true" >' +
  '        <filter>' +
  '          <condition attribute="new_brandid" operator="eq" value="' + brandId + '" uiname="' + brandName + '" uitype="new_brand" />' +
  '        </filter>' +
  '        <link-entity name="new_model" from="new_modelid" to="new_modelid" link-type="inner" >' +
  '          <attribute name="new_modelid" />' +
  '          <attribute name="new_name" />' +
  '        </link-entity>' +
  '      </link-entity>' +
  '    </link-entity>' +
  '  </entity>' +
  '</fetch>';
}

function addTableElem(credit, model, creditPeriod)
{
  const table = document.createElement("div");
  table.className = "table_row";
  
  table.appendChild(createTableElem(credit.name, openForm, "new_credit", credit.id));
  table.appendChild(createTableElem(model.name, openForm, "new_model", model.id));
  table.appendChild(createTableElem(creditPeriod));

  document.getElementById("table").appendChild(table);
}

function openForm(entityName, entityId)
{
  const entityFormOptions = {
    entityName: entityName,
    entityId: entityId
  };

  parent.Xrm.Navigation.openForm(entityFormOptions).then(
    function (success) 
    {
      console.log(success);
    },
    function (error) 
    {
      console.error(error);
    }
  );
}

function createTableElem(text, funcToCall, ...funcParams)
{
  const elem = document.createElement("div");
  elem.className = "table_row_elem";
  
  if(funcToCall !== undefined) elem.onclick = () => { funcToCall(...funcParams) };

  const textNode = document.createTextNode(text);
  elem.appendChild(textNode);

  return elem;
}
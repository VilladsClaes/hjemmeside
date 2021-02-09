$(function () {

    //var adresse = "https://villadsclaes.dk/hyponetapi/"
    var adresse = "https://localhost:44380/"
   

    //Bekræfter til consol at der er forbindelse til hyponet_Api
    async function TestConnection() {
        var test = "Hyponet-UI lavet med javascript"
        var apiEndpointUrl = adresse + "Node/TestConnection/" + test;
        var svar = await httpGetAsync(apiEndpointUrl);
        console.log(apiEndpointUrl)
      
        return svar;

    }

    var svar =  TestConnection()
    console.log(svar)

    //Henter 10 sidste noder fra neo4j
    async function GetHistory() {
        var apiEndpointUrl = adresse +  "Node/GetHistory/";
        var nodeResult = await httpGetAsync(apiEndpointUrl);

        return nodeResult;

    }

    BuildHistory()

    async function BuildHistory() {

        var noder = await GetHistory()
       

        noder.node.forEach(node => CreateNode(node));

    }

    //Opretter bokse i UI
    function CreateNode(node) {
       
        let newbox = document.createElement("p");
        $(newbox).hide();
        $(newbox).attr("id", node.nodeId)
        $(newbox).html(node.nodeName)
        $(newbox).attr("contenteditable", "false");
        

        if (node.nodeLabel == "ROOT")
        {
            $(newbox).addClass("redbox")
        }
        else if (node.nodeLabel == "SPEC")
        {
            $(newbox).addClass("greenbox")
        }
        else if (node.nodeLabel == "ASS")
        {
            $(newbox).addClass("purpleparagraf")
        }
        else if (node.nodeLabel == "MARK")
        {
            
            $(newbox).wrapInner("<mark></mark>")
        }
       
       
       
        document.getElementById("samtale").append(newbox)
        $(newbox).show("slow")
    }
    

    //Opret en rød boks hvis der ikke er nogen
    if (document.getElementById("samtale").children.length < 1) {
        CreateRedBox()
    } 
        
    //Opret rød boks
    function CreateRedBox(e) {

        let redBox = document.createElement("p")        
        $(redBox).attr("contenteditable", "true");         
        $(redBox).addClass("redbox")
        

        document.getElementById("samtale").append(redBox)   

    }

    //Opret grøn boks
    function CreateGreenBox(domElement, resultObject) {

        let greenBox = document.createElement("p");
        $(greenBox).attr("contenteditable", "true");
        $(greenBox).addClass("greenbox");
        
       
        var parentElement = document.getElementById(domElement.id);
        DrawSpeechBubble(parentElement, greenBox, resultObject);

        SendSpecNode(resultObject);
    }

    //Opret lilla boks
    function CreatePurpleBox(greenboxAndAssNode) {
        //Outputboks ÅBNES
        let purplebox = document.createElement("p");
        //Definér tekstfeltet i view
        $(purplebox).attr("class", "purpleparagraf");
        $(purplebox).attr("contenteditable", "true");
        purplebox.innerText = greenboxAndAssNode.node[0].nodeName;
        $(purplebox).insertAfter(greenboxAndAssNode.element.element.parentElement.lastElementChild);
        greenboxAndAssNode.element = purplebox;
        SetBoxId(greenboxAndAssNode)
    }

    //Opret en taleboblehale der går fra uddybningstekstfeltet til den mark-opmærkningen som udløste (uddybnings)tekstfeltet
    function DrawSpeechBubble(domElement, greenBox, resultObject) {
    //Lav en omgivende ramme
    var svgFrame = document.createElement('div');
    //Definér det der skal indsættes
    var svgHtml = "<svg><polyline id='pilTilMark" + resultObject.node[0].nodeId + "' class='pil' points=''/> <polyline id='bundTilPil" + resultObject.node[0].nodeId + "' class='pil' points=''/> </svg>";
    //indsæt element i omgivende ramme
    svgFrame.innerHTML = svgHtml;
    //indsæt p-elementet fra LavEnUddybningsboks til denne svg
    svgFrame.appendChild(greenBox);
    //Hvis markering foregår i redbox
      if (domElement.parentElement == $("p.redbox"))
      {      
      document.getElementsByClassName("greenbox").append(svgFrame);
      }
      else
      {
      $(svgFrame).insertAfter(domElement);
      }
    //Find markeringens x og y-koordinater
    var selection = document.getElementById(resultObject.node[0].nodeId).getBoundingClientRect();
    //Find uddybningsfeltets x og y-koordinator
    var specification = greenBox.getBoundingClientRect();
    var arrow = document.getElementById("pilTilMark" + resultObject.node[0].nodeId);
    var bottomArrow = document.getElementById("bundTilPil" + resultObject.node[0].nodeId);
    var coordinatesArrowLeft = parseInt(specification.width / 4) + "," + parseInt(21); //Først sæt: x,y for tekstboks overkant
    var coordinatesOfArrowTip = parseInt(selection.x + (selection.width / 2)) + "," + parseInt(-20); //Andet sæt: x,y for mark-tag
    var coordinatesArrowRight = parseInt(specification.width / 3) + "," + parseInt(21); //Tredje sæt: x,y for tekstboks overkant
    //Placering af taleboblepilens to ben og spids
    arrow.setAttributeNS(null, "points", coordinatesArrowLeft + " " + coordinatesOfArrowTip + " " + coordinatesArrowRight + " " + coordinatesArrowLeft);
    var coordinatesBottomRight = parseInt((specification.width - 1.5) / 3) + "," + parseInt(21);
    bottomArrow.setAttributeNS(null, "points", coordinatesArrowLeft + " " + coordinatesBottomRight);
    bottomArrow.setAttributeNS(null, "style", "stroke:#90ee90;stroke-width:1.5;stroke-linecap:round");    
  }

    //Udfyldt redbox sendes 
    function SendGrundNode() {

    var kunDenEneGang = true;
    //Lav en rodnode i neo4j på ENTER
    $("p.redbox").keypress(async function (e) {

     
        if (e.which == 13 && kunDenEneGang && e.currentTarget.id == "")
        {        
        kunDenEneGang = false;
        e.preventDefault();
        await RootNodeCreation(e);
        }
        else if (e.which == 13 && kunDenEneGang == false)
        {
        kunDenEneGang = true;
        e.preventDefault()
        CreateRedBox(e)
        }

      //console.log(e.key)
      //if (e.currentTarget.innerText != "") {
      //    var searchresults = await SearchNodes(e.currentTarget.innerText);
      //    console.log(searchresults)
      //}
      //else {
      //    var searchresults = await SearchNodes(e.key);
      //    console.log(searchresults)
      //}

    });
          
    //Lav en rodnode i neo4j på museklik
    $("p.redbox").mousedown(async function (e) {
        ////fjern placeholderteksten
        //if ($("p.redbox").text() === "Skriv noget her")
        //{
        //    $("p.redbox").text("")       
        //}
        

      //Fjern eventuelle mark-elementer i dette p-element
      FjernMarkTag(e);

      //Hvis man glemmer at trykke ENTER og laver mousedown igen, sendes teksten til neo4j = GRUNDNODE OPRETTES VED MUSEKLIK
      if (e.currentTarget.innerText != "" && kunDenEneGang && e.currentTarget.id == "") {
        //console.log("Da der ikke blev trykket ENTER i .redbox, sendes indholdet til databasen")
        await RootNodeCreation(e);

      }
    });

  };
        
    SendGrundNode()
    
    //Udfyldt greenbox sendes 
    function SendSpecNode(MARKOrigin) {

        //Lav en specnode i neo4j på ENTER
        var kunDenEneGang = true;
        $(".greenbox").keypress(async function (e) {

            if (e.which == 13 && kunDenEneGang && e.currentTarget.id == "") {
                e.preventDefault();
                var resultObject = await SpecNodeCreation(e, MARKOrigin);
                AssNodeCreation(resultObject, MARKOrigin);
                e.currentTarget.removeAttribute("contenteditable")
                kunDenEneGang = false;
            }

        });

        //Lav en specnode i neo4j på museklik
        $("body").on("mousedown", ".greenbox", async function (e) {
            FjernMarkTag(e);
            if (e.currentTarget.innerText != "" && kunDenEneGang && e.currentTarget.id == "") {
                var resultObject = await SpecNodeCreation(e, MARKOrigin)
                AssNodeCreation(resultObject, MARKOrigin);
                e.currentTarget.removeAttribute("contenteditable");
                kunDenEneGang = false;
            }
        });
    }

    //Markering i redbox
    $('body').on("mouseup", "p.redbox", function (e) {
      
    SelectTextFromWindow(e);  

      //Fjern tom greenbox
      if (e.currentTarget.nextElementSibling != null && e.currentTarget.nextElementSibling.childNodes[1].innerHTML == "")
      {
        e.currentTarget.nextElementSibling.remove()     
      }

  })

    //Markering i greenbox
    $('body').on("mouseup", ".greenbox", function (e) {

        SelectTextFromWindow(e)

        //Fjern tom greenbox
        if (e.currentTarget.nextElementSibling != null && e.currentTarget.nextElementSibling.childNodes[0].parentElement.className != "purpleparagraf") {
            if (e.currentTarget.nextElementSibling.childNodes[1].innerText == "")
            {
                e.currentTarget.nextElementSibling.remove();               
            }
        }
        
    })


  //Opret rodnode i UI
  async function RootNodeCreation(e) {
    var rootNodeResult = await CreateRootNode(e);
    SetBoxId(rootNodeResult);
  }

  //Opret rodnode i neo4j
  async function CreateRootNode(e) {
    var nodeType = "ROOT";
    var encodedString = encodeURIComponent(e.target.innerText);
    var apiEndpointUrl = adresse +  "Node/Create/" + encodedString + "/" + nodeType;
    var nodeResult = await httpGetAsync(apiEndpointUrl, e.currentTarget);
    return nodeResult;
  };

  //Opret marknode i UI 
  async function MarkNodeCreation(selectedText, domElement) {

    var selOffsets = getSelectionCharacterOffsetWithin(domElement)
    var start = selOffsets.start;
    var end = selOffsets.end;    

    //Resultobject indeholder: element og node
    var resultObject = await CreateMarkNode(selectedText, domElement);
    var selectionObject = SurroundSelectedTextWithMarkTag(resultObject);

    SetBoxId(selectionObject);
    //domelement er boksen den er lavet i, ROOT eller SPEC. 
    //selectionobject er markeringen
    await CreateRelation(domElement.id, selectionObject.node[0].nodeId, "Mark");


    await MergeMarkNodes(selectedText, domElement, start, end);


    CreateGreenBox(domElement, selectionObject);
  }


  //Opret marknode i neo4j
  async function CreateMarkNode(selectedText, domElement) {


    var nodeType = "MARK";
    var selOffsets = getSelectionCharacterOffsetWithin(domElement)
    var start = selOffsets.start;
    var end = selOffsets.end;

    var postChar = getCharacterSucceedingSelection(domElement)
    var preChar = getCharacterPrecedingSelection(domElement)

    //encode null as string to avoid 404 in httpGet
      if (postChar == "")
      {
         var postChar = " ";
      }
      if (preChar == "")
      {
        var preChar = " ";
      }
    var encodedString = encodeURIComponent($.trim(selectedText));
    var apiEndpointUrl = adresse +  "Node/Create/" + encodedString + "/" + nodeType + "/" + start + "/" + end + "/" + encodeURIComponent(preChar) + "/" + encodeURIComponent(postChar) + "/";


    var nodeResult = await httpGetAsync(apiEndpointUrl, domElement);

    return nodeResult;
  }

  //Forhindr dubletter af marknode i neo4j
  async function MergeMarkNodes(selectedText, domElement, selectionStart, selectionEnd) {
    var nodeType = "MARK";
    var encodedString = encodeURIComponent($.trim(selectedText));
    var apiEndpointUrl = adresse +  "Node/MergeMarkNodes/" + encodedString + "/" + nodeType + "/" + selectionStart + "/" + selectionEnd + "/" + domElement.id;
    var nodeResult = await httpGetAsync(apiEndpointUrl, domElement);

    return nodeResult;
  }

  //Opret specnode i UI 
  async function SpecNodeCreation(e, markNodeOrigin) {
    var resultObject = await CreateSpecNode(e.currentTarget);      
    SetBoxId(resultObject);
    await CreateRelation(markNodeOrigin.node[0].nodeId, resultObject.node[0].nodeId, "Spec");

    
    var ASStoRelateTo = await FindAssToRelateTo(resultObject.node);
      if (resultObject.node[0] != null && ASStoRelateTo.node[0] != null)
      {
          await CreateRelation(resultObject.node[0].nodeId, ASStoRelateTo.node[0].nodeId, "Ass");
      }          

    return resultObject;
  }

  //Opret specnode i neo4j
  async function CreateSpecNode(greenBoxElement) {
        var nodeType = "SPEC";
        var encodedString = encodeURIComponent($.trim(greenBoxElement.innerText));
        var apiEndpointUrl = adresse +  "Node/Create/" + encodedString + "/" + nodeType;
        var nodeResult = await httpGetAsync(apiEndpointUrl, greenBoxElement);
        return nodeResult;
  }

  //Opret assrel i neo4j (fromNode = spec)
  async function FindAssToRelateTo(fromNode) {

    var apiEndpointUrl = adresse +  "Node/FindAssToRelateTo/" + fromNode[0].nodeId;
    var nodeResult = await httpGetAsync(apiEndpointUrl);

    return nodeResult; //en række ASS-noder (TJEK OPGAVE TODO VIRKER IKKE MÅSKE ER DET BÅDE RÆKKE MED SPEC OG ASS VI SKAL BRUGE?!)
  }

  //Opret assnode i UI
  async function AssNodeCreation(fromResultObject, markResultObject) {
    
    var resultObject = await CreateAssNode(fromResultObject.element, markResultObject.element.innerText);
    
    await CreateRelation(fromResultObject.node[0].nodeId, resultObject.node[0].nodeId, "Ass");

    //Vælg hvilken ASS-node fra databasen der skal dukke op
    var ChosenNode = await ChooseAssNode(fromResultObject)

      if (ChosenNode.node[0])
      {
          CreatePurpleBox(ChosenNode)
      }

  }

  //Opret en assnode i neo4j
  async function CreateAssNode(fromElement, selectedText) {
    var nodeType = "ASS";
    var encodedString = encodeURIComponent($.trim(selectedText));
    var apiEndpointUrl = adresse +  "Node/Create/" + encodedString + "/" + nodeType;
    var resultObject = await httpGetAsync(apiEndpointUrl, fromElement)
    
    return resultObject;
  };

  //Udvælg node fra neo4j til purplebox
  async function ChooseAssNode(domElement) {
    var apiEndpointUrl = adresse +  "Node/ChooseAssNode/" + domElement.node[0].nodeId;
    var nodeResult = await httpGetAsync(apiEndpointUrl, domElement)
    return nodeResult;
  };

  //Opret relation i neo4j
  async function CreateRelation(fromNodeId, toNodeId, relationType) {
    var apiEndpointUrl = adresse +  "Relation/Create/" + fromNodeId + "/" + toNodeId + "/" + relationType;
    var nodeResult = await httpGetAsync(apiEndpointUrl);
    return nodeResult;
  }

  //sæt ID på box i UI
  function SetBoxId(resultObject) {
    $(resultObject.element).attr("id", resultObject.node[0].nodeId)
  }


  //kald neo4j gennem API
  function httpGetAsync(theUrl, htmlElement) {
    return new Promise(function (resolve, reject) {
      var xmlHttp = new XMLHttpRequest();
      var element = htmlElement;
      xmlHttp.onreadystatechange = async function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          console.log("readystate = 4: " + xmlHttp.responseText);
          var jsonResult = await JSON.parse(xmlHttp.responseText);
          var resultObject = {
            node: jsonResult,
            element: element
          };
          resolve(resultObject);
          return resultObject;
        }
        if (xmlHttp.readyState == 3) {
          //console.log(xmlHttp.responseText);
        } else {
          console.log("rejected at readystate = " + xmlHttp.readyState);
          //reject("REJECT");
        }
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous
      xmlHttp.send();

    })
  }

  //Find range fra UI
  function getSelectionCharacterOffsetWithin(element) {
    var start = 0;
    var end = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;

      if (typeof win.getSelection != "undefined")
      {
         sel = win.getSelection();
          if (sel.rangeCount > 0)
          {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            start = preCaretRange.toString().length;
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            end = preCaretRange.toString().length;
          }
      }
      else if ((sel = doc.selection) && sel.type != "Control")
      {
          var textRange = sel.createRange();
          var preCaretTextRange = doc.body.createTextRange();
          preCaretTextRange.moveToElementText(element);
          preCaretTextRange.setEndPoint("EndToStart", textRange);
          start = preCaretTextRange.text.length;
          preCaretTextRange.setEndPoint("EndToEnd", textRange);
          end = preCaretTextRange.text.length;
      }
      return {
          start: start, end: end
      };

  }

  //Find bogstav før markering fra UI
  function getCharacterPrecedingSelection(containerEl) {
    var precedingChar = "",
      sel, range, precedingRange;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount > 0) {
        range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        range.setStart(containerEl, 0);
        precedingChar = range.toString().slice(-1);
      }
    } else if ((sel = document.selection) && sel.type != "Control") {
      range = sel.createRange();
      precedingRange = range.duplicate();
      precedingRange.moveToElementText(containerEl);
      precedingRange.setEndPoint("EndToStart", range);
      precedingChar = precedingRange.text.slice(-1);
    }
    return precedingChar;
  }


  //Find bogstav efter markering fra UI
  function getCharacterSucceedingSelection(containerEl) {
    var succeedingChar = "",
      sel, range, succeedingRange;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount > 0) {
        range = sel.getRangeAt(0).cloneRange();
        range.collapse(false);
        range.setEnd(containerEl, containerEl.childNodes.length);
        succeedingChar = range.toString().charAt(0);
      }
    } else if ((sel = document.selection) && sel.type != "Control") {
      range = sel.createRange();
      succeedingRange = range.duplicate();
      succeedingRange.moveToElementText(containerEl);
      succeedingRange.setEndPoint("EndToStart", range);
      succeedingChar = succeedingRange.text.slice(-1);
    }
    return succeedingChar;
  }


  //Marker tekst fra UI
  function SelectTextFromWindow(event) {
    var selectedText = window.getSelection();
    var domElement = event.target;

    if (selectedText.type != "Caret") {

      var precedingChar = getCharacterPrecedingSelection(domElement);
      var succeedingChar = getCharacterSucceedingSelection(domElement)
        
        if ((selectedText.toString().trim() != '') && (selectedText.toString().trim() != '.'))
        {

            //Udvid det valgte indtil næste whitespace/mellemrum eller specialtegn    
            //snapSelectionToWord(selectedText)
            
            MarkNodeCreation(selectedText, domElement, precedingChar, succeedingChar)
        };

    }

    return selectedText, domElement;
  }

  //Opret marknode i UI
  function SurroundSelectedTextWithMarkTag(resultObject) {
        var selection = window.getSelection();
        var selectionRange = selection.getRangeAt(0);
        var newMarkElement = document.createElement("mark");
        resultObject.element = newMarkElement;
        selectionRange.surroundContents(newMarkElement);
        return resultObject;
    }

  //Fjerner mark-tag fra UI
  function FjernMarkTag(event) {
      if (event.currentTarget.childElementCount > 0)
      {
          if (event.target.matches('mark'))
          {
            let teksten = event.currentTarget.textContent;
            let thismark = event.target;
            thismark.remove();
            event.currentTarget.innerText = teksten
          }
          else
          {
                let marktag = document.getElementById(event.target.id).getElementsByTagName("mark");
                  while (marktag.length)
                  {
                      let parent = marktag[0].parentNode;

                      while (marktag[0].firstChild)
                      {
                        parent.insertBefore(marktag[0].firstChild, marktag[0]);
                      }          

                    parent.removeChild(marktag[0]);

                  }
          }


      }      

  }

  //Søg efter andre noder
  async function SearchNodes(searchChars) {
        var encodedString = encodeURIComponent(searchChars);
        var apiEndpointUrl = adresse +  "Node/SearchNodes/" + encodedString;
        var SearchResult = await httpGetAsync(apiEndpointUrl);
        return SearchResult;
    };
  

});
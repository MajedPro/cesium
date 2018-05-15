defineSuite([
        'Scene/CreditDisplay',
        'Core/Credit',
        'Core/defined',
        'Specs/absolutize'
    ], function(
        CreditDisplay,
        Credit,
        defined,
        absolutize) {
    'use strict';

    var container;
    var creditDisplay;
    var imageUrl;

    beforeEach(function() {
        imageUrl = absolutize('./Data/Images/Green.png');
        container = document.createElement('div');
        container.id = 'credit-container';
        document.body.appendChild(container);
    });

    afterEach(function() {
        document.body.removeChild(container);
        CreditDisplay.cesiumCredit = undefined;
        CreditDisplay._cesiumCreditInitialized = false;
        if (defined(creditDisplay)) {
            creditDisplay.destroy();
            creditDisplay = undefined;
        }
    });

    // For the sake of the tests, we remove the logo
    // credit at the beginning of every frame
    function beginFrame(creditDisplay) {
        creditDisplay.beginFrame();
    }

    it('credit display throws with no container', function() {
        expect(function() {
            return new CreditDisplay();
        }).toThrowDeveloperError();
    });

    it('credit display addCredit throws when credit is undefined', function() {
        expect(function() {
            creditDisplay = new CreditDisplay(container);
            creditDisplay.addCredit();
        }).toThrowDeveloperError();
    });

    it('credit display addDefaultCredit throws when credit is undefined', function() {
        expect(function() {
            creditDisplay = new CreditDisplay(container);
            creditDisplay.addDefaultCredit();
        }).toThrowDeveloperError();
    });

    it('credit display removeDefaultCredit throws when credit is undefined', function() {
        expect(function() {
            creditDisplay = new CreditDisplay(container);
            creditDisplay.removeDefaultCredit();
        }).toThrowDeveloperError();
    });

    it('credits have unique ids', function() {
        var credit1 = new Credit('<a href="http://cesiumjs.org/">credit1</a>');
        var credit2 = new Credit('<a href="http://cesiumjs.org/">credit2</a>');
        expect(credit1.id).not.toEqual(credit2.id);

        var credit3 = new Credit('<a href="http://cesiumjs.org/">credit1</a>');
        expect(credit1.id).toEqual(credit3.id);
    });

    it('credit display displays a credit', function() {
        creditDisplay = new CreditDisplay(container);
        var credit = new Credit('<a href="http://cesiumjs.org">CesiumJS.org</a>', true);
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit);
        creditDisplay.endFrame();

        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(1);
        var child10 = creditContainer.childNodes[0];
        expect(child10.childNodes.length).toEqual(1);
    });

    it('credit display updates html when credits change', function() {
        var credit1 = new Credit('credit1', true);
        var credit2 = new Credit('credit2', true);

        creditDisplay = new CreditDisplay(container);

        // add only credit1 during the frame
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.endFrame();
        var innerHTMLWithCredit1 = container.innerHTML;
        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(1);
        expect(creditContainer.childNodes[0].innerHTML).toEqual('credit1');

        // add only credit2 during the frame
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        var innerHTMLWithCredit2 = container.innerHTML;
        expect(innerHTMLWithCredit2).not.toEqual(innerHTMLWithCredit1);
        expect(creditContainer.childNodes.length).toEqual(1);
        expect(creditContainer.childNodes[0].innerHTML).toEqual('credit2');

        // add both credit1 and credit2 during the frame
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        var innerHTMLWithCredit1AndCredit2 = container.innerHTML;
        expect(innerHTMLWithCredit1AndCredit2).not.toEqual(innerHTMLWithCredit1);
        expect(innerHTMLWithCredit1AndCredit2).not.toEqual(innerHTMLWithCredit2);
        expect(creditContainer.childNodes.length).toEqual(3);
        expect(creditContainer.childNodes[0].innerHTML).toEqual('credit1');
        expect(creditContainer.childNodes[2].innerHTML).toEqual('credit2');

        // add neither credit during the frame
        beginFrame(creditDisplay);
        creditDisplay.endFrame();
        expect(container.innerHTML).not.toEqual(innerHTMLWithCredit1);
        expect(container.innerHTML).not.toEqual(innerHTMLWithCredit2);
        expect(container.innerHTML).not.toEqual(innerHTMLWithCredit1AndCredit2);
        expect(creditContainer.childNodes.length).toEqual(0);
    });

    it('credit display uses delimeter', function() {
        var credit1 = new Credit('credit1', true);
        var credit2 = new Credit('credit2', true);
        var delimiter = ', ';
        creditDisplay = new CreditDisplay(container, ', ');
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();

        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(3);
        expect(creditContainer.childNodes[0].innerHTML).toEqual('credit1');
        expect(creditContainer.childNodes[1].innerHTML).toEqual(delimiter);
        expect(creditContainer.childNodes[2].innerHTML).toEqual('credit2');
    });

    it('credit display manages delimeters correctly for text credits', function() {
        var credit1 = new Credit('credit1', true);
        var credit2 = new Credit('credit2', true);
        var credit3 = new Credit('credit3', true);
        var delimiter = ', ';
        creditDisplay = new CreditDisplay(container, delimiter);
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.addCredit(credit2);
        creditDisplay.addCredit(credit3);
        creditDisplay.endFrame();
        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(5);
        expect(creditContainer.childNodes[0]).toEqual(credit1.element);
        expect(creditContainer.childNodes[1].innerHTML).toEqual(delimiter);
        expect(creditContainer.childNodes[2]).toEqual(credit2.element);
        expect(creditContainer.childNodes[3].innerHTML).toEqual(delimiter);
        expect(creditContainer.childNodes[4]).toEqual(credit3.element);

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit2);
        creditDisplay.addCredit(credit3);
        creditDisplay.endFrame();
        expect(creditContainer.childNodes.length).toEqual(3);
        expect(creditContainer.childNodes[0]).toEqual(credit2.element);
        expect(creditContainer.childNodes[1].innerHTML).toEqual(delimiter);
        expect(creditContainer.childNodes[2]).toEqual(credit3.element);

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        expect(creditContainer.childNodes.length).toEqual(1);
        expect(creditContainer.childNodes[0]).toEqual(credit2.element);

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit2);
        creditDisplay.addCredit(credit3);
        creditDisplay.endFrame();
        expect(creditContainer.childNodes.length).toEqual(3);
        expect(creditContainer.childNodes[0]).toEqual(credit2.element);
        expect(creditContainer.childNodes[1].innerHTML).toEqual(delimiter);
        expect(creditContainer.childNodes[2]).toEqual(credit3.element);
    });

    it('credit display displays default credit', function() {
        var defaultCredit = new Credit('default credit', true);
        var credit1 = new Credit('credit1', true);

        creditDisplay = new CreditDisplay(container, ', ');
        creditDisplay.addDefaultCredit(defaultCredit);
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.endFrame();

        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(3);
        expect(creditContainer.childNodes[0]).toEqual(defaultCredit.element);
        expect(creditContainer.childNodes[1].innerHTML).toEqual(', ');
        expect(creditContainer.childNodes[2]).toEqual(credit1.element);

        beginFrame(creditDisplay);
        creditDisplay.endFrame();
        expect(creditContainer.childNodes.length).toEqual(1);
        expect(creditContainer.childNodes[0]).toEqual(defaultCredit.element);
    });

    it('credit display displays credits when default is removed', function() {
        var defaultCredit = new Credit('default credit', true);
        var credit1 = new Credit('credit1', true);

        creditDisplay = new CreditDisplay(container, ', ');
        creditDisplay.addDefaultCredit(defaultCredit);
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.endFrame();
        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(3);
        expect(creditContainer.childNodes[0]).toEqual(defaultCredit.element);
        expect(creditContainer.childNodes[1].innerHTML).toEqual(', ');
        expect(creditContainer.childNodes[2]).toEqual(credit1.element);

        creditDisplay.removeDefaultCredit(defaultCredit);
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.endFrame();
        expect(creditContainer.childNodes.length).toEqual(1);
        expect(creditContainer.childNodes[0]).toEqual(credit1.element);
    });

    it('credit display only displays one if two credits are equal', function() {
        var credit1 = new Credit('credit1', true);
        var credit2 = new Credit('credit1', true);
        creditDisplay = new CreditDisplay(container);
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(1);
        expect(creditContainer.childNodes[0].innerHTML).toEqual('credit1');
    });

    it('displays credits in a lightbox', function() {
        var credit1 = new Credit('credit1');
        var credit2 = new Credit('<img src="' + imageUrl + '"/>');

        creditDisplay = new CreditDisplay(container);
        var creditList = creditDisplay._creditList;

        creditDisplay.showLightbox();

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.endFrame();
        creditDisplay.update();

        var innerHTML = creditList.innerHTML;
        expect(creditList.childNodes.length).toEqual(1);
        expect(creditList.childNodes[0].childNodes[0]).toEqual(credit1.element);

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        creditDisplay.update();

        expect(creditList.innerHTML).not.toEqual(innerHTML);
        innerHTML = creditList.innerHTML;
        expect(creditList.childNodes.length).toEqual(1);
        expect(creditList.childNodes[0].childNodes[0]).toEqual(credit2.element);

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        creditDisplay.update();

        expect(creditList.innerHTML).not.toEqual(innerHTML);
        innerHTML = creditList.innerHTML;
        expect(creditList.childNodes.length).toEqual(2);

        beginFrame(creditDisplay);
        creditDisplay.endFrame();
        creditDisplay.update();

        expect(creditList.innerHTML).not.toEqual(innerHTML);
        expect(creditList.childNodes.length).toEqual(0);

        creditDisplay.hideLightbox();
    });

    it('renders lightbox credits', function() {
        var credit1 = new Credit('credit1');
        var credit2 = new Credit('<img src="' + imageUrl + '"/>');

        creditDisplay = new CreditDisplay(container);
        var creditList = creditDisplay._creditList;

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        creditDisplay.update();

        expect(creditList.childNodes.length).toEqual(2);

        creditDisplay.showLightbox();

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        creditDisplay.update();

        expect(creditList.childNodes.length).toEqual(2);

        creditDisplay.hideLightbox();
    });

    it('updates lightbox when a new frames are not rendered', function() {
        var credit1 = new Credit('credit1');
        var credit2 = new Credit('<img src="' + imageUrl + '"/>');

        creditDisplay = new CreditDisplay(container);
        var creditList = creditDisplay._creditList;

        creditDisplay.update();

        expect(creditList.childNodes.length).toEqual(0);

        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.addCredit(credit2);
        creditDisplay.endFrame();
        creditDisplay.update();

        expect(creditList.childNodes.length).toEqual(2);

        creditDisplay.showLightbox();
        creditDisplay.update();

        expect(creditList.childNodes.length).toEqual(2);

        creditDisplay.hideLightbox();
        creditDisplay.update();

        expect(creditList.childNodes.length).toEqual(2);

        creditDisplay.hideLightbox();
    });

    it('works if Cesium credit removed', function() {
        creditDisplay = new CreditDisplay(container);
        var cesiumCredit = CreditDisplay.cesiumCredit;
        CreditDisplay.cesiumCredit = undefined;
        creditDisplay.beginFrame();
        creditDisplay.endFrame();
        expect(creditDisplay._cesiumCreditContainer.childNodes.length).toBe(0);
        CreditDisplay.cesiumCredit = cesiumCredit;
    });

    // Deprecated specs below, remove for Cesium 1.46
    it('credit display displays text credit', function() {
        creditDisplay = new CreditDisplay(container);
        var credit = new Credit({
            text: 'credit1',
            showOnScreen: true
        });
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit);
        creditDisplay.endFrame();
        expect(container.childNodes.length).toEqual(3);
        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(1);
        expect(creditContainer.childNodes[0].innerHTML).toEqual('<span>credit1</span>');
    });

    it('credit display displays image credit', function() {
        creditDisplay = new CreditDisplay(container);
        var credit = new Credit({
            imageUrl: imageUrl,
            showOnScreen: true
        });
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit);
        creditDisplay.endFrame();

        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(1);
        var creditSpan = creditContainer.childNodes[0];
        expect(creditSpan.childNodes.length).toEqual(1);
        expect(creditSpan.childNodes[0].childNodes[0].src).toContain(imageUrl);
    });

    it('credit display displays hyperlink credit', function() {
        creditDisplay = new CreditDisplay(container);
        var link = 'http://cesiumjs.org/';
        var credit = new Credit({
            link: link,
            showOnScreen: true
        });
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit);
        creditDisplay.endFrame();

        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(1);
        var creditSpan = creditContainer.childNodes[0];
        expect(creditSpan.childNodes.length).toEqual(1);
        expect(creditSpan.childNodes[0].childNodes[0].href).toEqual(link);
        expect(creditSpan.childNodes[0].childNodes[0].innerHTML).toEqual(link);
    });

    it('credit display uses text as title for image credit', function() {
        var credit1 = new Credit({
            text: 'credit text',
            imageUrl: imageUrl,
            showOnScreen: true
        });
        creditDisplay = new CreditDisplay(container);
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.endFrame();

        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(1);
        var creditSpan = creditContainer.childNodes[0];
        expect(creditSpan.childNodes.length).toEqual(1);
        creditSpan = creditSpan.childNodes[0];
        expect(creditSpan.childNodes[0].src).toContain(imageUrl);
        expect(creditSpan.childNodes[0].alt).toEqual('credit text');
        expect(creditSpan.childNodes[0].title).toEqual('credit text');
    });

    it('credit display creates image credit with hyperlink', function() {
        var credit1 = new Credit({
            imageUrl: imageUrl,
            link: 'http://link.com',
            showOnScreen: true
        });
        creditDisplay = new CreditDisplay(container);
        beginFrame(creditDisplay);
        creditDisplay.addCredit(credit1);
        creditDisplay.endFrame();

        var creditContainer = container.childNodes[1];
        expect(creditContainer.childNodes.length).toEqual(1);
        var creditSpan = creditContainer.childNodes[0];
        expect(creditSpan.childNodes.length).toEqual(1);
        var creditContent = creditSpan.childNodes[0].childNodes[0];
        expect(creditContent.href).toContain('link.com');
        expect(creditContent.childNodes.length).toEqual(1);
        expect(creditContent.childNodes[0].src).toContain(imageUrl);
    });
});
